"use client"

import { DESO_IDENTITY_ORIGIN, getIdentityCredentials } from "./deso-identity-session"

type IdentityMessage = {
  id?: unknown
  service?: unknown
  method?: unknown
  payload?: unknown
}

type IdentityInfo = {
  browserSupported?: unknown
  hasCookieAccess?: unknown
  hasLocalStorageAccess?: unknown
  hasStorageAccess?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function requestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID()
  return `via-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

/**
 * Ask DeSo Identity for a short-lived JWT proving ownership of publicKey.
 *
 * Identity JWTs are valid for roughly ten minutes. On Safari/iOS, Identity
 * may need to take over the screen briefly so the user can grant iframe
 * storage access. Credentials never leave the browser except to
 * https://identity.deso.org.
 */
export function requestViaIdentityJwt(publicKey: string): Promise<string> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.reject(new Error("DeSo Identity JWT is only available in the browser."))
  }

  const credentials = getIdentityCredentials(publicKey)
  if (!credentials) {
    return Promise.reject(new Error("No usable DeSo Identity credentials are available for this account."))
  }

  return new Promise((resolve, reject) => {
    const iframe = document.createElement("iframe")
    iframe.src = `${DESO_IDENTITY_ORIGIN}/embed`
    iframe.title = "DeSo Identity security verification"
    iframe.setAttribute("aria-label", "DeSo Identity security verification")
    iframe.style.position = "fixed"
    iframe.style.inset = "0"
    iframe.style.width = "100vw"
    iframe.style.height = "100vh"
    iframe.style.border = "0"
    iframe.style.zIndex = "2147483647"
    iframe.style.display = "none"
    iframe.style.background = "#000"

    const infoId = requestId()
    const jwtId = requestId()
    let initialized = false
    let infoRequested = false
    let jwtRequested = false
    let settled = false

    const cleanup = () => {
      window.removeEventListener("message", onMessage)
      iframe.remove()
      window.clearTimeout(timeout)
    }

    const finish = (jwt: string) => {
      if (settled) return
      settled = true
      cleanup()
      resolve(jwt)
    }

    const fail = (message: string) => {
      if (settled) return
      settled = true
      cleanup()
      reject(new Error(message))
    }

    const post = (message: Record<string, unknown>) => {
      iframe.contentWindow?.postMessage(message, DESO_IDENTITY_ORIGIN)
    }

    const requestInfo = () => {
      if (infoRequested) return
      infoRequested = true
      post({ id: infoId, service: "identity", method: "info" })
    }

    const requestJwt = () => {
      if (jwtRequested) return
      jwtRequested = true
      iframe.style.display = "none"
      post({
        id: jwtId,
        service: "identity",
        method: "jwt",
        payload: {
          encryptedSeedHex: credentials.encryptedSeedHex,
          accessLevel: credentials.accessLevel,
          accessLevelHmac: credentials.accessLevelHmac,
        },
      })
    }

    function onMessage(event: MessageEvent) {
      if (event.origin !== DESO_IDENTITY_ORIGIN || event.source !== iframe.contentWindow || !isRecord(event.data)) return

      const message = event.data as IdentityMessage
      if (message.service !== "identity") return

      if (message.method === "initialize" && typeof message.id === "string") {
        post({ id: message.id, service: "identity", payload: {} })
        if (!initialized) {
          initialized = true
          window.setTimeout(requestInfo, 0)
        }
        return
      }

      if (message.method === "storageGranted") {
        requestJwt()
        return
      }

      if (message.id === infoId && isRecord(message.payload)) {
        const info = message.payload as IdentityInfo
        if (info.browserSupported === false) {
          fail("This browser cannot use DeSo Identity securely.")
          return
        }
        if (info.hasStorageAccess === true) {
          requestJwt()
        } else {
          // Safari/iOS can require an explicit tap inside Identity before the
          // iframe is allowed to use its secure storage.
          iframe.style.display = "block"
        }
        return
      }

      if (message.id === jwtId && isRecord(message.payload)) {
        const jwt = message.payload.jwt
        if (typeof jwt === "string" && jwt.split(".").length === 3) {
          finish(jwt)
          return
        }
        fail("DeSo Identity did not return a valid owner verification token.")
      }
    }

    const timeout = window.setTimeout(() => {
      fail("DeSo Identity verification timed out. Please try again.")
    }, 90_000)

    window.addEventListener("message", onMessage)
    document.body.appendChild(iframe)
  })
}
