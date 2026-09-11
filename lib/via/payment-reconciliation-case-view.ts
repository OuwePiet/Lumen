export type ViaReconciliationCaseView = {
  caseId: string
  orderId: string
  attemptId: string
  method: "fiat" | "bitcoin" | "deso"
  openedAt: string
  status: "open" | "resolved"
  relatedCaseId?: string
}

export function reconciliationCaseView(input: {
  ownerAuthorized: boolean
  caseData: ViaReconciliationCaseView
}): ViaReconciliationCaseView | null {
  if (!input.ownerAuthorized) return null
  if (!input.caseData.caseId.trim() || !input.caseData.orderId.trim() || !input.caseData.attemptId.trim()) return null
  return { ...input.caseData }
}

export const VIA_RECONCILIATION_CASE_VIEW_RULES = {
  ownerOnly:
    "Case detail is available only after server-side VIA-owner/admin authorization.",
  minimal:
    "The default case view shows identifiers, method, timestamps, status and optional case relation only.",
  secrets:
    "Raw card data, private keys, seed phrases, provider credentials and internal secrets are never part of this view model.",
  evidence:
    "Detailed trusted evidence is accessed separately and only when needed for the review decision.",
  noEffects:
    "Viewing a case performs no decision, confirmation, refund, settlement, forwarding, signing or blockchain write.",
} as const
