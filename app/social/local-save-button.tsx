"use client"

import { useEffect, useState } from "react"
import { SAVED_KEY, type SavedItem } from "../saved/save-button"

const SAVE_EVENT = "via:saved:changed"

type Props = {
  postHash: string
  body: string
  publicKey: string
  timestampNanos: number
}

function postHref(postHash: string) {
  return `/social?post=${encodeURIComponent(postHash)}`
}

function postTitle(body: string, publicKey: string) {
  const text = body.trim().replace(/\s+/g, " ")
  if (text) return text.length > 72 ? `${text.slice(0, 69)}...` : text
  const account = publicKey.length > 18 ? `${publicKey.slice(0, 10)}…${publicKey.slice(-6)}` : publicKey
  return `DeSo post · ${account}`
}

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

export default function LocalSaveButton({ postHash, body, publicKey }: Props) {
  const href = postHref(postHash)
  const [saved, setSaved] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const sync = () => setSaved(readSaved().some((item) => item.href === href))
    sync()
    window.addEventListener(SAVE_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(SAVE_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [href])

  function toggle() {
    try {
      const current = readSaved()
      if (current.some((item) => item.href === href)) {
        const next = current.filter((item) => item.href !== href)
        window.localStorage.setItem(SAVED_KEY, JSON.stringify(next))
        setSaved(false)
        window.dispatchEvent(new Event(SAVE_EVENT))
        setMessage("Removed from Saved.")
        return
      }

      const next: SavedItem[] = [
        {
          title: postTitle(body, publicKey),
          href,
          kind: "Post",
          savedAt: new Date().toISOString(),
        },
        ...current.filter((item) => item.href !== href),
      ].slice(0, 100)
      window.localStorage.setItem(SAVED_KEY, JSON.stringify(next))
      setSaved(true)
      window.dispatchEvent(new Event(SAVE_EVENT))
      setMessage("Saved in VIA Saved on this device.")
    } catch {
      setMessage("Saving is unavailable on this device.")
    }
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
