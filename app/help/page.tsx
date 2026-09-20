"use client"

import { useEffect, useState } from "react"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"

type Copy = { title: string; intro: string; building: string }

const COPY: Record<ViaLanguage | "Hindi", Copy> = {
  Dutch: { title: "VIA Handleiding", intro: "Dit wordt de centrale handleiding voor VIA.", building: "De inhoud wordt stap voor stap toegevoegd; deze vaste ingang blijft hetzelfde." },
  English: { title: "VIA Guide", intro: "This will be the central guide for VIA.", building: "Content will be added step by step; this permanent entry point stays the same." },
  French: { title: "Guide VIA", intro: "Ceci deviendra le guide central de VIA.", building: "Le contenu sera ajouté étape par étape ; ce point d’accès permanent restera le même." },
  Spanish: { title: "Guía VIA", intro: "Esta será la guía central de VIA.", building: "El contenido se añadirá paso a paso; este acceso permanente seguirá siendo el mismo." },
  Chinese: { title: "VIA 指南", intro: "这里将成为 VIA 的中央指南。", building: "内容会逐步添加；这个固定入口将保持不变。" },
  Hindi: { title: "VIA मार्गदर्शिका", intro: "यह VIA की केंद्रीय मार्गदर्शिका होगी।", building: "सामग्री चरण-दर-चरण जोड़ी जाएगी; यह स्थायी प्रवेश बिंदु वही रहेगा।" },
}

export default function HelpPage() {
  const [language, setLanguage] = useState<ViaLanguage>("English")

  useEffect(() => {
    const sync = () => setLanguage(readViaLocalSettings().interfaceLanguage)
    sync()
    window.addEventListener(VIA_SETTINGS_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(VIA_SETTINGS_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  const copy = COPY[language]

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl rounded-2xl border border-[#285f40]/70 bg-[#050806]/90 p-6 sm:p-8">
        <h1 className="text-3xl font-semibold tracking-tight">{copy.title}</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">{copy.intro}</p>
        <p className="mt-6 rounded-xl border border-zinc-800 bg-black/25 p-4 text-sm leading-6 text-zinc-500">{copy.building}</p>
      </div>
    </main>
  )
}
