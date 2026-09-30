"use client"

/**
 * Modern DeSo Identity boundary for VIA.
 *
 * This file intentionally contains no SDK import yet. It gives the migration a
 * single, typed boundary while the proven legacy Identity flow remains active.
 * The official deso-protocol dependency will be connected only together with a
 * reproducible pnpm lockfile.
 */
export type ViaModernIdentityUser = {
  publicKey: string
}

export type ViaModernIdentityAdapter = {
  currentUser(): Promise<ViaModernIdentityUser | null>
  login(): Promise<ViaModernIdentityUser>
  setActiveUser(publicKey: string): Promise<void>
  signTx(transactionHex: string): Promise<string>
  jwt(): Promise<string>
}

export const VIA_MODERN_IDENTITY_READY = false as const
