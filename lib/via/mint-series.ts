export type ViaMintSeriesInput = {
  totalCopies: number
  initialSaleCopies?: number
  priceNanos?: number
}

export type ViaMintSeriesPolicy = {
  totalCopies: number
  initialSaleCopies: number
  pricedAtMint: boolean
  creatorHeldCopies: number
  editionLabel: "Unique / 1 of 1" | "Limited edition" | "Edition"
}

export function normalizeMintSeries(input: ViaMintSeriesInput): ViaMintSeriesPolicy | null {
  const totalCopies = Math.floor(input.totalCopies)
  if (!Number.isFinite(totalCopies) || totalCopies < 1) return null

  const pricedAtMint =
    typeof input.priceNanos === "number" &&
    Number.isFinite(input.priceNanos) &&
    input.priceNanos > 0

  const requestedSaleCopies = pricedAtMint
    ? Math.floor(input.initialSaleCopies ?? 1)
    : 0

  if (requestedSaleCopies < 0 || requestedSaleCopies > totalCopies) return null

  return {
    totalCopies,
    initialSaleCopies: requestedSaleCopies,
    pricedAtMint,
    creatorHeldCopies: totalCopies - requestedSaleCopies,
    editionLabel:
      totalCopies === 1
        ? "Unique / 1 of 1"
        : totalCopies <= 10
          ? "Limited edition"
          : "Edition",
  }
}

/**
 * VIA keeps total minted copies separate from copies initially offered for
 * sale. Later gift/transfer decisions must use live edition ownership/sale
 * state rather than assuming all minted copies remain available.
 */
