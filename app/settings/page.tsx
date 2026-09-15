"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  DEFAULT_VIA_SETTINGS,
  readViaLocalSettings,
  saveViaLocalSettings,
  VIA_FEEDS,
  VIA_LANGUAGES,
  VIA_STUDIO_DRAFT_KEY,
  type ViaFeed,
  type ViaLanguage,
} from "../via-local-settings"

const action = "inline-flex min-h-11 items-center justify-center rounded-[11px] border border-[#8fd4a9]/45 bg-transparent px-4 py-2 text-sm font-semibold text-[#9adbb2] transition-colors hover:border-[#8fd4a9]/70 hover:bg-[#0c1711]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/20"
const quietAction = "inline-flex min-h-10 items-center rounded-[10px] border border-zinc-700/80 bg-transparent px-3 py-2 text-sm text-zinc-300 transition-colors hover:border-[#8fd4a9]/50 hover:text-[#9adbb2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/15"
const selectClass = "min-h-11 w-full rounded-[10px] border border-zinc-700/80 bg-[#050807] px-3 py-2 text-sm text-zinc-100 outline-none focus:border-[#8fd4a9]/55 focus:ring-2 focus:ring-[#8fd4a9]/10"

export default function SettingsPage() {
  const [language, setLanguage] = useState<ViaLanguage>(DEFAULT_VIA_SETTINGS.defaultLanguage)
  const [feed, setFeed] = useState<ViaFeed>(DEFAULT_VIA_SETTINGS.defaultFeed)
  const [status, setStatus] = useState("Settings are stored only in this browser.")

  useEffect(() => {
    const settings = readViaLocalSettings()
    setLanguage(settings.defaultLanguage)
    setFeed(settings.defaultFeed)
  }, [])

  function save() {
    try {
      saveViaLocalSettings({ defaultLanguage: language, defaultFeed: feed })
      setStatus("VIA preferences saved on this device.")
    } catch {
      setStatus("Preferences could not be saved in this browser.")
    }
  }

  function reset() {
    try {
      saveViaLocalSettings({
        defaultLanguage: DEFAULT_VIA_SETTINGS.defaultLanguage,
        defaultFeed: DEFAULT_VIA_SETTINGS.defaultFeed,
      })
      setLanguage(DEFAULT_VIA_SETTINGS.defaultLanguage)
      setFeed(DEFAULT_VIA_SETTINGS.defaultFeed)
      setStatus("Creator defaults reset to Dutch / Hot Feed. VIA interface language was kept.")
    } catch {
      setStatus("Preferences could not be reset in this browser.")
    }
  }

  function clearDraft() {
    try {
      window.localStorage.removeItem(VIA_STUDIO_DRAFT_KEY)
      setStatus("Local Studio draft removed from this device.")
    } catch {
      setStatus("The local draft could not be removed in this browser.")
    }
  }

  return (
    <main className="min-h-screen bg-[#050807] px-5 py-8 text-zinc-100 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8fd4a9]">VIA · SETTINGS</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-[2.25rem]">Settings</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">Real local preferences only. VIA does not store your DeSo seed phrase, private key or signing secret here.</p>
          </div>
          <Link href="/my-via" className={quietAction}>Back to My VIA</Link>
        </header>

        <section className="rounded-[14px] border border-zinc-800/80 bg-zinc-950/50 p-5 sm:p-6" aria-labelledby="creator-defaults">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">Creator defaults</p>
          <h2 id="creator-defaults" className="mt-2 text-2xl font-semibold">Post language and feed</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">These defaults are used when VIA Studio opens without an already saved draft.</p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-zinc-200">Default post language
              <select value={language} onChange={(event) => setLanguage(event.target.value as ViaLanguage)} className={selectClass}>
                {VIA_LANGUAGES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-zinc-200">Default feed
              <select value={feed} onChange={(event) => setFeed(event.target.value as ViaFeed)} className={selectClass}>
                {VIA_FEEDS.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={save} className={action}>Save preferences</button>
            <button type="button" onClick={reset} className={quietAction}>Reset defaults</button>
          </div>
        </section>

        <section className="mt-5 rounded-[14px] border border-zinc-800/80 bg-zinc-950/45 p-5 sm:p-6" aria-labelledby="local-data">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">Local data</p>
          <h2 id="local-data" className="mt-2 text-2xl font-semibold">Studio draft</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">Studio drafts are browser-local. Removing one here does not publish, delete or change anything on DeSo.</p>
          <button type="button" onClick={clearDraft} className={`${quietAction} mt-4`}>Clear local Studio draft</button>
        </section>

        <section className="mt-5 rounded-[14px] border border-zinc-800/80 bg-zinc-950/45 p-5 sm:p-6" aria-labelledby="security">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">Security</p>
          <h2 id="security" className="mt-2 text-2xl font-semibold">Account boundaries</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">Login, account switching and transaction approval stay with DeSo Identity. VIA Settings stores only these local creator preferences and local draft controls.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/profile" className={quietAction}>Profile</Link>
            <Link href="/wallet" className={quietAction}>Read-only Wallet</Link>
            <Link href="/live" className={quietAction}>Status & diagnostics</Link>
          </div>
        </section>

        <p className="mt-5 min-h-5 text-xs leading-5 text-zinc-400" role="status" aria-live="polite">{status}</p>
      </div>
    </main>
  )
}
