export function evidenceCaseIdIsValid(caseId: string): boolean {
  const value = caseId.trim()
  if (value.length < 1 || value.length > 96) return false
  return /^[A-Za-z0-9_-]+$/.test(value)
}

export const VIA_EVIDENCE_CASE_ID_RULES = {
  opaque:
    "Reconciliation case IDs are opaque VIA identifiers; they do not embed payer names, email addresses, wallet addresses, provider payloads or payment evidence.",
  charset:
    "Owner evidence routes accept only bounded ASCII letters, digits, underscore and hyphen for case IDs.",
  noPath:
    "Case IDs cannot contain slashes, dots, percent escapes, query delimiters or fragments and therefore are not treated as paths/URLs.",
  lookup:
    "A syntactically valid case ID still requires owner authorization and case-scoped access before any evidence lookup.",
  noEffects:
    "Case ID validation performs no case decision, payment confirmation, refund, settlement, signing or blockchain write.",
} as const
