"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import NotificationCenter from "./notification-center"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"

type PageCopy = { title: string; intro: string; back: string }

const COPY: Record<ViaLanguage, PageCopy> = {
  Dutch: { title: "Meldingen", intro: "Kies welke DeSo-activiteit je wilt zien.", back: "Terug naar Social" },
  English: { title: "Notifications", intro: "Choose which DeSo activity you want to see.", back: "Back to Social" },
  French: { title: "Notifications", intro: "Choisissez l’activité DeSo que vous souhaitez voir.", back: "Retour à Social" },
  Spanish: { title: "Notificaciones", intro: "Elige qué actividad de DeSo quieres ver.", back: "Volver a Social" },
  Chinese: { title: "通知", intro: "选择要查看的 DeSo 活动。", back: "返回社交" },
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
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{copy.title}</h1>
            <p className="mt-2 text-sm text-zinc-500">{copy.intro}</p>
          </div>
          <Link href="/social" className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-[#8fd4a9]/70 hover:text-[#9adbb2]">{copy.back}</Link>
        </header>

        <NotificationCenter language={language} />
      </div>
    </main>
  )
}
