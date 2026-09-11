export type ViaRoyaltyInfo = {
  creatorBasisPoints?: number
  coinBasisPoints?: number
  source: "deso-nft" | "via-metadata" | "unavailable"
}

function basisPoints(value: unknown) {
  return typeof value === "number" &&
    Number.isFinite(value) &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 10_000
    ? value
    : undefined
}

export function normalizeRoyaltyInfo(input: {
  creatorBasisPoints?: unknown
  coinBasisPoints?: unknown
  source?: ViaRoyaltyInfo["source"]
}): ViaRoyaltyInfo {
  const creatorBasisPoints = basisPoints(input.creatorBasisPoints)
  const coinBasisPoints = basisPoints(input.coinBasisPoints)

  return {
    creatorBasisPoints,
    coinBasisPoints,
    source:
      creatorBasisPoints !== undefined || coinBasisPoints !== undefined
        ? input.source ?? "deso-nft"
        : "unavailable",
  }
}

export function formatRoyaltyBasisPoints(value?: number) {
  if (value === undefined) return "Not available"
  return `${(value / 100).toFixed(value % 100 === 0 ? 0 : 2)}%`
}
