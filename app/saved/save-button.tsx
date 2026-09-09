"use client"

import { useEffect, useState } from "react"

export type SavedItem = {
  title: string
  href: string
  kind: string
  savedAt: string
}

export const SAVED_KEY = "via:saved:v1"

function readSaved(): SavedItem[] {
  try {
    const raw = window.localStorage.getItem(SAVED_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is SavedItem =>
      Boolean(item) &&
      typeof item.title === "string" &&
      typeof item.href === "string" &&
      typeof item.kind === "string" &&
      typeof item.savedAt === "string"
    ).slice(0, 100)
  } catch {
    return []
  }
}

export default function SaveButton({ title, href, kind }: { title: string; href: string; kind: string }) {
  const [saved, setSaved] = useState(false)
  const [status, setStatus] = useState("")

  useEffect(() => {
    setSaved(readSaved().some((item) => item.href === href))
  }, [href])

  function toggleSaved() {
    try {
      const current = readSaved()
      if (current.some((item) => item.href === href)) {
        const next = current.filter((item) => item.href !== href)
        window.localStorage.setItem(SAVED_KEY, JSON.stringify(next))
        setSaved(false)
        setStatus("Removed from Saved")
      } else {
        const next: SavedItem[] = [
          { title, href, kind, savedAt: new Date().toISOString() },
          ...current.filter((item) => item.href !== href),
        ].slice(0, 100)
        window.localStorage.setItem(SAVED_KEY, JSON.stringify(next))
        setSaved(true)
        setStatus("Saved in this browser")
      }
    } catch {
      setStatus("Saving is unavailable in this browser")
    }
    window.setTimeout(() => setStatus(""), 1800)
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <button
        type="button"
        onClick={toggleSaved}
        aria-pressed={saved}
        style={{
          minHeight: 40,
          border: "1px solid #285f40",
          borderRadius: 999,
          padding: "8px 12px",
          background: saved ? "#123822" : "#07100b",
          color: "#b9ffd4",
          fontWeight: 800,
          cursor: "pointer",
        }}
      >
        {saved ? "Saved ✓" : "Save"}
      </button>
      <span role="status" aria-live="polite" style={{ color: "#91a69a", fontSize: 12, minHeight: 18 }}>{status}</span>
    </span>
  )
}
