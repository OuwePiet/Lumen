export type ViaPaymentRetentionClass =
  | "accounting-required"
  | "operational"
  | "security-audit"
  | "temporary"

export type ViaPaymentRetentionDecision = {
  retain: boolean
  reason: "required" | "active-order" | "active-dispute" | "within-policy" | "eligible-for-deletion"
}

export function paymentRetentionDecision(input: {
  retentionClass: ViaPaymentRetentionClass
  legalOrAccountingRequired: boolean
  activeOrder: boolean
  activeDispute: boolean
  policyExpiresAtMs: number
  nowMs: number
}): ViaPaymentRetentionDecision {
  if (input.legalOrAccountingRequired) return { retain: true, reason: "required" }
  if (input.activeOrder) return { retain: true, reason: "active-order" }
  if (input.activeDispute) return { retain: true, reason: "active-dispute" }

  if (
    Number.isSafeInteger(input.policyExpiresAtMs) &&
    Number.isSafeInteger(input.nowMs) &&
    input.nowMs < input.policyExpiresAtMs
  ) {
    return { retain: true, reason: "within-policy" }
  }

  return { retain: false, reason: "eligible-for-deletion" }
}

export const VIA_PAYMENT_RETENTION_RULES = {
  configurable:
    "Concrete retention durations are configuration/policy values and must be reviewed against applicable legal and accounting requirements before production release.",
  noForever:
    "Operational and temporary payment data is not retained indefinitely merely because storage is available.",
  holds:
    "Active orders, disputes and legally/accounting-required records remain protected from routine deletion.",
  deletion:
    "Eligibility for deletion is a policy decision only; destructive deletion requires a separate controlled administrative implementation.",
  secrets:
    "Forbidden secrets remain forbidden regardless of retention class and must never be persisted in the first place.",
} as const
