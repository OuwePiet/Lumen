"use client"

import { useEffect, useState } from "react"

export const VIA_SOCIAL_FEED_STORAGE_KEY = "via:social:feed-choice:v1"
export const VIA_SOCIAL_FEED_EVENT = "via:social:feed-choice"

const choices = [
  { id: "following", title: "Following", text: "Read a bounded newest-first view of public posts from accounts the selected DeSo identity follows." },
  { id: "recent", title: "Recent", text: "A recency-first public DeSo view. Loaded public posts are shown newest first; newest does not automatically mean trusted or recommended." },
  { id: "discovery", title: "Discovery", text: "Explore a broader public DeSo feed outside your follows. Discovery ranking is experimental and is not a VIA trust or quality signal." },
] as const

export type ChoiceId = (typeof choices)[number]["id"]

export default function FeedChoice() {
  const [selected, setSelected] = useState<ChoiceId>("following")
  const [status, setStatus] = useState("")

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(VIA_SOCIAL_FEED_STORAGE_KEY)
      if (choices.some((choice) => choice.id === stored)) {
        setSelected(stored as ChoiceId)
      }
    } catch {
      setStatus("Feed preference could not be read from this browser.")
    }
  }, [])

  function choose(next: ChoiceId) {
    setSelected(next)
    window.dispatchEvent(new CustomEvent<ChoiceId>(VIA_SOCIAL_FEED_EVENT, { detail: next }))

    try {
      window.localStorage.setItem(VIA_SOCIAL_FEED_STORAGE_KEY, next)
      setStatus(`${choices.find((choice) => choice.id === next)?.title} saved as your local VIA feed preference.`)
    } catch {
      setStatus("Preference changed for this visit, but could not be saved locally.")
    }
  }

  return (
    <section className="mb-8 rounded-2xl border border-zinc-800/80 bg-zinc-950/55 p-5" aria-labelledby="feed-choice-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">Your entry point</p>
      <h2 id="feed-choice-heading" className="mt-2 text-2xl font-semibold">Choose your social view</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
        Following, Recent and Discovery all use public read-only DeSo data. Your choice is stored locally in this browser and never changes DeSo data or follows accounts.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {choices.map((choice) => {
          const active = selected === choice.id
          return (
            <button
              key={choice.id}
              type="button"
              aria-pressed={active}
              onClick={() => choose(choice.id)}
              className={`min-h-32 rounded-[14px] border p-4 text-left transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8fd4a9]/70 ${active ? "border-[#8fd4a9]/65 bg-[#0c1711]/55 shadow-[0_0_0_1px_rgba(143,212,169,0.08),0_0_22px_rgba(143,212,169,0.08)]" : "border-zinc-800/80 bg-transparent hover:border-[#8fd4a9]/35 hover:bg-[#0b120e]/35"}`}
            >
              <span className={active ? "text-base font-semibold text-[#9adbb2]" : "text-base font-semibold text-zinc-100"}>{choice.title}</span>
              <span className="mt-2 block text-sm leading-6 text-zinc-400">{choice.text}</span>
              <span className={active ? "mt-3 block text-xs text-[#8fd4a9]/80" : "mt-3 block text-xs text-zinc-500"}>{active ? "Active on this device" : "Choose this view"}</span>
            </button>
          )
        })}
      </div>
      <p className="mt-3 min-h-5 text-xs text-zinc-400" role="status" aria-live="polite">{status}</p>
    </section>
  )
}
