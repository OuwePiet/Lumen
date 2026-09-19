"use client"

import { FormEvent, useEffect, useMemo, useRef, useState } from "react"

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
const GLOBAL_STATION_KEY = "via:world-radio:station"
const GLOBAL_STATION_EVENT = "via:world-radio:station"
const GLOBAL_PLAY_EVENT = "via:world-radio:play"

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
  const [stationName, setStationName] = useState("")
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [favorites, setFavorites] = useState<string[]>([])
  const [favoriteStations, setFavoriteStations] = useState<Station[]>([])
  const [showFavorites, setShowFavorites] = useState(false)
  const searchController = useRef<AbortController | null>(null)

  const loadStations = async (nextCountry: string, nextStationName: string) => {
    searchController.current?.abort()
    const controller = new AbortController()
    searchController.current = controller
    setLoading(true)
    setError("")
    setShowFavorites(false)
    try {
      const params = new URLSearchParams()
      if (nextCountry.trim()) params.set("country", nextCountry.trim())
      if (nextStationName.trim()) params.set("name", nextStationName.trim())
      const response = await fetch(`/api/via/radio?${params.toString()}`, { cache: "no-store", signal: controller.signal })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error ?? "Radio directory unavailable")
      setStations(Array.isArray(data.stations) ? data.stations : [])
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setStations([])
        setError("World Radio could not load stations right now.")
      }
    } finally {
      if (searchController.current === controller) {
        searchController.current = null
        setLoading(false)
      }
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
    return () => searchController.current?.abort()
  }, [])

  const favoriteSet = useMemo(() => new Set(favorites), [favorites])
  const visibleStations = showFavorites ? favoriteStations.filter((station) => favoriteSet.has(station.id)) : stations

  const search = async (event?: FormEvent) => {
    event?.preventDefault()
    await loadStations(country, stationName)
  }

  const play = (station: Station) => {
    try {
      localStorage.setItem(GLOBAL_STATION_KEY, JSON.stringify({ name: station.name, streamUrl: station.streamUrl }))
      window.dispatchEvent(new Event(GLOBAL_STATION_EVENT))
      window.dispatchEvent(new Event(GLOBAL_PLAY_EVENT))
    } catch {
      // Global playback can still be selected again if local storage is unavailable.
    }
    void fetch("/api/via/radio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stationId: station.id }),
    }).catch(() => undefined)
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
        <input aria-label="Station name" placeholder="Station, e.g. Radio 538" value={stationName} maxLength={60} onChange={(event) => setStationName(event.target.value)} style={styles.input} />
        <button type="submit" style={styles.button} disabled={loading}>{loading ? "Searching…" : "Find stations"}</button>
        <button type="button" style={styles.button} aria-pressed={showFavorites} onClick={() => setShowFavorites((value) => !value)}>{showFavorites ? "Show search" : `Favorites (${favorites.length})`}</button>
      </form>

      {error ? <p role="alert" style={styles.status}>{error}</p> : null}
      {!error ? <p style={styles.status}>Streams come directly from the station. VIA does not host or proxy the audio. Choose Play here, then use the global World Radio control to turn the station on or off while navigating VIA.</p> : null}
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
