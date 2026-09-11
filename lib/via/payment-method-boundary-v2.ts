export type ViaSupportedPaymentMethod =
  | "fiat-eur"
  | "fiat-usd"
  | "bitcoin"
  | "deso"

export type ViaPaymentMethodAvailability = {
  method: ViaSupportedPaymentMethod
  released: boolean
  operational: boolean
  actionable: boolean
  requiresDesoAccount: boolean
  priority: 1 | 2 | 3
}

export function paymentMethodAvailability(input: {
  fiatOperational: boolean
  bitcoinOperational: boolean
  desoOperational: boolean
}): readonly ViaPaymentMethodAvailability[] {
  return [
    { method: "fiat-eur", released: true, operational: input.fiatOperational, actionable: input.fiatOperational, requiresDesoAccount: false, priority: 1 },
    { method: "fiat-usd", released: true, operational: input.fiatOperational, actionable: input.fiatOperational, requiresDesoAccount: false, priority: 1 },
    { method: "bitcoin", released: true, operational: input.bitcoinOperational, actionable: input.bitcoinOperational, requiresDesoAccount: false, priority: 2 },
    { method: "deso", released: false, operational: input.desoOperational, actionable: false, requiresDesoAccount: true, priority: 3 },
  ] as const
}

export function actionableViaPaymentMethods(input: {
  fiatOperational: boolean
  bitcoinOperational: boolean
  desoOperational: boolean
}) {
  return paymentMethodAvailability(input).filter((item) => item.actionable)
}

export const VIA_PAYMENT_METHOD_BOUNDARY_RULES = {
  releaseVsReady:
    "A payment route being released/supported is distinct from being operational; public actionability requires current server-side readiness.",
  fiatFirst:
    "EUR and USD regular payment are primary when the fiat provider + callback verification boundary is operational.",
  bitcoinSecond:
    "Bitcoin is secondary and becomes actionable only through its full operational/stability checkout boundary.",
  desoExtra:
    "DESO remains non-actionable until its secure signing/payment-write layer is explicitly released, regardless of any readiness signal.",
  failClosed:
    "No static enabled flag may bypass payment readiness or expose a destination/success path for an incomplete method.",
} as const
