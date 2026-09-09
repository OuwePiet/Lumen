"use client"

import { useEffect, useState } from "react"

const STORAGE_KEY = "via:communities:interests:v1"
const interests = ["Art & Photography", "Music", "DeSo & Builders", "NFT & Collecting", "Games & Quest", "Open Community"] as const
type Interest = (typeof interests)[number]

export default function CommunityInterests() {
  const [selected, setSelected] = useState<Interest[]>([])
  const [status, setStatus] = useState("")

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) setSelected(parsed.filter((item): item is Interest => interests.includes(item as Interest)))
    } catch { setStatus("Community interests could not be read from this browser.") }
  }, [])

  function toggle(interest: Interest) {
    const next = selected.includes(interest) ? selected.filter((item) => item !== interest) : [...selected, interest]
    setSelected(next)
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setStatus("Community interests saved on this device.") }
    catch { setStatus("Your choice changed for this visit, but could not be saved locally.") }
  }

  function clearAll() {
    setSelected([])
    try { window.localStorage.removeItem(STORAGE_KEY); setStatus("Community interests cleared from this device.") }
    catch { setStatus("Interests cleared for this visit.") }
  }

  return (
    <section className="mb-7 rounded-[14px] border border-zinc-800/80 bg-zinc-950/55 p-5" aria-labelledby="community-interest-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">Your community map</p>
      <h2 id="community-interest-heading" className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100">Mark what interests you</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">These choices stay in this browser. They do not join a community, follow an account, change your DeSo profile or send anything to VIA.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {interests.map((interest) => {
          const active = selected.includes(interest)
          return <button key={interest} type="button" aria-pressed={active} onClick={() => toggle(interest)} className={`min-h-11 rounded-[11px] border bg-transparent px-4 py-2 text-sm transition-[background-color,border-color,box-shadow,color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/15 ${active ? "border-[#8fd4a9]/60 bg-[#0c1711]/55 text-[#9adbb2] shadow-[inset_0_0_18px_rgba(143,212,169,0.035)]" : "border-zinc-700/80 text-zinc-300 hover:border-[#8fd4a9]/45 hover:bg-[#0c1711]/30"}`}>{interest}</button>
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-zinc-500">{selected.length} selected · local to this browser</p>
        <button type="button" onClick={clearAll} className="min-h-11 rounded-[11px] border border-zinc-700/80 bg-transparent px-4 py-2 text-sm text-zinc-300 transition-colors duration-200 hover:border-[#8fd4a9]/45 hover:text-[#9adbb2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/15">Clear all</button>
      </div>
      <p className="mt-3 min-h-5 text-xs text-zinc-400" role="status" aria-live="polite">{status}</p>
    </section>
  )
}
