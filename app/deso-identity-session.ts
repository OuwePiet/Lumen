export const DESO_IDENTITY_ORIGIN = "https://identity.deso.org"
export const DESO_LOGOUT_URL = `${DESO_IDENTITY_ORIGIN}/logout`

const IDENTITY_USERS_KEY = "identityUsersV2"
const VIA_ACTIVE_PUBLIC_KEY = "viaActivePublicKey"
const PUBLIC_KEY_RE = /^[1-9A-HJ-NP-Za-km-z]{20,100}$/
export const VIA_IDENTITY_EVENT = "via:identity-session"

type DeSoIdentityCredentials = {
  encryptedSeedHex?: unknown
  accessLevel?: unknown
  accessLevelHmac?: unknown
  network?: unknown
  encryptedMessagingKeyRandomness?: unknown
  derivedPublicKeyBase58Check?: unknown
  ownerPublicKeyBase58Check?: unknown
}

export type ViaIdentitySession = {
  publicKey: string
  accessLevel: number
  signedUp: boolean
}

export type ViaIdentityCredentials = {
  encryptedSeedHex: string
  accessLevel: number
  accessLevelHmac: string
  encryptedMessagingKeyRandomness?: string
  derivedPublicKeyBase58Check?: string
  ownerPublicKeyBase58Check?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined
}

function isUsableCredentials(value: unknown): value is DeSoIdentityCredentials & ViaIdentityCredentials {
  if (!isRecord(value)) return false
  const accessLevel = value.accessLevel
  return (
    typeof value.encryptedSeedHex === "string" &&
    value.encryptedSeedHex.length > 0 &&
    typeof value.accessLevelHmac === "string" &&
    value.accessLevelHmac.length > 0 &&
    typeof accessLevel === "number" &&
    Number.isInteger(accessLevel) &&
    accessLevel >= 3 &&
    accessLevel <= 4
  )
}

function readIdentityUsers(): Record<string, unknown> {
  try {
    const rawUsers = localStorage.getItem(IDENTITY_USERS_KEY)
    if (!rawUsers) return {}
    const users: unknown = JSON.parse(rawUsers)
    return isRecord(users) ? users : {}
  } catch {
    return {}
  }
}

export function getIdentityCredentials(publicKey: string): ViaIdentityCredentials | null {
  try {
    const credentials = readIdentityUsers()[publicKey]
    if (!isUsableCredentials(credentials)) return null
    return {
      encryptedSeedHex: credentials.encryptedSeedHex,
      accessLevel: credentials.accessLevel,
      accessLevelHmac: credentials.accessLevelHmac,
      encryptedMessagingKeyRandomness: optionalString(credentials.encryptedMessagingKeyRandomness),
      derivedPublicKeyBase58Check: optionalString(credentials.derivedPublicKeyBase58Check),
      ownerPublicKeyBase58Check: optionalString(credentials.ownerPublicKeyBase58Check),
    }
  } catch {
    return null
  }
}

// SDK 3.4.1 is the only active session. Legacy encrypted credentials remain
// untouched, but never select an account implicitly.
export const SDK_ACTIVE_PUBLIC_KEY = "desoActivePublicKey"
export const SDK_IDENTITY_USERS = "desoIdentityUsers"

export function listIdentitySessions(): ViaIdentitySession[] {
  try {
    const users: unknown = JSON.parse(localStorage.getItem(SDK_IDENTITY_USERS) || "{}")
    if (!isRecord(users)) return []
    return Object.entries(users).flatMap(([publicKey, user]) => {
      if (!PUBLIC_KEY_RE.test(publicKey) || !isRecord(user) || user.publicKey !== publicKey) return []
      const key = user.primaryDerivedKey
      if (!isRecord(key) || key.publicKeyBase58Check !== publicKey || key.derivedKeyRegistered !== true) return []
      return [{ publicKey, accessLevel: 3, signedUp: false }]
    })
  } catch { return [] }
}

export function restoreIdentitySession(): ViaIdentitySession | null {
  try {
    const active = localStorage.getItem(SDK_ACTIVE_PUBLIC_KEY)
    return listIdentitySessions().find((session) => session.publicKey === active) ?? null
  } catch { return null }
}

/** Local VIA sign-out, not revocation of the account's DeSo derived key. */
export function clearIdentitySession() {
  localStorage.removeItem(VIA_ACTIVE_PUBLIC_KEY)
  localStorage.removeItem(SDK_ACTIVE_PUBLIC_KEY)
  window.dispatchEvent(new CustomEvent(VIA_IDENTITY_EVENT, { detail: null }))
}
