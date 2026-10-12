import type { ViaClaimRequirement } from "./giveaway-policy"

export type ViaClaimEvidence =
  | { state: "verified"; source: "deso"; checkedAt: string }
  | { state: "not-met"; source: "deso"; checkedAt: string }
  | { state: "unknown"; reason: "not-checked" | "read-failed" | "unsupported" | "identity-missing" }

export type ViaClaimCheck = {
  requirement: ViaClaimRequirement
  evidence: ViaClaimEvidence
}

/**
 * Presentation-only readiness. Never use this as authorization for NFT transfer.
 * Every requirement must be verified from DeSo or a trusted payment provider,
 * and ownership/availability must be rechecked immediately before transfer.
 */
export function summarizeClaimChecks(checks: ViaClaimCheck[]): {
  readyForReview: boolean
  verified: number
  missing: number
  unknown: number
} {
  const verified = checks.filter((check) => check.evidence.state === "verified").length
  const missing = checks.filter((check) => check.evidence.state === "not-met").length
  const unknown = checks.filter((check) => check.evidence.state === "unknown").length
  return { readyForReview: checks.length > 0 && verified === checks.length, verified, missing, unknown }
}
