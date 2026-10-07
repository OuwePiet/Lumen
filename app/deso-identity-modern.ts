"use client"

import { identity, type AccessGroupEntryResponse, type NewMessageEntryResponse } from "deso-protocol"

/**
 * Central modern DeSo Identity boundary for VIA.
 *
 * All VIA pages can use this adapter instead of opening their own Identity
 * iframe/popup. Transaction permissions remain controlled by DeSo.
 */
export type ViaModernIdentityUser = {
  publicKey: string
}

export type ViaModernIdentityAdapter = {
  currentUser(): Promise<ViaModernIdentityUser | null>
  login(): Promise<ViaModernIdentityUser>
  logout(): Promise<void>
  alternateUsers(): Promise<ViaModernIdentityUser[]>
  subscribe(listener: (user: ViaModernIdentityUser | null) => void): () => void
  setActiveUser(publicKey: string): Promise<void>
  signTx(transactionHex: string): Promise<string>
  hasPermissions(permissions: Parameters<typeof identity.hasPermissions>[0]): ReturnType<typeof identity.hasPermissions>
  requestPermissions(permissions: Parameters<typeof identity.requestPermissions>[0]): ReturnType<typeof identity.requestPermissions>
  spendingLimits(): Promise<NonNullable<Awaited<ReturnType<typeof identity.snapshot>>["currentUser"]>["primaryDerivedKey"]["transactionSpendingLimits"] | null>
  refreshSpendingLimits(): Promise<void>
  encryptMessage(recipientPublicKey: string, message: string): Promise<string>
  decryptMessage(message: NewMessageEntryResponse, groups?: AccessGroupEntryResponse[]): Promise<string>
  jwt(): Promise<string>
}

export const VIA_BASE_SPENDING_LIMITS: Parameters<typeof identity.hasPermissions>[0] = {
  TransactionCountLimitMap: {
    SUBMIT_POST: "UNLIMITED",
    LIKE: "UNLIMITED",
    FOLLOW: "UNLIMITED",
    UPDATE_PROFILE: "UNLIMITED",
    CREATE_POST_ASSOCIATION: "UNLIMITED",
    NEW_MESSAGE: "UNLIMITED",
    CREATE_NFT: "UNLIMITED",
  },
}

let configured = false
let subscribed = false
const identityListeners = new Set<(user: ViaModernIdentityUser | null) => void>()

function ensureConfigured() {
  if (configured || typeof window === "undefined") return

  identity.configure({
    appName: "VIA",
    network: "mainnet",
    nodeURI: "https://node.deso.org",
    identityURI: "https://identity.deso.org",
    spendingLimitOptions: VIA_BASE_SPENDING_LIMITS,
  })

  configured = true
}

async function currentUser(): Promise<ViaModernIdentityUser | null> {
  ensureConfigured()
  const state = await identity.snapshot()
  const publicKey = state.currentUser?.publicKey
  return publicKey ? { publicKey } : null
}

export const viaModernIdentity: ViaModernIdentityAdapter = {
  currentUser,

  async login() {
    ensureConfigured()
    const payload = await identity.login()
    return { publicKey: payload.publicKeyBase58Check }
  },

  async logout() {
    ensureConfigured()
    await identity.logout()
  },

  async alternateUsers() {
    ensureConfigured()
    const state = await identity.snapshot()
    return Object.keys(state.alternateUsers ?? {}).map((publicKey) => ({ publicKey }))
  },

  subscribe(listener) {
    ensureConfigured()
    identityListeners.add(listener)

    if (!subscribed) {
      identity.subscribe((state) => {
        const publicKey = state.currentUser?.publicKey
        const user = publicKey ? { publicKey } : null
        identityListeners.forEach((currentListener) => currentListener(user))
      })
      subscribed = true
    } else {
      void currentUser().then(listener)
    }

    return () => identityListeners.delete(listener)
  },

  async setActiveUser(publicKey: string) {
    ensureConfigured()
    await identity.setActiveUser(publicKey)
  },

  async signTx(transactionHex: string) {
    ensureConfigured()
    return identity.signTx(transactionHex)
  },

  hasPermissions(permissions) {
    ensureConfigured()
    return identity.hasPermissions(permissions)
  },

  requestPermissions(permissions) {
    ensureConfigured()
    return identity.requestPermissions(permissions)
  },

  async spendingLimits() {
    ensureConfigured()
    const state = await identity.snapshot()
    return state.currentUser?.primaryDerivedKey?.transactionSpendingLimits ?? null
  },

  async refreshSpendingLimits() {
    ensureConfigured()
    await identity.refreshDerivedKeyPermissions()
  },

  async encryptMessage(recipientPublicKey: string, message: string) {
    ensureConfigured()
    return identity.encryptMessage(recipientPublicKey, message)
  },

  async decryptMessage(message: NewMessageEntryResponse, groups: AccessGroupEntryResponse[] = []) {
    ensureConfigured()
    const result = await identity.decryptMessage(message, groups)
    return result.DecryptedMessage
  },

  async jwt() {
    ensureConfigured()
    return identity.jwt()
  },
}

/**
 * The SDK boundary itself is now live. Existing VIA action consumers are still
 * migrated one by one before the legacy Identity files are removed.
 */
export const VIA_MODERN_IDENTITY_READY = true as const
