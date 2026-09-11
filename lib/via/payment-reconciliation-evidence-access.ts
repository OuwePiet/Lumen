export type ViaReconciliationEvidenceAccess =
  | { allowed: true; scope: "case-evidence"; caseId: string }
  | { allowed: false; reason: "not-owner" | "reauth-required" | "invalid-case" }

export function reconciliationEvidenceAccess(input: {
  ownerAuthorized: boolean
  freshReauth: boolean
  caseId: string
}): ViaReconciliationEvidenceAccess {
  if (!input.ownerAuthorized) return { allowed: false, reason: "not-owner" }
  if (!input.freshReauth) return { allowed: false, reason: "reauth-required" }
  if (!input.caseId.trim()) return { allowed: false, reason: "invalid-case" }

  return { allowed: true, scope: "case-evidence", caseId: input.caseId }
}

export const VIA_RECONCILIATION_EVIDENCE_ACCESS_RULES = {
  deliberate:
    "Detailed reconciliation evidence is behind a deliberate separate owner action, not loaded automatically with the case summary.",
  freshAuth:
    "Evidence access requires server-side owner authorization plus recent re-authentication.",
  scoped:
    "Authorization is scoped to the requested case and does not grant general payment configuration, signing, refund or wallet authority.",
  minimization:
    "Only evidence needed for the decision should be retrieved; provider secrets, raw card data, private keys and seeds remain forbidden.",
  audit:
    "Successful evidence access should create a non-secret private audit event without copying the evidence itself into the audit log.",
} as const
