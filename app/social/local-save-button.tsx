"use client"

import { useEffect, useState } from "react"

const STORAGE_KEY = "via:social:saved-posts:v1"

type SavedPost = {
  postHash: string
  body: string
  publicKey: string
  timestampNanos: number
  savedAt: number
}

function readSaved(): SavedPost[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is SavedPost => Boolean(item) && typeof item === "object" && typeof item.postHash === "string")
  } catch {
    return []
  }
}

function writeSaved(items: SavedPost[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 100)))
}

export default function LocalSaveButton({ postHash, body, publicKey, timestampNanos }: Omit<SavedPost, "savedAt">) {
  const [saved, setSaved] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    setSaved(readSaved().some((item) => item.postHash === postHash))
  }, [postHash])

  function toggle() {
    const current = readSaved()
    if (current.some((item) => item.postHash === postHash)) {
      writeSaved(current.filter((item) => item.postHash !== postHash))
      setSaved(false)
      setMessage("Removed from this device.")
      return
    }

    writeSaved([
      { postHash, body: body.slice(0, 1200), publicKey, timestampNanos, savedAt: Date.now() },
      ...current.filter((item) => item.postHash !== postHash),
    ])
    setSaved(true)
    setMessage("Saved on this device.")
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={saved}
        className="rounded-full border border-zinc-800 px-3 py-1 text-zinc-300 hover:border-[#8fd4a9]/45 hover:text-[#9adbb2]"
        title="Local VIA save · no blockchain write"
      >
        {saved ? "Saved" : "Save"}
      </button>
      {message ? <span className="sr-only" role="status" aria-live="polite">{message}</span> : null}
    </span>
  )
}
