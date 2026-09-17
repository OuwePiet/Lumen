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
  const [sponsorOpen, setSponsorOpen] = useState(false)
  const [saved, setSaved] = useState(false)

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

  function saveSponsorDraft(form: HTMLFormElement) {
    const data = new FormData(form)
    const payload = {
      name: String(data.get("name") ?? ""),
      contact: String(data.get("contact") ?? ""),
      title: String(data.get("title") ?? ""),
      url: String(data.get("url") ?? ""),
      motion: String(data.get("motion") ?? "static"),
      materialName: (data.get("material") as File | null)?.name ?? "",
      savedAt: new Date().toISOString(),
    }
    window.localStorage.setItem("via:sponsor:draft:v1", JSON.stringify(payload))
    setSaved(true)
  }

  return (
    <>
      <section
        aria-labelledby="via-featured-title"
        style={{
          position: "absolute",
          zIndex: 3,
          top: "24px",
          right: "16px",
          bottom: "92px",
          width: "306px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
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
            minHeight: "150px",
            display: "grid",
            gridTemplateRows: "1.2fr 1fr",
            overflow: "hidden",
            border: "1px solid rgba(143,212,169,.17)",
            borderRadius: "15px",
            background: "rgba(3,10,6,.72)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "4px", padding: "13px 15px", borderBottom: "1px solid rgba(143,212,169,.12)" }}>
            <span style={eyebrow}>Sponsor VIA</span>
            <strong style={middleTitle}>Sponsored spotlight</strong>
            <span style={middleSub}>Commercial placement · paid after approval</span>
            <button type="button" onClick={() => { setSaved(false); setSponsorOpen(true) }} style={sponsorButton}>Sponsor VIA</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "13px 15px" }}>
            <span style={eyebrow}>Best Performer</span>
            <strong style={middleTitle}>VIA creator recognition</strong>
            <span style={middleSub}>Special badge</span>
          </div>
        </div>

        {items.slice(2).map((item) => <CityCard key={`${item.city}-${item.country}`} item={item} />)}
      </section>

      {sponsorOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Sponsor VIA"
          style={{ position: "fixed", inset: 0, zIndex: 120, display: "grid", placeItems: "center", padding: "20px", background: "rgba(0,0,0,.74)", backdropFilter: "blur(8px)" }}
          onMouseDown={(event) => { if (event.currentTarget === event.target) setSponsorOpen(false) }}
        >
          <form
            onSubmit={(event) => { event.preventDefault(); saveSponsorDraft(event.currentTarget) }}
            style={{ width: "min(560px, 100%)", border: "1px solid rgba(143,212,169,.28)", borderRadius: "18px", padding: "22px", background: "#06100b", boxShadow: "0 24px 80px rgba(0,0,0,.55)" }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
              <div>
                <span style={eyebrow}>Sponsor VIA</span>
                <h3 style={{ margin: "5px 0 0", color: "#edf4ef", fontSize: "22px" }}>Aanvraag voor sponsorplaatsing</h3>
                <p style={{ margin: "7px 0 0", color: "#92a097", fontSize: "12px", lineHeight: 1.55 }}>Vul de plaatsing in, kies stilstaand of zeer langzaam bewegend materiaal en selecteer het bestand. Betaling volgt pas nadat VIA de uitvoering en prijs heeft bevestigd.</p>
              </div>
              <button type="button" onClick={() => setSponsorOpen(false)} aria-label="Close sponsor window" style={{ border: 0, background: "transparent", color: "#9eaaa2", fontSize: "22px", cursor: "pointer" }}>×</button>
            </div>

            <div style={{ display: "grid", gap: "10px", marginTop: "18px" }}>
              <input name="name" required placeholder="Naam / organisatie" style={fieldStyle} />
              <input name="contact" required placeholder="E-mail of contact" style={fieldStyle} />
              <input name="title" required placeholder="Titel van de sponsorplaatsing" style={fieldStyle} />
              <input name="url" type="url" placeholder="Bestemmingslink (https://…)" style={fieldStyle} />
              <label style={labelStyle}>Materiaal<input name="material" type="file" accept="image/*,video/*" style={{ marginTop: "7px", width: "100%", color: "#b6c2bb" }} /></label>
              <label style={labelStyle}>Weergave<select name="motion" defaultValue="static" style={{ ...fieldStyle, width: "100%", marginTop: "7px" }}><option value="static">Stilstaand</option><option value="slow">Zeer langzaam bewegen</option></select></label>
            </div>

            <div style={{ marginTop: "16px", padding: "11px 12px", border: "1px solid rgba(143,212,169,.16)", borderRadius: "12px", color: "#92a097", fontSize: "11px", lineHeight: 1.5 }}>
              Betaling: na goedkeuring van uitvoering en prijs. De checkout wordt pas geactiveerd zodra VIA een echte betaalprovider heeft gekoppeld.
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "9px", marginTop: "16px" }}>
              <button type="submit" style={{ ...sponsorButton, minHeight: "40px", paddingInline: "18px" }}>{saved ? "Concept opgeslagen" : "Concept opslaan"}</button>
              <a href="/payment-info" style={{ ...sponsorButton, minHeight: "40px", paddingInline: "18px", textDecoration: "none", background: "rgba(3,12,7,.72)" }}>Betaalinformatie</a>
            </div>
          </form>
        </div>
      ) : null}
    </>
  )
}

const eyebrow = {
  color: "#8fd4a9",
  fontSize: "8px",
  fontWeight: 800,
  letterSpacing: ".14em",
  textTransform: "uppercase" as const,
}

const middleTitle = { marginTop: "2px", color: "#edf3ef", fontSize: "12px" }
const middleSub = { marginTop: "1px", color: "#8f9c94", fontSize: "9px" }
const sponsorButton = { marginTop: "6px", alignSelf: "flex-start", minHeight: "30px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(143,212,169,.36)", borderRadius: "999px", padding: "6px 11px", background: "rgba(18,53,34,.58)", color: "#aef0c5", fontSize: "9px", fontWeight: 750, cursor: "pointer" } as const
const fieldStyle = { minHeight: "42px", border: "1px solid rgba(143,212,169,.18)", borderRadius: "11px", padding: "9px 11px", background: "rgba(0,0,0,.24)", color: "#e2ebe5", outline: "none" } as const
const labelStyle = { color: "#a7b4ac", fontSize: "11px" } as const

function CityCard({ item }: { item: CityItem }) {
  const content = (
    <article
      style={{
        position: "relative",
        minHeight: "124px",
        overflow: "hidden",
        border: "1px solid rgba(143,212,169,.14)",
        borderRadius: "15px",
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
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "12px 13px" }}>
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
