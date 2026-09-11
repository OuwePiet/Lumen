export type ViaBitcoinCheckoutDecision =
  | { allowed: true }
  | { allowed: false; reason: "bitcoin-unavailable" }

export function bitcoinCheckoutDecision(input: {
  gateReadyNow: boolean
  stableReadyNow: boolean
}): ViaBitcoinCheckoutDecision {
  return input.gateReadyNow && input.stableReadyNow
    ? { allowed: true }
    : { allowed: false, reason: "bitcoin-unavailable" }
}

export const VIA_BITCOIN_CHECKOUT_DECISION_RULES = {
  live:
    "Immediately before creating a Bitcoin payment request, VIA re-evaluates the full gate and stable-readiness state server-side.",
  both:
    "Checkout creation requires both current full-gate readiness and current stable readiness; either false blocks Bitcoin.",
  noClientAuthority:
    "Browser availability flags, old snapshots and previously rendered Bitcoin buttons are never authority to create a payment request.",
  failClosed:
    "Readiness evaluation errors/unknown state are represented as unavailable.",
  noPayment:
    "This decision only gates request creation and itself performs no signing, confirmation, settlement, forwarding or blockchain write.",
} as const
