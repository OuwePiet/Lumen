import type { ViaCheckoutOrderInput } from "./checkout-order-boundary"

export function validateCheckoutOrderForAttempt(input: ViaCheckoutOrderInput): { valid: boolean; reason?: string } {
  if (!input.orderId.trim()) return { valid: false, reason: "missing-order" }
  if (!input.nftId.trim()) return { valid: false, reason: "missing-nft" }
  if (!input.sellerPublicKey.trim()) return { valid: false, reason: "missing-seller" }
  if (!Number.isSafeInteger(input.amountMinor) || input.amountMinor <= 0) return { valid: false, reason: "invalid-amount" }
  if (input.buyerPublicKey !== undefined && !input.buyerPublicKey.trim()) return { valid: false, reason: "invalid-buyer" }
  if (!(["EUR", "USD", "BTC", "DESO"] as const).includes(input.currency)) return { valid: false, reason: "invalid-currency" }
  return { valid: true }
}

export const VIA_CHECKOUT_ORDER_VALIDATION_RULES = {
  serverOnly: "Order validation is authoritative on the server.",
  failClosed: "Missing identifiers, invalid amounts and unsupported currencies are rejected.",
  noConfirmation: "A valid order is not evidence of payment and cannot grant NFT ownership.",
} as const
