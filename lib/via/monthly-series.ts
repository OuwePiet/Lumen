export type ViaMonthlyIssue = {
  number: number
  year: number
  month: number
  title: string
  edition: "1 of 1"
  origin: "VIA"
  domain: "viadeso.online"
}

export function buildViaMonthlyIssue(input: {
  number: number
  year: number
  month: number
  title: string
}): ViaMonthlyIssue | null {
  const number = Math.floor(input.number)
  const year = Math.floor(input.year)
  const month = Math.floor(input.month)
  const title = input.title.trim().slice(0, 160)

  if (number < 1 || year < 2026 || month < 1 || month > 12 || !title) return null

  return {
    number,
    year,
    month,
    title,
    edition: "1 of 1",
    origin: "VIA",
    domain: "viadeso.online",
  }
}

export type ViaMonthlyAuctionPlan = {
  durationHours: 24
  startsAfterMint: true
  beneficiary: "seller"
  rewardPoolContributionBasisPoints: number
}

export function createViaMonthlyAuctionPlan(input: {
  rewardPoolContributionBasisPoints?: number
} = {}): ViaMonthlyAuctionPlan {
  const requested = Math.floor(input.rewardPoolContributionBasisPoints ?? 1000)
  const rewardPoolContributionBasisPoints =
    requested >= 0 && requested <= 10000 ? requested : 1000

  return {
    durationHours: 24,
    startsAfterMint: true,
    beneficiary: "seller",
    rewardPoolContributionBasisPoints,
  }
}

export type ViaMonthlySettlementSplit = {
  grossNanos: number
  rewardPoolNanos: number
  remainderNanos: number
}

export function splitViaMonthlyProceeds(
  grossNanos: number,
  rewardPoolContributionBasisPoints: number
): ViaMonthlySettlementSplit | null {
  if (!Number.isSafeInteger(grossNanos) || grossNanos < 0) return null
  if (
    !Number.isInteger(rewardPoolContributionBasisPoints) ||
    rewardPoolContributionBasisPoints < 0 ||
    rewardPoolContributionBasisPoints > 10000
  ) return null

  const rewardPoolNanos = Math.floor(
    (grossNanos * rewardPoolContributionBasisPoints) / 10000
  )

  return {
    grossNanos,
    rewardPoolNanos,
    remainderNanos: grossNanos - rewardPoolNanos,
  }
}

/**
 * The monthly series is a VIA-issued 1-of-1 collection. Artwork generation,
 * mint signing, auction settlement and reward-pool transfer remain separate
 * controlled execution steps.
 */
