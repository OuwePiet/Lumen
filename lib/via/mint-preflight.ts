export type ViaMintPreflightInput = {
  updaterPublicKey: string
  nftPostHashHex: string
  numCopies: number
  hasUnlockable: boolean
  isForSale: boolean
  minBidAmountNanos: number
  creatorRoyaltyBasisPoints: number
  coinRoyaltyBasisPoints: number
  isBuyNow: boolean
  buyNowPriceNanos: number
}

const POST_HASH_RE = /^[0-9a-fA-F]{64}$/
const PUBLIC_KEY_RE = /^[1-9A-HJ-NP-Za-km-z]{20,100}$/

function isSafeNonNegativeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) >= 0
}

export function validateMintPreflightInput(value: unknown): ViaMintPreflightInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const input = value as Record<string, unknown>

  const allowed = [
    "updaterPublicKey",
    "nftPostHashHex",
    "numCopies",
    "hasUnlockable",
    "isForSale",
    "minBidAmountNanos",
    "creatorRoyaltyBasisPoints",
    "coinRoyaltyBasisPoints",
    "isBuyNow",
    "buyNowPriceNanos",
  ]
  if (!Object.keys(input).every((key) => allowed.includes(key))) return null

  if (typeof input.updaterPublicKey !== "string" || !PUBLIC_KEY_RE.test(input.updaterPublicKey)) return null
  if (typeof input.nftPostHashHex !== "string" || !POST_HASH_RE.test(input.nftPostHashHex)) return null
  if (!Number.isInteger(input.numCopies) || Number(input.numCopies) < 1 || Number(input.numCopies) > 10000) return null
  if (typeof input.hasUnlockable !== "boolean" || typeof input.isForSale !== "boolean" || typeof input.isBuyNow !== "boolean") return null
  if (!isSafeNonNegativeInteger(input.minBidAmountNanos)) return null
  if (!isSafeNonNegativeInteger(input.buyNowPriceNanos)) return null
  if (!Number.isInteger(input.creatorRoyaltyBasisPoints) || Number(input.creatorRoyaltyBasisPoints) < 0 || Number(input.creatorRoyaltyBasisPoints) > 10000) return null
  if (!Number.isInteger(input.coinRoyaltyBasisPoints) || Number(input.coinRoyaltyBasisPoints) < 0 || Number(input.coinRoyaltyBasisPoints) > 10000) return null
  if (Number(input.creatorRoyaltyBasisPoints) + Number(input.coinRoyaltyBasisPoints) > 10000) return null

  if (!input.isForSale && (Number(input.minBidAmountNanos) !== 0 || input.isBuyNow || Number(input.buyNowPriceNanos) !== 0)) return null
  if (input.isBuyNow && (!input.isForSale || Number(input.buyNowPriceNanos) <= 0 || input.hasUnlockable)) return null

  return {
    updaterPublicKey: input.updaterPublicKey,
    nftPostHashHex: input.nftPostHashHex.toLowerCase(),
    numCopies: Number(input.numCopies),
    hasUnlockable: input.hasUnlockable,
    isForSale: input.isForSale,
    minBidAmountNanos: Number(input.minBidAmountNanos),
    creatorRoyaltyBasisPoints: Number(input.creatorRoyaltyBasisPoints),
    coinRoyaltyBasisPoints: Number(input.coinRoyaltyBasisPoints),
    isBuyNow: input.isBuyNow,
    buyNowPriceNanos: Number(input.buyNowPriceNanos),
  }
}

export const VIA_MINT_PREFLIGHT_RULES = {
  nativeDeSoMint:
    "VIA uses DeSo's native create-nft transaction constructor instead of inventing a separate mint ledger.",
  unsigned:
    "Preflight constructs only an unsigned DeSo transaction. It never signs or submits it.",
  actualCost:
    "Fee and spend values come from the current DeSo transaction constructor response, not historical VIA example tariffs.",
  noDesoViaFee:
    "VIA adds no DESO-denominated service output to the mint transaction.",
  explicitApproval:
    "A later signing step must show refreshed costs and require explicit creator approval before submission.",
} as const
