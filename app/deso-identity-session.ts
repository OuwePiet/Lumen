export const DESO_IDENTITY_ORIGIN = "https://identity.deso.org"
export const DESO_LOGIN_URL = `${DESO_IDENTITY_ORIGIN}/log-in?accessLevelRequest=2`
export const DESO_LOGOUT_URL = `${DESO_IDENTITY_ORIGIN}/logout`

const IDENTITY_USERS_KEY = "identityUsersV2"
const VIA_ACTIVE_PUBLIC_KEY = "viaActivePublicKey"
export const VIA_IDENTITY_EVENT = "via:identity-session"

type DeSoIdentityCredentials = {
  encryptedSeedHex?: unknown
  accessLevel?: unknown
  accessLevelHmac?: unknown
  network?: unknown
}

type LoginPayload = {
  users?: unknown
  publicKeyAdded?: unknown
  signedUp?: unknown
}

type LoginMessage = {
  service?: unknown
  method?: unknown
  payload?: LoginPayload
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
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
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
    accessLevel >= 2 &&
    accessLevel <= 4
  )
}

export function parseIdentityLoginMessage(event: MessageEvent): ViaIdentitySession | null {
  if (event.origin !== DESO_IDENTITY_ORIGIN) return null
  if (!isRecord(event.data)) return null

  const message = event.data as LoginMessage
  if (message.service !== "identity" || message.method !== "login") return null
  if (!message.payload || !isRecord(message.payload)) return null

  const publicKey = message.payload.publicKeyAdded
  const users = message.payload.users
  if (typeof publicKey !== "string" || publicKey.length < 20 || !isRecord(users)) return null

  const credentials = users[publicKey]
  if (!isUsableCredentials(credentials)) return null

  return {
    publicKey,
    accessLevel: credentials.accessLevel,
    signedUp: message.payload.signedUp === true,
  }
}

export function persistIdentityLogin(event: MessageEvent): ViaIdentitySession | null {
  const session = parseIdentityLoginMessage(event)
  if (!session) return null

  const payload = (event.data as LoginMessage).payload
  if (!payload || !isRecord(payload.users)) return null

  localStorage.setItem(IDENTITY_USERS_KEY, JSON.stringify(payload.users))
  localStorage.setItem(VIA_ACTIVE_PUBLIC_KEY, session.publicKey)
  window.dispatchEvent(new CustomEvent(VIA_IDENTITY_EVENT, { detail: session }))
  return session
}

export function getIdentityCredentials(publicKey: string): ViaIdentityCredentials | null {
  try {
    const rawUsers = localStorage.getItem(IDENTITY_USERS_KEY)
    if (!rawUsers) return null
    const users: unknown = JSON.parse(rawUsers)
    if (!isRecord(users)) return null
    const credentials = users[publicKey]
    if (!isUsableCredentials(credentials)) return null
    return {
      encryptedSeedHex: credentials.encryptedSeedHex,
      accessLevel: credentials.accessLevel,
      accessLevelHmac: credentials.accessLevelHmac,
    }
  } catch {
    return null
  }
}

export function restoreIdentitySession(): ViaIdentitySession | null {
  try {
    const publicKey = localStorage.getItem(VIA_ACTIVE_PUBLIC_KEY)
    const rawUsers = localStorage.getItem(IDENTITY_USERS_KEY)
    if (!publicKey || !rawUsers) return null

    const users: unknown = JSON.parse(rawUsers)
    if (!isRecord(users)) return null
    const credentials = users[publicKey]
    if (!isUsableCredentials(credentials)) return null

    return { publicKey, accessLevel: credentials.accessLevel, signedUp: false }
  } catch {
    return null
  }
}

export function clearIdentitySession(publicKey?: string) {
  localStorage.removeItem(VIA_ACTIVE_PUBLIC_KEY)
  if (!publicKey) localStorage.removeItem(IDENTITY_USERS_KEY)
  window.dispatchEvent(new CustomEvent(VIA_IDENTITY_EVENT, { detail: null }))
}
