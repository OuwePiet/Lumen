"use client"

import { DESO_IDENTITY_ORIGIN, getIdentityCredentials } from "./deso-identity-session"

type IdentityPayload = Record<string, unknown>
type IdentityMessage = { id?: unknown; service?: unknown; method?: unknown; payload?: unknown }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function requestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID()
  return `via-identity-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function openApproval(transactionHex: string): Promise<IdentityPayload> {
  return new Promise((resolve, reject) => {
    const url = new URL(`${DESO_IDENTITY_ORIGIN}/approve`)
    url.searchParams.set("tx", transactionHex)
    const popup = window.open(url.toString(), null, "toolbar=no,width=800,height=1000")
    if (!popup) { reject(new Error("DeSo Identity approval window was blocked.")); return }
    const activePopup = popup

    const timeout = window.setTimeout(() => finish(new Error("DeSo Identity transaction approval timed out.")), 90_000)
    const watch = window.setInterval(() => {
      if (activePopup.closed) finish(new Error("DeSo Identity approval was closed before completion."))
    }, 400)

    function finish(value: IdentityPayload | Error) {
      window.clearTimeout(timeout)
      window.clearInterval(watch)
      window.removeEventListener("message", onMessage)
      if (!activePopup.closed) activePopup.close()
      if (value instanceof Error) reject(value)
      else resolve(value)
    }

    function onMessage(event: MessageEvent) {
      if (event.origin !== DESO_IDENTITY_ORIGIN || event.source !== activePopup || !isRecord(event.data)) return
      const message = event.data as IdentityMessage
      if (message.service !== "identity" || !isRecord(message.payload)) return
      if (typeof message.payload.signedTransactionHex === "string" && message.payload.signedTransactionHex) finish(message.payload)
    }

    window.addEventListener("message", onMessage)
  })
}

export function signViaTransaction(publicKey: string, transactionHex: string): Promise<string> {
  if (typeof window === "undefined" || typeof document === "undefined") return Promise.reject(new Error("DeSo Identity is only available in the browser."))
  const credentials = getIdentityCredentials(publicKey)
  if (!credentials) return Promise.reject(new Error("No usable DeSo Identity credentials are available."))
  if (!/^[0-9a-fA-F]+$/.test(transactionHex) || transactionHex.length % 2 !== 0) return Promise.reject(new Error("Invalid DeSo transaction hex."))

  return new Promise((resolve, reject) => {
    const iframe = document.createElement("iframe")
    iframe.src = `${DESO_IDENTITY_ORIGIN}/embed?v=2`
    iframe.title = "DeSo Identity"
    iframe.style.display = "none"
    document.body.appendChild(iframe)

    const id = requestId()
    let initialized = false
    let settled = false
    const pending: Record<string, unknown>[] = []

    const cleanup = () => { window.removeEventListener("message", onMessage); iframe.remove(); window.clearTimeout(timeout) }
    const fail = (message: string) => { if (settled) return; settled = true; cleanup(); reject(new Error(message)) }
    const finish = (signed: string) => { if (settled) return; settled = true; cleanup(); resolve(signed) }
    const post = (message: Record<string, unknown>) => {
      if (initialized) iframe.contentWindow?.postMessage(message, DESO_IDENTITY_ORIGIN)
      else pending.push(message)
    }

    function onMessage(event: MessageEvent) {
      if (event.origin !== DESO_IDENTITY_ORIGIN || event.source !== iframe.contentWindow || !isRecord(event.data)) return
      const message = event.data as IdentityMessage
      if (message.service !== "identity") return

      if (message.method === "initialize" && typeof message.id === "string") {
        iframe.contentWindow?.postMessage({ id: message.id, service: "identity", payload: {} }, DESO_IDENTITY_ORIGIN)
        if (!initialized) {
          initialized = true
          pending.splice(0).forEach((item) => iframe.contentWindow?.postMessage(item, DESO_IDENTITY_ORIGIN))
        }
        return
      }

      if (message.id !== id || !isRecord(message.payload)) return
      const response = message.payload
      if (typeof response.error === "string" && response.error) { fail(response.error); return }

      if (response.approvalRequired === true) {
        void openApproval(transactionHex).then((approved) => {
          const signed = approved.signedTransactionHex
          if (typeof signed === "string" && signed) finish(signed)
          else fail("DeSo Identity did not return an approved signed transaction.")
        }).catch((error) => fail(error instanceof Error ? error.message : "DeSo Identity approval failed."))
        return
      }

      const signed = response.signedTransactionHex
      if (typeof signed === "string" && signed) finish(signed)
      else fail("DeSo Identity did not return a signed transaction.")
    }

    window.addEventListener("message", onMessage)
    post({
      id,
      service: "identity",
      method: "sign",
      payload: {
        transactionHex,
        encryptedSeedHex: credentials.encryptedSeedHex,
        accessLevel: credentials.accessLevel,
        accessLevelHmac: credentials.accessLevelHmac,
        encryptedMessagingKeyRandomness: credentials.encryptedMessagingKeyRandomness,
        ownerPublicKeyBase58Check: credentials.ownerPublicKeyBase58Check ?? publicKey,
        derivedPublicKeyBase58Check: credentials.derivedPublicKeyBase58Check,
      },
    })

    const timeout = window.setTimeout(() => fail("DeSo Identity transaction signing timed out."), 90_000)
  })
}
