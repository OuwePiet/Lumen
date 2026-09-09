"use client"

import { useEffect, useMemo, useState } from "react"

const zones = [
  { label: "Amsterdam", timeZone: "Europe/Amsterdam" },
  { label: "New York", timeZone: "America/New_York" },
  { label: "Los Angeles", timeZone: "America/Los_Angeles" },
  { label: "Tokyo", timeZone: "Asia/Tokyo" },
]

function formatTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)
}

export default function ViaWorldClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  const clocks = useMemo(
    () => zones.map((zone) => ({ ...zone, time: formatTime(now, zone.timeZone) })),
    [now]
  )

  return (
    <section
      aria-label="World clock"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px 14px",
        alignItems: "center",
        borderTop: "1px solid rgba(79, 116, 98, 0.18)",
        color: "#9aa8a0",
        fontSize: "11px",
        letterSpacing: "0.02em",
        margin: "10px auto 0",
        maxWidth: "1180px",
        padding: "10px 20px 0",
        position: "relative",
        zIndex: 2,
      }}
    >
      {clocks.map((clock) => (
        <span key={clock.timeZone} style={{ whiteSpace: "nowrap" }}>
          <span style={{ color: "#6e7f76" }}>{clock.label}</span>{" "}
          <strong style={{ color: "#c8d1cc", fontWeight: 600 }}>{clock.time}</strong>
        </span>
      ))}
      <span
        title="Visitor total will appear only when a reliable aggregate counter is connected."
        style={{ marginLeft: "auto", whiteSpace: "nowrap", color: "#6e7f76" }}
      >
        Total visitors —
      </span>
    </section>
  )
}
