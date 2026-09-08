"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"

type Station = {
  id: string
  name: string
  streamUrl: string
  homepage: string
  favicon: string
  tags: string
  country: string
  countryCode: string
  codec: string
  bitrate: number
}

const FAVORITES_KEY = "via:world-radio:favorites:v1"

const styles = {
  form: { display: "flex", flexWrap: "wrap" as const, gap: "10px", margin: "0 0 18px" },
  input: { flex: "1 1 210px", minHeight: "44px", borderRadius: "10px", border: "1px solid #285f40", background: "#050807", color: "#f4f7f5", padding: "10px 12px", fontSize: "16px" },
  button: { minHeight: "44px", borderRadius: "999px", border: "1px solid #285f40", background: "#10261a", color: "#b9ffd4", padding: "9px 14px", fontWeight: 800, cursor: "pointer" },
  status: { color: "#a9b8af", fontSize: "13px", lineHeight: 1.5, margin: "0 0 14px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" },
  card: { background: "#0b120e", border: "1px solid #285f40", borderRadius: "14px", padding: "14px" },
  title: { color: "#f4f7f5", fontSize: "16px", margin: "0 0 6px" },
  meta: { color: "#a9b8af", fontSize: "12px", lineHeight: 1.45, margin: "0 0 10px" },
  actions: { display: "flex", gap: "8px", flexWrap: "wrap" as const },
  player: { margin: "0 0 18px", padding: "16px", border: "1px solid #285f40", borderRadius: "14px", background: "#07100b" },
  audio: { width: "100%", marginTop: "10px" },
}

export default function RadioBrowser() {
  const [country, setCountry] = useState("")
  const [tag, setTag] = useState("")
  const [stations, setStations] = useState<Station[]>([])
  const [selected, setSelected] = useState<Station | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]")
      if (Array.isArray(parsed)) setFavorites(parsed.filter((value) => typeof value === "string"))
    } catch {
      // Favorites are optional local convenience data.
    }
  }, [])

  const favoriteSet = useMemo(() => new Set(favorites), [favorites])

  const search = async (event?: FormEvent) => {
    event?.preventDefault()
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams()
      if (country.trim()) params.set("country", country.trim())
      if (tag.trim()) params.set("tag", tag.trim())
      const response = await fetch(`/api/via/radio?${params.toString()}`, { cache: "no-store" })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error ?? "Radio directory unavailable")
      setStations(Array.isArray(data.stations) ? data.stations : [])
    } catch {
      setStations([])
      setError("World Radio could not load stations right now.")
    } finally {
      setLoading(false)
    }
  }

  const play = (station: Station) => {
    setSelected(station)
    void fetch("/api/via/radio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stationId: station.id }),
    })
  }

  const toggleFavorite = (id: string) => {
    const next = favoriteSet.has(id) ? favorites.filter((value) => value !== id) : [...favorites, id]
    setFavorites(next)
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next))
    } catch {
      // Keep the current session usable if storage is unavailable.
    }
  }

  return (
    <section aria-label="World Radio station discovery">
      <form style={styles.form} onSubmit={search}>
        <input aria-label="Country" placeholder="Country, e.g. Netherlands" value={country} maxLength={60} onChange={(event) => setCountry(event.target.value)} style={styles.input} />
        <input aria-label="Genre or tag" placeholder="Genre/tag, e.g. jazz" value={tag} maxLength={60} onChange={(event) => setTag(event.target.value)} style={styles.input} />
        <button type="submit" style={styles.button} disabled={loading}>{loading ? "Searching…" : "Find stations"}</button>
      </form>

      {selected ? (
        <div style={styles.player}>
          <strong>Now selected: {selected.name}</strong>
          <p style={styles.status}>{selected.country || "Unknown country"} · {selected.codec || "stream"}{selected.bitrate ? ` · ${selected.bitrate} kbps` : ""}</p>
          <audio controls preload="none" src={selected.streamUrl} style={styles.audio}>Your browser does not support audio playback.</audio>
        </div>
      ) : null}

      {error ? <p role="alert" style={styles.status}>{error}</p> : null}
      {!error ? <p style={styles.status}>Streams come directly from the station. VIA does not host or proxy the audio.</p> : null}

      <div style={styles.grid}>
        {stations.map((station) => (
          <article key={station.id} style={styles.card}>
            <h2 style={styles.title}>{station.name}</h2>
            <p style={styles.meta}>{station.country || "Unknown country"}{station.tags ? ` · ${station.tags}` : ""}</p>
            <div style={styles.actions}>
              <button type="button" style={styles.button} onClick={() => play(station)}>Play</button>
              <button type="button" style={styles.button} aria-pressed={favoriteSet.has(station.id)} onClick={() => toggleFavorite(station.id)}>{favoriteSet.has(station.id) ? "★ Favorite" : "☆ Favorite"}</button>
              {station.homepage ? <a href={station.homepage} target="_blank" rel="noreferrer" style={{ ...styles.button, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Station site</a> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
