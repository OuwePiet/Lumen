"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { readViaLocalSettings } from "../via-local-settings"

export const VIA_SOCIAL_FEED_STORAGE_KEY = "via:social:feed-choice:v1"
export const VIA_SOCIAL_FEED_EVENT = "via:social:feed-choice"

const choices = [
  { id: "following", title: "Following", text: "Posts from accounts followed by the active DeSo identity." },
  { id: "hot", title: "Hot", text: "DeSo Hot ranking." },
  { id: "recent", title: "Recent", text: "Newest public posts first." },
] as const

export type ChoiceId = (typeof choices)[number]["id"]

export function defaultSocialFeedChoice(): ChoiceId {
  const preferred = readViaLocalSettings().defaultFeed
  if (preferred === "Following") return "following"
  if (preferred === "New") return "recent"
  return "hot"
}

export default function FeedChoice() {
  const [selected, setSelected] = useState<ChoiceId>("hot")
  const [status, setStatus] = useState("")

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(VIA_SOCIAL_FEED_STORAGE_KEY)
      const normalized = stored === "discovery" ? "hot" : stored
      const initial = choices.some((choice) => choice.id === normalized)
        ? normalized as ChoiceId
        : defaultSocialFeedChoice()
      setSelected(initial)
    } catch {
      const initial = defaultSocialFeedChoice()
      setSelected(initial)
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

  const inactiveClass = "min-h-11 sm:min-h-9 rounded-full border border-zinc-800 px-4 py-1.5 text-sm text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-200"

  return (
    <section className="rounded-t-2xl border border-b-0 border-white/10 bg-black/35 px-3 py-2" aria-labelledby="feed-choice-heading">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="hidden sm:block">
          <h2 id="feed-choice-heading" className="text-sm font-semibold text-zinc-100">{active.title}</h2>
        </div>
        <div className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto sm:flex-wrap" aria-label="Choose social feed">
          {choices.map((choice) => {
            const isActive = selected === choice.id
            return (
              <button
                key={choice.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => choose(choice.id)}
                className={isActive ? "min-h-11 sm:min-h-9 rounded-full border border-[#8fd4a9]/55 bg-[#102117]/70 px-3 py-1.5 text-center text-sm text-[#9adbb2] transition sm:px-4" : `${inactiveClass} px-3 text-center sm:px-4`}
              >
                {choice.title}
              </button>
            )
          })}

        </div>
      </div>
      <p className={`text-[11px] text-zinc-600 ${status ? "mt-2" : "hidden"}`} role="status" aria-live="polite">{status}</p>
    </section>
  )
}
