"use client"

import { useEffect, useState } from "react"

const STORAGE_KEY = "via:social:feed-choice:v1"

const choices = [
  { id: "following", title: "Following", text: "Posts from accounts you choose to follow. VIA will keep the ordering rule visible when this feed becomes live." },
  { id: "recent", title: "Recent", text: "A recency-first public DeSo view. Newest does not automatically mean trusted or recommended." },
  { id: "discovery", title: "Discovery", text: "A broader route to creators and conversations outside your follows, with ranking and Sponsored placement kept explicit." },
] as const

type ChoiceId = (typeof choices)[number]["id"]

export default function FeedChoice() {
  const [selected, setSelected] = useState<ChoiceId>("following")
  const [status, setStatus] = useState("")

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (choices.some((choice) => choice.id === stored)) {
        setSelected(stored as ChoiceId)
      }
    } catch {
      setStatus("Feed preference could not be read from this browser.")
    }
  }, [])

  function choose(next: ChoiceId) {
    setSelected(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
      setStatus(`${choices.find((choice) => choice.id === next)?.title} saved as your local VIA feed preference.`)
    } catch {
      setStatus("Preference changed for this visit, but could not be saved locally.")
    }
  }

  return (
    <section className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5" aria-labelledby="feed-choice-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-400">Your entry point</p>
      <h2 id="feed-choice-heading" className="mt-2 text-2xl font-semibold">Choose your social view</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
        This currently stores only a preference in your browser. It does not change DeSo data, follow accounts or create a profile.
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
              className={`min-h-32 rounded-2xl border p-4 text-left transition ${active ? "border-green-600 bg-green-950/20" : "border-zinc-800 bg-black hover:border-zinc-600"}`}
            >
              <span className={active ? "text-base font-semibold text-green-300" : "text-base font-semibold text-white"}>{choice.title}</span>
              <span className="mt-2 block text-sm leading-6 text-zinc-400">{choice.text}</span>
              <span className="mt-3 block text-xs text-zinc-500">{active ? "Selected on this device" : "Choose this view"}</span>
            </button>
          )
        })}
      </div>
      <p className="mt-3 min-h-5 text-xs text-zinc-400" role="status" aria-live="polite">{status}</p>
    </section>
  )
}
