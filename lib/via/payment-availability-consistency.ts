import type { ViaPaymentMethodAvailability } from "./payment-method-boundary-v2"

export type ViaPaymentAvailabilityConsistency =
  | { valid: true }
  | { valid: false; reason: "actionable-without-release" | "actionable-without-operational" }

export function paymentAvailabilityConsistency(
  item: ViaPaymentMethodAvailability,
): ViaPaymentAvailabilityConsistency {
  if (item.actionable && !item.released) {
    return { valid: false, reason: "actionable-without-release" }
  }
  if (item.actionable && !item.operational) {
    return { valid: false, reason: "actionable-without-operational" }
  }
  return { valid: true }
}

export const VIA_PAYMENT_AVAILABILITY_CONSISTENCY_RULES = {
  invariant:
    "No payment method may be actionable unless it is both explicitly released and currently operational.",
  server:
    "Production checkout computes and validates this invariant server-side before presenting/creating an actionable payment path.",
  deso:
    "Because DESO is unreleased, it cannot become actionable from a stray readiness/configuration signal.",
  failClosed:
    "An inconsistent payment-method state is treated as non-actionable and should be logged with safe metadata for investigation.",
  noPayment:
    "Consistency validation performs no signing, payment confirmation, refund, settlement, forwarding or blockchain write.",
} as const
