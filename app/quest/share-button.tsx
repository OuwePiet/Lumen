"use client"

import { useState } from "react"

type Props = { game: string; path?: string }

export default function ShareButton({ game, path = "/quest" }: Props) {
  const [status, setStatus] = useState("")
  const url = `https://viadeso.online${path}`
  const text = `I played ${game} on VIA — viadeso.online`

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: `${game} · VIA`, text, url })
        setStatus("Shared")
        return
      }
      await navigator.clipboard.writeText(`${text} ${url}`)
      setStatus("Link copied")
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return
      setStatus("Sharing unavailable")
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
