"use client"

import { useEffect, useMemo, useState } from "react"
import { fetchViaRates, isViaRateStale, VIA_RATE_REFRESH_MS, type ViaRates } from "./via-live-rates"

const zones = [
  { label: "Amsterdam", timeZone: "Europe/Amsterdam" },
  { label: "New York", timeZone: "America/New_York" },
  { label: "Los Angeles", timeZone: "America/Los_Angeles" },
  { label: "Tokyo", timeZone: "Asia/Tokyo" },
]

function formatTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hour12: false }).format(date)
}

export default function ViaWorldClock() {
  const [now, setNow] = useState(() => new Date())
  const [rates, setRates] = useState<ViaRates | null>(null)
  const [rateUnavailable, setRateUnavailable] = useState(false)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    let active = true
    let controller: AbortController | null = null
    const refresh = async () => {
      controller?.abort()
      controller = new AbortController()
      try {
        const next = await fetchViaRates(controller.signal)
        if (active) { setRates(next); setRateUnavailable(false) }
      } catch (error) {
        if (active && !(error instanceof DOMException && error.name === "AbortError")) setRateUnavailable(true)
      }
    }
    void refresh()
    const timer = window.setInterval(refresh, VIA_RATE_REFRESH_MS)
    return () => { active = false; controller?.abort(); window.clearInterval(timer) }
  }, [])

  const clocks = useMemo(() => zones.map((zone) => ({ ...zone, time: formatTime(now, zone.timeZone) })), [now])
  const stale = rates ? isViaRateStale(rates.checkedAt, now.getTime()) : false
  const usd = rates?.rates && !stale && !rateUnavailable ? rates.rates.USD : null

  return (
    <section aria-label="World clock and live DESO price" style={{ display: "flex", flexWrap: "wrap", gap: "8px 14px", alignItems: "center", borderTop: "1px solid rgba(79, 116, 98, 0.18)", color: "#9aa8a0", fontSize: "11px", letterSpacing: "0.02em", margin: "10px auto 0", maxWidth: "1180px", padding: "10px 20px 0", position: "relative", zIndex: 2 }}>
      {clocks.map((clock) => (
        <span key={clock.timeZone} style={{ whiteSpace: "nowrap" }}>
          <span style={{ color: "#6e7f76" }}>{clock.label}</span>{" "}<strong style={{ color: "#c8d1cc", fontWeight: 600 }}>{clock.time}</strong>
        </span>
      ))}
      <span style={{ whiteSpace: "nowrap" }} title={stale ? "DESO rate is stale" : rateUnavailable ? "DESO rate is temporarily unavailable" : "Live DESO reference price; transaction fees are calculated separately from the prepared DeSo transaction."}>
        <span style={{ color: "#6e7f76" }}>$DESO</span>{" "}<strong style={{ color: usd === null ? "#7f8b85" : "#9adbb2", fontWeight: 600 }}>{usd === null ? "—" : `$${usd.toLocaleString(undefined, { maximumFractionDigits: 4 })}`}</strong>
      </span>
      <span title="Visitor total will appear only when a reliable aggregate counter is connected." style={{ marginLeft: "auto", whiteSpace: "nowrap", color: "#6e7f76" }}>Total visitors —</span>
    </section>
  )
}
