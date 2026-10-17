"use client"

import { identity, type AccessGroupEntryResponse, type NewMessageEntryResponse } from "deso-protocol"
import { clearIdentitySession, listIdentitySessions, restoreIdentitySession, SDK_ACTIVE_PUBLIC_KEY, SDK_IDENTITY_USERS, VIA_IDENTITY_EVENT } from "./deso-identity-session"

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
let loginPending = false
const identityListeners = new Set<(user: ViaModernIdentityUser | null) => void>()

function configure(redirectLogin = false) {
  if (typeof window === "undefined") return
  identity.configure({
    appName: "VIA", network: "mainnet", nodeURI: "https://node.deso.org",
    identityURI: "https://identity.deso.org", spendingLimitOptions: VIA_BASE_SPENDING_LIMITS,
    // Official SDK redirect: no Safari popup/opener dependency. Only login redirects.
    redirectURI: redirectLogin ? `${window.location.origin}/` : undefined,
  })
  configured = true
}
function ensureConfigured() { if (!configured) configure() }
function selectedUser(): ViaModernIdentityUser | null {
  const session = restoreIdentitySession()
  return session ? { publicKey: session.publicKey } : null
}
function notify() {
  const user = selectedUser()
  identityListeners.forEach((listener) => listener(user))
}
function requireUser() {
  ensureConfigured()
  const user = selectedUser()
  if (!user) throw new Error("Log in once on the VIA homepage with DeSo Identity.")
  return user
}
async function forSelectedUser<T>(operation: () => T | Promise<T>): Promise<T> {
  const user = requireUser()
  let changed = false
  const check = () => { if (selectedUser()?.publicKey !== user.publicKey) changed = true }
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === SDK_ACTIVE_PUBLIC_KEY || event.key === SDK_IDENTITY_USERS) {
      if (event.key === SDK_ACTIVE_PUBLIC_KEY && event.newValue !== user.publicKey) changed = true
      check()
    }
  }
  window.addEventListener(VIA_IDENTITY_EVENT, check)
  window.addEventListener("storage", onStorage)
  try {
    const result = await operation()
    check()
    if (changed) throw new Error("The active DeSo account changed. Please review the action again.")
    return result
  } finally {
    window.removeEventListener(VIA_IDENTITY_EVENT, check)
    window.removeEventListener("storage", onStorage)
  }
}

export const viaModernIdentity: ViaModernIdentityAdapter = {
  async currentUser() { ensureConfigured(); return selectedUser() },
  async login() {
    if (loginPending) throw new Error("DeSo Identity login is already opening.")
    loginPending = true
    try {
      localStorage.removeItem("viaActivePublicKey")
      configure(true)
      const payload = await identity.login()
      return { publicKey: payload.publicKeyBase58Check }
    } finally { loginPending = false; configure() }
  },
  async logout() { clearIdentitySession() },
  async alternateUsers() {
    ensureConfigured()
    return listIdentitySessions().map(({ publicKey }) => ({ publicKey }))
  },
  subscribe(listener) {
    ensureConfigured()
    identityListeners.add(listener)
    if (!subscribed) {
      subscribed = true
      void identity.subscribe(() => {
        notify()
        window.dispatchEvent(new CustomEvent(VIA_IDENTITY_EVENT, { detail: restoreIdentitySession() }))
      }).catch(() => notify())
      window.addEventListener(VIA_IDENTITY_EVENT, notify)
      window.addEventListener("storage", (event) => {
        if (event.key === null || event.key === SDK_ACTIVE_PUBLIC_KEY || event.key === SDK_IDENTITY_USERS) notify()
      })
      window.addEventListener("pageshow", notify)
      window.addEventListener("focus", notify)
    }
    listener(selectedUser())
    return () => { identityListeners.delete(listener) }
  },
  async setActiveUser(publicKey) {
    ensureConfigured()
    if (!listIdentitySessions().some((user) => user.publicKey === publicKey)) {
      throw new Error("This account must first log in with DeSo Identity on the VIA homepage.")
    }
    localStorage.removeItem("viaActivePublicKey")
    await identity.setActiveUser(publicKey)
    window.dispatchEvent(new CustomEvent(VIA_IDENTITY_EVENT, { detail: restoreIdentitySession() }))
  },
  signTx(transactionHex) { return forSelectedUser(() => identity.signTx(transactionHex)) },
  hasPermissions(permissions) { return forSelectedUser(() => identity.hasPermissions(permissions)) },
  requestPermissions(permissions) { return forSelectedUser(() => identity.requestPermissions(permissions)) },
  async spendingLimits() {
    return forSelectedUser(async () => {
      const state = await identity.snapshot()
      if (state.currentUser?.publicKey !== selectedUser()?.publicKey) throw new Error("DeSo account mismatch")
      return state.currentUser?.primaryDerivedKey?.transactionSpendingLimits ?? null
    })
  },
  refreshSpendingLimits() { return forSelectedUser(() => identity.refreshDerivedKeyPermissions()) },
  encryptMessage(recipientPublicKey, message) { return forSelectedUser(() => identity.encryptMessage(recipientPublicKey, message)) },
  async decryptMessage(message, groups = []) {
    return forSelectedUser(async () => (await identity.decryptMessage(message, groups)).DecryptedMessage)
  },
  jwt() { return forSelectedUser(() => identity.jwt()) },
}
export const VIA_MODERN_IDENTITY_READY = true as const
