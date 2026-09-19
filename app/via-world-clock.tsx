"use client"

import { useEffect, useMemo, useState } from "react"
import { fetchViaRates, isViaRateStale, VIA_RATE_REFRESH_MS, type ViaRates } from "./via-live-rates"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "./via-local-settings"

const zones = [
  { label: "New York", timeZone: "America/New_York" },
  { label: "London", timeZone: "Europe/London" },
  { label: "Amsterdam", timeZone: "Europe/Amsterdam" },
  { label: "Tokyo", timeZone: "Asia/Tokyo" },
  { label: "Los Angeles", timeZone: "America/Los_Angeles" },
] as const

const localeByLanguage: Record<ViaLanguage, string> = {
  Dutch: "nl-NL",
  English: "en-GB",
  French: "fr-FR",
  Spanish: "es-ES",
  Chinese: "zh-CN",
}

const labels: Record<ViaLanguage, { clock: string; date: string; source: string },
  Hindi: { clock: string; date: string; source: string }> = {
  Dutch: { clock: "Wereldklok", date: "Datum", source: "Aardvisualisatie van NASA Scientific Visualization Studio" },
  English: { clock: "World Clock", date: "Date", source: "Earth visualization by NASA Scientific Visualization Studio" },
  French: { clock: "Horloge mondiale", date: "Date", source: "Visualisation de la Terre par NASA Scientific Visualization Studio" },
  Spanish: { clock: "Reloj mundial", date: "Fecha", source: "Visualización de la Tierra por NASA Scientific Visualization Studio" },
  Chinese: { clock: "世界时钟", date: "日期", source: "地球可视化来源：NASA Scientific Visualization Studio" },
}

function formatTime(date: Date, timeZone: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)
}

function formatLocalDate(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
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
  const [language, setLanguage] = useState<ViaLanguage>("English")

  useEffect(() => {
    const sync = () => setLanguage(readViaLocalSettings().interfaceLanguage)
    sync()
    window.addEventListener(VIA_SETTINGS_EVENT, sync)
    return () => window.removeEventListener(VIA_SETTINGS_EVENT, sync)
  }, [])

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

  const locale = localeByLanguage[language]
  const t = labels[language]
  const clocks = useMemo(() => zones.map((zone) => ({ ...zone, time: formatTime(now, zone.timeZone, locale) })), [now, locale])
  const localDate = useMemo(() => formatLocalDate(now, locale), [now, locale])
  const stale = rates ? isViaRateStale(rates.checkedAt, now.getTime()) : false
  const usd = rates?.rates && !stale && !rateUnavailable ? rates.rates.USD : null

  const frame = { left: "250px", right: "330px" } as const

  return (
    <>
      <section
        aria-label="World clock, local date and live DESO price"
        className="via-home-world-clock"
        style={{
          position: "absolute",
          zIndex: 3,
          ...frame,
          bottom: "58px",
          minHeight: "42px",
          padding: "9px 12px",
          border: "1px solid rgba(79,116,98,.15)",
          borderRadius: "999px",
          background: "rgba(2,7,4,.50)",
          backdropFilter: "blur(8px)",
          display: "flex",
          flexWrap: "nowrap",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px 10px",
          overflowX: "auto",
          color: "#93a097",
          fontSize: "9.5px",
          letterSpacing: ".005em",
          scrollbarWidth: "none",
        }}
      >
        <span style={{ color: "#8fd4a9", fontWeight: 750, letterSpacing: ".08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{t.clock}</span>
        <span style={{ whiteSpace: "nowrap" }} title={t.date}>
          <span style={{ color: "#69776f" }}>{t.date}</span>{" "}
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
            {usd === null ? "—" : `$${usd.toLocaleString(locale, { maximumFractionDigits: 4 })}`}
          </strong>
        </span>
      </section>

      <div
        className="via-home-nasa-source"
        style={{
          position: "absolute",
          zIndex: 3,
          ...frame,
          bottom: "27px",
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <a
          href="https://svs.gsfc.nasa.gov/"
          target="_blank"
          rel="noreferrer"
          aria-label={t.source}
          className="via-home-nasa-source-link"
          style={{
            pointerEvents: "auto",
            minHeight: "22px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "3px 10px",
            border: "1px solid rgba(143,212,169,.13)",
            borderRadius: "999px",
            background: "rgba(2,7,4,.46)",
            color: "#75837b",
            fontSize: "8.5px",
            letterSpacing: ".02em",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          <span aria-hidden="true" style={{ width: "15px", height: "15px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(143,212,169,.28)", borderRadius: "50%", color: "#8fd4a9", fontSize: "9px" }}>◎</span>
          <strong style={{ color: "#8fa89a", fontWeight: 750 }}>NASA SVS</strong>
          <span>·</span>
          <span>{t.source}</span>
        </a>
      </div>
      <style>{`
        @media (max-width: 720px) {
          .via-home-world-clock {
            position: relative !important;
            left: auto !important;
            right: auto !important;
            bottom: auto !important;
            margin: 10px !important;
            border-radius: 18px !important;
            justify-content: flex-start !important;
          }
          .via-home-nasa-source {
            position: relative !important;
            left: auto !important;
            right: auto !important;
            bottom: auto !important;
            margin: 0 10px 84px !important;
          }
          .via-home-nasa-source-link {
            max-width: 100% !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
        }
      `}</style>
    </>
  )
}
