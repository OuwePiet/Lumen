export type ViaCheckoutRetryDecision =
  | { allowed: true; createFreshPaymentInstruction: true }
  | {
      allowed: false
      reason: "already-confirmed" | "active-attempt" | "order-expired" | "method-unavailable"
    }

export function checkoutRetryDecision(input: {
  paymentConfirmed: boolean
  activeAttempt: boolean
  orderExpired: boolean
  methodAvailable: boolean
}): ViaCheckoutRetryDecision {
  if (input.paymentConfirmed) return { allowed: false, reason: "already-confirmed" }
  if (input.activeAttempt) return { allowed: false, reason: "active-attempt" }
  if (input.orderExpired) return { allowed: false, reason: "order-expired" }
  if (!input.methodAvailable) return { allowed: false, reason: "method-unavailable" }

  return { allowed: true, createFreshPaymentInstruction: true }
}

export const VIA_CHECKOUT_RETRY_RULES = {
  fresh:
    "A retry creates a fresh provider session or Bitcoin quote/request and never blindly reuses an expired or failed payment instruction.",
  noDuplicate:
    "VIA does not start another retry while an earlier payment attempt is still active or while the order is already confirmed.",
  readiness:
    "The selected payment method must still pass the server-side readiness/availability gate at retry time.",
  expiredOrder:
    "An expired order requires a new order flow rather than a payment retry.",
  noExecution:
    "Retry authorization itself performs no charge, transfer, signing, custody or blockchain write.",
} as const
