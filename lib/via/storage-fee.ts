export type ViaStorageQuote = {
  providerCostCents: number
  serviceFeeCents: number
  blockchainFeeCents: number
  totalCents: number
}

function cents(value: number) {
  return Number.isInteger(value) && value >= 0 ? value : 0
}

/**
 * VIA facilitates external storage; it is not the storage provider.
 * Fees remain explicit and configurable instead of being hard-coded into
 * mint/storage behavior. A quote must be accepted before any future payment.
 */
export function quoteExternalStorage(input: {
  providerCostCents: number
  blockchainFeeCents?: number
  serviceFeeCents?: number
}): ViaStorageQuote {
  const providerCostCents = cents(input.providerCostCents)
  const blockchainFeeCents = cents(input.blockchainFeeCents ?? 0)
  const serviceFeeCents = cents(input.serviceFeeCents ?? 2)

  return {
    providerCostCents,
    serviceFeeCents,
    blockchainFeeCents,
    totalCents: providerCostCents + serviceFeeCents + blockchainFeeCents,
  }
}
