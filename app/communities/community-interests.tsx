"use client"

import { useEffect, useState } from "react"

const STORAGE_KEY = "via:communities:interests:v1"

const interests = [
  "Art & Photography",
  "Music",
  "DeSo & Builders",
  "NFT & Collecting",
  "Games & Quest",
  "Open Community",
] as const

type Interest = (typeof interests)[number]

export default function CommunityInterests() {
  const [selected, setSelected] = useState<Interest[]>([])
  const [status, setStatus] = useState("")

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        setSelected(parsed.filter((item): item is Interest => interests.includes(item as Interest)))
      }
    } catch {
      setStatus("Community interests could not be read from this browser.")
    }
  }, [])

  function toggle(interest: Interest) {
    const next = selected.includes(interest)
      ? selected.filter((item) => item !== interest)
      : [...selected, interest]

    setSelected(next)

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setStatus("Community interests saved on this device.")
    } catch {
      setStatus("Your choice changed for this visit, but could not be saved locally.")
    }
  }

  function clearAll() {
    setSelected([])
    try {
      window.localStorage.removeItem(STORAGE_KEY)
      setStatus("Community interests cleared from this device.")
    } catch {
      setStatus("Interests cleared for this visit.")
    }
  }

  return (
    <section className="mb-7 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5" aria-labelledby="community-interest-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-400">Your community map</p>
      <h2 id="community-interest-heading" className="mt-2 text-2xl font-semibold">Mark what interests you</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
        These choices stay in this browser. They do not join a community, follow an account, change your DeSo profile or send anything to VIA.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {interests.map((interest) => {
          const active = selected.includes(interest)
          return (
            <button
              key={interest}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(interest)}
              className={`min-h-11 rounded-full border px-4 py-2 text-sm transition ${active ? "border-green-600 bg-green-950/20 text-green-300" : "border-zinc-700 text-zinc-300 hover:border-zinc-500"}`}
            >
              {interest}
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-zinc-500">{selected.length} selected · local to this browser</p>
        <button type="button" onClick={clearAll} className="min-h-11 rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500">
          Clear all
        </button>
      </div>

      <p className="mt-3 min-h-5 text-xs text-zinc-400" role="status" aria-live="polite">{status}</p>
    </section>
  )
}
