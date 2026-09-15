"use client"

import { useEffect, useState } from "react"

type CityItem = {
  city: string
  country: string
  imageUrl: string | null
  descriptionUrl: string | null
  title: string | null
  artist: string | null
  license: string | null
  seasonal: boolean
}

type CityResponse = {
  month?: string
  source?: string
  items?: CityItem[]
}

const fallbackCities: CityItem[] = [
  { city: "Tokyo", country: "Japan", imageUrl: null, descriptionUrl: null, title: null, artist: null, license: null, seasonal: false },
  { city: "Lagos", country: "Nigeria", imageUrl: null, descriptionUrl: null, title: null, artist: null, license: null, seasonal: false },
  { city: "São Paulo", country: "Brazil", imageUrl: null, descriptionUrl: null, title: null, artist: null, license: null, seasonal: false },
  { city: "Sydney", country: "Australia", imageUrl: null, descriptionUrl: null, title: null, artist: null, license: null, seasonal: false },
]

export default function ViaFeatured() {
  const [items, setItems] = useState<CityItem[]>(fallbackCities)

  useEffect(() => {
    const controller = new AbortController()
    void fetch("/api/via/featured-cities", {
      cache: "no-store",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then(async (response) => response.ok ? (await response.json()) as CityResponse : null)
      .then((data) => {
        if (Array.isArray(data?.items) && data.items.length === 4) setItems(data.items)
      })
      .catch(() => undefined)
    return () => controller.abort()
  }, [])

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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", marginBottom: "10px" }}>
        <h2 id="via-featured-title" style={{ margin: 0, color: "#f4f7f5", fontSize: "17px", fontWeight: 700, letterSpacing: ".01em" }}>
          Featured in VIA
        </h2>
        <span style={{ color: "#829087", fontSize: "11px" }}>
          World city images refresh monthly · December uses Christmas city imagery
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: "10px" }}>
        {items.slice(0, 2).map((item) => <CityCard key={`${item.city}-${item.country}`} item={item} />)}

        <div
          style={{
            minHeight: "190px",
            display: "grid",
            gridTemplateRows: "1fr 1fr",
            overflow: "hidden",
            border: "1px solid rgba(143,212,169,.2)",
            borderRadius: "16px",
            background: "rgba(3,10,6,.76)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "16px", borderBottom: "1px solid rgba(143,212,169,.16)" }}>
            <span style={eyebrow}>Sponsor VIA</span>
            <strong style={middleTitle}>Sponsored spotlight</strong>
            <span style={middleSub}>Clearly marked commercial space</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "16px" }}>
            <span style={eyebrow}>Best Performer</span>
            <strong style={middleTitle}>VIA creator recognition</strong>
            <span style={middleSub}>Special badge · $0.50 creator bonus</span>
          </div>
        </div>

        {items.slice(2).map((item) => <CityCard key={`${item.city}-${item.country}`} item={item} />)}
      </div>
    </section>
  )
}

const eyebrow = {
  color: "#8fd4a9",
  fontSize: "10px",
  fontWeight: 800,
  letterSpacing: ".14em",
  textTransform: "uppercase" as const,
}

const middleTitle = { marginTop: "4px", color: "#f2f6f3", fontSize: "14px" }
const middleSub = { marginTop: "3px", color: "#b6c0ba", fontSize: "11px" }

function CityCard({ item }: { item: CityItem }) {
  const content = (
    <article
      style={{
        position: "relative",
        minHeight: "190px",
        overflow: "hidden",
        border: "1px solid rgba(143,212,169,.18)",
        borderRadius: "16px",
        background: "linear-gradient(145deg, rgba(5,14,9,.84), rgba(2,5,4,.92))",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,.015)",
      }}
    >
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={`${item.city}, ${item.country}`}
          loading="lazy"
          referrerPolicy="no-referrer"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : null}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: item.imageUrl ? "linear-gradient(to top, rgba(0,0,0,.86), rgba(0,0,0,.08) 64%)" : "radial-gradient(circle at 70% 25%, rgba(143,212,169,.16), transparent 44%)" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "16px" }}>
        <span style={eyebrow}>{item.seasonal ? "Christmas World City" : "World City"}</span>
        <strong style={{ marginTop: "4px", color: "#f2f6f3", fontSize: "17px" }}>{item.city}</strong>
        <span style={{ marginTop: "2px", color: "#c4cec8", fontSize: "11px" }}>{item.country}</span>
        <span style={{ marginTop: "4px", color: "#9da8a1", fontSize: "10px" }}>
          {item.license ? `Wikimedia Commons · ${item.license}` : "VIA world window"}
        </span>
      </div>
    </article>
  )

  if (!item.descriptionUrl) return content

  return (
    <a href={item.descriptionUrl} target="_blank" rel="noreferrer" aria-label={`View image source for ${item.city}`} style={{ color: "inherit", textDecoration: "none" }}>
      {content}
    </a>
  )
}
