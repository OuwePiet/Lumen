export type ViaFiatExpectedPayment = {
  orderId: string
  currency: "EUR" | "USD"
  totalMinor: number
}

export type ViaFiatObservedPayment = {
  orderId: string
  currency: string
  paidMinor: number
  paymentReference: string
}

export type ViaFiatReconciliation =
  | { matched: true; paymentReference: string }
  | {
      matched: false
      reason: "wrong-order" | "wrong-currency" | "wrong-amount" | "missing-reference"
    }

export function reconcileFiatPayment(input: {
  expected: ViaFiatExpectedPayment
  observed: ViaFiatObservedPayment
}): ViaFiatReconciliation {
  if (!input.observed.paymentReference.trim()) {
    return { matched: false, reason: "missing-reference" }
  }

  if (input.observed.orderId !== input.expected.orderId) {
    return { matched: false, reason: "wrong-order" }
  }

  if (input.observed.currency !== input.expected.currency) {
    return { matched: false, reason: "wrong-currency" }
  }

  if (input.observed.paidMinor !== input.expected.totalMinor) {
    return { matched: false, reason: "wrong-amount" }
  }

  return { matched: true, paymentReference: input.observed.paymentReference }
}

export const VIA_FIAT_RECONCILIATION_RULES = {
  exact:
    "A trusted fiat callback confirms a VIA order only when order ID, currency and exact total amount all match.",
  integerMoney:
    "Fiat reconciliation uses integer minor units to avoid floating-point money errors.",
  mismatch:
    "A mismatched callback does not activate sponsor placement, support benefits, receipts or downstream settlement.",
  idempotency:
    "The matched provider payment reference feeds the shared VIA idempotency boundary before side effects are applied.",
} as const
