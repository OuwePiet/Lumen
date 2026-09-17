"use client"

import { useEffect, useMemo, useState } from "react"
import { fetchViaRates, isViaRateStale, VIA_RATE_REFRESH_MS, type ViaRates } from "./via-live-rates"

const zones = [
  { label: "New York", timeZone: "America/New_York" },
  { label: "London", timeZone: "Europe/London" },
  { label: "Amsterdam", timeZone: "Europe/Amsterdam" },
  { label: "Tokyo", timeZone: "Asia/Tokyo" },
  { label: "Los Angeles", timeZone: "America/Los_Angeles" },
] as const

function formatTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)
}

function formatLocalDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
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
        if (active) {
          setRates(next)
          setRateUnavailable(false)
        }
      } catch (error) {
        if (active && !(error instanceof DOMException && error.name === "AbortError")) setRateUnavailable(true)
      }
    }

    void refresh()
    const timer = window.setInterval(refresh, VIA_RATE_REFRESH_MS)
    return () => {
      active = false
      controller?.abort()
      window.clearInterval(timer)
    }
  }, [])

  const clocks = useMemo(() => zones.map((zone) => ({ ...zone, time: formatTime(now, zone.timeZone) })), [now])
  const localDate = useMemo(() => formatLocalDate(now), [now])
  const stale = rates ? isViaRateStale(rates.checkedAt, now.getTime()) : false
  const usd = rates?.rates && !stale && !rateUnavailable ? rates.rates.USD : null

  return (
    <section
      aria-label="World clock, local date and live DESO price"
      style={{
        position: "absolute",
        zIndex: 3,
        left: "286px",
        right: "318px",
        bottom: "56px",
        minHeight: "42px",
        padding: "9px 14px",
        border: "1px solid rgba(79,116,98,.15)",
        borderRadius: "999px",
        background: "rgba(2,7,4,.50)",
        backdropFilter: "blur(8px)",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: "7px 13px",
        color: "#93a097",
        fontSize: "10px",
        letterSpacing: ".01em",
      }}
    >
      <span style={{ color: "#8fd4a9", fontWeight: 750, letterSpacing: ".09em", textTransform: "uppercase", whiteSpace: "nowrap" }}>World Clock</span>

      <span style={{ whiteSpace: "nowrap" }} title="Date on this device">
        <span style={{ color: "#69776f" }}>Date</span>{" "}
        <strong style={{ color: "#c2cbc6", fontWeight: 600 }}>{localDate}</strong>
      </span>

      {clocks.map((clock) => (
        <span key={clock.timeZone} style={{ whiteSpace: "nowrap" }}>
          <span style={{ color: "#69776f" }}>{clock.label}</span>{" "}
          <strong style={{ color: "#c2cbc6", fontWeight: 600 }}>{clock.time}</strong>
        </span>
      ))}

      <span style={{ whiteSpace: "nowrap" }} title={stale ? "DESO rate is stale" : rateUnavailable ? "DESO rate is temporarily unavailable" : "Current DESO reference price in USD"}>
        <span style={{ color: "#69776f" }}>$DESO</span>{" "}
        <strong style={{ color: usd === null ? "#7f8b85" : "#9adbb2", fontWeight: 700 }}>
          {usd === null ? "—" : `$${usd.toLocaleString(undefined, { maximumFractionDigits: 4 })}`}
        </strong>
      </span>
    </section>
  )
}
