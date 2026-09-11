export type ViaReconciliationEvidenceAudit = {
  event: "reconciliation-evidence-viewed"
  caseId: string
  actor: "via-owner"
  occurredAt: string
}

export function reconciliationEvidenceAudit(input: {
  accessAllowed: boolean
  caseId: string
  occurredAt: string
}): ViaReconciliationEvidenceAudit | null {
  if (!input.accessAllowed) return null
  if (!input.caseId.trim() || !input.occurredAt.trim()) return null

  return {
    event: "reconciliation-evidence-viewed",
    caseId: input.caseId,
    actor: "via-owner",
    occurredAt: input.occurredAt,
  }
}

export const VIA_RECONCILIATION_EVIDENCE_AUDIT_RULES = {
  metadataOnly:
    "The audit event records that authorized evidence was viewed, not the evidence content itself.",
  noSecrets:
    "No payer details, card data, wallet secrets, provider credentials, private keys or seed phrases are copied into the audit event.",
  afterAuthorization:
    "An evidence-view audit event is created only after the separate owner + fresh-reauth access boundary succeeds.",
  private:
    "Evidence access audit history is private VIA-owner/admin information.",
  noEffects:
    "Audit recording performs no case decision, payment confirmation, refund, settlement, signing or blockchain write.",
} as const
