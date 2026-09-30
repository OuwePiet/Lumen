"use client"

import { DESO_IDENTITY_ORIGIN, getIdentityCredentials } from "./deso-identity-session"

type IdentityMessage = { id?: unknown; service?: unknown; method?: unknown; payload?: unknown }
type PendingSign = { resolve: (signed: string) => void; reject: (error: Error) => void; timeout: number; transactionHex: string; approvalWindow?: Window | null }
type PendingInfo = { resolve: (info: Record<string, unknown>) => void; reject: (error: Error) => void; timeout: number }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function requestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID()
  return `via-sign-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

let identityFrame: HTMLIFrameElement | null = null
let initialized = false
const queued: Record<string, unknown>[] = []
const pending = new Map<string, PendingSign>()
const pendingInfo = new Map<string, PendingInfo>()
let storageGrantedResolve: (() => void) | null = null

function post(message: Record<string, unknown>) {
  if (initialized) identityFrame?.contentWindow?.postMessage(message, "*")
  else queued.push(message)
}

function handleIdentityMessage(event: MessageEvent) {
  if (event.origin !== DESO_IDENTITY_ORIGIN || !identityFrame || !isRecord(event.data)) return
  const fromFrame = event.source === identityFrame.contentWindow
  const approvalEntries = [...pending.entries()].filter(([, item]) => item.approvalWindow)
  const approvalEntry = approvalEntries.length === 1 ? approvalEntries[0] : undefined
  const message = event.data as IdentityMessage
  if (message.service !== "identity") return

  // Identity window messages can return with a different WindowProxy on iPad
  // Safari. The official client trusts the Identity origin and active flow.
  if (message.method === "initialize" && typeof message.id === "string") {
    if (!initialized) {
      initialized = true
      queued.splice(0).forEach((request) => identityFrame?.contentWindow?.postMessage(request, "*"))
    }
    ;(event.source as WindowProxy).postMessage({ id: message.id, service: "identity", payload: {} }, "*")
    return
  }

  if (message.method === "storageGranted") {
    identityFrame.style.display = "none"
    storageGrantedResolve?.()
    storageGrantedResolve = null
    return
  }

  // The /approve window completes through the Identity window API, not the
  // iframe request id. Its response is method "login", id null, with the
  // signed transaction in the payload.
  if (approvalEntry && message.method === "login" && isRecord(message.payload)) {
    const [approvalId, request] = approvalEntry
    pending.delete(approvalId)
    window.clearTimeout(request.timeout)
    const signed = message.payload.signedTransactionHex
    request.approvalWindow?.close()
    if (typeof signed === "string" && signed) request.resolve(signed)
    else request.reject(new Error("DeSo Identity approval was cancelled."))
    return
  }

  if (!fromFrame) return
  if (typeof message.id !== "string" || !isRecord(message.payload)) return
  const infoRequest = pendingInfo.get(message.id)
  if (infoRequest) {
    pendingInfo.delete(message.id)
    window.clearTimeout(infoRequest.timeout)
    infoRequest.resolve(message.payload)
    return
  }

  const request = pending.get(message.id)
  if (!request) return
  pending.delete(message.id)
  window.clearTimeout(request.timeout)

  const response = message.payload
  if (response.approvalRequired === true) {
    const approvalWindow = request.approvalWindow && !request.approvalWindow.closed ? request.approvalWindow : window.open("", "via-deso-approve")
    if (!approvalWindow) {
      pending.delete(message.id)
      window.clearTimeout(request.timeout)
      request.reject(new Error("DeSo Identity approval window was blocked."))
      return
    }
    approvalWindow.location.href = `${DESO_IDENTITY_ORIGIN}/approve?tx=${encodeURIComponent(request.transactionHex)}`
    request.approvalWindow = approvalWindow
    pending.set(message.id, request)
    return
  }
  if (typeof response.error === "string" && response.error) {
    request.reject(new Error(response.error))
    return
  }
  const signed = response.signedTransactionHex
  if (typeof signed === "string" && signed) { request.approvalWindow?.close(); request.resolve(signed) }
  else request.reject(new Error("DeSo Identity did not return a signed transaction."))
}

function ensureIdentityFrame() {
  if (identityFrame?.isConnected) return
  initialized = false
  identityFrame = document.createElement("iframe")
  identityFrame.id = "via-deso-identity"
  identityFrame.src = `${DESO_IDENTITY_ORIGIN}/embed?v=2`
  identityFrame.title = "DeSo Identity"
  identityFrame.style.position = "fixed"
  identityFrame.style.inset = "0"
  identityFrame.style.width = "100vw"
  identityFrame.style.height = "100vh"
  identityFrame.style.border = "0"
  identityFrame.style.zIndex = "2147483647"
  identityFrame.style.background = "#000"
  identityFrame.style.display = "none"
  window.addEventListener("message", handleIdentityMessage)
  document.body.appendChild(identityFrame)
}

function requestIdentityInfo(): Promise<Record<string, unknown>> {
  const id = requestId()
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      pendingInfo.delete(id)
      reject(new Error("DeSo Identity info timed out."))
    }, 20_000)
    pendingInfo.set(id, { resolve, reject, timeout })
    post({ id, service: "identity", method: "info", payload: {} })
  })
}

async function ensureStorageAccess() {
  const info = await requestIdentityInfo()
  if (info.browserSupported === false) throw new Error("This browser cannot use DeSo Identity securely.")
  if (info.hasStorageAccess !== false) return

  if (!identityFrame) throw new Error("DeSo Identity is unavailable.")
  identityFrame.style.display = "block"
  await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      if (storageGrantedResolve) storageGrantedResolve = null
      reject(new Error("DeSo Identity storage access timed out."))
    }, 90_000)
    storageGrantedResolve = () => {
      window.clearTimeout(timeout)
      resolve()
    }
  })
}

export async function signViaTransaction(publicKey: string, transactionHex: string, onProgress?: (message: string) => void, reservedApprovalWindow?: Window | null): Promise<string> {
  if (typeof window === "undefined" || typeof document === "undefined") return Promise.reject(new Error("DeSo Identity is only available in the browser."))
  const credentials = getIdentityCredentials(publicKey)
  if (!credentials) return Promise.reject(new Error("No usable DeSo Identity credentials are available."))
  if (!/^[0-9a-fA-F]+$/.test(transactionHex) || transactionHex.length % 2 !== 0) return Promise.reject(new Error("Invalid DeSo transaction hex."))

  ensureIdentityFrame()
  onProgress?.("DeSo Identity: checking Safari storage…")
  const info = await requestIdentityInfo()
  const supported = info.browserSupported !== false
  const hasStorage = info.hasStorageAccess !== false
  onProgress?.(`DeSo Identity: browser ${supported ? "supported" : "unsupported"} · storage ${hasStorage ? "available" : "permission required"}`)
  if (!supported) throw new Error("This browser cannot use DeSo Identity securely.")
  if (!hasStorage) {
    if (!identityFrame) throw new Error("DeSo Identity is unavailable.")
    identityFrame.style.display = "block"
    onProgress?.("DeSo Identity: grant storage access in the Identity screen…")
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        if (storageGrantedResolve) storageGrantedResolve = null
        reject(new Error("DeSo Identity storage access timed out."))
      }, 90_000)
      storageGrantedResolve = () => {
        window.clearTimeout(timeout)
        onProgress?.("DeSo Identity: storage granted · signing…")
        resolve()
      }
    })
  } else {
    onProgress?.("DeSo Identity: signing…")
  }
  const id = requestId()

  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      pending.delete(id)
      reject(new Error("DeSo Identity transaction signing timed out."))
    }, 90_000)

    pending.set(id, { resolve, reject, timeout, transactionHex, approvalWindow: reservedApprovalWindow })
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
  })
}
