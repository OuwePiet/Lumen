export type ViaEvidenceRateDecision =
  | { allowed: true }
  | { allowed: false; reason: "too-many-requests" }

export function evidenceRateDecision(input: {
  requestsInWindow: number
  maxRequestsInWindow: number
}): ViaEvidenceRateDecision {
  if (
    !Number.isSafeInteger(input.requestsInWindow) ||
    !Number.isSafeInteger(input.maxRequestsInWindow) ||
    input.requestsInWindow < 0 ||
    input.maxRequestsInWindow < 1
  ) {
    return { allowed: false, reason: "too-many-requests" }
  }

  return input.requestsInWindow < input.maxRequestsInWindow
    ? { allowed: true }
    : { allowed: false, reason: "too-many-requests" }
}

export const VIA_EVIDENCE_RATE_RULES = {
  serverSide:
    "Protected detailed-evidence endpoints are rate-limited server-side per authenticated owner/session context.",
  configurable:
    "Concrete thresholds/windows are deployment configuration and are not hardcoded into this policy helper.",
  failClosed:
    "Invalid limiter state fails closed rather than granting unrestricted evidence access.",
  generic:
    "Rate-limit responses use the generic protected-evidence error boundary and do not reveal case/provider/payment details.",
  noEffects:
    "Rate limiting performs no case decision, payment confirmation, refund, settlement, signing or blockchain write.",
} as const
