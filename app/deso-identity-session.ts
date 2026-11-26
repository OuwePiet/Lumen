import { identity } from "deso-protocol"
export const DESO_IDENTITY_ORIGIN = "https://identity.deso.org"
export const DESO_LOGOUT_URL = `${DESO_IDENTITY_ORIGIN}/logout`

export const VIA_IDENTITY_EVENT = "via:identity-session"

export type ViaIdentitySession = {
  publicKey: string
  accessLevel: number
  signedUp: boolean
}

export const SDK_ACTIVE_PUBLIC_KEY = "desoActivePublicKey"
export const SDK_IDENTITY_USERS = "desoIdentityUsers"

export function listIdentitySessions(): ViaIdentitySession[] {
  try {
    const state = identity.snapshot()
    if (state instanceof Promise) return []
    return [...(state.currentUser ? [state.currentUser] : []), ...Object.values(state.alternateUsers ?? {})].map(user => ({ publicKey: user.publicKey, accessLevel: 3, signedUp: false }))
  } catch { return [] }
}
export function restoreIdentitySession(): ViaIdentitySession | null {
  try {
    const state = identity.snapshot()
    if (state instanceof Promise || !state.currentUser) return null
    return { publicKey: state.currentUser.publicKey, accessLevel: 3, signedUp: false }
  } catch { return null }
}
