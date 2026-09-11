export type ViaBitcoinObservedPayment = {
  receiverAddress: string
  receivedBtc: string
  confirmations: number
  transactionReference: string
}

export type ViaBitcoinExpectedPayment = {
  receiverAddress: string
  expectedBtc: string
}

export function bitcoinObservedPaymentMatches(input: {
  expected: ViaBitcoinExpectedPayment
  observed: ViaBitcoinObservedPayment
  minimumConfirmations: number
}): boolean {
  if (input.observed.receiverAddress !== input.expected.receiverAddress) return false
  if (input.observed.receivedBtc !== input.expected.expectedBtc) return false
  if (!input.observed.transactionReference.trim()) return false
  if (!Number.isSafeInteger(input.minimumConfirmations) || input.minimumConfirmations < 1) return false
  if (!Number.isSafeInteger(input.observed.confirmations)) return false

  return input.observed.confirmations >= input.minimumConfirmations
}

export const VIA_BITCOIN_CONFIRMATION_MATCH_RULES = {
  destination:
    "The observed Bitcoin payment must match the receiver address bound to the VIA order.",
  amount:
    "The observed BTC amount must match the exact amount bound to the VIA order before confirmation.",
  confirmations:
    "VIA requires the configured minimum number of trusted confirmations before treating the Bitcoin payment as confirmed.",
  transaction:
    "A non-empty transaction reference is required for reconciliation and audit.",
  noBrowserTrust:
    "Client-side claims, screenshots and browser redirects cannot satisfy Bitcoin payment confirmation.",
} as const
