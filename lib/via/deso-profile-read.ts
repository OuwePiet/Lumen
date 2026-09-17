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
 * IsVerified is deliberately exposed as a DeSo-source fact. VIA must not
 * present it as a VIA-issued identity guarantee.
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
    isVerified: profile.IsVerified === true,
    creatorBasisPoints: numberOrNull(coinEntry?.CreatorBasisPoints),
    coinPriceDeSoNanos: numberOrNull(profile.CoinPriceDeSoNanos),
    numberOfHolders: numberOrNull(coinEntry?.NumberOfHolders),
    coinsInCirculationNanos: numberOrNull(coinEntry?.CoinsInCirculationNanos),
    desoLockedNanos: numberOrNull(coinEntry?.DeSoLockedNanos),
    followersCount,
    followingCount,
  }
}
