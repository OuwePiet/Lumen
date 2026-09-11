export type ViaReconciliationDecision =
  | "accept-as-payment"
  | "reject-evidence"
  | "needs-more-review"

export type ViaReconciliationDecisionRecord = {
  caseId: string
  decision: ViaReconciliationDecision
  decidedBy: "via-owner"
  decidedAt: string
}

export function recordReconciliationDecision(input: {
  caseId: string
  decision: ViaReconciliationDecision
  decidedAt: string
  ownerAuthorized: boolean
  freshReauth: boolean
}): ViaReconciliationDecisionRecord | null {
  if (!input.ownerAuthorized || !input.freshReauth) return null
  if (!input.caseId.trim() || !input.decidedAt.trim()) return null

  return {
    caseId: input.caseId,
    decision: input.decision,
    decidedBy: "via-owner",
    decidedAt: input.decidedAt,
  }
}

export const VIA_RECONCILIATION_DECISION_RULES = {
  ownerOnly:
    "Payment reconciliation decisions require authorized VIA-owner access plus fresh re-authentication.",
  explicit:
    "The owner explicitly chooses accept-as-payment, reject-evidence or needs-more-review; VIA does not infer a financial decision from a browser return.",
  effectsSeparate:
    "Accept-as-payment records the administrative decision only; confirmed-payment effects require the separate controlled/idempotent confirmation workflow.",
  noRefund:
    "Rejecting evidence does not automatically refund, reverse, forward, transfer, sign or perform blockchain writes.",
  audit:
    "The non-secret decision record is suitable for the private administrative audit trail.",
} as const
