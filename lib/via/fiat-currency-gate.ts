export type ViaFiatCurrency = "EUR" | "USD"

export type ViaFiatCurrencyGate =
  | { allowed: true; currency: ViaFiatCurrency }
  | { allowed: false; reason: "unsupported-currency" }

export function fiatCurrencyGate(input: string): ViaFiatCurrencyGate {
  const currency = input.trim().toUpperCase()
  if (currency === "EUR" || currency === "USD") {
    return { allowed: true, currency }
  }
  return { allowed: false, reason: "unsupported-currency" }
}

export const VIA_FIAT_CURRENCY_GATE_RULES = {
  explicit:
    "VIA fiat checkout accepts only explicitly supported ISO currency codes EUR and USD.",
  noGuess:
    "VIA never infers currency from locale, browser language, IP location, symbol or provider default.",
  order:
    "The selected currency is bound to the VIA order before provider checkout creation and must reconcile exactly on trusted callback.",
  noConversion:
    "This gate does not silently convert EUR to USD or USD to EUR; any future conversion requires an explicit quoted conversion boundary.",
  failClosed:
    "Unknown, empty or unsupported currency keeps fiat checkout unavailable for that request.",
} as const
