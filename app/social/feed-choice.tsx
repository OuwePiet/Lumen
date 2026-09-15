"use client"

import { useEffect, useState } from "react"

export const VIA_SOCIAL_FEED_STORAGE_KEY = "via:social:feed-choice:v1"
export const VIA_SOCIAL_FEED_EVENT = "via:social:feed-choice"

const choices = [
  { id: "following", title: "Following", text: "Posts from accounts followed by the selected DeSo identity." },
  { id: "recent", title: "Recent", text: "Newest public posts first." },
  { id: "hot", title: "Hot", text: "DeSo Hot ranking." },
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

  function choose(next: ChoiceId) {
    setSelected(next)
    window.dispatchEvent(new CustomEvent<ChoiceId>(VIA_SOCIAL_FEED_EVENT, { detail: next }))
    try {
      window.localStorage.setItem(VIA_SOCIAL_FEED_STORAGE_KEY, next)
      setStatus("")
    } catch {
      setStatus("Preference changed for this visit only.")
    }
  }

  const active = choices.find((choice) => choice.id === selected) ?? choices[0]

  return (
    <section className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 sm:px-5" aria-labelledby="feed-choice-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8fd4a9]">Feed</p>
          <h2 id="feed-choice-heading" className="mt-1 text-base font-semibold text-zinc-100">{active.title}</h2>
          <p className="mt-1 text-xs text-zinc-500">{active.text}</p>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Choose social feed">
          {choices.map((choice) => {
            const isActive = selected === choice.id
            return (
              <button
                key={choice.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => choose(choice.id)}
                className={`rounded-full border px-4 py-2 text-sm transition ${isActive ? "border-[#8fd4a9]/55 bg-[#102117]/70 text-[#9adbb2]" : "border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"}`}
              >
                {choice.title}
              </button>
            )
          })}
        </div>
      </div>
      <p className="mt-2 min-h-4 text-[11px] text-zinc-600" role="status" aria-live="polite">{status}</p>
    </section>
  )
}
