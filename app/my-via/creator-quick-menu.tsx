"use client"

import { FormEvent, useEffect, useState } from "react"

const STORAGE_KEY = "via:creator-quick-menu:v1"
const MAX_ITEMS = 12

type SavedCreator = { username: string }
type ViaProfileResponse = { ok?: boolean; profile?: { username?: string } }

function normalizeUsername(value: string) {
  return value.trim().replace(/^@/, "").replace(/[^A-Za-z0-9_.-]/g, "").slice(0, 64)
}

export default function CreatorQuickMenu() {
  const [items, setItems] = useState<SavedCreator[]>([])
  const [input, setInput] = useState("")
  const [status, setStatus] = useState("")
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      if (!Array.isArray(parsed)) return
      const safeItems = parsed
        .map((item) => typeof item?.username === "string" ? normalizeUsername(item.username) : "")
        .filter(Boolean)
        .slice(0, MAX_ITEMS)
        .map((username) => ({ username }))
      setItems(safeItems)
    } catch {
      setStatus("Your local creator shortcuts could not be read from this browser.")
    }
  }, [])

  function persist(next: SavedCreator[]) {
    setItems(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return true
    } catch {
      setStatus("The shortcut changed for this visit but could not be saved locally.")
      return false
    }
  }

  async function addCreator(event: FormEvent) {
    event.preventDefault()
    const username = normalizeUsername(input)
    if (!username) {
      setStatus("Enter a DeSo username first.")
      return
    }
    if (items.some((item) => item.username.toLowerCase() === username.toLowerCase())) {
      setStatus(`@${username} is already in your quick menu.`)
      return
    }
    if (items.length >= MAX_ITEMS) {
      setStatus(`This local quick menu is limited to ${MAX_ITEMS} creators.`)
      return
    }

    setChecking(true)
    setStatus(`Checking @${username} on DeSo…`)
    try {
      const response = await fetch(`/api/via/profile?identity=${encodeURIComponent(username)}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      })
      const data = response.ok ? (await response.json()) as ViaProfileResponse : null
      const verifiedUsername = normalizeUsername(data?.profile?.username ?? "")
      if (!response.ok || !data?.ok || !verifiedUsername) {
        setStatus(`@${username} could not be verified as a public DeSo profile, so it was not saved.`)
        return
      }
      if (items.some((item) => item.username.toLowerCase() === verifiedUsername.toLowerCase())) {
        setStatus(`@${verifiedUsername} is already in your quick menu.`)
        return
      }
      const next = [...items, { username: verifiedUsername }]
      if (persist(next)) setStatus(`@${verifiedUsername} verified on DeSo and saved locally on this device.`)
      setInput("")
    } catch {
      setStatus("The DeSo profile could not be checked right now. Nothing was saved.")
    } finally {
      setChecking(false)
    }
  }

  function removeCreator(username: string) {
    const next = items.filter((item) => item.username !== username)
    if (persist(next)) setStatus(`@${username} removed from this local quick menu.`)
  }

  return (
    <section className="mt-8 rounded-[14px] border border-zinc-800/80 bg-zinc-950/45 p-5" aria-labelledby="creator-quick-menu-heading" aria-busy={checking}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">Local shortcut</p>
      <h2 id="creator-quick-menu-heading" className="mt-2 text-2xl font-semibold text-zinc-100">Creator quick menu</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
        Keep a small list of public DeSo creators you want to revisit. VIA checks that the profile exists before saving it. This version stays only in this browser, makes no DeSo transaction and does not prove control of the saved account. Cross-device on-chain syncing remains a separate later step.
      </p>
      <form onSubmit={addCreator} className="mt-4 flex max-w-2xl flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="creator-quick-menu-input">DeSo creator username</label>
        <input id="creator-quick-menu-input" value={input} onChange={(event) => setInput(event.target.value)} autoCapitalize="none" autoCorrect="off" spellCheck={false} maxLength={65} placeholder="DeSo username, with or without @" disabled={checking} className="min-w-0 flex-1 rounded-[12px] border border-zinc-700/80 bg-black/35 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-[#8fd4a9]/70 focus:ring-2 focus:ring-[#8fd4a9]/10 disabled:cursor-wait disabled:opacity-60" />
        <button type="submit" disabled={checking} className="rounded-[12px] border border-[#8fd4a9]/45 bg-transparent px-5 py-3 text-sm font-medium text-[#9adbb2] hover:border-[#8fd4a9]/70 hover:bg-[#0c1711]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/20 disabled:cursor-wait disabled:opacity-60">{checking ? "Checking…" : "Add creator"}</button>
      </form>
      <p className="mt-3 min-h-5 text-sm text-zinc-500" role="status" aria-live="polite">{status}</p>
      {items.length ? (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3" aria-label="Saved creator shortcuts">
          {items.map((item) => (
            <li key={item.username} className="flex items-center justify-between gap-3 rounded-[12px] border border-zinc-800/80 bg-black/30 p-3">
              <a href={`/?account=${encodeURIComponent(item.username)}`} className="min-h-10 min-w-0 flex-1 rounded-[9px] px-2 py-2 text-sm font-medium text-zinc-200 hover:bg-[#0c1711]/45 hover:text-[#9adbb2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/15">@{item.username}</a>
              <button type="button" onClick={() => removeCreator(item.username)} className="min-h-10 rounded-[9px] border border-zinc-800 px-3 text-xs text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/15">Remove</button>
            </li>
          ))}
        </ul>
      ) : <p className="mt-4 text-sm text-zinc-600">No local creator shortcuts yet.</p>}
    </section>
  )
}
