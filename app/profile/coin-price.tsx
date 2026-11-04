"use client"
import { useEffect, useState } from "react"
import { fetchViaRates, VIA_RATE_REFRESH_MS, type ViaRates } from "../via-live-rates"
export default function CoinPrice({ nanos, dutch }: { nanos: number | null; dutch: boolean }) {
  const [rates, setRates] = useState<ViaRates["rates"]>(null)
  useEffect(() => { const controller = new AbortController()
    const load = () => { void fetchViaRates(controller.signal).then(value => setRates(value.rates)).catch(() => { if (!controller.signal.aborted) setRates(null) }) }
    load(); const timer = setInterval(load, VIA_RATE_REFRESH_MS)
    return () => { controller.abort(); clearInterval(timer) }
  }, [])
  const value = typeof nanos === "number" && Number.isFinite(nanos) && nanos >= 0 ? nanos / 1e9 : null
  const locale = dutch ? "nl-NL" : "en-US"
  return <span className="text-sm text-[#b9e4c8]" data-via-coin-price>
    {dutch ? "Muntprijs: " : "Coin price: "}
    {value === null ? "—" : <><strong>{value.toLocaleString(locale, { maximumFractionDigits: 4 })} DESO</strong>
    {rates ? <span className="text-zinc-400">{" · ≈ " + (value * rates.USD).toLocaleString(locale, { style: "currency", currency: "USD" }) + " / " + (value * rates.EUR).toLocaleString(locale, { style: "currency", currency: "EUR" })}</span> : null}</>}
  </span>
}
