import type { ViaRates } from "../../app/via-live-rates"
/** Display estimates only. The underlying DeSo transaction always uses its exact native amount. */
export function nftMoney(value: unknown, rates: ViaRates | null = null, now = Date.now()): string | undefined {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) return undefined
  const amount = value / 1_000_000_000
  const native = `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 9 }).format(amount)} DESO`
  const checked = Date.parse(rates?.checkedAt ?? "")
  if (!rates?.rates || rates.status !== "current" || !Number.isFinite(checked) || now - checked > 180_000 || checked - now > 60_000) return native
  const estimate = (symbol: string, rate: number) => {
    if (!Number.isFinite(rate) || rate <= 0) return null
    const fiat = amount * rate
    return fiat > 0 && fiat < 0.01 ? `< ${symbol}0.01` : `${symbol}${fiat.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  const fiat = [estimate("$", rates.rates.USD), estimate("€", rates.rates.EUR)].filter(Boolean)
  return native + (fiat.length ? ` · ≈ ${fiat.join(" / ")}` : "")
}