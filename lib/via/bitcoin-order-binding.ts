export type ViaBitcoinOrderBinding = {
  orderId: string
  receiverAddress: string
  btcAmount: string
  quoteExpiresAtMs: number
  paymentRequestUri: string
}

export function bindBitcoinPaymentToOrder(input: {
  orderId: string
  receiverAddress: string
  btcAmount: string
  quoteExpiresAtMs: number
  paymentRequestUri: string
}): ViaBitcoinOrderBinding | null {
  if (!input.orderId.trim()) return null
  if (!input.receiverAddress.trim()) return null
  if (!input.btcAmount.trim()) return null
  if (!Number.isSafeInteger(input.quoteExpiresAtMs) || input.quoteExpiresAtMs < 1) return null
  if (!input.paymentRequestUri.startsWith(`bitcoin:${input.receiverAddress}`)) return null

  return {
    orderId: input.orderId,
    receiverAddress: input.receiverAddress,
    btcAmount: input.btcAmount,
    quoteExpiresAtMs: input.quoteExpiresAtMs,
    paymentRequestUri: input.paymentRequestUri,
  }
}

export function bitcoinOrderBindingIsPayable(
  binding: ViaBitcoinOrderBinding,
  nowMs: number,
): boolean {
  return Number.isSafeInteger(nowMs) && nowMs < binding.quoteExpiresAtMs
}

export const VIA_BITCOIN_ORDER_BINDING_RULES = {
  immutableDestination:
    "A Bitcoin payment request is bound to the configured VIA receiver for that order and cannot be replaced by payer input.",
  exactQuote:
    "The order binding keeps the exact BTC amount and quote expiry together with the payment request.",
  expired:
    "Once the quote expires, the binding is not payable and VIA must create a fresh quote/request rather than silently changing the amount.",
  confirmationSeparate:
    "Order binding prepares payment instructions only; transaction confirmation remains a separate trusted step.",
} as const
