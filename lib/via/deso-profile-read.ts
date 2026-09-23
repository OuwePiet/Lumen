import { fetchDeSo } from "../../app/deso-api"

export type ViaPublicProfile = {
  publicKey: string
  username: string
  description: string
  profilePic: string | null
  isVerified: boolean
  verificationSources: string[]
  creatorBasisPoints: number | null
  coinPriceDeSoNanos: number | null
  numberOfHolders: number | null
  coinsInCirculationNanos: number | null
  desoLockedNanos: number | null
  followersCount: number | null
  followingCount: number | null
  lastPublicActivityAt: string | null
  isInactive: boolean
}

type DeSoProfileResponse = {
  Profile?: {
    PublicKeyBase58Check?: unknown
    Username?: unknown
    Description?: unknown
    ProfilePic?: unknown
    IsVerified?: unknown
    ExtraData?: unknown
    extraData?: unknown
    CoinPriceDeSoNanos?: unknown
    CoinEntry?: {
      CreatorBasisPoints?: unknown
      NumberOfHolders?: unknown
      CoinsInCirculationNanos?: unknown
      DeSoLockedNanos?: unknown
    } | null
  } | null
}

type DeSoFollowsResponse = {
  NumFollowers?: unknown
}

type DeSoPostsResponse = {
  Posts?: Array<{ TimestampNanos?: unknown }>
}

const INACTIVE_AFTER_MS = 90 * 24 * 60 * 60 * 1000

const TRUSTED_VERIFICATION_NODES = [
  { label: "Diamond", origin: "https://diamondapp.com" },
  { label: "DeSocialWorld", origin: "https://desocialworld.com" },
  { label: "SafetyNet / MyDeSoSpace", origin: "https://consensus.safetynet.social" },
] as const

const VERIFICATION_TIMEOUT_MS = 3_500

function text(value: unknown) {
  return typeof value === "string" ? value : ""
}

function numberOrNull(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

function profilePictureUrl(publicKey: string, profilePic: string) {
  if (/^https:\/\//i.test(profilePic)) return profilePic
  if (!publicKey) return null
  return `https://node.deso.org/api/v0/get-single-profile-picture/${encodeURIComponent(publicKey)}`
}

function extraDataRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>
  if (typeof value !== "string" || !value.trim()) return null
  try {
    const parsed = JSON.parse(value)
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null
  } catch {
    return null
  }
}

function verificationFromProfile(profile: NonNullable<DeSoProfileResponse["Profile"]>) {
  const extraData = extraDataRecord(profile.ExtraData) ?? extraDataRecord(profile.extraData)
  const current = extraData?.IsVerified
  if (current === true || current === "true") return true
  if (current === false || current === "false") return false
  return profile.IsVerified === true
}


async function readVerificationFromTrustedNode(
  origin: string,
  publicKey: string,
) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), VERIFICATION_TIMEOUT_MS)

  try {
    const response = await fetch(`${origin}/api/v0/get-single-profile`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        PublicKeyBase58Check: publicKey,
        Username: "",
      }),
      cache: "no-store",
      signal: controller.signal,
      credentials: "omit",
      referrerPolicy: "no-referrer",
    })

    if (!response.ok) return false
    const data = (await response.json()) as DeSoProfileResponse
    const profile = data.Profile
    if (!profile) return false
    if (text(profile.PublicKeyBase58Check) !== publicKey) return false
    return verificationFromProfile(profile)
  } catch {
    return false
  } finally {
    clearTimeout(timeout)
  }
}

async function readTrustedVerificationSources(
  publicKey: string,
  canonicalVerified: boolean,
) {
  const sources: string[] = canonicalVerified ? ["DeSo"] : []
  const results = await Promise.all(
    TRUSTED_VERIFICATION_NODES.map(async (node) => ({
      label: node.label,
      verified: await readVerificationFromTrustedNode(node.origin, publicKey),
    })),
  )

  for (const result of results) {
    if (result.verified) sources.push(result.label)
  }

  return sources
}

async function readFollowCount(publicKey: string, followers: boolean) {
  const response = await fetchDeSo("get-follows-stateless", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      PublicKeyBase58Check: publicKey,
      Username: "",
      GetEntriesFollowingUsername: followers,
      LastPublicKeyBase58Check: "",
      NumToFetch: 1,
    }),
  })

  if (!response.ok) return null
  const data = (await response.json()) as DeSoFollowsResponse
  return numberOrNull(data.NumFollowers)
}


