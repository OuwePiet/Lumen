"use client"

import { useEffect, useRef, useState } from "react"

type Props = { game: string; path?: string }

export default function ShareButton({ game, path = "/quest" }: Props) {
  const [status, setStatus] = useState("")
  const statusTimer = useRef<number | null>(null)
  const url = `https://viadeso.online${path}`
  const text = `I played ${game} on VIA — viadeso.online`

  useEffect(() => () => {
    if (statusTimer.current !== null) window.clearTimeout(statusTimer.current)
  }, [])

  function showStatus(next: string) {
    setStatus(next)
    if (statusTimer.current !== null) window.clearTimeout(statusTimer.current)
    statusTimer.current = window.setTimeout(() => {
      statusTimer.current = null
      setStatus("")
    }, 2200)
  }

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: `${game} · VIA`, text, url })
        showStatus("Shared")
        return
      }
      await navigator.clipboard.writeText(`${text} ${url}`)
      showStatus("Link copied")
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return
      showStatus("Sharing unavailable")
    }
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <button type="button" onClick={share} style={{ minHeight: 44, border: "1px solid #3d8058", borderRadius: 999, background: "#10261a", color: "#c9ffdc", padding: "10px 16px", fontWeight: 800, cursor: "pointer" }} aria-label={`Share ${game} from VIA`}>
        Share VIA
      </button>
      <small style={{ color: "#82958a" }}>viadeso.online{status ? ` · ${status}` : ""}</small>
    </span>
  )
}
