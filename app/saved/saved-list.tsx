"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { SAVED_KEY, type SavedItem } from "./save-button"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"

function isSafeViaHref(href: string) {
  return href.startsWith("/") && !href.startsWith("//")
}

function readSaved(): SavedItem[] {
  try {
    const raw = window.localStorage.getItem(SAVED_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is SavedItem =>
      Boolean(item) &&
      typeof item.title === "string" &&
      typeof item.href === "string" &&
      isSafeViaHref(item.href) &&
      typeof item.kind === "string" &&
      typeof item.savedAt === "string"
    ).slice(0, 100)
  } catch {
    return []
  }
}

const COPY: Record<ViaLanguage, { loading: string; empty: string; hint: string; open: string; remove: string }> = {
  English: { loading: "Loading local bookmarks…", empty: "Nothing saved locally yet", hint: "Older saved items remain in this browser. Use Save to keep an item here.", open: "Open", remove: "Remove" },
  Dutch: { loading: "Lokale bladwijzers laden…", empty: "Nog niets lokaal opgeslagen", hint: "Eerder opgeslagen items blijven in deze browser. Gebruik Opslaan om iets te bewaren.", open: "Openen", remove: "Verwijderen" },
  French: { loading: "Chargement des favoris locaux…", empty: "Aucun favori local", hint: "Les anciens éléments enregistrés restent dans ce navigateur. Utilisez Enregistrer pour conserver un élément.", open: "Ouvrir", remove: "Supprimer" },
  Spanish: { loading: "Cargando guardados locales…", empty: "Todavía no hay guardados locales", hint: "Los elementos guardados anteriormente permanecen en este navegador. Usa Guardar para conservar uno.", open: "Abrir", remove: "Eliminar" },
  Chinese: { loading: "正在加载本地书签…", empty: "尚无本地保存的内容", hint: "之前保存的内容仍留在此浏览器中。使用保存功能可保留内容。", open: "打开", remove: "移除" },
  Hindi: { loading: "स्थानीय बुकमार्क लोड हो रहे हैं…", empty: "अभी कोई स्थानीय बुकमार्क नहीं है", hint: "पहले सहेजे गए आइटम इसी ब्राउज़र में रहते हैं। किसी आइटम को रखने के लिए सेव का उपयोग करें।", open: "खोलें", remove: "हटाएँ" },
}

export default function SavedList() {
  const [language, setLanguage] = useState<ViaLanguage>("English")
  const copy = COPY[language] ?? COPY.English

  useEffect(() => {
    const refresh = () => setLanguage(readViaLocalSettings().interfaceLanguage)
    refresh()
    window.addEventListener(VIA_SETTINGS_EVENT, refresh)
    return () => window.removeEventListener(VIA_SETTINGS_EVENT, refresh)
  }, [])
  const [items, setItems] = useState<SavedItem[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setItems(readSaved())
    setReady(true)
  }, [])

  function remove(href: string) {
    try {
      const next = items.filter((item) => item.href !== href)
      window.localStorage.setItem(SAVED_KEY, JSON.stringify(next))
      setItems(next)
    } catch {
      // Keep the visible list unchanged when local browser storage is unavailable.
    }
  }

  if (!ready) {
    return <p className="text-sm text-zinc-500">{copy.loading}</p>
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="font-medium text-white">{copy.empty}</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">{copy.hint}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <article key={item.href} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8fd4a9]">{item.kind}</p>
          <h2 className="mt-2 font-medium text-white">{item.title}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={item.href} className="rounded-full border border-[#285f40] px-3 py-2 text-sm text-[#9adbb2] hover:border-[#8fd4a9]/70">{copy.open}</Link>
            <button type="button" onClick={() => remove(item.href)} className="rounded-full border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:border-zinc-500">{copy.remove}</button>
          </div>
        </article>
      ))}
    </div>
  )
}
