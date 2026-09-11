export type ViaReconciliationEvidence = {
  providerReference?: string
  transactionReference?: string
  amount?: string
  currency?: string
  observedAt?: string
  rawCardData?: string
  providerSecret?: string
  privateKey?: string
  seedPhrase?: string
}

export function redactReconciliationEvidence(
  evidence: ViaReconciliationEvidence,
): Omit<ViaReconciliationEvidence, "rawCardData" | "providerSecret" | "privateKey" | "seedPhrase"> {
  const {
    rawCardData: _rawCardData,
    providerSecret: _providerSecret,
    privateKey: _privateKey,
    seedPhrase: _seedPhrase,
    ...safe
  } = evidence

  return safe
}

export const VIA_RECONCILIATION_EVIDENCE_REDACTION_RULES = {
  denylist:
    "Raw card data, provider secrets, private keys and seed phrases are removed before evidence reaches the owner-facing review model.",
  upstream:
    "Production integrations should avoid collecting forbidden secret fields at all; redaction is a defense-in-depth boundary, not permission to store them.",
  minimal:
    "Only evidence necessary to identify and assess the payment exception is returned.",
  noLogging:
    "Forbidden fields must not be copied into logs, analytics, error reports or administrative audit records.",
  noEffects:
    "Redaction performs no case decision, payment confirmation, refund, settlement, signing or blockchain write.",
} as const
