export type ViaBitcoinAddressChangePreview = {
  network: "bitcoin-mainnet"
  address: string
  fingerprint: string
  warningKey: "payment.bitcoin.receiver.confirm-warning"
}

export function bitcoinAddressChangePreview(input: {
  normalizedAddress: string
}): ViaBitcoinAddressChangePreview | null {
  const address = input.normalizedAddress.trim()
  if (address.length < 12) return null

  return {
    network: "bitcoin-mainnet",
    address,
    fingerprint: `${address.slice(0, 6)}…${address.slice(-6)}`,
    warningKey: "payment.bitcoin.receiver.confirm-warning",
  }
}

export const VIA_BITCOIN_ADDRESS_PREVIEW_RULES = {
  fullAddress:
    "Before committing a receiver change, the owner sees the complete normalized public Bitcoin address for visual verification.",
  network:
    "The confirmation screen states bitcoin-mainnet explicitly and does not allow silent network substitution.",
  warning:
    "The owner is warned to compare the destination carefully; VIA does not infer correctness from visual similarity alone.",
  noQr:
    "Configuration confirmation does not accept a QR scan as authority to replace the typed/pasted validated address.",
  noSave:
    "Generating the preview does not save configuration or affect any existing/new payment request until explicit protected confirmation succeeds.",
} as const
