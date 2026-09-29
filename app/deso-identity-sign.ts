"use client"

import { DESO_IDENTITY_ORIGIN, getIdentityCredentials } from "./deso-identity-session"

type IdentityMessage = { id?: unknown; service?: unknown; method?: unknown; payload?: unknown }
type PendingSign = { resolve: (signed: string) => void; reject: (error: Error) => void; timeout: number }

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

function post(message: Record<string, unknown>) {
  if (initialized) identityFrame?.contentWindow?.postMessage(message, "*")
  else queued.push(message)
}

function handleIdentityMessage(event: MessageEvent) {
  if (event.origin !== DESO_IDENTITY_ORIGIN || !identityFrame || event.source !== identityFrame.contentWindow || !isRecord(event.data)) return
  const message = event.data as IdentityMessage
  if (message.service !== "identity") return

  if (message.method === "initialize" && typeof message.id === "string") {
    if (!initialized) {
      initialized = true
      queued.splice(0).forEach((request) => identityFrame?.contentWindow?.postMessage(request, "*"))
    }
    ;(event.source as WindowProxy).postMessage({ id: message.id, service: "identity", payload: {} }, "*")
    return
  }

  if (typeof message.id !== "string" || !isRecord(message.payload)) return
  const request = pending.get(message.id)
  if (!request) return
  pending.delete(message.id)
  window.clearTimeout(request.timeout)

  const response = message.payload
  if (response.approvalRequired === true) {
    request.reject(new Error("DeSo Identity approval is required for this transaction."))
    return
  }
  if (typeof response.error === "string" && response.error) {
    request.reject(new Error(response.error))
    return
  }
  const signed = response.signedTransactionHex
  if (typeof signed === "string" && signed) request.resolve(signed)
  else request.reject(new Error("DeSo Identity did not return a signed transaction."))
}

function ensureIdentityFrame() {
  if (identityFrame?.isConnected) return
  initialized = false
  identityFrame = document.createElement("iframe")
  identityFrame.id = "via-deso-identity"
  identityFrame.src = `${DESO_IDENTITY_ORIGIN}/embed?v=2`
  identityFrame.title = "DeSo Identity"
  identityFrame.style.display = "none"
  window.addEventListener("message", handleIdentityMessage)
  document.body.appendChild(identityFrame)
}

export function signViaTransaction(publicKey: string, transactionHex: string): Promise<string> {
  if (typeof window === "undefined" || typeof document === "undefined") return Promise.reject(new Error("DeSo Identity is only available in the browser."))
  const credentials = getIdentityCredentials(publicKey)
  if (!credentials) return Promise.reject(new Error("No usable DeSo Identity credentials are available."))
  if (!/^[0-9a-fA-F]+$/.test(transactionHex) || transactionHex.length % 2 !== 0) return Promise.reject(new Error("Invalid DeSo transaction hex."))

  ensureIdentityFrame()
  const id = requestId()

  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      pending.delete(id)
      reject(new Error("DeSo Identity transaction signing timed out."))
    }, 90_000)

    pending.set(id, { resolve, reject, timeout })
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
