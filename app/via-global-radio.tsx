"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"

const STORAGE_KEY = "via:world-radio:station"
const EVENT = "via:world-radio:station"
const PLAY_EVENT = "via:world-radio:play"
const PAUSE_EVENT = "via:world-radio:pause"

type Station = { name: string; streamUrl: string }

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
  const audio = useRef<HTMLAudioElement | null>(null)
  const [station, setStation] = useState<Station | null>(null)
  const [playing, setPlaying] = useState(false)

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

  return <aside aria-label="World Radio" className="fixed bottom-3 right-3 z-[80] flex max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-full border border-[#285f40] bg-[#07100b]/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
    <audio ref={audio} onPause={()=>setPlaying(false)} onPlay={()=>setPlaying(true)} />
    <Link href="/radio" className="max-w-40 truncate text-[#b9ffd4]">{station ? station.name : "World Radio"}</Link>
    <button type="button" disabled={!station} aria-pressed={playing} aria-label={station ? `${playing ? "Turn off" : "Turn on"} World Radio: ${station.name}` : "Choose a World Radio station"} onClick={toggle} className="min-h-9 rounded-full border border-[#5cff9d]/45 px-3 font-semibold text-[#b9ffd4] disabled:opacity-45">{station ? (playing ? "Off" : "On") : "Choose"}</button>
  </aside>
}
