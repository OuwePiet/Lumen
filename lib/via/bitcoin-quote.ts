export type ViaBitcoinQuote = {
  fiatCurrency: "EUR" | "USD"
  fiatAmountMinor: number
  btcAmount: string
  quotedAtMs: number
  expiresAtMs: number
  rateSource: string
}

export function createBitcoinQuote(input: {
  fiatCurrency: "EUR" | "USD"
  fiatAmountMinor: number
  btcAmount: string
  quotedAtMs: number
  validityMs: number
  rateSource: string
}): ViaBitcoinQuote | null {
  if (!Number.isSafeInteger(input.fiatAmountMinor) || input.fiatAmountMinor < 1) return null
  if (!/^0\.\d{1,8}$/.test(input.btcAmount) || Number(input.btcAmount) <= 0) return null
  if (!Number.isSafeInteger(input.quotedAtMs) || input.quotedAtMs < 1) return null
  if (!Number.isSafeInteger(input.validityMs) || input.validityMs < 1) return null
  if (!input.rateSource.trim()) return null

  const expiresAtMs = input.quotedAtMs + input.validityMs
  if (!Number.isSafeInteger(expiresAtMs)) return null

  return {
    fiatCurrency: input.fiatCurrency,
    fiatAmountMinor: input.fiatAmountMinor,
    btcAmount: input.btcAmount,
    quotedAtMs: input.quotedAtMs,
    expiresAtMs,
    rateSource: input.rateSource,
  }
}

export function bitcoinQuoteIsCurrent(quote: ViaBitcoinQuote, nowMs: number) {
  return Number.isSafeInteger(nowMs) && nowMs >= quote.quotedAtMs && nowMs < quote.expiresAtMs
}

export const VIA_BITCOIN_QUOTE_RULES = {
  liveRate:
    "The exact BTC amount is derived from a current external market-rate quote rather than a hardcoded exchange rate.",
  expiry:
    "A Bitcoin quote has a defined validity window; an expired quote must be refreshed before payment is requested.",
  disclosure:
    "VIA may show the fiat amount, BTC amount and quote expiry before the payer confirms the Bitcoin payment route.",
  confirmation:
    "A valid quote creates only a payment amount; it never confirms receipt of Bitcoin.",
} as const
