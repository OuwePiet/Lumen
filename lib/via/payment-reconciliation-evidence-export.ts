export type ViaEvidenceExportDecision =
  | { allowed: false; reason: "bulk-export-disabled" }

export function evidenceBulkExportDecision(): ViaEvidenceExportDecision {
  return { allowed: false, reason: "bulk-export-disabled" }
}

export const VIA_EVIDENCE_EXPORT_RULES = {
  disabled:
    "Bulk export/download of detailed payment reconciliation evidence is disabled by default.",
  reviewInPlace:
    "Sensitive evidence is reviewed in the protected owner session; individual safe fields may use the separate explicit copy boundary when needed.",
  noArchive:
    "VIA does not generate a ZIP, CSV, JSON, PDF or browser-download archive containing detailed reconciliation evidence.",
  future:
    "Any future export capability requires a separate privacy/security design and explicit owner approval before implementation.",
  noEffects:
    "The export boundary performs no case decision, payment confirmation, refund, settlement, signing or blockchain write.",
} as const