function timestampFromNanos(value: unknown) {
  const nanos = typeof value === "number"
    ? value
    : typeof value === "string"
      ? Number(value)
      : Number.NaN
  if (!Number.isFinite(nanos) || nanos <= 0) return null
  const milliseconds = Math.floor(nanos / 1_000_000)
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) return null
  const date = new Date(milliseconds)
  return Number.isNaN(date.getTime()) ? null : date
}

async function readLatestPublicActivity(publicKey: string) {
  const response = await fetchDeSo("get-posts-for-public-key", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      PublicKeyBase58Check: publicKey,
      ReaderPublicKeyBase58Check: "",
      LastPostHashHex: "",
      NumToFetch: 1,
      MediaRequired: false,
    }),
  })

  if (!response.ok) return null
  const data = (await response.json()) as DeSoPostsResponse
  return timestampFromNanos(data.Posts?.[0]?.TimestampNanos)
}

/**
 * Read a public DeSo profile without requesting wallet authority.
 * DeSo's get-single-profile endpoint is a POST transport, but this operation
 * only requests public data. No transaction is constructed, signed or sent.
 *
 * Verification is exposed only as a DeSo-source fact. Current DeSo UI reads
 * ExtraData.IsVerified; the legacy top-level IsVerified boolean remains a
 * fallback for older node responses. VIA does not issue this verification.
 */

export async function readPublicProfileIdentity(usernameOrPublicKey: string) {
  const identity = usernameOrPublicKey.trim().replace(/^@/, "")
  if (!identity || identity.length > 128) return null

  const response = await fetchDeSo("get-single-profile", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      PublicKeyBase58Check: identity.startsWith("BC1") ? identity : "",
      Username: identity.startsWith("BC1") ? "" : identity,
    }),
  })
  if (!response.ok) return null
  const data = (await response.json()) as DeSoProfileResponse
  const profile = data.Profile
  if (!profile) return null
  const publicKey = text(profile.PublicKeyBase58Check)
  const username = text(profile.Username)
  if (!publicKey && !username) return null
  return {
    publicKey,
    username,
    profilePic: profilePictureUrl(publicKey, text(profile.ProfilePic)),
    isVerified: verificationFromProfile(profile),
  }
}

export async function readPublicProfile(
  usernameOrPublicKey: string,
): Promise<ViaPublicProfile | null> {
  const identity = usernameOrPublicKey.trim().replace(/^@/, "")
  if (!identity || identity.length > 128) return null

  const response = await fetchDeSo("get-single-profile", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      PublicKeyBase58Check: identity.startsWith("BC1") ? identity : "",
      Username: identity.startsWith("BC1") ? "" : identity,
    }),
  })

  if (!response.ok) return null

  const data = (await response.json()) as DeSoProfileResponse
  const profile = data.Profile
  if (!profile) return null

  const publicKey = text(profile.PublicKeyBase58Check)
  const username = text(profile.Username)
  if (!publicKey && !username) return null

  const profilePic = text(profile.ProfilePic)
  const coinEntry = profile.CoinEntry ?? null
  const canonicalVerified = verificationFromProfile(profile)
  const [followersCount, followingCount, latestPublicActivity, verificationSources] = publicKey
    ? await Promise.all([
        readFollowCount(publicKey, true),
        readFollowCount(publicKey, false),
        readLatestPublicActivity(publicKey),
        readTrustedVerificationSources(publicKey, canonicalVerified),
      ])
    : [null, null, null, canonicalVerified ? ["DeSo"] : []]

  const lastPublicActivityAt = latestPublicActivity?.toISOString() ?? null
  const isInactive = latestPublicActivity
    ? Date.now() - latestPublicActivity.getTime() >= INACTIVE_AFTER_MS
    : false

  return {
    publicKey,
    username,
    description: text(profile.Description),
    profilePic: profilePictureUrl(publicKey, profilePic),
    isVerified: verificationSources.length > 0,
    verificationSources,
    creatorBasisPoints: numberOrNull(coinEntry?.CreatorBasisPoints),
    coinPriceDeSoNanos: numberOrNull(profile.CoinPriceDeSoNanos),
    numberOfHolders: numberOrNull(coinEntry?.NumberOfHolders),
    coinsInCirculationNanos: numberOrNull(coinEntry?.CoinsInCirculationNanos),
    desoLockedNanos: numberOrNull(coinEntry?.DeSoLockedNanos),
    followersCount,
    followingCount,
    lastPublicActivityAt,
    isInactive,
  }
}
