export type ViaBitcoinMismatchReason =
  | "wrong-address"
  | "underpaid"
  | "overpaid"
  | "insufficient-confirmations"
  | "missing-transaction-reference"

export type ViaBitcoinReconciliationDecision =
  | { matched: true }
  | { matched: false; reason: ViaBitcoinMismatchReason; manualReviewRequired: true }

export function reconcileBitcoinPayment(input: {
  expectedAddress: string
  observedAddress: string
  expectedSats: bigint
  observedSats: bigint
  confirmations: number
  minimumConfirmations: number
  transactionReference: string
}): ViaBitcoinReconciliationDecision {
  if (!input.transactionReference.trim()) {
    return { matched: false, reason: "missing-transaction-reference", manualReviewRequired: true }
  }

  if (input.observedAddress !== input.expectedAddress) {
    return { matched: false, reason: "wrong-address", manualReviewRequired: true }
  }

  if (input.observedSats < input.expectedSats) {
    return { matched: false, reason: "underpaid", manualReviewRequired: true }
  }

  if (input.observedSats > input.expectedSats) {
    return { matched: false, reason: "overpaid", manualReviewRequired: true }
  }

  if (input.confirmations < input.minimumConfirmations) {
    return { matched: false, reason: "insufficient-confirmations", manualReviewRequired: true }
  }

  return { matched: true }
}

export const VIA_BITCOIN_MISMATCH_RULES = {
  noSilentAcceptance:
    "Underpayments, overpayments, wrong destinations and incomplete confirmations are never silently accepted as a normal paid order.",
  review:
    "A mismatched Bitcoin payment is held for private review instead of automatically activating sponsor or support benefits.",
  noAutomaticRefund:
    "VIA does not automatically spend Bitcoin to refund an overpayment; any refund policy remains a separate controlled process.",
  exactSatoshis:
    "Reconciliation compares integer satoshi amounts to avoid floating-point payment errors.",
} as const
