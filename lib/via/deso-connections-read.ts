import { fetchDeSo } from "../../app/deso-api"
import { readPublicProfile } from "./deso-profile-read"

export type ViaConnection = {
  publicKey: string
  username: string
  description: string
  profilePic: string | null
  isVerified: boolean
  creatorBasisPoints: number | null
  coinPriceDeSoNanos: number | null
}

type DeSoProfileEntry = {
  PublicKeyBase58Check?: unknown
  Username?: unknown
  Description?: unknown
  ProfilePic?: unknown
  IsVerified?: unknown
  CoinPriceDeSoNanos?: unknown
  CoinEntry?: {
    CreatorBasisPoints?: unknown
  } | null
}

type DeSoFollowsResponse = {
  PublicKeyToProfileEntry?: unknown
  NumFollowers?: unknown
}

function text(value: unknown) {
  return typeof value === "string" ? value : ""
}

function numberOrNull(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

function safeImage(value: unknown) {
  const candidate = text(value)
  return /^https:\/\//i.test(candidate) ? candidate : null
}

export async function readConnections(
  usernameOrPublicKey: string,
  mode: "followers" | "following",
  limit = 50,
) {
  const profile = await readPublicProfile(usernameOrPublicKey)
  if (!profile?.publicKey) return { entries: [] as ViaConnection[], total: 0 }

  const response = await fetchDeSo("get-follows-stateless", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      PublicKeyBase58Check: profile.publicKey,
      Username: "",
      GetEntriesFollowingUsername: mode === "followers",
      LastPublicKeyBase58Check: "",
      NumToFetch: Math.max(1, Math.min(100, limit)),
    }),
  })

  if (!response.ok) return { entries: [] as ViaConnection[], total: 0 }

  const data = (await response.json()) as DeSoFollowsResponse
  const rawMap = data.PublicKeyToProfileEntry
  const entries = rawMap && typeof rawMap === "object" && !Array.isArray(rawMap)
    ? Object.entries(rawMap as Record<string, DeSoProfileEntry | null>)
        .map(([publicKey, item]) => {
          if (!item) return null
          const username = text(item.Username)
          return {
            publicKey: text(item.PublicKeyBase58Check) || publicKey,
            username,
            description: text(item.Description),
            profilePic: safeImage(item.ProfilePic),
            isVerified: item.IsVerified === true,
            creatorBasisPoints: numberOrNull(item.CoinEntry?.CreatorBasisPoints),
            coinPriceDeSoNanos: numberOrNull(item.CoinPriceDeSoNanos),
          } satisfies ViaConnection
        })
        .filter((entry): entry is ViaConnection => Boolean(entry?.publicKey))
    : []

  return {
    entries,
    total: numberOrNull(data.NumFollowers) ?? entries.length,
  }
}
