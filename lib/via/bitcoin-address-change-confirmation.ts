export type ViaBitcoinAddressConfirmation =
  | { confirmed: true; address: string; network: "bitcoin-mainnet" }
  | { confirmed: false; reason: "not-explicit" | "preview-mismatch" }

export function confirmBitcoinAddressChange(input: {
  explicitConfirmation: boolean
  previewAddress: string
  submittedAddress: string
}): ViaBitcoinAddressConfirmation {
  if (!input.explicitConfirmation) {
    return { confirmed: false, reason: "not-explicit" }
  }

  const preview = input.previewAddress.trim()
  const submitted = input.submittedAddress.trim()
  if (!preview || preview !== submitted) {
    return { confirmed: false, reason: "preview-mismatch" }
  }

  return { confirmed: true, address: submitted, network: "bitcoin-mainnet" }
}

export const VIA_BITCOIN_ADDRESS_CONFIRMATION_RULES = {
  exact:
    "The address committed must exactly match the normalized address shown in the immediately preceding protected confirmation preview.",
  explicit:
    "A receiver change requires an explicit owner confirmation action; merely viewing the preview is insufficient.",
  stale:
    "If the submitted address differs from the preview, confirmation fails and a new preview/confirmation cycle is required.",
  reauth:
    "This confirmation is still subordinate to the separate fresh owner re-authentication requirement.",
  noPayment:
    "Confirmation changes configuration only after the protected commit step; it never confirms, signs or forwards a Bitcoin payment.",
} as const
