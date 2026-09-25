"use client"

import { DESO_IDENTITY_ORIGIN, getIdentityCredentials } from "./deso-identity-session"

type IdentityMessage = { id?: unknown; service?: unknown; method?: unknown; payload?: unknown }
type IdentityInfo = { browserSupported?: unknown; hasStorageAccess?: unknown }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function requestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID()
  return `via-message-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function identityRequest(publicKey: string, method: "encrypt" | "decrypt" | "sign", payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  if (typeof window === "undefined" || typeof document === "undefined") return Promise.reject(new Error("DeSo Identity is only available in the browser."))
  const credentials = getIdentityCredentials(publicKey)
  if (!credentials) return Promise.reject(new Error("No usable DeSo Identity credentials are available."))

  return new Promise((resolve, reject) => {
    const iframe = document.createElement("iframe")
    iframe.src = `${DESO_IDENTITY_ORIGIN}/embed`
    iframe.title = "DeSo Identity message security"
    iframe.style.position = "fixed"
    iframe.style.inset = "0"
    iframe.style.width = "100vw"
    iframe.style.height = "100vh"
    iframe.style.border = "0"
    iframe.style.zIndex = "2147483647"
    iframe.style.display = "none"
    iframe.style.background = "#000"

    const infoId = requestId()
    const id = requestId()
    let initialized = false
    let infoRequested = false
    let requestSent = false
    let settled = false
    const cleanup = () => { window.removeEventListener("message", onMessage); iframe.remove(); window.clearTimeout(timeout) }
    const fail = (message: string) => { if (settled) return; settled = true; cleanup(); reject(new Error(message)) }
    const post = (message: Record<string, unknown>) => iframe.contentWindow?.postMessage(message, DESO_IDENTITY_ORIGIN)
    const requestInfo = () => {
      if (infoRequested) return
      infoRequested = true
      post({ id: infoId, service: "identity", method: "info" })
    }
    const request = () => {
      if (requestSent) return
      requestSent = true
      iframe.style.display = "none"
      post({
        id,
        service: "identity",
        method,
        payload: {
          ...payload,
          encryptedSeedHex: credentials.encryptedSeedHex,
          accessLevel: credentials.accessLevel,
          accessLevelHmac: credentials.accessLevelHmac,
          ...(credentials.encryptedMessagingKeyRandomness ? { encryptedMessagingKeyRandomness: credentials.encryptedMessagingKeyRandomness } : {}),
          ...(credentials.derivedPublicKeyBase58Check ? { derivedPublicKeyBase58Check: credentials.derivedPublicKeyBase58Check } : {}),
          ...(credentials.ownerPublicKeyBase58Check ? { ownerPublicKeyBase58Check: credentials.ownerPublicKeyBase58Check } : {}),
        },
      })
    }

    function onMessage(event: MessageEvent) {
      if (event.origin !== DESO_IDENTITY_ORIGIN || event.source !== iframe.contentWindow || !isRecord(event.data)) return
      const message = event.data as IdentityMessage
      if (message.service !== "identity") return
      if (message.method === "initialize" && typeof message.id === "string") {
        post({ id: message.id, service: "identity", payload: {} })
        if (!initialized) { initialized = true; window.setTimeout(requestInfo, 0) }
        return
      }
      if (message.method === "storageGranted") {
        request()
        return
      }
      if (message.id === infoId && isRecord(message.payload)) {
        const info = message.payload as IdentityInfo
        if (info.browserSupported === false) { fail("This browser cannot use DeSo Identity securely."); return }
        if (info.hasStorageAccess === true) request()
        else iframe.style.display = "block"
        return
      }
      if (message.id === id && isRecord(message.payload)) {
        const response = message.payload
        if (response.approvalRequired === true) { fail("DeSo Identity approval is required for this message action."); return }
        if (response.requiresEncryptedMessagingKeyRandomness === true) { fail("This DeSo Identity session needs messaging-key authorization before messages can be encrypted."); return }
        if (typeof response.error === "string" && response.error) { fail(response.error); return }
        settled = true; cleanup(); resolve(response)
      }
    }

    const timeout = window.setTimeout(() => fail("DeSo Identity message security timed out."), 90_000)
    window.addEventListener("message", onMessage)
    document.body.appendChild(iframe)
  })
}

export async function encryptViaMessage(publicKey: string, recipientPublicKey: string, message: string, senderGroupKeyName = "default-key") {
  const response = await identityRequest(publicKey, "encrypt", { recipientPublicKey, message, senderGroupKeyName })
  const encryptedMessage = response.encryptedMessage
  if (typeof encryptedMessage !== "string" || !encryptedMessage) throw new Error("DeSo Identity did not return an encrypted message.")
  return encryptedMessage
}

export async function decryptViaMessages(publicKey: string, encryptedMessages: unknown[], messagingGroups: unknown[] = []) {
  const response = await identityRequest(publicKey, "decrypt", { encryptedMessages, messagingGroups })
  const decryptedHexes = response.decryptedHexes
  return isRecord(decryptedHexes) ? decryptedHexes : {}
}

export async function signViaMessageTransaction(publicKey: string, transactionHex: string) {
  const response = await identityRequest(publicKey, "sign", { transactionHex })
  const signedTransactionHex = response.signedTransactionHex
  if (typeof signedTransactionHex !== "string" || !signedTransactionHex) throw new Error("DeSo Identity did not return a signed transaction.")
  return signedTransactionHex
}
