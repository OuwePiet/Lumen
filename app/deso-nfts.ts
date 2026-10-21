import { fetchDeSo } from "./deso-api"

export type DeSoNFTPost = {
  PostHashHex?: string
  Body?: string
  TimestampNanos?: number
  ImageURLs?: string[]
  VideoURLs?: string[]
  NumNFTCopies?: number
  PostExtraData?: Record<string, unknown>
  ExtraData?: Record<string, unknown>
  ProfileEntryResponse?: { Username?: string }
}

export type DeSoNFTEntry = {
  SerialNumber?: number
  OwnerPublicKeyBase58Check?: string
  IsPending?: boolean
  IsBuyNow?: boolean
  IsForSale?: boolean
  BuyNowPriceNanos?: number
  MinBidAmountNanos?: number
}

export type DeSoNFTCollection = {
  PostEntryResponse?: DeSoNFTPost
  NFTEntryResponses?: DeSoNFTEntry[]
}

function isFiniteNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0
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
  if (typeof post.TimestampNanos === "number" && Number.isFinite(post.TimestampNanos) && post.TimestampNanos > 0) normalizedPost.TimestampNanos = post.TimestampNanos
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
          SerialNumber: isFiniteNonNegativeNumber(entry.SerialNumber) && entry.SerialNumber > 0 ? entry.SerialNumber : undefined,
          OwnerPublicKeyBase58Check: typeof entry.OwnerPublicKeyBase58Check === "string" && /^[1-9A-HJ-NP-Za-km-z]{40,128}$/.test(entry.OwnerPublicKeyBase58Check) ? entry.OwnerPublicKeyBase58Check : undefined,
          IsPending: typeof entry.IsPending === "boolean" ? entry.IsPending : undefined,
          IsBuyNow: typeof entry.IsBuyNow === "boolean" ? entry.IsBuyNow : undefined,
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
 * Read all owned editions through the current node's verified cursor contract.
 * One work can span pages: merge by post hash and edition serial, not page totals.
 */
export async function getNFTsForUser(publicKey: string, signal?: AbortSignal, onProgress?: (progress: { pages: number; works: number; editions: number; collections: DeSoNFTCollection[] }) => void) {
  const collections = new Map<string, DeSoNFTCollection>()
  const cursors = new Set<string>()
  let cursor = ""
  for (let page = 0; page < 1000; page += 1) {
    if (signal?.aborted) throw new DOMException("NFT read cancelled", "AbortError")
    const response = await fetchDeSo("get-nfts-for-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        UserPublicKeyBase58Check: publicKey,
        ReaderPublicKeyBase58Check: "",
        Limit: 100,
        LastKeyHex: cursor,
      }),
      signal,
    })

    if (!response.ok) {
      throw new Error("DESO_NFT_COLLECTION_UNAVAILABLE")
    }

    const data = await response.json()
    if (!data.NFTsMap || typeof data.NFTsMap !== "object" || Array.isArray(data.NFTsMap)) throw new Error("DESO_NFT_COLLECTION_INVALID")
    let addedEdition = false
    for (const value of Object.values(data.NFTsMap)) {
      const collection = normalizeCollection(value)
      if (!collection) throw new Error("DESO_NFT_COLLECTION_INVALID")
      const hash = collection.PostEntryResponse!.PostHashHex!
      const previous = collections.get(hash)
      const entries = new Map<number, DeSoNFTEntry>((previous?.NFTEntryResponses ?? []).map(entry => [entry.SerialNumber!, entry]))
      for (const entry of collection.NFTEntryResponses ?? []) {
        if (!entry.SerialNumber || entry.OwnerPublicKeyBase58Check !== publicKey) throw new Error("DESO_NFT_EDITION_INVALID")
        if (!entries.has(entry.SerialNumber)) addedEdition = true
        entries.set(entry.SerialNumber, entry)
      }
      collections.set(hash, { ...collection, NFTEntryResponses: [...entries.values()] })
    }
    const available = [...collections.values()]
    onProgress?.({ pages: page + 1, works: collections.size, editions: available.reduce((sum, item) => sum + (item.NFTEntryResponses?.length ?? 0), 0), collections: available })
    const next = data.LastKeyHex ?? ""
    if (typeof next !== "string" || !/^[a-f0-9]{0,1024}$/i.test(next)) throw new Error("DESO_NFT_CURSOR_INVALID")
    if (!next) return [...collections.values()]
    // The backend's Badger seek is inclusive: its exhausted page repeats the
    // final anchor (plus possible mempool entries), with the same last key.
    if (next === cursor && !addedEdition) return [...collections.values()]
    if (cursors.has(next)) throw new Error("DESO_NFT_CURSOR_REPEATED")
    cursors.add(next)
    cursor = next
    }
    // Never return a bounded partial read as a complete ownership count.
    throw new Error("DESO_NFT_COLLECTION_INCOMPLETE")
  }
