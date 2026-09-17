import { fetchDeSo } from "../../app/deso-api"

export type ViaPublicProfile = {
  publicKey: string
  username: string
  description: string
  profilePic: string | null
  isVerified: boolean
  creatorBasisPoints: number | null
  coinPriceDeSoNanos: number | null
  numberOfHolders: number | null
  coinsInCirculationNanos: number | null
  desoLockedNanos: number | null
  followersCount: number | null
  followingCount: number | null
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

/**
 * Read a public DeSo profile without requesting wallet authority.
 * DeSo's get-single-profile endpoint is a POST transport, but this operation
 * only requests public data. No transaction is constructed, signed or sent.
 *
 * Verification is exposed only as a DeSo-source fact. Current DeSo UI reads
 * ExtraData.IsVerified; the legacy top-level IsVerified boolean remains a
 * fallback for older node responses. VIA does not issue this verification.
 */
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
  const [followersCount, followingCount] = publicKey
    ? await Promise.all([
        readFollowCount(publicKey, true),
        readFollowCount(publicKey, false),
      ])
    : [null, null]

  return {
    publicKey,
    username,
    description: text(profile.Description),
    profilePic: profilePictureUrl(publicKey, profilePic),
    isVerified: verificationFromProfile(profile),
    creatorBasisPoints: numberOrNull(coinEntry?.CreatorBasisPoints),
    coinPriceDeSoNanos: numberOrNull(profile.CoinPriceDeSoNanos),
    numberOfHolders: numberOrNull(coinEntry?.NumberOfHolders),
    coinsInCirculationNanos: numberOrNull(coinEntry?.CoinsInCirculationNanos),
    desoLockedNanos: numberOrNull(coinEntry?.DeSoLockedNanos),
    followersCount,
    followingCount,
  }
}
