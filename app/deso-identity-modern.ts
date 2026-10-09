"use client"

import { identity, type AccessGroupEntryResponse, type NewMessageEntryResponse } from "deso-protocol"
import { clearIdentitySession, listIdentitySessions, restoreIdentitySession, switchIdentitySession, VIA_IDENTITY_EVENT } from "./deso-identity-session"
import { requestViaIdentityJwt } from "./deso-identity-jwt"

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
  const viaSession = restoreIdentitySession()
  if (viaSession?.publicKey) return { publicKey: viaSession.publicKey }

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
    clearIdentitySession()
  },

  async alternateUsers() {
    const users = new Set(listIdentitySessions().map((session) => session.publicKey))
    ensureConfigured()
    const state = await identity.snapshot()
    Object.keys(state.alternateUsers ?? {}).forEach((publicKey) => users.add(publicKey))
    if (state.currentUser?.publicKey) users.add(state.currentUser.publicKey)
    return [...users].map((publicKey) => ({ publicKey }))
  },

  subscribe(listener) {
    ensureConfigured()
    identityListeners.add(listener)

    if (!subscribed) {
      const notify = () => {
        void currentUser().then((user) => identityListeners.forEach((currentListener) => currentListener(user)))
      }
      identity.subscribe(() => notify())
      window.addEventListener(VIA_IDENTITY_EVENT, notify)
      subscribed = true
    } else {
      void currentUser().then(listener)
    }

    return () => identityListeners.delete(listener)
  },

  async setActiveUser(publicKey: string) {
    const viaSession = switchIdentitySession(publicKey)
    if (viaSession) return
    ensureConfigured()
    await identity.setActiveUser(publicKey)
  },

  async signTx(transactionHex: string) {
    ensureConfigured()
    const state = await identity.snapshot()
    const sdkPublicKey = state.currentUser?.publicKey
    const legacyPublicKey = restoreIdentitySession()?.publicKey
    // Never sign through a different account than the one exposed to callers.
    // Legacy sessions must be migrated before they can authorize SDK transactions.
    if (legacyPublicKey) throw new Error("DESO_LEGACY_SESSION_RECONNECT_REQUIRED")
    if (!sdkPublicKey) throw new Error("DESO_IDENTITY_LOGIN_REQUIRED")
    return identity.signTx(transactionHex)
  },

  hasPermissions(permissions) {
    if (restoreIdentitySession()?.publicKey) return Promise.resolve(true)
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
    const viaSession = restoreIdentitySession()
    if (viaSession?.publicKey) return requestViaIdentityJwt(viaSession.publicKey)
    ensureConfigured()
    return identity.jwt()
  },
}

/**
 * The SDK boundary itself is now live. Existing VIA action consumers are still
 * migrated one by one before the legacy Identity files are removed.
 */
export const VIA_MODERN_IDENTITY_READY = true as const
