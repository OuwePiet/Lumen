export type ViaSponsorPrecheckInput = {
  httpsDestination: boolean
  advertiserVerifiable: boolean
  scamSignal: boolean
  misleadingFinanceSignal: boolean
  gamblingSignal: boolean
  adultSignal: boolean
  malwareSignal: boolean
  deceptiveTokenSignal: boolean
  aggressiveTrackingSignal: boolean
}

export type ViaSponsorPrecheckResult =
  | { passed: true; requiresOwnerReview: true }
  | {
      passed: false
      requiresOwnerReview: false
      reason:
        | "invalid-destination"
        | "unverifiable"
        | "prohibited-content"
    }

export function runSponsorPrecheck(
  input: ViaSponsorPrecheckInput,
): ViaSponsorPrecheckResult {
  if (!input.httpsDestination) {
    return { passed: false, requiresOwnerReview: false, reason: "invalid-destination" }
  }

  if (!input.advertiserVerifiable) {
    return { passed: false, requiresOwnerReview: false, reason: "unverifiable" }
  }

  if (
    input.scamSignal ||
    input.misleadingFinanceSignal ||
    input.gamblingSignal ||
    input.adultSignal ||
    input.malwareSignal ||
    input.deceptiveTokenSignal ||
    input.aggressiveTrackingSignal
  ) {
    return { passed: false, requiresOwnerReview: false, reason: "prohibited-content" }
  }

  return { passed: true, requiresOwnerReview: true }
}

export const VIA_SPONSOR_PRECHECK_RULES = {
  denyByDefault:
    "A sponsor that cannot be sufficiently verified does not proceed to placement.",
  prohibited:
    "Scams, misleading financial promotion, gambling, adult content, malware, deceptive tokens and aggressive tracking fail the automatic precheck.",
  humanDecision:
    "Passing the automatic precheck never approves a sponsor; the VIA owner must still make the private Approve or Reject decision.",
  doubt:
    "When automated evidence is inconclusive, VIA does not treat uncertainty as approval.",
} as const
