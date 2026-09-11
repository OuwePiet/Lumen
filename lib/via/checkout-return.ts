export type ViaCheckoutReturnState =
  | "returned"
  | "cancelled"
  | "provider-error"
  | "awaiting-confirmation"

export type ViaCheckoutReturnView = {
  state: ViaCheckoutReturnState
  paymentConfirmed: false
  messageKey:
    | "checkout.returned"
    | "checkout.cancelled"
    | "checkout.providerError"
    | "checkout.awaitingConfirmation"
}

export function checkoutReturnView(state: ViaCheckoutReturnState): ViaCheckoutReturnView {
  const messageKeys: Record<ViaCheckoutReturnState, ViaCheckoutReturnView["messageKey"]> = {
    returned: "checkout.returned",
    cancelled: "checkout.cancelled",
    "provider-error": "checkout.providerError",
    "awaiting-confirmation": "checkout.awaitingConfirmation",
  }

  return {
    state,
    paymentConfirmed: false,
    messageKey: messageKeys[state],
  }
}

export const VIA_CHECKOUT_RETURN_RULES = {
  neverConfirm:
    "Returning from an external payment provider, including a provider success URL, never marks the VIA payment confirmed.",
  trustedPath:
    "Confirmation comes only through the separate trusted server-side provider callback or Bitcoin observation/reconciliation path.",
  cancellation:
    "A payer cancellation is shown neutrally and does not create a receipt, ledger entry, sponsor activation or support benefit.",
  retry:
    "A failed/cancelled checkout may later offer a fresh retry without reusing an expired or unsafe payment instruction.",
  privacy:
    "Return-state UI exposes no provider secrets, internal risk decisions or private payment administration.",
} as const
