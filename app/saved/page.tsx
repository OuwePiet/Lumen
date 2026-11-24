"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import SavedList from "./saved-list"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"

export default function SavedPage() {
  const [language, setLanguage] = useState<ViaLanguage | "Hindi">("English")

  useEffect(() => {
    const refresh = () => setLanguage(readViaLocalSettings().interfaceLanguage)
    refresh()
    window.addEventListener(VIA_SETTINGS_EVENT, refresh)
    return () => window.removeEventListener(VIA_SETTINGS_EVENT, refresh)
  }, [])

  const hindi = language === "Hindi"

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-2xl">
        <header className="mb-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#8fd4a9]">VIA</p>
            <h1 className="mt-2 text-xl font-semibold">{hindi ? "बुकमार्क्स" : "Bookmarks"}</h1>
            <p className="mt-3 max-w-2xl text-zinc-400">{hindi ? "उन चीज़ों के लिए एक शांत जगह जिन्हें आपने खुद दोबारा खोजने के लिए सहेजा है।" : "One calm place for things you explicitly choose to find again."}</p>
          </div>
          <Link href="/my-via" className="rounded-full border border-zinc-700 px-4 py-2 text-sm hover:border-[#8fd4a9]/70 hover:text-[#9adbb2]">My VIA</Link>
        </header>

<SavedList />

        <p className="mt-4 text-xs text-zinc-500">Bookmarks are stored on this device.</p>
      </div>
    </main>
  )
}
