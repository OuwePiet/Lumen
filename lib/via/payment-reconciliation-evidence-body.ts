export type ViaEvidenceActionBody = {
  caseId: string
  csrfToken: string
}

export function evidenceActionBody(input: unknown): ViaEvidenceActionBody | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null
  const value = input as Record<string, unknown>
  const keys = Object.keys(value)
  if (keys.some((key) => key !== "caseId" && key !== "csrfToken")) return null
  if (typeof value.caseId !== "string" || typeof value.csrfToken !== "string") return null

  const caseId = value.caseId.trim()
  const csrfToken = value.csrfToken.trim()
  if (!caseId || caseId.length > 160 || !csrfToken || csrfToken.length > 512) return null

  return { caseId, csrfToken }
}

export const VIA_EVIDENCE_BODY_RULES = {
  allowlist:
    "Sensitive evidence action bodies use an explicit allowlist; unexpected properties are rejected rather than ignored.",
  bounded:
    "Case identifiers and anti-CSRF tokens are non-empty and length-bounded before further processing.",
  noEvidence:
    "Evidence values, payer details, provider secrets, wallet secrets and arbitrary nested objects are not accepted in action bodies.",
  parseFirst:
    "Body shape validation occurs before case lookup/evidence processing; authorization and CSRF validation still follow independently.",
  noEffects:
    "Body validation performs no case decision, payment confirmation, refund, settlement, signing or blockchain write.",
} as const
