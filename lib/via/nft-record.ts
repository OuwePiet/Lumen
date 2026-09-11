export type ViaNftEntryInput = {
  IsForSale?: unknown
  MinBidAmountNanos?: unknown
  OwnerPublicKeyBase58Check?: unknown
  BuyNowPriceNanos?: unknown
  SerialNumber?: unknown
}

export type ViaNftRecord = {
  postHash: string
  creatorPublicKey?: string
  ownerPublicKeys: string[]
  editionCount: number
  forSaleCount: number
  lowestBuyNowNanos?: number
  lowestMinBidNanos?: number
  mediaUrls: string[]
}

function positiveNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : undefined
}

function safeKey(value: unknown) {
  return typeof value === "string" && value.length > 0 && value.length <= 128 ? value : undefined
}

export function normalizeNftRecord(input: {
  postHash: string
  creatorPublicKey?: string
  imageUrls?: string[]
  videoUrls?: string[]
  entries: ViaNftEntryInput[]
}): ViaNftRecord {
  const entries = input.entries.slice(0, 10_000)
  const forSale = entries.filter((entry) => entry.IsForSale === true)
  const buyNow = forSale.map((entry) => positiveNumber(entry.BuyNowPriceNanos)).filter((value): value is number => value !== undefined)
  const minBid = forSale.map((entry) => positiveNumber(entry.MinBidAmountNanos)).filter((value): value is number => value !== undefined)
  const ownerPublicKeys = Array.from(new Set(entries.map((entry) => safeKey(entry.OwnerPublicKeyBase58Check)).filter((key): key is string => Boolean(key))))
  const mediaUrls = [...(input.imageUrls ?? []), ...(input.videoUrls ?? [])].filter((url) => typeof url === "string" && url.length <= 4096).slice(0, 16)

  return {
    postHash: input.postHash,
    creatorPublicKey: safeKey(input.creatorPublicKey),
    ownerPublicKeys,
    editionCount: entries.length,
    forSaleCount: forSale.length,
    lowestBuyNowNanos: buyNow.length ? Math.min(...buyNow) : undefined,
    lowestMinBidNanos: minBid.length ? Math.min(...minBid) : undefined,
    mediaUrls,
  }
}
