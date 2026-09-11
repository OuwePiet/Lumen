export type ViaCheckoutMethod = "fiat" | "bitcoin" | "deso"

export type ViaCheckoutSelection =
  | { selected: true; method: ViaCheckoutMethod }
  | { selected: false; reason: "method-unavailable" }

export function selectCheckoutMethod(input: {
  method: ViaCheckoutMethod
  fiatAvailable: boolean
  bitcoinAvailable: boolean
  desoAvailable: boolean
}): ViaCheckoutSelection {
  const available =
    input.method === "fiat"
      ? input.fiatAvailable
      : input.method === "bitcoin"
        ? input.bitcoinAvailable
        : input.desoAvailable

  if (!available) return { selected: false, reason: "method-unavailable" }
  return { selected: true, method: input.method }
}

export const VIA_CHECKOUT_METHOD_SELECTION_RULES = {
  explicit:
    "The payer explicitly selects an available payment method; VIA does not silently switch methods after checkout starts.",
  readiness:
    "Selection accepts only methods already marked operational by the server-side payment readiness boundary.",
  priority:
    "The interface may present EUR/USD first, Bitcoin second and DESO as an extra option without forcing the payer away from another available method.",
  noFallback:
    "If the selected method becomes unavailable, VIA stops and asks for a new selection instead of silently creating a different payment destination.",
  noExecution:
    "Method selection creates no charge, transfer, signing request or blockchain write.",
} as const
