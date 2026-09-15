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
        margin: "82px auto 0",
      }}
    >
      <h2
        id="via-featured-title"
        style={{ margin: "0 0 10px", color: "#e8eee9", fontSize: "16px", fontWeight: 700, letterSpacing: ".01em" }}
      >
        Featured in VIA
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: "10px" }}>
        {items.slice(0, 2).map((item) => <CityCard key={`${item.city}-${item.country}`} item={item} />)}

        <div
          style={{
            minHeight: "178px",
            display: "grid",
            gridTemplateRows: "1fr 1fr",
            overflow: "hidden",
            border: "1px solid rgba(143,212,169,.17)",
            borderRadius: "15px",
            background: "rgba(3,10,6,.68)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "15px", borderBottom: "1px solid rgba(143,212,169,.13)" }}>
            <span style={eyebrow}>Sponsor VIA</span>
            <strong style={middleTitle}>Sponsored spotlight</strong>
            <span style={middleSub}>Commercial space</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "15px" }}>
            <span style={eyebrow}>Best Performer</span>
            <strong style={middleTitle}>VIA creator recognition</strong>
            <span style={middleSub}>Special badge · $0.50 bonus</span>
          </div>
        </div>

        {items.slice(2).map((item) => <CityCard key={`${item.city}-${item.country}`} item={item} />)}
      </div>
    </section>
  )
}

const eyebrow = {
  color: "#8fd4a9",
  fontSize: "9px",
  fontWeight: 800,
  letterSpacing: ".14em",
  textTransform: "uppercase" as const,
}

const middleTitle = { marginTop: "4px", color: "#edf3ef", fontSize: "13px" }
const middleSub = { marginTop: "3px", color: "#9da9a2", fontSize: "10px" }

function CityCard({ item }: { item: CityItem }) {
  const content = (
    <article
      style={{
        position: "relative",
        minHeight: "178px",
        overflow: "hidden",
        border: "1px solid rgba(143,212,169,.15)",
        borderRadius: "15px",
        background: "linear-gradient(145deg, rgba(5,14,9,.8), rgba(2,5,4,.9))",
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
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: item.imageUrl ? "linear-gradient(to top, rgba(0,0,0,.82), rgba(0,0,0,.04) 66%)" : "radial-gradient(circle at 70% 25%, rgba(143,212,169,.13), transparent 44%)" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "14px" }}>
        <span style={eyebrow}>{item.seasonal ? "Christmas City" : "World City"}</span>
        <strong style={{ marginTop: "4px", color: "#f0f4f1", fontSize: "16px" }}>{item.city}</strong>
        <span style={{ marginTop: "2px", color: "#b7c1bb", fontSize: "10px" }}>{item.country}</span>
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
