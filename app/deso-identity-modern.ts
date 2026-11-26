"use client"

import { identity, type AccessGroupEntryResponse, type NewMessageEntryResponse } from "deso-protocol"
import { SDK_ACTIVE_PUBLIC_KEY, SDK_IDENTITY_USERS, VIA_IDENTITY_EVENT } from "./deso-identity-session"


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

  })
  configured = true
}
function ensureConfigured() { if (!configured) configure() }
function publish(user: ViaModernIdentityUser | null) {
  identityListeners.forEach(listener => listener(user))
}
function notify() {
  void viaModernIdentity.currentUser().then(publish).catch(() => {})
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
  subscribe(listener) {
    ensureConfigured()
    identityListeners.add(listener)
    if (!subscribed) {
      subscribed = true
      void identity.subscribe(({ currentUser }) => {
        publish(currentUser ? { publicKey: currentUser.publicKey } : null)

        window.dispatchEvent(new CustomEvent(VIA_IDENTITY_EVENT, { detail: currentUser ? { publicKey: currentUser.publicKey } : null }))
      }).catch(() => notify())

      window.addEventListener("storage", (event) => {
        if (event.key === null || event.key === SDK_ACTIVE_PUBLIC_KEY || event.key === SDK_IDENTITY_USERS) notify()
      })
      window.addEventListener("pageshow", notify)
      window.addEventListener("focus", notify)
    }
    void viaModernIdentity.currentUser().then(user => { if (identityListeners.has(listener)) listener(user) }).catch(() => {})

    return () => { identityListeners.delete(listener) }
  },
  async setActiveUser(publicKey) {
    ensureConfigured()
    await identity.setActiveUser(publicKey)
  },
  signTx(transactionHex) { ensureConfigured(); return identity.signTx(transactionHex) },
  encryptMessage(recipientPublicKey, message) { ensureConfigured(); return identity.encryptMessage(recipientPublicKey, message) },
  async decryptMessage(message, groups = []) {
    ensureConfigured(); return (await identity.decryptMessage(message, groups)).DecryptedMessage
  },
  jwt() { ensureConfigured(); return identity.jwt() },
}
export const VIA_MODERN_IDENTITY_READY = true as const

// SDK 3.4.1 starts redirect handling in its constructor. Configure synchronously
// in this module, before that async callback resumes, rather than waiting for a
// React effect: otherwise key registration uses the SDK's default blockproducer
// endpoint and empty app name instead of VIA's configured node and app name.
if (typeof window !== "undefined") configure()
