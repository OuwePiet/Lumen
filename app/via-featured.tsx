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
        position: "absolute",
        zIndex: 3,
        top: "28px",
        right: "16px",
        bottom: "92px",
        width: "286px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        overflowY: "auto",
      }}
    >
      <h2
        id="via-featured-title"
        style={{ margin: "0 0 2px", color: "#dce5df", fontSize: "14px", fontWeight: 700, letterSpacing: ".01em" }}
      >
        Featured in VIA
      </h2>

      {items.slice(0, 2).map((item) => <CityCard key={`${item.city}-${item.country}`} item={item} />)}

      <div
        style={{
          minHeight: "126px",
          display: "grid",
          gridTemplateRows: "1fr 1fr",
          overflow: "hidden",
          border: "1px solid rgba(143,212,169,.17)",
          borderRadius: "14px",
          background: "rgba(3,10,6,.70)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "11px 13px", borderBottom: "1px solid rgba(143,212,169,.12)" }}>
          <span style={eyebrow}>Sponsor VIA</span>
          <strong style={middleTitle}>Sponsored spotlight</strong>
          <span style={middleSub}>Commercial space</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "11px 13px" }}>
          <span style={eyebrow}>Best Performer</span>
          <strong style={middleTitle}>VIA creator recognition</strong>
          <span style={middleSub}>Special badge</span>
        </div>
      </div>

      {items.slice(2).map((item) => <CityCard key={`${item.city}-${item.country}`} item={item} />)}
    </section>
  )
}

const eyebrow = {
  color: "#8fd4a9",
  fontSize: "8px",
  fontWeight: 800,
  letterSpacing: ".14em",
  textTransform: "uppercase" as const,
}

const middleTitle = { marginTop: "3px", color: "#edf3ef", fontSize: "12px" }
const middleSub = { marginTop: "2px", color: "#8f9c94", fontSize: "9px" }

function CityCard({ item }: { item: CityItem }) {
  const content = (
    <article
      style={{
        position: "relative",
        minHeight: "116px",
        overflow: "hidden",
        border: "1px solid rgba(143,212,169,.14)",
        borderRadius: "14px",
        background: "linear-gradient(145deg, rgba(5,14,9,.78), rgba(2,5,4,.9))",
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
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: item.imageUrl ? "linear-gradient(to top, rgba(0,0,0,.82), rgba(0,0,0,.03) 64%)" : "radial-gradient(circle at 70% 25%, rgba(143,212,169,.12), transparent 44%)" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "11px 12px" }}>
        <span style={eyebrow}>{item.seasonal ? "Christmas City" : "World City"}</span>
        <strong style={{ marginTop: "3px", color: "#f0f4f1", fontSize: "14px" }}>{item.city}</strong>
        <span style={{ marginTop: "1px", color: "#b7c1bb", fontSize: "9px" }}>{item.country}</span>
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
