import type { ViaCheckoutOrder } from "./checkout-order-boundary"
import type { ViaCheckoutAttempt } from "./checkout-attempt-foundation"

export type ViaOrderAttemptBindingResult =
  | { valid: true }
  | { valid: false; reason: "order-id-mismatch" | "amount-mismatch" | "currency-mismatch" }

export function validateOrderAttemptBinding(
  order: ViaCheckoutOrder,
  attempt: ViaCheckoutAttempt,
): ViaOrderAttemptBindingResult {
  if (order.orderId !== attempt.orderId) return { valid: false, reason: "order-id-mismatch" }
  if (order.amountMinor !== attempt.amountMinor) return { valid: false, reason: "amount-mismatch" }
  if (order.currency !== attempt.currency) return { valid: false, reason: "currency-mismatch" }
  return { valid: true }
}

export const VIA_ORDER_ATTEMPT_BINDING_RULES = {
  exactOrder: "A checkout attempt must reference the exact order that created it.",
  exactAmount: "The checkout attempt amount must equal the immutable order amount.",
  exactCurrency: "The checkout attempt currency must equal the immutable order currency.",
  failClosed: "Any mismatch blocks the payment handoff and requires a fresh validated attempt.",
  noPayment: "A valid binding authorizes no charge, payment confirmation, wallet signature, NFT transfer or blockchain write.",
} as const
