"use client"

import { useEffect, useMemo, useState } from "react"

export const VIA_SOCIAL_FEED_STORAGE_KEY = "via:social:feed-choice:v1"
export const VIA_SOCIAL_FEED_EVENT = "via:social:feed-choice"

const choices = [
  { id: "following", title: "Following", text: "Newest public posts from accounts followed by the selected DeSo identity." },
  { id: "recent", title: "Recent", text: "Public DeSo posts in a recency-first view." },
  { id: "hot", title: "Hot", text: "DeSo's documented Hot feed, ranked by public engagement and recency signals." },
] as const

export type ChoiceId = (typeof choices)[number]["id"]

export default function FeedChoice() {
  const [selected, setSelected] = useState<ChoiceId>("following")
  const [status, setStatus] = useState("")

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(VIA_SOCIAL_FEED_STORAGE_KEY)
      const normalized = stored === "discovery" ? "hot" : stored
      if (choices.some((choice) => choice.id === normalized)) setSelected(normalized as ChoiceId)
    } catch {
      setStatus("Feed preference could not be read from this browser.")
    }
  }, [])

  const activeChoice = useMemo(() => choices.find((choice) => choice.id === selected) ?? choices[0], [selected])

  function choose(next: ChoiceId) {
    setSelected(next)
    window.dispatchEvent(new CustomEvent<ChoiceId>(VIA_SOCIAL_FEED_EVENT, { detail: next }))
    try {
      window.localStorage.setItem(VIA_SOCIAL_FEED_STORAGE_KEY, next)
      setStatus(`${choices.find((choice) => choice.id === next)?.title} selected.`)
    } catch {
      setStatus("Preference changed for this visit, but could not be saved locally.")
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-black/30 p-3 sm:p-4" aria-labelledby="feed-choice-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8fd4a9]">Feed</p>
          <h2 id="feed-choice-heading" className="mt-1 text-base font-semibold text-zinc-100">Choose your view</h2>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Social feed view">
          {choices.map((choice) => {
            const active = selected === choice.id
            return (
              <button
                key={choice.id}
                type="button"
                aria-pressed={active}
                onClick={() => choose(choice.id)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8fd4a9]/70 ${active ? "border-[#8fd4a9]/55 bg-[#0d1b13]/80 text-[#9adbb2]" : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-[#8fd4a9]/30 hover:text-zinc-200"}`}
              >
                {choice.title}
              </button>
            )
          })}
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-zinc-400">{activeChoice.text}</p>
      <p className="mt-1 text-[11px] text-zinc-600">Hot is DeSo ranking, not VIA endorsement. Feed choice is stored only in this browser.</p>
      <p className="mt-2 min-h-4 text-[11px] text-zinc-500" role="status" aria-live="polite">{status}</p>
    </section>
  )
}
