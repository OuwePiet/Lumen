export type ViaFiatProviderCapability =
  | "cards"
  | "apple-pay"
  | "google-pay"
  | "ideal"
  | "payment-links"
  | "recurring"

export type ViaFiatProviderProfile = {
  providerId: string
  capabilities: ViaFiatProviderCapability[]
  hostedCheckoutRequired: true
  rawCardDataAllowedInVia: false
}

export const VIA_FIAT_PROVIDER_REQUIREMENTS = {
  currencies: ["EUR", "USD"] as const,
  capabilities: [
    "cards",
    "apple-pay",
    "google-pay",
    "payment-links",
  ] as const,
  hostedCheckoutRequired: true,
  rawCardDataAllowedInVia: false,
  webhookConfirmationRequired: true,
  lowFixedMonthlyCostPreferred: true,
} as const

export function providerMeetsViaBaseline(profile: ViaFiatProviderProfile) {
  const required = VIA_FIAT_PROVIDER_REQUIREMENTS.capabilities
  return required.every((item) => profile.capabilities.includes(item))
}

export const VIA_FIAT_PROVIDER_GUIDE = {
  separation:
    "VIA creates an internal order first; the payment provider processes fiat payment separately and returns only payment status/reference data needed by VIA.",
  credentials:
    "VIA never stores raw card numbers, security codes or wallet payment credentials.",
  confirmation:
    "A sponsor or community-support order is confirmed only after provider-side payment confirmation.",
  selection:
    "The provider remains configurable so VIA is not permanently locked to one payment company.",
  customerCosts:
    "Where permitted by the selected payment method, provider and applicable rules, payment-processing costs are disclosed before confirmation and added to the customer total rather than silently absorbed by VIA."
} as const


export type ViaCheckoutCostBreakdown = {
  sponsorAmountMinor: number
  processingCostMinor: number
  totalDueMinor: number
}

export function checkoutCostBreakdown(input: {
  sponsorAmountMinor: number
  processingCostMinor: number
}): ViaCheckoutCostBreakdown | null {
  if (!Number.isSafeInteger(input.sponsorAmountMinor) || input.sponsorAmountMinor < 1) return null
  if (!Number.isSafeInteger(input.processingCostMinor) || input.processingCostMinor < 0) return null

  return {
    sponsorAmountMinor: input.sponsorAmountMinor,
    processingCostMinor: input.processingCostMinor,
    totalDueMinor: input.sponsorAmountMinor + input.processingCostMinor,
  }
}

export const VIA_CHECKOUT_COST_COPY = {
  en: {
    processing: "Payment processing costs",
    total: "Total to pay",
    disclosure: "Payment processing costs are shown before you confirm payment.",
  },
  nl: {
    processing: "Betaalverwerkingskosten",
    total: "Totaal te betalen",
    disclosure: "De betaalverwerkingskosten worden getoond voordat u de betaling bevestigt.",
  },
} as const
