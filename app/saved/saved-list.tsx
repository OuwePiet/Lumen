"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { SAVED_KEY, type SavedItem } from "./save-button"

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

export default function SavedList() {
  const [items, setItems] = useState<SavedItem[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setItems(readSaved())
    setReady(true)
  }, [])

  function remove(href: string) {
    try {
      const next = items.filter((item) => item.href !== href)
      window.localStorage.setItem(SAVED_KEY, JSON.stringify(next))
      setItems(next)
    } catch {
      // Keep the visible list unchanged when local browser storage is unavailable.
    }
  }

  if (!ready) {
    return <p className="text-sm text-zinc-500">Loading your local Saved list…</p>
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="font-medium text-white">Nothing saved yet</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">Use a Save button in VIA when you want a route or item to appear here. Saved data stays in this browser.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <article key={item.href} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-green-400">{item.kind}</p>
          <h2 className="mt-2 font-medium text-white">{item.title}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={item.href} className="rounded-full border border-green-900 px-3 py-2 text-sm text-green-300 hover:border-green-500">Open</Link>
            <button type="button" onClick={() => remove(item.href)} className="rounded-full border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:border-zinc-500">Remove</button>
          </div>
        </article>
      ))}
    </div>
  )
}
