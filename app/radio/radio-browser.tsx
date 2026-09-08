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
const FAVORITE_STATIONS_KEY = "via:world-radio:favorite-stations:v1"

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

function validStation(value: unknown): value is Station {
  if (!value || typeof value !== "object") return false
  const station = value as Partial<Station>
  return typeof station.id === "string" && typeof station.name === "string" && typeof station.streamUrl === "string" && station.streamUrl.startsWith("https://")
}

export default function RadioBrowser() {
  const [country, setCountry] = useState("")
  const [tag, setTag] = useState("")
  const [stations, setStations] = useState<Station[]>([])
  const [selected, setSelected] = useState<Station | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [playerError, setPlayerError] = useState("")
  const [favorites, setFavorites] = useState<string[]>([])
  const [favoriteStations, setFavoriteStations] = useState<Station[]>([])
  const [showFavorites, setShowFavorites] = useState(false)

  const loadStations = async (nextCountry: string, nextTag: string) => {
    setLoading(true)
    setError("")
    setShowFavorites(false)
    try {
      const params = new URLSearchParams()
      if (nextCountry.trim()) params.set("country", nextCountry.trim())
      if (nextTag.trim()) params.set("tag", nextTag.trim())
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

  useEffect(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]")
      if (Array.isArray(parsed)) setFavorites(parsed.filter((value) => typeof value === "string"))
      const savedStations = JSON.parse(localStorage.getItem(FAVORITE_STATIONS_KEY) ?? "[]")
      if (Array.isArray(savedStations)) setFavoriteStations(savedStations.filter(validStation))
    } catch {
      // Favorites are optional local convenience data.
    }

    const params = new URLSearchParams(window.location.search)
    const initialCountry = (params.get("country") ?? "").slice(0, 60)
    const initialTag = (params.get("tag") ?? "").slice(0, 60)
    if (initialCountry || initialTag) {
      setCountry(initialCountry)
      setTag(initialTag)
      void loadStations(initialCountry, initialTag)
    }
  }, [])

  const favoriteSet = useMemo(() => new Set(favorites), [favorites])
  const visibleStations = showFavorites ? favoriteStations.filter((station) => favoriteSet.has(station.id)) : stations

  const search = async (event?: FormEvent) => {
    event?.preventDefault()
    await loadStations(country, tag)
  }

  const play = (station: Station) => {
    setPlayerError("")
    setSelected(station)
    void fetch("/api/via/radio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stationId: station.id }),
    }).catch(() => undefined)
  }

  const stop = () => {
    setSelected(null)
    setPlayerError("")
  }

  const toggleFavorite = (station: Station) => {
    const removing = favoriteSet.has(station.id)
    const next = removing ? favorites.filter((value) => value !== station.id) : [...favorites, station.id]
    const nextStations = removing
      ? favoriteStations.filter((value) => value.id !== station.id)
      : [...favoriteStations.filter((value) => value.id !== station.id), station]
    setFavorites(next)
    setFavoriteStations(nextStations)
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next))
      localStorage.setItem(FAVORITE_STATIONS_KEY, JSON.stringify(nextStations))
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
        <button type="button" style={styles.button} aria-pressed={showFavorites} onClick={() => setShowFavorites((value) => !value)}>{showFavorites ? "Show search" : `Favorites (${favorites.length})`}</button>
      </form>

      {selected ? (
        <div style={styles.player}>
          <strong>Now selected: {selected.name}</strong>
          <p style={styles.status}>{selected.country || "Unknown country"} · {selected.codec || "stream"}{selected.bitrate ? ` · ${selected.bitrate} kbps` : ""}</p>
          <audio key={selected.id} controls autoPlay preload="none" src={selected.streamUrl} style={styles.audio} onPlaying={() => setPlayerError("")} onError={() => setPlayerError("This station stream could not be played. Try another station.")}>Your browser does not support audio playback.</audio>
          {playerError ? <p role="alert" style={styles.status}>{playerError}</p> : null}
          <button type="button" style={styles.button} onClick={stop}>Stop / close player</button>
        </div>
      ) : null}

      {error ? <p role="alert" style={styles.status}>{error}</p> : null}
      {!error ? <p style={styles.status}>Streams come directly from the station. VIA does not host or proxy the audio. Playback starts only after you choose Play.</p> : null}
      {showFavorites && visibleStations.length === 0 ? <p style={styles.status}>No saved favorite stations yet.</p> : null}

      <div style={styles.grid}>
        {visibleStations.map((station) => (
          <article key={station.id} style={styles.card}>
            <h2 style={styles.title}>{station.name}</h2>
            <p style={styles.meta}>{station.country || "Unknown country"}{station.tags ? ` · ${station.tags}` : ""}</p>
            <div style={styles.actions}>
              <button type="button" style={styles.button} onClick={() => play(station)}>Play</button>
              <button type="button" style={styles.button} aria-pressed={favoriteSet.has(station.id)} onClick={() => toggleFavorite(station)}>{favoriteSet.has(station.id) ? "★ Favorite" : "☆ Favorite"}</button>
              {station.homepage ? <a href={station.homepage} target="_blank" rel="noreferrer" style={{ ...styles.button, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Station site</a> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
