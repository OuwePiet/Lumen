"use client"

import { DESO_IDENTITY_ORIGIN, getIdentityCredentials } from "../deso-identity-session"

const IDENTITY_EMBED_URL = `${DESO_IDENTITY_ORIGIN}/embed`
const REQUEST_TIMEOUT_MS = 20_000

type IdentityPayload = Record<string, unknown>

type IdentityMessage = {
  id?: unknown
  service?: unknown
  method?: unknown
  payload?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function uuid() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID()
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16)
    const value = char === "x" ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}

function makeIframe() {
  const iframe = document.createElement("iframe")
  iframe.src = IDENTITY_EMBED_URL
  iframe.title = "DeSo Identity"
  iframe.setAttribute("aria-label", "DeSo Identity")
  iframe.style.display = "none"
  iframe.style.position = "fixed"
  iframe.style.inset = "0"
  iframe.style.width = "100vw"
  iframe.style.height = "100vh"
  iframe.style.border = "0"
  iframe.style.zIndex = "2147483647"
  iframe.style.background = "black"
  document.body.appendChild(iframe)
  return iframe
}

export async function requestIdentityJwt(publicKey: string): Promise<string> {
  const credentials = getIdentityCredentials(publicKey)
  if (!credentials) throw new Error("IDENTITY_CREDENTIALS_UNAVAILABLE")

  const iframe = makeIframe()
  const pending = new Map<string, (payload: IdentityPayload) => void>()
  let initialized = false
  let storageGrantedResolve: (() => void) | null = null

  const storageGranted = new Promise<void>((resolve) => { storageGrantedResolve = resolve })

  const cleanup = () => {
    window.removeEventListener("message", onMessage)
    iframe.remove()
  }

  const send = (method: string, payload: IdentityPayload = {}) => new Promise<IdentityPayload>((resolve, reject) => {
    const id = uuid()
    const timeout = window.setTimeout(() => {
      pending.delete(id)
      reject(new Error(`IDENTITY_${method.toUpperCase()}_TIMEOUT`))
    }, REQUEST_TIMEOUT_MS)

    pending.set(id, (response) => {
      window.clearTimeout(timeout)
      resolve(response)
    })

    const post = () => iframe.contentWindow?.postMessage({ id, service: "identity", method, payload }, DESO_IDENTITY_ORIGIN)
    if (initialized) post()
    else {
      const wait = window.setInterval(() => {
        if (!initialized) return
        window.clearInterval(wait)
        post()
      }, 25)
      window.setTimeout(() => window.clearInterval(wait), REQUEST_TIMEOUT_MS)
    }
  })

  const onMessage = (event: MessageEvent) => {
    if (event.origin !== DESO_IDENTITY_ORIGIN || event.source !== iframe.contentWindow || !isRecord(event.data)) return
    const message = event.data as IdentityMessage
    if (message.service !== "identity") return

    if (message.method === "initialize" && typeof message.id === "string") {
      initialized = true
      iframe.contentWindow?.postMessage({ id: message.id, service: "identity", payload: {} }, DESO_IDENTITY_ORIGIN)
      return
    }

    if (message.method === "storageGranted") {
      iframe.style.display = "none"
      storageGrantedResolve?.()
      return
    }

    if (typeof message.id === "string" && pending.has(message.id) && isRecord(message.payload)) {
      const resolve = pending.get(message.id)
      pending.delete(message.id)
      resolve?.(message.payload)
    }
  }

  window.addEventListener("message", onMessage)

  try {
    const info = await send("info")
    if (info.browserSupported === false) throw new Error("IDENTITY_BROWSER_UNSUPPORTED")

    if (info.hasStorageAccess === false) {
      iframe.style.display = "block"
      await Promise.race([
        storageGranted,
        new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error("IDENTITY_STORAGE_ACCESS_TIMEOUT")), REQUEST_TIMEOUT_MS)),
      ])
    }

    const payload = await send("jwt", {
      encryptedSeedHex: credentials.encryptedSeedHex,
      accessLevel: credentials.accessLevel,
      accessLevelHmac: credentials.accessLevelHmac,
    })

    if (payload.approvalRequired === true) throw new Error("IDENTITY_REAUTHORIZE_REQUIRED")
    if (typeof payload.jwt !== "string" || payload.jwt.length < 32) throw new Error("IDENTITY_INVALID_JWT")
    return payload.jwt
  } finally {
    cleanup()
  }
}
