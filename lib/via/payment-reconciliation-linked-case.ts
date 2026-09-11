export type ViaLinkedReconciliationCase = {
  caseId: string
  relatedCaseId: string
  relation: "follow-up"
  reason: "new-evidence-after-resolution"
  status: "open"
}

export function createLinkedReconciliationCase(input: {
  caseId: string
  relatedCaseId: string
  priorCaseResolved: boolean
  trustedNewEvidence: boolean
}): ViaLinkedReconciliationCase | null {
  if (!input.priorCaseResolved || !input.trustedNewEvidence) return null
  if (!input.caseId.trim() || !input.relatedCaseId.trim()) return null
  if (input.caseId === input.relatedCaseId) return null

  return {
    caseId: input.caseId,
    relatedCaseId: input.relatedCaseId,
    relation: "follow-up",
    reason: "new-evidence-after-resolution",
    status: "open",
  }
}

export const VIA_LINKED_RECONCILIATION_CASE_RULES = {
  preserve:
    "New trusted evidence after resolution creates a linked follow-up case rather than mutating the resolved case.",
  traceable:
    "The follow-up keeps the prior case identifier so the private administrative history remains traceable.",
  private:
    "Case relationships are private owner/admin information and are not exposed to sponsors, supporters or public VIA pages.",
  noEffects:
    "Creating a follow-up case does not confirm payment or execute refunds, settlement, forwarding, signing or blockchain writes.",
} as const
