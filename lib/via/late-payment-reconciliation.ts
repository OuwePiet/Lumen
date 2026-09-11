export type ViaLatePaymentReconciliation =
  | { action: "ignore-duplicate"; reason: "order-already-confirmed" }
  | { action: "admin-review"; reason: "late-payment-evidence" }

export function reconcileLatePaymentEvidence(input: {
  orderAlreadyConfirmed: boolean
  trustedEvidence: boolean
}): ViaLatePaymentReconciliation | null {
  if (!input.trustedEvidence) return null
  if (input.orderAlreadyConfirmed) {
    return { action: "ignore-duplicate", reason: "order-already-confirmed" }
  }
  return { action: "admin-review", reason: "late-payment-evidence" }
}

export const VIA_LATE_PAYMENT_RECONCILIATION_RULES = {
  noReopen:
    "Trusted payment evidence arriving after checkout expiry never reopens or directly confirms the expired attempt.",
  review:
    "Late trusted evidence for an otherwise unconfirmed order is routed to private owner/admin review.",
  duplicate:
    "Evidence for an already-confirmed order is treated as duplicate evidence and cannot trigger confirmed-payment effects again.",
  untrusted:
    "Untrusted browser/provider-return claims do not create a reconciliation case.",
  noAutomaticRefund:
    "Reconciliation does not automatically refund, forward, settle, transfer, sign or perform blockchain writes.",
} as const
