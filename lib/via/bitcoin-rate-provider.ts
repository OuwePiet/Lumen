export type ViaBitcoinRateCurrency = "EUR" | "USD"

export type ViaBitcoinRateSnapshot = {
  currency: ViaBitcoinRateCurrency
  fiatPerBtc: number
  providerId: string
  observedAtMs: number
}

export type ViaBitcoinRateProvider = {
  id: string
  fetchRate(currency: ViaBitcoinRateCurrency): Promise<ViaBitcoinRateSnapshot>
}

export function validateBitcoinRateSnapshot(
  snapshot: ViaBitcoinRateSnapshot,
  nowMs: number,
  maxAgeMs: number,
): boolean {
  if (!snapshot.providerId.trim()) return false
  if (!Number.isFinite(snapshot.fiatPerBtc) || snapshot.fiatPerBtc <= 0) return false
  if (!Number.isSafeInteger(snapshot.observedAtMs) || snapshot.observedAtMs < 1) return false
  if (!Number.isSafeInteger(nowMs) || !Number.isSafeInteger(maxAgeMs) || maxAgeMs < 1) return false

  const age = nowMs - snapshot.observedAtMs
  return age >= 0 && age <= maxAgeMs
}

export const VIA_BITCOIN_RATE_PROVIDER_RULES = {
  replaceable:
    "The Bitcoin market-rate source is behind a provider interface so VIA can replace it without changing quote or payment-state logic.",
  serverSide:
    "Provider credentials, if a selected rate service requires them, remain server-side and are never exposed to the browser.",
  freshness:
    "VIA rejects stale, future-dated, zero or invalid market-rate snapshots before creating a BTC quote.",
  noProviderTrustShortcut:
    "A rate provider supplies pricing data only and cannot confirm receipt, authorize spending or alter payment settlement state.",
  currencies:
    "The rate boundary supports EUR and USD as VIA's primary fiat reference currencies.",
} as const
