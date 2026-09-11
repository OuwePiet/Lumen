export type ViaSupportedPaymentMethod =
  | "fiat-eur"
  | "fiat-usd"
  | "bitcoin"
  | "deso"

export type ViaPaymentMethodAvailability = {
  method: ViaSupportedPaymentMethod
  enabled: boolean
  requiresDesoAccount: boolean
  priority: 1 | 2 | 3
}

export const VIA_PAYMENT_METHOD_AVAILABILITY: readonly ViaPaymentMethodAvailability[] = [
  { method: "fiat-eur", enabled: true, requiresDesoAccount: false, priority: 1 },
  { method: "fiat-usd", enabled: true, requiresDesoAccount: false, priority: 1 },
  { method: "bitcoin", enabled: true, requiresDesoAccount: false, priority: 2 },
  { method: "deso", enabled: false, requiresDesoAccount: true, priority: 3 },
] as const

export function availableViaPaymentMethods() {
  return VIA_PAYMENT_METHOD_AVAILABILITY.filter((item) => item.enabled)
}

export const VIA_PAYMENT_METHOD_BOUNDARY_RULES = {
  fiatFirst:
    "EUR and USD regular payment are the primary sponsor and community-support methods.",
  bitcoinSecond:
    "Bitcoin is available as the second payment route and does not require a DeSo account.",
  desoExtra:
    "DESO is an additional optional route only; it remains disabled until the corresponding secure signing/payment-write layer is explicitly released.",
  externalSponsor:
    "A sponsor or supporter using fiat or Bitcoin does not need to create a DeSo account.",
  noImplicitWrite:
    "Declaring a payment method available never authorizes blockchain signing or payment execution by itself.",
} as const
