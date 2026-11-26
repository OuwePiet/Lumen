"use client"

import Link from "next/link"
import {readNativeUnread,readNativeNotifications} from "./native-notifications"
import {NOTIFICATION_SEEN_EVENT,readSeenNotificationIndex} from "../notification-indicator"
import styles from "./notification-center.module.css"
import { useEffect, useState } from "react"
import NotificationCenter from "./notification-center"
import PostComposeShortcut from "../social/post-compose-shortcut"
import SponsorPlatform from "../sponsor-platform"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"
import ViaRightPanels from "../via-right-panels"
import { viaModernIdentity, type ViaModernIdentityUser } from "../deso-identity-modern"

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
  const [session, setSession] = useState<ViaModernIdentityUser | null>(null)
  const [unreadCount, setUnreadCount] = useState<number | null>(null)

  useEffect(() => viaModernIdentity.subscribe(setSession), [])

  useEffect(() => {
    setUnreadCount(null)
    if (!session?.publicKey) return
    const publicKey = session.publicKey
    const controller = new AbortController()
    const loadUnread = async () => {
      try {
        const data = await readNativeUnread(publicKey)
        if (!controller.signal.aborted) {
          const count = data.ok && typeof data.unreadCount === "number" && Number.isSafeInteger(data.unreadCount) && data.unreadCount >= 0 ? data.unreadCount : null
          const seen = readSeenNotificationIndex(publicKey)
          const latest = count && seen !== null ? await readNativeNotifications(publicKey,-1,40) : null
          if (controller.signal.aborted) return
          const remaining = latest ? latest.notifications.filter(item => typeof item.Index === "number" && item.Index > seen!).length : count
          setUnreadCount(remaining && remaining > 0 ? remaining : null)
        }
      } catch {
        if (!controller.signal.aborted) setUnreadCount(null)
      }
    }
    void loadUnread()
    window.addEventListener("focus", loadUnread)
    window.addEventListener(NOTIFICATION_SEEN_EVENT, loadUnread)
    return () => {
      controller.abort()
      window.removeEventListener("focus", loadUnread)
      window.removeEventListener(NOTIFICATION_SEEN_EVENT, loadUnread)
    }
  }, [session?.publicKey])

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
  const title = <span className="inline-flex min-w-0 items-center gap-2">{copy.title}{unreadCount !== null ? <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-950/60 px-2 py-0.5 text-sm font-semibold text-emerald-300" aria-label={String(unreadCount) + " ongelezen meldingen"}><span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-400" />{unreadCount}</span> : null}</span>

  return (
    <main  className={`${styles.page} min-h-screen bg-black px-0 pb-8 pt-0 text-white sm:px-8 sm:py-2 lg:px-12`}>
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
        <header className="sticky top-0 z-30 mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-black px-4 py-1 sm:px-0">
          <div className="block">
            <h1 className="text-base font-semibold tracking-tight sm:text-2xl">{title}</h1>
          </div>
          <div data-notification-controls className="hidden w-full flex-nowrap items-center justify-end gap-2 py-1 sm:flex sm:w-auto sm:flex-wrap sm:justify-start sm:gap-2 sm:py-0"><div className="relative [&>button]:!grid [&>button]:!h-12 [&>button]:!w-12 [&>button]:!min-h-0 [&>button]:!place-items-center [&>button]:!rounded-full [&>button]:!p-0 [&>button]:!text-[0] sm:[&>button]:!inline-flex sm:[&>button]:!h-auto sm:[&>button]:!w-auto sm:[&>button]:!min-h-[38px] sm:[&>button]:!px-4 sm:[&>button]:!py-2 sm:[&>button]:!text-sm"><SponsorPlatform compact /><span className="pointer-events-none absolute inset-0 grid place-items-center text-xl leading-none text-[#9adbb2] sm:hidden" aria-hidden="true">💵</span></div></div>


        </header>

        {session ? <><PostComposeShortcut /></> : null}
        <NotificationCenter language={language} />
        </div>
        <aside className="min-w-0 self-start">
          <ViaRightPanels />
        </aside>
      </div>
    </main>
  )
}
