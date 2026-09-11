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
} as const
