export type ViaEvidenceCopyField =
  | "providerReference"
  | "transactionReference"
  | "amount"
  | "currency"
  | "observedAt"

export function evidenceFieldMayCopy(input: {
  ownerAuthorized: boolean
  evidenceSessionActive: boolean
  field: ViaEvidenceCopyField
  value: string
}): boolean {
  if (!input.ownerAuthorized || !input.evidenceSessionActive) return false
  return input.value.trim().length > 0 && input.value.length <= 160
}

export const VIA_EVIDENCE_COPY_RULES = {
  explicit:
    "Copying an evidence value is an explicit owner action on one visible safe field; VIA does not bulk-copy a case automatically.",
  session:
    "Copy is available only while the case-scoped detailed-evidence session remains active.",
  safeFields:
    "Only already-redacted safe display fields can be copied; forbidden secrets/raw card data are not eligible fields.",
  clipboard:
    "VIA does not read existing clipboard contents and does not retain copied values after the explicit copy operation.",
  noEffects:
    "Copying evidence performs no case decision, payment confirmation, refund, settlement, signing or blockchain write.",
} as const
