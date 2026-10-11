"use client"

import { identity } from "deso-protocol"
import { DEFAULT_PERMISSIONS } from "deso-protocol/src/identity/constants.js"

export const VIA_ACTIVE_PUBLIC_KEY = "viaActivePublicKey"
export const VIA_IDENTITY_EVENT = "via:identity-session"
const SDK_ACTIVE_PUBLIC_KEY = "desoActivePublicKey"

export const VIA_BASE_SPENDING_LIMITS: Parameters<typeof identity.hasPermissions>[0] = {
  GlobalDESOLimit: DEFAULT_PERMISSIONS.GlobalDESOLimit,
  TransactionCountLimitMap: {
    SUBMIT_POST: "UNLIMITED", LIKE: "UNLIMITED", FOLLOW: "UNLIMITED",
    UPDATE_PROFILE: "UNLIMITED", CREATE_POST_ASSOCIATION: "UNLIMITED",
    NEW_MESSAGE: "UNLIMITED", CREATE_NFT: "UNLIMITED",
  },
}

let configured = false

export function ensureIdentityConfigured() {
  if (configured || typeof window === "undefined") return
  // The SDK's supported storage provider shares only the existing active
  // account selector. Both credential formats remain owned by their signers.
  const storage = window.localStorage
  const selected = storage.getItem(VIA_ACTIVE_PUBLIC_KEY) ?? storage.getItem(SDK_ACTIVE_PUBLIC_KEY)
  if (selected) storage.setItem(VIA_ACTIVE_PUBLIC_KEY, selected)
  identity.configure({
    appName: "VIA", network: "mainnet", nodeURI: "https://node.deso.org",
    identityURI: "https://identity.deso.org", spendingLimitOptions: VIA_BASE_SPENDING_LIMITS,
    storageProvider: {
      get length() { return storage.length },
      key(index: number) { return storage.key(index) },
      clear() { storage.clear() },
      getItem(key: string) {
        return storage.getItem(key === SDK_ACTIVE_PUBLIC_KEY ? VIA_ACTIVE_PUBLIC_KEY : key)
      },
      setItem(key: string, value: string) {
        if (key === SDK_ACTIVE_PUBLIC_KEY) storage.setItem(VIA_ACTIVE_PUBLIC_KEY, value)
        storage.setItem(key, value)
      },
      removeItem(key: string) {
        if (key === SDK_ACTIVE_PUBLIC_KEY) storage.removeItem(VIA_ACTIVE_PUBLIC_KEY)
        storage.removeItem(key)
      },
    },
  })
  configured = true
  identity.subscribe(() => window.dispatchEvent(new CustomEvent(VIA_IDENTITY_EVENT)))
  window.addEventListener("storage", (event) => {
    if (event.storageArea === storage && (event.key === null ||
      [VIA_ACTIVE_PUBLIC_KEY, SDK_ACTIVE_PUBLIC_KEY, "desoIdentityUsers", "identityUsersV2"].includes(event.key))) {
      window.dispatchEvent(new CustomEvent(VIA_IDENTITY_EVENT))
    }
  })
}
