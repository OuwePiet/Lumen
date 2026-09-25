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

  if (pathname === "/radio" || pathname === "/messages") {
    return <audio ref={audio} onPause={()=>setPlaying(false)} onPlay={()=>setPlaying(true)} />
  }

  return <aside aria-label={copy.radio} className={`via-global-radio ${pathname === "/" ? "via-global-radio-home" : pathname === "/notifications" ? "via-global-radio-notifications" : pathname === "/radio" ? "via-global-radio-radio-page" : pathname === "/messages" ? "via-global-radio-messages" : pathname === "/profile" ? "via-global-radio-profile" : ""} fixed bottom-3 right-3 z-[80] flex max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-full border border-[#285f40] bg-[#07100b]/95 px-3 py-2 text-xs shadow-xl backdrop-blur`}>
    <audio ref={audio} onPause={()=>setPlaying(false)} onPlay={()=>setPlaying(true)} />
    <Link href="/radio" className="via-global-radio-label max-w-40 truncate text-[#b8ddc5]">{station ? station.name : copy.radio}</Link>
    <button type="button" disabled={!station} aria-pressed={playing} aria-label={station ? `${playing ? copy.turnOff : copy.turnOn}: ${station.name}` : copy.chooseAria} onClick={toggle} className="via-global-radio-button min-h-9 rounded-full border border-[#8fd4a9]/45 px-3 font-semibold text-[#b8ddc5] disabled:opacity-45">{station ? (playing ? copy.off : copy.on) : copy.choose}</button>
    <style>{`
      @media (max-width: 720px) {
        .via-global-radio {
          right: 10px !important;
          bottom: calc(env(safe-area-inset-bottom) + 10px) !important;
          max-width: 118px !important;
          gap: 4px !important;
          padding: 5px !important;
          border-radius: 999px !important;
        }
        .via-global-radio-home,\n        .via-global-radio-notifications,\n        .via-global-radio-profile {\n          display: none !important;\n        }
        .via-global-radio-radio-page,
        .via-global-radio-messages {
          top: 66px !important;
          right: 10px !important;
          bottom: auto !important;
          z-index: 190 !important;
        }
        .via-global-radio-label {
          width: 34px !important;
          height: 34px !important;
          display: inline-grid !important;
          place-items: center !important;
          overflow: hidden !important;
          color: transparent !important;
          font-size: 0 !important;
        }
        .via-global-radio-label::after {
          content: "◉";
          color: #b8ddc5;
          font-size: 16px;
          line-height: 1;
        }
        .via-global-radio-button {
          min-height: 34px !important;
          padding: 5px 10px !important;
          font-size: 11px !important;
        }
      }
    `}</style>
  </aside>
}
