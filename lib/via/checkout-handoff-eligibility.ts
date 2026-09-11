import type { ViaCheckoutOrder } from "./checkout-order-boundary"
import type { ViaCheckoutAttempt } from "./checkout-attempt-foundation"
import { validateOrderAttemptBinding } from "./checkout-order-attempt-binding"

export type ViaPaymentMethodState = {
  method: "fiat-eur" | "fiat-usd" | "bitcoin" | "deso"
  actionable: boolean
}

export type ViaCheckoutHandoffResult =
  | { eligible: true; method: ViaPaymentMethodState["method"] }
  | {
      eligible: false
      reason:
        | "order-attempt-mismatch"
        | "method-currency-mismatch"
        | "payment-method-not-ready"
    }

function expectedMethod(order: ViaCheckoutOrder): ViaPaymentMethodState["method"] {
  if (order.currency === "EUR") return "fiat-eur"
  if (order.currency === "USD") return "fiat-usd"
  if (order.currency === "BTC") return "bitcoin"
  return "deso"
}

export function evaluateCheckoutHandoffEligibility(
  order: ViaCheckoutOrder,
  attempt: ViaCheckoutAttempt,
  readiness: ViaPaymentMethodState[],
): ViaCheckoutHandoffResult {
  const binding = validateOrderAttemptBinding(order, attempt)
  if (!binding.valid) return { eligible: false, reason: "order-attempt-mismatch" }

  const method = expectedMethod(order)
  if (attempt.method !== method) {
    return { eligible: false, reason: "method-currency-mismatch" }
  }

  const current = readiness.find((item) => item.method === method)
  if (!current?.actionable) {
    return { eligible: false, reason: "payment-method-not-ready" }
  }

  return { eligible: true, method }
}

export const VIA_CHECKOUT_HANDOFF_RULES = {
  exactBinding: "Only an attempt that still matches the immutable order may continue.",
  exactMethod: "The attempt payment method must match the order currency.",
  liveReadiness: "A handoff is eligible only while the selected payment method is currently actionable.",
  failClosed: "Missing or non-actionable readiness state blocks the handoff.",
  noExecution: "Eligibility does not create a provider session, charge, wallet signature, NFT transfer or blockchain write.",
} as const
