export type ViaCheckoutAttemptBinding = {
  orderId: string
  attemptId: string
  method: "fiat" | "bitcoin" | "deso"
}

export function checkoutConfirmationMatchesAttempt(input: {
  expected: ViaCheckoutAttemptBinding
  orderId: string
  attemptId: string
  method: ViaCheckoutAttemptBinding["method"]
}): boolean {
  return (
    input.orderId === input.expected.orderId &&
    input.attemptId === input.expected.attemptId &&
    input.method === input.expected.method
  )
}

export const VIA_CHECKOUT_ATTEMPT_BINDING_RULES = {
  exact:
    "A payment confirmation must match the exact VIA order, checkout attempt and selected payment method.",
  stale:
    "A callback or observation belonging to an older/replaced attempt cannot confirm the current attempt.",
  method:
    "A fiat callback cannot satisfy a Bitcoin/DESO attempt and a blockchain observation cannot satisfy a fiat attempt.",
  serverSide:
    "Production matching is performed against trusted server-side order/attempt state, never browser-supplied state alone.",
  noExecution:
    "Attempt matching validates identity only and performs no settlement, transfer, signing or blockchain write.",
} as const
