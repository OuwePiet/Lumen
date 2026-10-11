import { normalizeRoyaltyInfo, type ViaRoyaltyInfo } from "./nft-royalties"

const CREATOR_KEYS = [
  "NFTRoyaltyToCreatorBasisPoints",
  "CreatorRoyaltyBasisPoints",
  "VIA_CREATOR_ROYALTY_BPS",
]
const COIN_KEYS = [
  "NFTRoyaltyToCoinBasisPoints",
  "CoinRoyaltyBasisPoints",
  "VIA_COIN_ROYALTY_BPS",
]

function firstNumber(data: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = data[key]
    if (typeof value === "number") return value
    if (typeof value === "string" && /^\d{1,5}$/.test(value)) return Number(value)
  }
}

function record(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined
}

/**
 * Reads the official DeSo NFT royalty fields from the post response. Legacy
 * metadata remains a fallback for older VIA records that do not expose them.
 * Values still pass through the strict 0–10000 basis-point normalizer.
 */
export function readRoyaltyMetadata(post: unknown): ViaRoyaltyInfo {
  const data = record(post)
  if (!data) {
    return normalizeRoyaltyInfo({})
  }

  const metadata = record(data.PostExtraData) ?? record(data.ExtraData)
  return normalizeRoyaltyInfo({
    creatorBasisPoints:
      firstNumber(data, CREATOR_KEYS) ??
      (metadata ? firstNumber(metadata, CREATOR_KEYS) : undefined),
    coinBasisPoints:
      firstNumber(data, COIN_KEYS) ??
      (metadata ? firstNumber(metadata, COIN_KEYS) : undefined),
    source: "deso-nft",
  })
}
