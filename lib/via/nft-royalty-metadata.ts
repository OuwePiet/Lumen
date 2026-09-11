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

/**
 * Reads known royalty fields without assuming they exist on every legacy NFT.
 * Values still pass through the strict 0–10000 basis-point normalizer.
 */
export function readRoyaltyMetadata(extraData: unknown): ViaRoyaltyInfo {
  if (!extraData || typeof extraData !== "object") {
    return normalizeRoyaltyInfo({})
  }

  const data = extraData as Record<string, unknown>
  return normalizeRoyaltyInfo({
    creatorBasisPoints: firstNumber(data, CREATOR_KEYS),
    coinBasisPoints: firstNumber(data, COIN_KEYS),
    source: "deso-nft",
  })
}
