"use client"

import { FormEvent, useEffect, useRef, useState } from "react"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"

const STORAGE_KEY = "via:creator-quick-menu:v1"
const MAX_ITEMS = 12

type SavedCreator = { username: string }
type ViaProfileResponse = { ok?: boolean; profile?: { username?: string } }

type Copy = {
  kicker: string
  heading: string
  intro: string
  inputLabel: string
  placeholder: string
  checking: string
  add: string
  listLabel: string
  remove: string
  empty: string
  readError: string
  saveError: string
  enterFirst: string
  already: string
  limit: string
  checkingName: string
  notVerified: string
  saved: string
  checkError: string
  removed: string
}

const copy: Record<ViaLanguage, Copy> = {
  Dutch: {
    kicker: "Lokale snelkoppeling",
    heading: "Creator-snelmenu",
    intro: "Bewaar een kleine lijst met openbare DeSo-creators die je snel wilt terugvinden. VIA controleert eerst of het profiel bestaat. Deze versie blijft alleen in deze browser, doet geen DeSo-transactie en bewijst niet dat je het opgeslagen account beheert. Synchronisatie tussen apparaten blijft een aparte latere stap.",
    inputLabel: "DeSo creator-gebruikersnaam",
    placeholder: "DeSo-gebruikersnaam, met of zonder @",
    checking: "Controleren…",
    add: "Creator toevoegen",
    listLabel: "Opgeslagen creator-snelkoppelingen",
    remove: "Verwijderen",
    empty: "Nog geen lokale creator-snelkoppelingen.",
    readError: "Je lokale creator-snelkoppelingen konden niet uit deze browser worden gelezen.",
    saveError: "De snelkoppeling is voor dit bezoek aangepast maar kon niet lokaal worden opgeslagen.",
    enterFirst: "Voer eerst een DeSo-gebruikersnaam in.",
    already: "@{name} staat al in je snelmenu.",
    limit: "Dit lokale snelmenu is beperkt tot {max} creators.",
    checkingName: "@{name} controleren op DeSo…",
    notVerified: "@{name} kon niet als openbaar DeSo-profiel worden bevestigd en is daarom niet opgeslagen.",
    saved: "@{name} is op DeSo bevestigd en lokaal op dit apparaat opgeslagen.",
    checkError: "Het DeSo-profiel kon nu niet worden gecontroleerd. Er is niets opgeslagen.",
    removed: "@{name} is uit dit lokale snelmenu verwijderd.",
  },
  English: {
    kicker: "Local shortcut",
    heading: "Creator quick menu",
    intro: "Keep a small list of public DeSo creators you want to revisit. VIA checks that the profile exists before saving it. This version stays only in this browser, makes no DeSo transaction and does not prove control of the saved account. Cross-device syncing remains a separate later step.",
    inputLabel: "DeSo creator username",
    placeholder: "DeSo username, with or without @",
    checking: "Checking…",
    add: "Add creator",
    listLabel: "Saved creator shortcuts",
    remove: "Remove",
    empty: "No local creator shortcuts yet.",
    readError: "Your local creator shortcuts could not be read from this browser.",
    saveError: "The shortcut changed for this visit but could not be saved locally.",
    enterFirst: "Enter a DeSo username first.",
    already: "@{name} is already in your quick menu.",
    limit: "This local quick menu is limited to {max} creators.",
    checkingName: "Checking @{name} on DeSo…",
    notVerified: "@{name} could not be verified as a public DeSo profile, so it was not saved.",
    saved: "@{name} verified on DeSo and saved locally on this device.",
    checkError: "The DeSo profile could not be checked right now. Nothing was saved.",
    removed: "@{name} removed from this local quick menu.",
  },
  French: {
    kicker: "Raccourci local",
    heading: "Menu rapide des créateurs",
    intro: "Gardez une petite liste de créateurs DeSo publics à retrouver rapidement. VIA vérifie que le profil existe avant de l'enregistrer. Cette version reste dans ce navigateur, n'effectue aucune transaction DeSo et ne prouve pas le contrôle du compte enregistré. La synchronisation entre appareils reste une étape ultérieure séparée.",
    inputLabel: "Nom d'utilisateur du créateur DeSo",
    placeholder: "Nom DeSo, avec ou sans @",
    checking: "Vérification…",
    add: "Ajouter le créateur",
    listLabel: "Raccourcis créateurs enregistrés",
    remove: "Supprimer",
    empty: "Aucun raccourci créateur local pour le moment.",
    readError: "Les raccourcis créateurs locaux n'ont pas pu être lus dans ce navigateur.",
    saveError: "Le raccourci a changé pour cette visite mais n'a pas pu être enregistré localement.",
    enterFirst: "Saisissez d'abord un nom d'utilisateur DeSo.",
    already: "@{name} est déjà dans votre menu rapide.",
    limit: "Ce menu rapide local est limité à {max} créateurs.",
    checkingName: "Vérification de @{name} sur DeSo…",
    notVerified: "@{name} n'a pas pu être confirmé comme profil DeSo public et n'a donc pas été enregistré.",
    saved: "@{name} a été confirmé sur DeSo et enregistré localement sur cet appareil.",
    checkError: "Le profil DeSo ne peut pas être vérifié pour le moment. Rien n'a été enregistré.",
    removed: "@{name} a été supprimé de ce menu rapide local.",
  },
  Spanish: {
    kicker: "Acceso local",
    heading: "Menú rápido de creadores",
    intro: "Guarda una pequeña lista de creadores públicos de DeSo que quieras volver a visitar. VIA comprueba que el perfil existe antes de guardarlo. Esta versión permanece solo en este navegador, no realiza transacciones DeSo y no demuestra el control de la cuenta guardada. La sincronización entre dispositivos queda como un paso posterior independiente.",
    inputLabel: "Nombre de usuario del creador DeSo",
    placeholder: "Usuario DeSo, con o sin @",
    checking: "Comprobando…",
    add: "Añadir creador",
    listLabel: "Accesos de creadores guardados",
    remove: "Eliminar",
    empty: "Todavía no hay accesos locales de creadores.",
    readError: "No se pudieron leer los accesos locales de creadores de este navegador.",
    saveError: "El acceso cambió para esta visita, pero no pudo guardarse localmente.",
    enterFirst: "Introduce primero un nombre de usuario DeSo.",
    already: "@{name} ya está en tu menú rápido.",
    limit: "Este menú rápido local está limitado a {max} creadores.",
    checkingName: "Comprobando @{name} en DeSo…",
    notVerified: "@{name} no pudo verificarse como perfil público de DeSo y no se guardó.",
    saved: "@{name} se verificó en DeSo y se guardó localmente en este dispositivo.",
    checkError: "Ahora no se puede comprobar el perfil DeSo. No se guardó nada.",
    removed: "@{name} se eliminó de este menú rápido local.",
  },
  Chinese: {
    kicker: "本地快捷入口",
    heading: "创作者快捷菜单",
    intro: "保存一小组你想再次访问的公开 DeSo 创作者。VIA 会在保存前确认该公开资料存在。此版本只保存在当前浏览器中，不会发起 DeSo 交易，也不能证明你控制所保存的账户。跨设备同步将作为后续独立步骤处理。",
    inputLabel: "DeSo 创作者用户名",
    placeholder: "DeSo 用户名，可带或不带 @",
    checking: "正在检查…",
    add: "添加创作者",
    listLabel: "已保存的创作者快捷入口",
    remove: "移除",
    empty: "还没有本地创作者快捷入口。",
    readError: "无法从此浏览器读取本地创作者快捷入口。",
    saveError: "本次访问中的快捷入口已更改，但无法在本地保存。",
    enterFirst: "请先输入 DeSo 用户名。",
    already: "@{name} 已在你的快捷菜单中。",
    limit: "此本地快捷菜单最多保存 {max} 位创作者。",
    checkingName: "正在 DeSo 上检查 @{name}…",
    notVerified: "无法确认 @{name} 是公开 DeSo 资料，因此未保存。",
    saved: "已在 DeSo 上确认 @{name}，并在此设备本地保存。",
    checkError: "当前无法检查 DeSo 资料。没有保存任何内容。",
    removed: "已从本地快捷菜单移除 @{name}。",
  },
}

