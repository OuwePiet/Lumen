"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import NotificationCenter from "./notification-center"
import SponsorPlatform from "../sponsor-platform"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"
import ViaRightPanels from "../via-right-panels"

type PageCopy = { title: string; intro: string; back: string }

const COPY: Record<ViaLanguage | "Hindi", PageCopy> = {
  Dutch: { title: "Meldingen", intro: "Kies welke DeSo-activiteit je wilt zien.", back: "Terug naar Social" },
  English: { title: "Notifications", intro: "Choose which DeSo activity you want to see.", back: "Back to Social" },
  French: { title: "Notifications", intro: "Choisissez l’activité DeSo que vous souhaitez voir.", back: "Retour à Social" },
  Spanish: { title: "Notificaciones", intro: "Elige qué actividad de DeSo quieres ver.", back: "Volver a Social" },
  Chinese: { title: "通知", intro: "选择要查看的 DeSo 活动。", back: "返回社交" },
  Hindi: { title: "सूचनाएँ", intro: "चुनें कि आप कौन-सी DeSo गतिविधि देखना चाहते हैं।", back: "Social पर वापस जाएँ" },
}

export default function NotificationsPage() {
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
    <main className="min-h-screen bg-black px-3 pb-8 pt-2 text-white sm:px-8 sm:py-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
        <header className="mb-1 flex flex-wrap items-center justify-between gap-1.5 border-b border-white/10 pb-1 sm:mb-6 sm:gap-4 sm:pb-5">
          <div className="hidden sm:block">
            <h1 className="text-xl font-semibold tracking-tight sm:text-4xl">{copy.title}</h1>
            <p className="mt-1 text-xs text-zinc-500 sm:mt-2 sm:text-sm">{copy.intro}</p>
          </div>
          <div className="flex flex-wrap items-center gap-1 sm:gap-2"><div className="[&>button]:!min-h-7 [&>button]:!rounded-full [&>button]:!px-2 [&>button]:!py-1 [&>button]:!text-[10px] sm:[&>button]:!min-h-[38px] sm:[&>button]:!px-4 sm:[&>button]:!py-2 sm:[&>button]:!text-sm"><SponsorPlatform compact /></div><Link href="/social" aria-label={copy.back} title={copy.back} className="inline-flex min-h-7 items-center rounded-full border border-[#8fd4a9]/35 bg-[#050b08]/80 px-2 py-1 text-[10px] font-semibold text-[#9adbb2] hover:border-[#8fd4a9]/60 hover:bg-[#0c1711]/55 sm:min-h-[38px] sm:px-4 sm:py-2 sm:text-sm"><span className="sm:hidden">Social</span><span className="hidden sm:inline">{copy.back}</span></Link></div>
        </header>

        <NotificationCenter language={language} />
        </div>
        <aside className="hidden xl:block xl:sticky xl:top-6 xl:self-start">
          <ViaRightPanels />
        </aside>
      </div>
    </main>
  )
}
