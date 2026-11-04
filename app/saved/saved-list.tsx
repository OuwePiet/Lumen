"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { SAVED_KEY, type SavedItem } from "./save-button"
import { useSavedCopy } from "./saved-copy"

function isSafeViaHref(href: string) {
  return href.startsWith("/") && !href.startsWith("//") && !/[\\\u0000-\u0020]/.test(href)
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
      isSafeViaHref(item.href) &&
      typeof item.kind === "string" &&
      typeof item.savedAt === "string"
    ).slice(0, 100)
  } catch {
    return []
  }
}

export default function SavedList() {
  const t=useSavedCopy()
  const [items, setItems] = useState<SavedItem[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const sync=()=>{setItems(readSaved());setReady(true)}
    sync();window.addEventListener("via:saved:changed",sync);window.addEventListener("storage",sync)
    return()=>{window.removeEventListener("via:saved:changed",sync);window.removeEventListener("storage",sync)}
  }, [])

  function remove(href: string) {
    try {
      const next = readSaved().filter((item) => item.href !== href)
      window.localStorage.setItem(SAVED_KEY, JSON.stringify(next))
      setItems(next)
      window.dispatchEvent(new Event("via:saved:changed"))
    } catch {
      // Keep the visible list unchanged when local browser storage is unavailable.
    }
  }

  if (!ready) {
    return <p className="text-sm text-zinc-500">{t.loading}</p>
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="font-medium text-white">{t.empty}</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">{t.emptyInfo}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <article key={item.href} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8fd4a9]">{item.kind}</p>
          <h2 className="mt-2 font-medium text-white">{item.title}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={item.href} className="rounded-full border border-[#285f40] px-3 py-2 text-sm text-[#9adbb2] hover:border-[#8fd4a9]/70">{t.open}</Link>
            <button type="button" onClick={() => remove(item.href)} className="rounded-full border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:border-zinc-500">{t.remove}</button>
          </div>
        </article>
      ))}
    </div>
  )
}
