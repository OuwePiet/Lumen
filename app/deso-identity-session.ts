export const DESO_IDENTITY_ORIGIN = "https://identity.deso.org"
export const DESO_LOGIN_URL = `${DESO_IDENTITY_ORIGIN}/log-in?accessLevelRequest=2`
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

type LoginPayload = {
  users?: unknown
  publicKeyAdded?: unknown
  signedUp?: unknown
}

type LoginMessage = {
  id?: unknown
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
    accessLevel >= 2 &&
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

function sessionForPublicKey(publicKey: string, signedUp = false): ViaIdentitySession | null {
  if (!PUBLIC_KEY_RE.test(publicKey)) return null
  const credentials = readIdentityUsers()[publicKey]
  if (!isUsableCredentials(credentials)) return null
  return { publicKey, accessLevel: credentials.accessLevel, signedUp }
}

function acknowledgeIdentityInitialize(event: MessageEvent): boolean {
  if (event.origin !== DESO_IDENTITY_ORIGIN || !isRecord(event.data)) return false

  const message = event.data as LoginMessage
  if (message.service !== "identity" || message.method !== "initialize" || typeof message.id !== "string") return false
  if (!event.source) return false

  ;(event.source as WindowProxy).postMessage(
    {
      id: message.id,
      service: "identity",
      payload: {},
    },
    DESO_IDENTITY_ORIGIN,
  )
  return true
}

export function parseIdentityLoginMessage(event: MessageEvent): ViaIdentitySession | null {
  if (event.origin !== DESO_IDENTITY_ORIGIN) return null
  if (!isRecord(event.data)) return null

  const message = event.data as LoginMessage
  if (message.service !== "identity" || message.method !== "login") return null
  if (!message.payload || !isRecord(message.payload)) return null

  const publicKey = message.payload.publicKeyAdded
  const users = message.payload.users
  if (typeof publicKey !== "string" || !PUBLIC_KEY_RE.test(publicKey) || !isRecord(users)) return null

  const credentials = users[publicKey]
  if (!isUsableCredentials(credentials)) return null

  return {
    publicKey,
    accessLevel: credentials.accessLevel,
    signedUp: message.payload.signedUp === true,
  }
}

export function persistIdentityLogin(event: MessageEvent): ViaIdentitySession | null {
  if (acknowledgeIdentityInitialize(event)) return null

  const session = parseIdentityLoginMessage(event)
  if (!session) return null

  const payload = (event.data as LoginMessage).payload
  if (!payload || !isRecord(payload.users)) return null

  const existingUsers = readIdentityUsers()
  const mergedUsers = { ...existingUsers, ...payload.users }
  localStorage.setItem(IDENTITY_USERS_KEY, JSON.stringify(mergedUsers))
  localStorage.setItem(VIA_ACTIVE_PUBLIC_KEY, session.publicKey)
  window.dispatchEvent(new CustomEvent(VIA_IDENTITY_EVENT, { detail: session }))
  return session
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

export function listIdentitySessions(): ViaIdentitySession[] {
  return Object.entries(readIdentityUsers())
    .filter(([publicKey, credentials]) => PUBLIC_KEY_RE.test(publicKey) && isUsableCredentials(credentials))
    .map(([publicKey, credentials]) => ({
      publicKey,
      accessLevel: (credentials as DeSoIdentityCredentials & ViaIdentityCredentials).accessLevel,
      signedUp: false,
    }))
}

export function switchIdentitySession(publicKey: string): ViaIdentitySession | null {
  const session = sessionForPublicKey(publicKey)
  if (!session) return null
  localStorage.setItem(VIA_ACTIVE_PUBLIC_KEY, publicKey)
  window.dispatchEvent(new CustomEvent(VIA_IDENTITY_EVENT, { detail: session }))
  return session
}

export function restoreIdentitySession(): ViaIdentitySession | null {
  try {
    const publicKey = localStorage.getItem(VIA_ACTIVE_PUBLIC_KEY)
    return publicKey ? sessionForPublicKey(publicKey) : null
  } catch {
    return null
  }
}

export function clearIdentitySession(publicKey?: string) {
  localStorage.removeItem(VIA_ACTIVE_PUBLIC_KEY)
  if (publicKey) {
    const users = readIdentityUsers()
    delete users[publicKey]
    localStorage.setItem(IDENTITY_USERS_KEY, JSON.stringify(users))
  }
  window.dispatchEvent(new CustomEvent(VIA_IDENTITY_EVENT, { detail: null }))
}
