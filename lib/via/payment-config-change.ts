export type ViaPaymentConfigField =
  | "fiat-provider"
  | "bitcoin-receiver"
  | "bitcoin-rate-provider"
  | "bitcoin-minimum-confirmations"
  | "payment-cost-policy"
  | "retention-policy"

export type ViaPaymentConfigChange = {
  field: ViaPaymentConfigField
  changedAt: string
  changedBy: "via-owner"
  previousFingerprint: string
  nextFingerprint: string
}

export function recordPaymentConfigChange(input: {
  field: ViaPaymentConfigField
  changedAt: string
  ownerAuthorized: boolean
  freshReauth: boolean
  previousFingerprint: string
  nextFingerprint: string
}): ViaPaymentConfigChange | null {
  if (!input.ownerAuthorized || !input.freshReauth) return null
  if (!input.changedAt.trim()) return null
  if (!input.previousFingerprint.trim() || !input.nextFingerprint.trim()) return null
  if (input.previousFingerprint === input.nextFingerprint) return null

  return {
    field: input.field,
    changedAt: input.changedAt,
    changedBy: "via-owner",
    previousFingerprint: input.previousFingerprint,
    nextFingerprint: input.nextFingerprint,
  }
}

export const VIA_PAYMENT_CONFIG_CHANGE_RULES = {
  protected:
    "Payment configuration changes require authorized owner access plus the separate fresh re-authentication gate.",
  fingerprintOnly:
    "Audit records store non-secret fingerprints/identifiers of configuration versions, never provider secrets, private keys or seed phrases.",
  traceable:
    "Changes to fiat provider, Bitcoin receiver/rate source, confirmation policy, cost policy and retention policy remain administratively traceable.",
  noActivation:
    "Recording a configuration change does not itself enable a payment method or authorize payment/signing/blockchain writes.",
} as const
