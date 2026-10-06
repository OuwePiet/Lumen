"use client"

import { identity } from "deso-protocol"

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
  setActiveUser(publicKey: string): Promise<void>
  signTx(transactionHex: string): Promise<string>
  jwt(): Promise<string>
}

let configured = false

function ensureConfigured() {
  if (configured || typeof window === "undefined") return

  identity.configure({
    appName: "VIA",
    network: "mainnet",
    nodeURI: "https://node.deso.org",
    identityURI: "https://identity.deso.org",
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

  async setActiveUser(publicKey: string) {
    ensureConfigured()
    await identity.setActiveUser(publicKey)
  },

  async signTx(transactionHex: string) {
    ensureConfigured()
    return identity.signTx(transactionHex)
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
