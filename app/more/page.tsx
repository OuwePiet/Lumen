"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"

type Copy = {
  kicker: string
  title: string
  intro: string
  settings: string
  settingsText: string
  openSettings: string
  help: string
  helpText: string
  parked: string
  back: string
}

const COPY: Record<ViaLanguage, Copy> = {
  Dutch: {
    kicker: "VIA · MEER",
    title: "Meer",
    intro: "Secundaire VIA-functies op één vaste plek.",
    settings: "Instellingen",
    settingsText: "Beheer je lokale VIA-voorkeuren, standaard posttaal, feedkeuze en lokale conceptgegevens.",
    openSettings: "Open instellingen",
    help: "Help",
    helpText: "Ondersteuning hoort hier. De uiteindelijke VIA-helpactie wordt pas gekoppeld zodra het echte supportadres definitief is vastgelegd.",
    parked: "Nog niet gekoppeld",
    back: "Terug naar VIA",
  },
  English: {
    kicker: "VIA · MORE",
    title: "More",
    intro: "Secondary VIA functions in one fixed place.",
    settings: "Settings",
    settingsText: "Manage your local VIA preferences, default post language, feed choice and local draft data.",
    openSettings: "Open settings",
    help: "Help",
    helpText: "Support belongs here. The final VIA help action will only be connected after the real support address is confirmed.",
    parked: "Not connected yet",
    back: "Back to VIA",
  },
  French: {
    kicker: "VIA · PLUS",
    title: "Plus",
    intro: "Les fonctions VIA secondaires réunies au même endroit.",
    settings: "Paramètres",
    settingsText: "Gérez vos préférences VIA locales, la langue de publication par défaut, le flux et les brouillons locaux.",
    openSettings: "Ouvrir les paramètres",
    help: "Aide",
    helpText: "L’assistance appartient ici. L’action d’aide VIA ne sera connectée qu’après confirmation de l’adresse d’assistance réelle.",
    parked: "Pas encore connecté",
    back: "Retour à VIA",
  },
  Spanish: {
    kicker: "VIA · MÁS",
    title: "Más",
    intro: "Funciones secundarias de VIA reunidas en un solo lugar.",
    settings: "Ajustes",
    settingsText: "Gestiona tus preferencias locales de VIA, idioma de publicación, feed y borradores locales.",
    openSettings: "Abrir ajustes",
    help: "Ayuda",
    helpText: "El soporte pertenece aquí. La acción de ayuda de VIA solo se conectará cuando se confirme la dirección de soporte real.",
    parked: "Aún no conectado",
    back: "Volver a VIA",
  },
  Chinese: {
    kicker: "VIA · 更多",
    title: "更多",
    intro: "将 VIA 的次要功能集中到一个固定位置。",
    settings: "设置",
    settingsText: "管理 VIA 本地偏好、默认发帖语言、Feed 选择和本地草稿数据。",
    openSettings: "打开设置",
    help: "帮助",
    helpText: "支持功能属于这里。只有在确认真实支持地址后，VIA 帮助操作才会正式连接。",
    parked: "尚未连接",
    back: "返回 VIA",
  },
  Hindi: {
    kicker: "VIA · MORE",
    title: "More",
    intro: "Secondary VIA functions in one fixed place.",
    settings: "Settings",
    settingsText: "Manage your local VIA preferences, default post language, feed choice and local draft data.",
    openSettings: "Open settings",
    help: "Help",
    helpText: "Support belongs here. The final VIA help action will only be connected after the real support address is confirmed.",
    parked: "Not connected yet",
    back: "Back to VIA",
  },
}

const card = "rounded-[14px] border border-zinc-800/80 bg-zinc-950/50 p-5 sm:p-6"
const action = "inline-flex min-h-10 items-center rounded-[10px] border border-[#8fd4a9]/45 px-3 py-2 text-sm font-semibold text-[#9adbb2] transition-colors hover:border-[#8fd4a9]/70 hover:bg-[#0c1711]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/20"
const disabled = "inline-flex min-h-10 items-center rounded-[10px] border border-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-600 opacity-80"

export default function MorePage() {
  const [language, setLanguage] = useState<ViaLanguage>("Dutch")

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

  const t = COPY[language]

  return (
    <main className="min-h-screen bg-[#050807] px-5 py-8 text-zinc-100 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8fd4a9]">{t.kicker}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-[2.25rem]">{t.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">{t.intro}</p>
          </div>
          <Link href="/" className={action}>{t.back}</Link>
        </header>

        <section className="grid gap-5 sm:grid-cols-2" aria-label={t.title}>
          <article className={card}>
            <h2 className="text-xl font-semibold">{t.settings}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{t.settingsText}</p>
            <Link href="/settings" className={`${action} mt-5`}>{t.openSettings}</Link>
          </article>

          <article className={card}>
            <h2 className="text-xl font-semibold">{t.help}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{t.helpText}</p>
            <span aria-disabled="true" className={`${disabled} mt-5`}>{t.parked}</span>
          </article>
        </section>
      </div>
    </main>
  )
}
