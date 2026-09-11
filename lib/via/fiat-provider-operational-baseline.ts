import {
  VIA_FIAT_PROVIDER_REQUIREMENTS,
  type ViaFiatProviderProfile,
} from "./fiat-provider"

export type ViaFiatProviderOperationalProfile = ViaFiatProviderProfile & {
  currencies: Array<"EUR" | "USD">
  webhookVerificationConfigured: boolean
}

export function fiatProviderOperationalBaseline(
  profile: ViaFiatProviderOperationalProfile,
): boolean {
  const capabilitiesReady =
    VIA_FIAT_PROVIDER_REQUIREMENTS.capabilities.every((item) =>
      profile.capabilities.includes(item),
    )
  const currenciesReady =
    VIA_FIAT_PROVIDER_REQUIREMENTS.currencies.every((item) =>
      profile.currencies.includes(item),
    )

  return (
    capabilitiesReady &&
    currenciesReady &&
    profile.hostedCheckoutRequired === true &&
    profile.rawCardDataAllowedInVia === false &&
    profile.webhookVerificationConfigured
  )
}

export const VIA_FIAT_PROVIDER_OPERATIONAL_RULES = {
  currencies:
    "A provider is not operational for VIA unless both EUR and USD support are explicitly confirmed.",
  callback:
    "Provider capability alone is insufficient: trusted server-side webhook/callback verification must be configured.",
  hosted:
    "VIA requires hosted provider checkout and never accepts raw card/security-code data.",
  failClosed:
    "Unknown/missing currency, capability or webhook configuration keeps fiat non-operational.",
  replaceable:
    "These requirements describe the provider boundary and do not permanently bind VIA to one payment company.",
} as const
