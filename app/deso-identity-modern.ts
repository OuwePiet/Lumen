"use client"

import { identity, type AccessGroupEntryResponse, type NewMessageEntryResponse } from "deso-protocol"
import { clearIdentitySession, listIdentitySessions, restoreIdentitySession, restoreLegacyIdentitySession, switchIdentitySession, VIA_IDENTITY_EVENT, logoutLegacyIdentity } from "./deso-identity-session"
import { ensureIdentityConfigured as ensureConfigured } from "./deso-identity-config"
import { guardTxPermission } from "deso-protocol/src/transactions/utils.js"
export { VIA_BASE_SPENDING_LIMITS } from "./deso-identity-config"
import { signViaTransaction } from "./deso-identity-sign"
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
  ensurePostPermissions(feeNanos: number | null | undefined): Promise<void>
  hasPermissions(permissions: Parameters<typeof identity.hasPermissions>[0]): ReturnType<typeof identity.hasPermissions>
  requestPermissions(permissions: Parameters<typeof identity.requestPermissions>[0]): ReturnType<typeof identity.requestPermissions>
  spendingLimits(): Promise<NonNullable<Awaited<ReturnType<typeof identity.snapshot>>["currentUser"]>["primaryDerivedKey"]["transactionSpendingLimits"] | null>
  refreshSpendingLimits(): Promise<void>
  encryptMessage(recipientPublicKey: string, message: string): Promise<string>
  decryptMessage(message: NewMessageEntryResponse, groups?: AccessGroupEntryResponse[]): Promise<string>
  jwt(): Promise<string>
}

let subscribed = false
const identityListeners = new Set<(user: ViaModernIdentityUser | null) => void>()

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
    ensureConfigured()
    const user = await currentUser()
    if (!user) { clearIdentitySession(); return }
    const state = await identity.snapshot()
    if (state.currentUser?.publicKey === user.publicKey) await identity.logout()
    else await logoutLegacyIdentity(user.publicKey)
    // Remove the active user's credentials in both formats. Other authorized
    // accounts remain available for explicit switching; none becomes active.
    clearIdentitySession(user.publicKey)
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
    const viaSession = restoreLegacyIdentitySession()
    if (viaSession?.publicKey) return signViaTransaction(viaSession.publicKey, transactionHex)
    ensureConfigured()
    return identity.signTx(transactionHex)
  },

  async ensurePostPermissions(feeNanos) {
    if (restoreLegacyIdentitySession()) return
    ensureConfigured()
    if (typeof feeNanos !== "number" || !Number.isSafeInteger(feeNanos) || feeNanos < 0) throw new Error("DESO_POST_FEE_UNAVAILABLE")
    // Use the SDK's own guard and the actual node-provided fee. No spending
    // price or permission budget is calculated by VIA.
    await guardTxPermission({ GlobalDESOLimit: feeNanos, TransactionCountLimitMap: { SUBMIT_POST: "UNLIMITED" } })
  },

  hasPermissions(permissions) {
    if (restoreLegacyIdentitySession()?.publicKey) return Promise.resolve(true)
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
    const viaSession = restoreLegacyIdentitySession()
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
