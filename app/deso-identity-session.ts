export const DESO_IDENTITY_ORIGIN = "https://identity.deso.org"
export const DESO_LOGOUT_URL = `${DESO_IDENTITY_ORIGIN}/logout`

export const VIA_IDENTITY_EVENT = "via:identity-session"

export type ViaIdentitySession = {
  publicKey: string
}

export const SDK_ACTIVE_PUBLIC_KEY = "desoActivePublicKey"
export const SDK_IDENTITY_USERS = "desoIdentityUsers"
