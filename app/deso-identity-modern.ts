"use client"

import { identity, type AccessGroupEntryResponse, type NewMessageEntryResponse } from "deso-protocol"
import { listIdentitySessions, restoreIdentitySession, SDK_ACTIVE_PUBLIC_KEY, SDK_IDENTITY_USERS, VIA_IDENTITY_EVENT } from "./deso-identity-session"
import { resumeIdentityReturn } from "./deso-identity-return"

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
  resumeRedirect(): void
  encryptMessage(recipientPublicKey: string, message: string): Promise<string>
  decryptMessage(message: NewMessageEntryResponse, groups?: AccessGroupEntryResponse[]): Promise<string>
  jwt(): Promise<string>
}

let configured = false
let subscribed = false
let loginPending = false
const identityListeners = new Set<(user: ViaModernIdentityUser | null) => void>()

function configure(redirectLogin = false) {
  if (typeof window === "undefined") return
  identity.configure({
    appName: "VIA", network: "mainnet", nodeURI: "https://node.deso.org",
    identityURI: "https://identity.deso.org",
    // Official SDK redirect: no Safari popup/opener dependency. Only login redirects.
    redirectURI: redirectLogin ? `${window.location.origin}/` : undefined,
    identityPresenter: redirectLogin ? (url) => { window.location.href = url } : undefined,
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
  async currentUser() { ensureConfigured(); const { currentUser } = await identity.snapshot(); return currentUser ? { publicKey: currentUser.publicKey } : null },
  async login() {
    // 3.4.1: the homepage is the sole entry for a new DeSo login.
    if (window.location.pathname !== "/") { window.location.assign("/"); throw new Error("Continue on the VIA homepage.") }
    if (loginPending) throw new Error("DeSo Identity login is already opening.")
    loginPending = true
    try {
      configure(true)
      const payload = await identity.login()
      return { publicKey: payload.publicKeyBase58Check }
    } finally { loginPending = false; configure() }
  },
  async logout() { ensureConfigured(); await identity.logout() },
  async alternateUsers() {
    ensureConfigured()
    const { currentUser, alternateUsers } = await identity.snapshot(); return [...(currentUser ? [currentUser] : []), ...Object.values(alternateUsers ?? {})].map(({ publicKey }) => ({ publicKey }))
  },
  resumeRedirect() {
    resumeIdentityReturn((url) => identity.handleRedirectURI(url))

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
    await identity.setActiveUser(publicKey)
    window.dispatchEvent(new CustomEvent(VIA_IDENTITY_EVENT, { detail: restoreIdentitySession() }))
  },
  signTx(transactionHex) { return forSelectedUser(() => identity.signTx(transactionHex)) },
  encryptMessage(recipientPublicKey, message) { return forSelectedUser(() => identity.encryptMessage(recipientPublicKey, message)) },
  async decryptMessage(message, groups = []) {
    return forSelectedUser(async () => (await identity.decryptMessage(message, groups)).DecryptedMessage)
  },
  jwt() { return forSelectedUser(() => identity.jwt()) },
}
export const VIA_MODERN_IDENTITY_READY = true as const

// SDK 3.4.1 starts redirect handling in its constructor. Configure synchronously
// in this module, before that async callback resumes, rather than waiting for a
// React effect: otherwise key registration uses the SDK's default blockproducer
// endpoint and empty app name instead of VIA's configured node and app name.
if (typeof window !== "undefined") configure()
