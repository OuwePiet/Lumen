export type ViaPublicPaymentMethod = "fiat" | "bitcoin" | "deso"

export type ViaPublicPaymentMethodState = {
  method: ViaPublicPaymentMethod
  actionable: boolean
  labelKey:
    | "payment.available"
    | "payment.comingSoon"
    | "payment.extraOption"
}

export function publicPaymentMethodState(input: {
  method: ViaPublicPaymentMethod
  operational: boolean
}): ViaPublicPaymentMethodState {
  if (input.method === "deso") {
    return {
      method: "deso",
      actionable: input.operational,
      labelKey: input.operational ? "payment.extraOption" : "payment.comingSoon",
    }
  }

  return {
    method: input.method,
    actionable: input.operational,
    labelKey: input.operational ? "payment.available" : "payment.comingSoon",
  }
}

export const VIA_PUBLIC_PAYMENT_METHOD_RULES = {
  readiness:
    "Public payment buttons are actionable only when the corresponding server-side readiness boundary reports the method operational.",
  noDeadEnd:
    "A configured-but-incomplete method is presented as unavailable/coming later rather than sending a payer into a broken payment flow.",
  priority:
    "Regular EUR/USD payment remains the primary route, Bitcoin the secondary route and DESO an extra option when each is operational.",
  noSecrets:
    "The public availability model exposes no provider credentials, private configuration, wallet administration or security details.",
} as const
