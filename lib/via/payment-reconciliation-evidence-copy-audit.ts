export type ViaEvidenceCopyAudit = {
  event: "reconciliation-evidence-field-copied"
  caseId: string
  field: "providerReference" | "transactionReference" | "amount" | "currency" | "observedAt"
  actor: "via-owner"
  occurredAt: string
}

export function evidenceCopyAudit(input: {
  copyAllowed: boolean
  caseId: string
  field: ViaEvidenceCopyAudit["field"]
  occurredAt: string
}): ViaEvidenceCopyAudit | null {
  if (!input.copyAllowed) return null
  if (!input.caseId.trim() || !input.occurredAt.trim()) return null

  return {
    event: "reconciliation-evidence-field-copied",
    caseId: input.caseId,
    field: input.field,
    actor: "via-owner",
    occurredAt: input.occurredAt,
  }
}

export const VIA_EVIDENCE_COPY_AUDIT_RULES = {
  metadataOnly:
    "Copy audit records case ID, safe field name, actor and time only; the copied evidence value itself is never written to the audit log.",
  authorized:
    "An audit event is created only after the separate owner/session copy boundary allows the operation.",
  private:
    "Evidence copy history is private VIA-owner/admin metadata.",
  noSecrets:
    "No clipboard content, provider secrets, raw card data, private keys or seed phrases are logged.",
  noEffects:
    "Audit recording performs no case decision, payment confirmation, refund, settlement, signing or blockchain write.",
} as const
