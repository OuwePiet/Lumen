"use client"

import { useEffect, useMemo, useState } from "react"

const cities = [
  "Tokyo",
  "New York",
  "Lagos",
  "São Paulo",
  "Seoul",
  "Mumbai",
  "Sydney",
  "Paris",
  "Mexico City",
  "Cape Town",
  "Amsterdam",
  "Singapore",
] as const

function hourSlot(date: Date) {
  return Math.floor(date.getTime() / 3_600_000)
}

export default function ViaFeatured() {
  const [slot, setSlot] = useState(() => hourSlot(new Date()))

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlot((current) => {
        const next = hourSlot(new Date())
        return next === current ? current : next
      })
    }, 60_000)

    return () => window.clearInterval(timer)
  }, [])

  const selected = useMemo(
    () => [0, 3, 6, 9].map((offset) => cities[(slot + offset) % cities.length]),
    [slot],
  )

  return (
    <section
      aria-labelledby="via-featured-title"
      style={{
        position: "relative",
        zIndex: 2,
        width: "min(1480px, calc(100% - 32px))",
        margin: "26px auto 0",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          marginBottom: "10px",
        }}
      >
        <h2
          id="via-featured-title"
          style={{
            margin: 0,
            color: "#f4f7f5",
            fontSize: "17px",
            fontWeight: 700,
            letterSpacing: ".01em",
          }}
        >
          Featured in VIA
        </h2>
        <span style={{ color: "#829087", fontSize: "11px" }}>
          World city windows refresh once an hour
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: "10px",
        }}
      >
        {selected.slice(0, 2).map((city) => (
          <CityCard key={city} city={city} />
        ))}

        <div
          style={{
            minHeight: "168px",
            display: "grid",
            gridTemplateRows: "1fr 1fr",
            overflow: "hidden",
            border: "1px solid rgba(143,212,169,.2)",
            borderRadius: "16px",
            background: "rgba(3,10,6,.76)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "16px",
              borderBottom: "1px solid rgba(143,212,169,.16)",
            }}
          >
            <span style={{ color: "#8fd4a9", fontSize: "10px", fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" }}>
              Sponsor VIA
            </span>
            <strong style={{ marginTop: "4px", color: "#f2f6f3", fontSize: "14px" }}>
              Sponsored spotlight
            </strong>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "16px",
            }}
          >
            <span style={{ color: "#8fd4a9", fontSize: "10px", fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" }}>
              Best Performer
            </span>
            <strong style={{ marginTop: "4px", color: "#f2f6f3", fontSize: "14px" }}>
              VIA creator recognition
            </strong>
            <span style={{ marginTop: "3px", color: "#b6c0ba", fontSize: "11px" }}>
              Special badge · $0.50 creator bonus
            </span>
          </div>
        </div>

        {selected.slice(2).map((city) => (
          <CityCard key={city} city={city} />
        ))}
      </div>
    </section>
  )
}

function CityCard({ city }: { city: string }) {
  return (
    <article
      style={{
        position: "relative",
        minHeight: "168px",
        overflow: "hidden",
        border: "1px solid rgba(143,212,169,.18)",
        borderRadius: "16px",
        background: "linear-gradient(145deg, rgba(5,14,9,.84), rgba(2,5,4,.92))",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,.015)",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 70% 25%, rgba(143,212,169,.16), transparent 44%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "16px",
        }}
      >
        <span style={{ color: "#8fd4a9", fontSize: "10px", fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" }}>
          World City
        </span>
        <strong style={{ marginTop: "4px", color: "#f2f6f3", fontSize: "17px" }}>{city}</strong>
        <span style={{ marginTop: "3px", color: "#9da8a1", fontSize: "11px" }}>
          Image · creator · art · music · community
        </span>
      </div>
    </article>
  )
}
