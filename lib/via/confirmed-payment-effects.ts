export type ViaConfirmedPaymentPurpose = "sponsor" | "community-support"

export type ViaConfirmedPaymentEffects = {
  createLedgerEntry: true
  createReceipt: true
  sponsorActivationEligible: boolean
  supportPulseEligible: boolean
}

export function confirmedPaymentEffects(input: {
  purpose: ViaConfirmedPaymentPurpose
  trustedConfirmation: boolean
  reconciliationMatched: boolean
  idempotencyClaimed: boolean
}): ViaConfirmedPaymentEffects | null {
  if (!input.trustedConfirmation) return null
  if (!input.reconciliationMatched) return null
  if (!input.idempotencyClaimed) return null

  return {
    createLedgerEntry: true,
    createReceipt: true,
    sponsorActivationEligible: input.purpose === "sponsor",
    supportPulseEligible: input.purpose === "community-support",
  }
}

export const VIA_CONFIRMED_PAYMENT_EFFECT_RULES = {
  gate:
    "Receipt, ledger and benefit eligibility are created only after trusted confirmation, exact reconciliation and successful idempotency claim.",
  sponsor:
    "Sponsor payment confirmation makes activation eligible only; owner approval, approved current material and placement-window rules still apply.",
  support:
    "Community-support confirmation may trigger the one-time subtle VIA Pulse through its separate visual boundary.",
  atomicity:
    "Production persistence should apply the idempotency claim and resulting payment effects transactionally so partial duplicate processing cannot occur.",
  noWriteAuthority:
    "This orchestration boundary does not authorize payment, refund, forwarding, signing or blockchain writes.",
} as const
