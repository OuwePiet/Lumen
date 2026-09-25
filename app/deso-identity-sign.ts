"use client"

import { DESO_IDENTITY_ORIGIN, getIdentityCredentials } from "./deso-identity-session"

type IdentityMessage = { id?: unknown; service?: unknown; method?: unknown; payload?: unknown }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function requestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID()
  return `via-sign-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function signViaTransaction(publicKey: string, transactionHex: string): Promise<string> {
  if (typeof window === "undefined" || typeof document === "undefined") return Promise.reject(new Error("DeSo Identity is only available in the browser."))
  const credentials = getIdentityCredentials(publicKey)
  if (!credentials) return Promise.reject(new Error("No usable DeSo Identity credentials are available."))
  if (!/^[0-9a-fA-F]+$/.test(transactionHex) || transactionHex.length % 2 !== 0) return Promise.reject(new Error("Invalid DeSo transaction hex."))

  return new Promise((resolve, reject) => {
    const iframe = document.createElement("iframe")
    iframe.src = `${DESO_IDENTITY_ORIGIN}/embed`
    iframe.title = "DeSo Identity transaction approval"
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
    const request = () => post({
      id,
      service: "identity",
      method: "sign",
      payload: {
        encryptedSeedHex: credentials.encryptedSeedHex,
        accessLevel: credentials.accessLevel,
        accessLevelHmac: credentials.accessLevelHmac,
        transactionHex,
      },
    })

    function onMessage(event: MessageEvent) {
      if (event.origin !== DESO_IDENTITY_ORIGIN || event.source !== iframe.contentWindow || !isRecord(event.data)) return
      const message = event.data as IdentityMessage
      if (message.service !== "identity") return
      if (message.method === "initialize" && typeof message.id === "string") {
        post({ id: message.id, service: "identity", payload: {} })
        if (!initialized) { initialized = true; window.setTimeout(request, 0) }
        return
      }
      if (message.id !== id || !isRecord(message.payload)) return
      const response = message.payload
      if (response.approvalRequired === true) {
        fail("DeSo Identity approval is required for this transaction.")
        return
      }
      if (typeof response.error === "string" && response.error) { fail(response.error); return }
      const signedTransactionHex = response.signedTransactionHex
      if (typeof signedTransactionHex !== "string" || !signedTransactionHex) { fail("DeSo Identity did not return a signed transaction."); return }
      settled = true
      cleanup()
      resolve(signedTransactionHex)
    }

    const timeout = window.setTimeout(() => fail("DeSo Identity transaction signing timed out."), 90_000)
    window.addEventListener("message", onMessage)
    document.body.appendChild(iframe)
  })
}
