"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "./via-local-settings"

const STORAGE_KEY = "via:world-radio:station"
const EVENT = "via:world-radio:station"
const PLAY_EVENT = "via:world-radio:play"
const PAUSE_EVENT = "via:world-radio:pause"

type Station = { name: string; streamUrl: string }
type RadioCopy = { radio: string; choose: string; on: string; off: string; turnOn: string; turnOff: string; chooseAria: string }

const COPY: Record<ViaLanguage | "Hindi", RadioCopy> = {
  Dutch: { radio: "Wereldradio", choose: "Kiezen", on: "Aan", off: "Uit", turnOn: "Wereldradio aanzetten", turnOff: "Wereldradio uitzetten", chooseAria: "Kies een Wereldradio-zender" },
  English: { radio: "World Radio", choose: "Choose", on: "On", off: "Off", turnOn: "Turn on World Radio", turnOff: "Turn off World Radio", chooseAria: "Choose a World Radio station" },
  French: { radio: "Radio mondiale", choose: "Choisir", on: "Marche", off: "Arrêt", turnOn: "Activer la radio mondiale", turnOff: "Désactiver la radio mondiale", chooseAria: "Choisir une station de radio mondiale" },
  Spanish: { radio: "Radio mundial", choose: "Elegir", on: "Encender", off: "Apagar", turnOn: "Encender la radio mundial", turnOff: "Apagar la radio mundial", chooseAria: "Elegir una emisora de radio mundial" },
  Chinese: { radio: "世界电台", choose: "选择", on: "开启", off: "关闭", turnOn: "开启世界电台", turnOff: "关闭世界电台", chooseAria: "选择世界电台" },
  Hindi: { radio: "विश्व रेडियो", choose: "चुनें", on: "चालू", off: "बंद", turnOn: "विश्व रेडियो चालू करें", turnOff: "विश्व रेडियो बंद करें", chooseAria: "विश्व रेडियो स्टेशन चुनें" },
}

function readStation(): Station | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const value = JSON.parse(raw) as Station
    const url = new URL(value.streamUrl)
    return value.name && url.protocol === "https:" ? { name: value.name, streamUrl: url.toString() } : null
  } catch { return null }
}

export default function ViaGlobalRadio() {
  const pathname = usePathname()
  const audio = useRef<HTMLAudioElement | null>(null)
  const [station, setStation] = useState<Station | null>(null)
  const [playing, setPlaying] = useState(false)
  const [language, setLanguage] = useState<ViaLanguage>("English")

  useEffect(() => {
    const syncLanguage = () => setLanguage(readViaLocalSettings().interfaceLanguage)
    syncLanguage()
    window.addEventListener(VIA_SETTINGS_EVENT, syncLanguage)
    window.addEventListener("storage", syncLanguage)
    return () => {
      window.removeEventListener(VIA_SETTINGS_EVENT, syncLanguage)
      window.removeEventListener("storage", syncLanguage)
    }
  }, [])

  useEffect(() => {
    const sync = () => {
      const next = readStation()
      const player = audio.current
      if (player && (!next || player.src !== next.streamUrl)) {
        player.pause()
        player.removeAttribute("src")
        player.load()
        setPlaying(false)
      }
      setStation(next)
    }
    const playSelected = () => {
      const next = readStation()
      setStation(next)
      if (!next) return
      const player = audio.current
      if (!player) return
      if (player.src !== next.streamUrl) player.src = next.streamUrl
      void player.play().catch(() => setPlaying(false))
    }
    sync()
    const pauseSelected = () => audio.current?.pause()
    window.addEventListener(EVENT, sync)
    window.addEventListener(PLAY_EVENT, playSelected)
    window.addEventListener(PAUSE_EVENT, pauseSelected)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener(PLAY_EVENT, playSelected)
      window.removeEventListener(PAUSE_EVENT, pauseSelected)
      window.removeEventListener("storage", sync)
      const player = audio.current
      if (player) {
        player.pause()
        player.removeAttribute("src")
        player.load()
      }
    }
  }, [])

  useEffect(() => {
    if (!audio.current || !station) return
    if (audio.current.src !== station.streamUrl) audio.current.src = station.streamUrl
  }, [station])

  async function toggle() {
    if (!station) return
    const player = audio.current
    if (!player) return
    if (player.paused) { try { await player.play(); setPlaying(true) } catch { setPlaying(false) } }
    else { player.pause(); setPlaying(false) }
  }

  const copy = COPY[language]

  return (
    <>
      <audio ref={audio} onPause={() => setPlaying(false)} onPlay={() => setPlaying(true)} />
      {station && pathname !== "/messages" ? (
        <aside aria-label={copy.radio} style={{ position: "fixed", bottom: 12, left: 12, right: 12, zIndex: 45, maxWidth: 460, margin: "0 auto", padding: "10px 12px", border: "1px solid #285f40", borderRadius: 14, background: "#07100b", color: "#f4f7f5", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 4px 24px #0009" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12, color: "#b9ffd4" }}>{copy.radio}</div>
            <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 14, fontWeight: 700 }} title={station.name}>{station.name}</div>
          </div>
          <button type="button" onClick={() => void toggle()} aria-label={playing ? copy.turnOff : copy.turnOn} aria-pressed={playing} style={{ minHeight: 44, minWidth: 58, padding: "8px 12px", borderRadius: 22, border: "1px solid #285f40", background: "#10261a", color: "#b9ffd4", fontWeight: 700 }}>{playing ? copy.off : copy.on}</button>
          <Link href="/radio" aria-label={copy.chooseAria} style={{ color: "#b9ffd4", fontSize: 13, padding: 8 }}>{copy.choose}</Link>
        </aside>
      ) : null}
    </>
  )
}
