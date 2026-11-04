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

export type AdditionalRoyalty = { publicKey: string; basisPoints: number; destination: "wallet" | "coin" }
export function readRoyaltyBreakdown(post: unknown) {
  const base = readRoyaltyMetadata(post)
  const data = record(post)
  const additional: AdditionalRoyalty[] = []
  let complete = Boolean(data && typeof data.NFTRoyaltyToCreatorBasisPoints === "number" && typeof data.NFTRoyaltyToCoinBasisPoints === "number" && base.creatorBasisPoints !== undefined && base.coinBasisPoints !== undefined)
  for (const [field, destination] of [["AdditionalDESORoyaltiesMap", "wallet"], ["AdditionalCoinRoyaltiesMap", "coin"]] as const) {
    if (!data || !Object.prototype.hasOwnProperty.call(data, field)) { complete = false; continue }
    if (data[field] === null) continue
    const entries = record(data[field])
    if (!entries || Array.isArray(entries) || Object.keys(entries).length > 1000) { complete = false; continue }
    for (const [publicKey, value] of Object.entries(entries)) {
      if (!/^[1-9A-HJ-NP-Za-km-z]{20,100}$/.test(publicKey) || typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 10_000) { complete = false; continue }
      if (value > 0) additional.push({ publicKey, basisPoints: value, destination })
    }
  }
  additional.sort((a, b) => a.publicKey.localeCompare(b.publicKey) || a.destination.localeCompare(b.destination))
  const sum = (base.creatorBasisPoints ?? 0) + (base.coinBasisPoints ?? 0) + additional.reduce((total, entry) => total + entry.basisPoints, 0)
  if (sum > 10_000) complete = false
  return { ...base, additional, complete, totalBasisPoints: complete ? sum : undefined }
}