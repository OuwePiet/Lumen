export type ViaPaymentConfirmationKey = {
  orderId: string
  paymentReference: string
}

export function paymentConfirmationKey(input: ViaPaymentConfirmationKey): string | null {
  const orderId = input.orderId.trim()
  const paymentReference = input.paymentReference.trim()
  if (!orderId || !paymentReference) return null

  return `${orderId}:${paymentReference}`
}

export function paymentConfirmationIsDuplicate(input: {
  key: string
  processedKeys: ReadonlySet<string>
}): boolean {
  return input.processedKeys.has(input.key)
}

export const VIA_PAYMENT_IDEMPOTENCY_RULES = {
  once:
    "The same confirmed payment reference for the same VIA order may be applied only once.",
  providerRetries:
    "Repeated provider callbacks or repeated Bitcoin observation events must not create duplicate receipts, ledger entries, sponsor activation or support benefits.",
  atomic:
    "Production persistence must claim the confirmation key atomically before applying payment side effects.",
  scope:
    "Idempotency protects payment confirmation processing only; it does not authorize payment, signing, refund or blockchain writes.",
} as const
