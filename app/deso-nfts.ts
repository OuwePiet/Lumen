import { fetchDeSo } from "./deso-api"
import { getNFTsForUser as sdkGetNFTsForUser } from "deso-protocol"

export type DeSoNFTPost = {
  PostHashHex?: string
  Body?: string
  ImageURLs?: string[]
  VideoURLs?: string[]
  NumNFTCopies?: number
  PostExtraData?: Record<string, unknown>
  ExtraData?: Record<string, unknown>
  ProfileEntryResponse?: { Username?: string }
}

export type DeSoNFTEntry = {
  IsForSale?: boolean
  BuyNowPriceNanos?: number
  MinBidAmountNanos?: number
}

export type DeSoNFTCollection = {
  PostEntryResponse?: DeSoNFTPost
  NFTEntryResponses?: DeSoNFTEntry[]
  CreatedByAccount?: boolean
  OwnedEntries?: DeSoNFTEntry[]
}

function isFiniteNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
}

function safeUrlArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  const urls = value.filter(
    (item): item is string => typeof item === "string" && item.length > 0 && item.length <= 4096
  )
  return urls.length > 0 ? urls : undefined
}

function normalizeCollection(value: unknown): DeSoNFTCollection | null {
  if (!value || typeof value !== "object") return null

  const raw = value as DeSoNFTCollection
  const post = raw.PostEntryResponse
  if (!post || !/^[0-9a-fA-F]{64}$/.test(post.PostHashHex ?? "")) return null

  const normalizedPost: DeSoNFTPost = {
    PostHashHex: post.PostHashHex!.toLowerCase(),
  }

  if (typeof post.Body === "string") normalizedPost.Body = post.Body.slice(0, 100_000)
  normalizedPost.ImageURLs = safeUrlArray(post.ImageURLs)
  normalizedPost.VideoURLs = safeUrlArray(post.VideoURLs)
  if (isFiniteNonNegativeNumber(post.NumNFTCopies)) {
    normalizedPost.NumNFTCopies = post.NumNFTCopies
  }
  if (post.PostExtraData && typeof post.PostExtraData === "object" && !Array.isArray(post.PostExtraData)) normalizedPost.PostExtraData = post.PostExtraData
  if (post.ExtraData && typeof post.ExtraData === "object" && !Array.isArray(post.ExtraData)) normalizedPost.ExtraData = post.ExtraData
  if (typeof post.ProfileEntryResponse?.Username === "string") {
    normalizedPost.ProfileEntryResponse = {
      Username: post.ProfileEntryResponse.Username.slice(0, 64),
    }
  }

  const entries = Array.isArray(raw.NFTEntryResponses)
    ? raw.NFTEntryResponses
        .filter((entry): entry is DeSoNFTEntry => Boolean(entry && typeof entry === "object"))
        .map((entry) => ({
          IsForSale: typeof entry.IsForSale === "boolean" ? entry.IsForSale : undefined,
          BuyNowPriceNanos: isFiniteNonNegativeNumber(entry.BuyNowPriceNanos)
            ? entry.BuyNowPriceNanos
            : undefined,
          MinBidAmountNanos: isFiniteNonNegativeNumber(entry.MinBidAmountNanos)
            ? entry.MinBidAmountNanos
            : undefined,
        }))
    : undefined

  return {
    PostEntryResponse: normalizedPost,
    NFTEntryResponses: entries,
  }
}

/**
 * Read a user's public NFT map using only the documented request fields for
 * DeSo's get-nfts-for-user endpoint. Do not add cursor/limit fields unless
 * they are verified against the currently deployed DeSo API contract.
 */
export async function getNFTsForUser(publicKey: string, signal?: AbortSignal) {
  signal?.throwIfAborted()
  const data = await sdkGetNFTsForUser({
    UserPublicKeyBase58Check: publicKey,
    ReaderPublicKeyBase58Check: "",
  })
  signal?.throwIfAborted()
  const values = Object.values(data.NFTsMap ?? {})

  return values
    .map(normalizeCollection)
    .filter((value): value is DeSoNFTCollection => value !== null)
}

export async function getCreatedNFTs(publicKey: string, signal?: AbortSignal) {
  const found = new Map<string, DeSoNFTCollection>()
  const cursors = new Set<string>()
  let cursor = ""
  while (true) {
    const response = await fetchDeSo("get-nfts-created-by-public-key", {
      method: "POST", headers: { "Content-Type": "application/json" }, signal,
      body: JSON.stringify({ PublicKeyBase58Check: publicKey, ReaderPublicKeyBase58Check: "", LastPostHashHex: cursor, NumToFetch: 12 }),
    })
    if (!response.ok) throw new Error("DESO_CREATED_NFTS_UNAVAILABLE")
    const data = await response.json()
    if (!Array.isArray(data.NFTs) || typeof data.LastPostHashHex !== "string") throw new Error("DESO_CREATED_NFTS_INVALID_RESPONSE")
    for (const nft of data.NFTs) {
      const item = normalizeCollection({ ...nft.NFTCollectionResponse, NFTEntryResponses: nft.NFTEntryResponses })
      if (item?.PostEntryResponse?.PostHashHex) found.set(item.PostEntryResponse.PostHashHex, { ...item, CreatedByAccount: true })
    }
    const next = data.LastPostHashHex
    if (!next) break
    if (cursors.has(next)) throw new Error("DESO_NFT_CURSOR_STALLED")
    cursors.add(next)
    cursor = next
  }
  return [...found.values()]
}