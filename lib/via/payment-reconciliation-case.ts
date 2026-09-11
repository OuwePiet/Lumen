export type ViaPaymentReconciliationCase = {
  caseId: string
  orderId: string
  attemptId: string
  method: "fiat" | "bitcoin" | "deso"
  openedAt: string
  status: "open"
  reason: "late-payment-evidence"
}

export function createPaymentReconciliationCase(input: {
  caseId: string
  orderId: string
  attemptId: string
  method: ViaPaymentReconciliationCase["method"]
  openedAt: string
  trustedEvidence: boolean
  orderAlreadyConfirmed: boolean
}): ViaPaymentReconciliationCase | null {
  if (!input.trustedEvidence || input.orderAlreadyConfirmed) return null
  if (!input.caseId.trim() || !input.orderId.trim() || !input.attemptId.trim() || !input.openedAt.trim()) return null

  return {
    caseId: input.caseId,
    orderId: input.orderId,
    attemptId: input.attemptId,
    method: input.method,
    openedAt: input.openedAt,
    status: "open",
    reason: "late-payment-evidence",
  }
}

export const VIA_PAYMENT_RECONCILIATION_CASE_RULES = {
  private:
    "Reconciliation cases are private owner/admin records and never public sponsor/support content.",
  evidence:
    "A case is opened only from trusted payment evidence for an unconfirmed order.",
  minimal:
    "The case stores identifiers and review state; raw card data, private keys, seed phrases and provider secrets are forbidden.",
  manual:
    "Opening a case does not itself confirm, refund, forward, settle, transfer, sign or perform blockchain writes.",
  audit:
    "Case opening and later owner decisions should be represented in the non-secret administrative audit trail.",
} as const
