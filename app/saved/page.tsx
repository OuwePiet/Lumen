"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import SavedList from "./saved-list"
import DeSoSavedPosts from "./deso-saved-posts"
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
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#8fd4a9]">VIA</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{hindi ? "बुकमार्क्स" : "Bookmarks"}</h1>
            <p className="mt-3 max-w-2xl text-zinc-400">{hindi ? "उन चीज़ों के लिए एक शांत जगह जिन्हें आपने खुद दोबारा खोजने के लिए सहेजा है।" : "One calm place for things you explicitly choose to find again."}</p>
          </div>
          <Link href="/my-via" className="rounded-full border border-zinc-700 px-4 py-2 text-sm hover:border-[#8fd4a9]/70 hover:text-[#9adbb2]">My VIA</Link>
        </header>

        <section className="mb-6 rounded-2xl border border-[#285f40]/70 bg-zinc-950 p-5">
          <h2 className="text-lg text-[#9adbb2]">{hindi ? "आपकी पसंद, छिपी profiling नहीं" : "Your choice, not hidden profiling"}</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{hindi ? "VIA Bookmarks में केवल वही चीज़ें होती हैं जिन्हें आप स्पष्ट रूप से सहेजते हैं। DeSo बुकमार्क आपके खाते से जुड़े सार्वजनिक ब्लॉकचेन एसोसिएशन हैं। पहले के स्थानीय सेव इसी डिवाइस पर बने रहते हैं। VIA इनका उपयोग छिपी प्रोफ़ाइलिंग या भुगतान वाली रैंकिंग के लिए नहीं करता।" : "VIA Bookmarks only contains things you explicitly save. DeSo bookmarks are public blockchain associations linked to your account. Earlier local saves remain on this device."}</p>
        </section>

        <DeSoSavedPosts />
        <h2 className="mb-3 text-lg font-semibold text-[#9adbb2]">Eerder lokaal opgeslagen</h2>
        <SavedList />

        <p className="mt-8 text-xs leading-5 text-zinc-600">{hindi ? "इस browser का site data साफ़ करने से स्थानीय Bookmarks हट सकते हैं। DeSo बुकमार्क उसी DeSo खाते से अन्य डिवाइस पर देखे जा सकते हैं।" : "Clearing this browser's site data can remove local Bookmarks. DeSo bookmarks can be viewed from other devices using the same DeSo account."}</p>
      </div>
    </main>
  )
}