function normalizeUsername(value: string) {
  return value.trim().replace(/^@/, "").replace(/[^A-Za-z0-9_.-]/g, "").slice(0, 64)
}

function fill(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce((text, [key, value]) => text.replace(`{${key}}`, String(value)), template)
}

export default function CreatorQuickMenu() {
  const [items, setItems] = useState<SavedCreator[]>([])
  const [input, setInput] = useState("")
  const [status, setStatus] = useState("")
  const [checking, setChecking] = useState(false)
  const [language, setLanguage] = useState<ViaLanguage>("English")
  const checkController = useRef<AbortController | null>(null)
  const t = copy[language]

  useEffect(() => {
    const refreshLanguage = () => setLanguage(readViaLocalSettings().interfaceLanguage)
    refreshLanguage()
    window.addEventListener(VIA_SETTINGS_EVENT, refreshLanguage)
    return () => window.removeEventListener(VIA_SETTINGS_EVENT, refreshLanguage)
  }, [])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      if (!Array.isArray(parsed)) return
      const safeItems = parsed
        .map((item) => typeof item?.username === "string" ? normalizeUsername(item.username) : "")
        .filter(Boolean)
        .slice(0, MAX_ITEMS)
        .map((username) => ({ username }))
      setItems(safeItems)
    } catch {
      setStatus(t.readError)
    }
  }, [t.readError])

  function persist(next: SavedCreator[]) {
    setItems(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return true
    } catch {
      setStatus(t.saveError)
      return false
    }
  }

  async function addCreator(event: FormEvent) {
    event.preventDefault()
    checkController.current?.abort()
    const username = normalizeUsername(input)
    if (!username) {
      setStatus(t.enterFirst)
      return
    }
    if (items.some((item) => item.username.toLowerCase() === username.toLowerCase())) {
      setStatus(fill(t.already, { name: username }))
      return
    }
    if (items.length >= MAX_ITEMS) {
      setStatus(fill(t.limit, { max: MAX_ITEMS }))
      return
    }

    const controller = new AbortController()
    checkController.current = controller
    setChecking(true)
    setStatus(fill(t.checkingName, { name: username }))
    try {
      const response = await fetch(`/api/via/profile?identity=${encodeURIComponent(username)}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: controller.signal,
      })
      const data = response.ok ? (await response.json()) as ViaProfileResponse : null
      const verifiedUsername = normalizeUsername(data?.profile?.username ?? "")
      if (!response.ok || !data?.ok || !verifiedUsername) {
        setStatus(fill(t.notVerified, { name: username }))
        return
      }
      if (items.some((item) => item.username.toLowerCase() === verifiedUsername.toLowerCase())) {
        setStatus(fill(t.already, { name: verifiedUsername }))
        return
      }
      const next = [...items, { username: verifiedUsername }]
      if (persist(next)) setStatus(fill(t.saved, { name: verifiedUsername }))
      setInput("")
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) setStatus(t.checkError)
    } finally {
      if (checkController.current === controller) {
        checkController.current = null
        setChecking(false)
      }
    }
  }

  useEffect(() => () => checkController.current?.abort(), [])

  function removeCreator(username: string) {
    const next = items.filter((item) => item.username !== username)
    if (persist(next)) setStatus(fill(t.removed, { name: username }))
  }

  return (
    <section className="mt-8 rounded-[14px] border border-zinc-800/80 bg-zinc-950/45 p-5" aria-labelledby="creator-quick-menu-heading" aria-busy={checking}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">{t.kicker}</p>
      <h2 id="creator-quick-menu-heading" className="mt-2 text-2xl font-semibold text-zinc-100">{t.heading}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">{t.intro}</p>
      <form onSubmit={addCreator} className="mt-4 flex max-w-2xl flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="creator-quick-menu-input">{t.inputLabel}</label>
        <input id="creator-quick-menu-input" value={input} onChange={(event) => setInput(event.target.value)} autoCapitalize="none" autoCorrect="off" spellCheck={false} maxLength={65} placeholder={t.placeholder} disabled={checking} className="min-w-0 flex-1 rounded-[12px] border border-zinc-700/80 bg-black/35 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-[#8fd4a9]/70 focus:ring-2 focus:ring-[#8fd4a9]/10 disabled:cursor-wait disabled:opacity-60" />
        <button type="submit" disabled={checking} className="rounded-[12px] border border-[#8fd4a9]/45 bg-transparent px-5 py-3 text-sm font-medium text-[#9adbb2] hover:border-[#8fd4a9]/70 hover:bg-[#0c1711]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/20 disabled:cursor-wait disabled:opacity-60">{checking ? t.checking : t.add}</button>
      </form>
      <p className="mt-3 min-h-5 text-sm text-zinc-500" role="status" aria-live="polite">{status}</p>
      {items.length ? (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3" aria-label={t.listLabel}>
          {items.map((item) => (
            <li key={item.username} className="flex items-center justify-between gap-3 rounded-[12px] border border-zinc-800/80 bg-black/30 p-3">
              <a href={`/collection?account=${encodeURIComponent(item.username)}#collection-controls`} className="min-h-10 min-w-0 flex-1 rounded-[9px] px-2 py-2 text-sm font-medium text-zinc-200 hover:bg-[#0c1711]/45 hover:text-[#9adbb2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/15">@{item.username}</a>
              <button type="button" onClick={() => removeCreator(item.username)} className="min-h-10 rounded-[9px] border border-zinc-800 px-3 text-xs text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/15">{t.remove}</button>
            </li>
          ))}
        </ul>
      ) : <p className="mt-4 text-sm text-zinc-600">{t.empty}</p>}
    </section>
  )
}
