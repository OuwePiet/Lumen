"use client"

import { DESO_IDENTITY_ORIGIN, getIdentityCredentials } from "./deso-identity-session"

type IdentityMessage = { id?: unknown; service?: unknown; method?: unknown; payload?: unknown }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function requestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID()
  return `via-message-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function identityRequest(publicKey: string, method: "encrypt" | "decrypt", payload: Record<string, unknown>): Promise<Record<string, unknown>> {
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

    const id = requestId()
    let initialized = false
    let settled = false
    const cleanup = () => { window.removeEventListener("message", onMessage); iframe.remove(); window.clearTimeout(timeout) }
    const fail = (message: string) => { if (settled) return; settled = true; cleanup(); reject(new Error(message)) }
    const post = (message: Record<string, unknown>) => iframe.contentWindow?.postMessage(message, DESO_IDENTITY_ORIGIN)
    const request = () => post({ id, service: "identity", method, payload: { ...payload, encryptedSeedHex: credentials.encryptedSeedHex, accessLevel: credentials.accessLevel, accessLevelHmac: credentials.accessLevelHmac } })

    function onMessage(event: MessageEvent) {
      if (event.origin !== DESO_IDENTITY_ORIGIN || event.source !== iframe.contentWindow || !isRecord(event.data)) return
      const message = event.data as IdentityMessage
      if (message.service !== "identity") return
      if (message.method === "initialize" && typeof message.id === "string") {
        post({ id: message.id, service: "identity", payload: {} })
        if (!initialized) { initialized = true; window.setTimeout(request, 0) }
        return
      }
      if (message.id === id && isRecord(message.payload)) {
        const response = message.payload
        if (response.approvalRequired === true) { fail("DeSo Identity approval is required for message security."); return }
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
