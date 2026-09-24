"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Search, SquarePen } from "lucide-react"
import { restoreIdentitySession, VIA_IDENTITY_EVENT } from "../deso-identity-session"
import { fetchDeSo } from "../deso-api"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"

type ThreadEntry = {
  ChatType?: string
  SenderAccessGroupOwnerPublicKeyBase58Check?: string
  RecipientAccessGroupOwnerPublicKeyBase58Check?: string
  SenderPublicKeyBase58Check?: string
  RecipientPublicKeyBase58Check?: string
  TimestampNanos?: number
  EncryptedText?: string
}

type Profile = {
  Username?: string
  PublicKeyBase58Check?: string
  ProfilePic?: string
}

type ThreadsResponse = {
  OrderedContactsWithMessages?: ThreadEntry[]
  MessageThreads?: ThreadEntry[]
  NewMessageEntries?: ThreadEntry[]
  PublicKeyToProfileEntryResponse?: Record<string, Profile>
  PublicKeyToProfileEntry?: Record<string, Profile>
}

type Copy = {
  kicker: string
  title: string
  intro: string
  back: string
  search: string
  noAccount: string
  noAccountText: string
  loading: string
  unavailable: string
  empty: string
  encrypted: string
  identityNote: string
  newMessage: string
  selectConversation: string
}

const COPY: Record<ViaLanguage | "Hindi", Copy> = {
  Dutch: {
    kicker: "VIA · BERICHTEN",
    title: "Berichten",
    intro: "Privégesprekken via DeSo. Gesprekken worden rechtstreeks van het DeSo-netwerk geladen.",
    back: "Terug naar VIA",
    search: "Zoek gesprekken",
    noAccount: "Geen DeSo-account verbonden",
    noAccountText: "Log in met DeSo Identity om je privégesprekken te laden.",
    loading: "Gesprekken laden…",
    unavailable: "Berichten zijn tijdelijk niet beschikbaar.",
    empty: "Nog geen gesprekken gevonden.",
    encrypted: "Versleuteld DeSo-bericht",
    identityNote: "Lezen en verzenden gebruikt DeSo Identity voor encryptie en decryptie. VIA slaat privéberichten niet zelf op.",
    newMessage: "Nieuw bericht",
    selectConversation: "Selecteer een gesprek",
  },
  English: {
    kicker: "VIA · MESSAGES",
    title: "Messages",
    intro: "Private conversations via DeSo. Threads are loaded directly from the DeSo network.",
    back: "Back to VIA",
    search: "Search conversations",
    noAccount: "No DeSo account connected",
    noAccountText: "Log in with DeSo Identity to load your private conversations.",
    loading: "Loading conversations…",
    unavailable: "Messages are temporarily unavailable.",
    empty: "No conversations found yet.",
    encrypted: "Encrypted DeSo message",
    identityNote: "Reading and sending uses DeSo Identity for encryption and decryption. VIA does not store private messages itself.",
    newMessage: "New message",
    selectConversation: "Select a conversation",
  },
  French: {
    kicker: "VIA · MESSAGES",
    title: "Messages",
    intro: "Conversations privées via DeSo. Les discussions sont chargées directement depuis le réseau DeSo.",
    back: "Retour à VIA",
    search: "Rechercher des conversations",
    noAccount: "Aucun compte DeSo connecté",
    noAccountText: "Connectez-vous avec DeSo Identity pour charger vos conversations privées.",
    loading: "Chargement des conversations…",
    unavailable: "Les messages sont temporairement indisponibles.",
    empty: "Aucune conversation trouvée.",
    encrypted: "Message DeSo chiffré",
    identityNote: "La lecture et l’envoi utilisent DeSo Identity pour le chiffrement et le déchiffrement. VIA ne stocke pas lui-même les messages privés.",
    newMessage: "Nouveau message",
    selectConversation: "Sélectionnez une conversation",
  },
  Spanish: {
    kicker: "VIA · MENSAJES",
    title: "Mensajes",
    intro: "Conversaciones privadas mediante DeSo. Los hilos se cargan directamente desde la red DeSo.",
    back: "Volver a VIA",
    search: "Buscar conversaciones",
    noAccount: "No hay una cuenta DeSo conectada",
    noAccountText: "Inicia sesión con DeSo Identity para cargar tus conversaciones privadas.",
    loading: "Cargando conversaciones…",
    unavailable: "Los mensajes no están disponibles temporalmente.",
    empty: "Aún no se encontraron conversaciones.",
    encrypted: "Mensaje DeSo cifrado",
    identityNote: "La lectura y el envío usan DeSo Identity para cifrar y descifrar. VIA no almacena los mensajes privados.",
    newMessage: "Nuevo mensaje",
    selectConversation: "Selecciona una conversación",
  },
  Chinese: {
    kicker: "VIA · 消息",
    title: "消息",
    intro: "通过 DeSo 进行私人对话。会话直接从 DeSo 网络加载。",
    back: "返回 VIA",
    search: "搜索会话",
    noAccount: "未连接 DeSo 账户",
    noAccountText: "使用 DeSo Identity 登录以加载私人会话。",
    loading: "正在加载会话…",
    unavailable: "消息暂时不可用。",
    empty: "尚未找到会话。",
    encrypted: "已加密的 DeSo 消息",
    identityNote: "读取和发送通过 DeSo Identity 完成加密和解密。VIA 不自行存储私人消息。",
    newMessage: "新消息",
    selectConversation: "选择一个会话",
  },
  Hindi: {
    kicker: "VIA · संदेश", title: "संदेश", intro: "DeSo के माध्यम से निजी बातचीत। वार्तालाप सीधे DeSo नेटवर्क से लोड होते हैं।",
    back: "VIA पर वापस जाएँ", search: "बातचीत खोजें", noAccount: "कोई DeSo खाता कनेक्ट नहीं है",
    noAccountText: "अपनी निजी बातचीत लोड करने के लिए DeSo Identity से लॉग इन करें।", loading: "बातचीत लोड हो रही है…",
    unavailable: "संदेश अस्थायी रूप से उपलब्ध नहीं हैं।", empty: "अभी कोई बातचीत नहीं मिली।", encrypted: "एन्क्रिप्टेड DeSo संदेश",
    identityNote: "पढ़ने और भेजने में encryption और decryption के लिए DeSo Identity का उपयोग होता है। VIA निजी संदेश स्वयं संग्रहीत नहीं करता।",
    newMessage: "नया संदेश", selectConversation: "बातचीत चुनें",
  },
}

function shortKey(value: string) {
  return value ? `${value.slice(0, 8)}…${value.slice(-5)}` : "DeSo"
}

function safeImage(value?: string) {
  if (!value) return undefined
  try {
    const url = new URL(value)
    return url.protocol === "https:" ? url.toString() : undefined
  } catch {
    return undefined
  }
}

function threadList(data: ThreadsResponse) {
  if (Array.isArray(data.OrderedContactsWithMessages)) return data.OrderedContactsWithMessages
  if (Array.isArray(data.MessageThreads)) return data.MessageThreads
  if (Array.isArray(data.NewMessageEntries)) return data.NewMessageEntries
  return []
}

function counterpartKey(thread: ThreadEntry, self: string) {
  const keys = [
    thread.SenderAccessGroupOwnerPublicKeyBase58Check,
    thread.RecipientAccessGroupOwnerPublicKeyBase58Check,
    thread.SenderPublicKeyBase58Check,
    thread.RecipientPublicKeyBase58Check,
  ].filter((value): value is string => Boolean(value))
  return keys.find((key) => key !== self) ?? keys[0] ?? ""
}

function formatThreadTime(nanos?: number) {
  if (!nanos || !Number.isFinite(nanos)) return ""
  const ms = nanos / 1_000_000
  const date = new Date(ms)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString(undefined, { day: "2-digit", month: "short" })
}

export default function MessagesClient() {
  const [language, setLanguage] = useState<ViaLanguage>("English")
  const [publicKey, setPublicKey] = useState("")
  const [threads, setThreads] = useState<ThreadEntry[]>([])
  const [profiles, setProfiles] = useState<Record<string, Profile>>({})
  const [selectedKey, setSelectedKey] = useState("")
  const [search, setSearch] = useState("")
  const [mobileConversationOpen, setMobileConversationOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const syncLanguage = () => setLanguage(readViaLocalSettings().interfaceLanguage)
    const syncIdentity = () => setPublicKey(restoreIdentitySession()?.publicKey ?? "")
    syncLanguage()
    syncIdentity()
    window.addEventListener(VIA_SETTINGS_EVENT, syncLanguage)
    window.addEventListener(VIA_IDENTITY_EVENT, syncIdentity)
    return () => {
      window.removeEventListener(VIA_SETTINGS_EVENT, syncLanguage)
      window.removeEventListener(VIA_IDENTITY_EVENT, syncIdentity)
    }
  }, [])

  useEffect(() => {
    if (!publicKey) {
      setThreads([])
      setProfiles({})
      setSelectedKey("")
      setLoading(false)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    setError("")
    void fetchDeSo("get-user-dm-threads-ordered-by-timestamp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ UserPublicKeyBase58Check: publicKey }),
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("MESSAGES_UNAVAILABLE")
        return await response.json() as ThreadsResponse
      })
      .then((data) => {
        const nextThreads = threadList(data)
        setThreads(nextThreads)
        setProfiles(data.PublicKeyToProfileEntryResponse ?? data.PublicKeyToProfileEntry ?? {})
        const first = nextThreads[0] ? counterpartKey(nextThreads[0], publicKey) : ""
        setSelectedKey((current) => current || first)
      })
      .catch((reason) => {
        if (!(reason instanceof DOMException && reason.name === "AbortError")) setError("MESSAGES_UNAVAILABLE")
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [publicKey])

  const t = COPY[language]

  const rows = useMemo(() => threads.map((thread, index) => {
    const key = counterpartKey(thread, publicKey)
    const profile = profiles[key]
    const name = profile?.Username ? `@${profile.Username}` : shortKey(key)
    return { thread, key, profile, name, index }
  }).filter((row) => {
    const needle = search.trim().toLowerCase()
    return !needle || row.name.toLowerCase().includes(needle) || row.key.toLowerCase().includes(needle)
  }), [threads, profiles, publicKey, search])

  const selected = rows.find((row) => row.key === selectedKey) ?? rows[0]

  return (
    <main className="min-h-screen bg-[#050807] px-4 py-6 text-zinc-100 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="via-messages-page-header mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8fd4a9]">{t.kicker}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">{t.intro}</p>
          </div>
          <Link href="/" aria-label={t.back} title={t.back} className="via-messages-back inline-flex min-h-10 items-center gap-2 rounded-[10px] border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:border-[#8fd4a9]/50"><ArrowLeft className="h-4 w-4" aria-hidden="true" /><span>{t.back}</span></Link>
        </header>

        {!publicKey ? (
          <section className="rounded-[16px] border border-zinc-800 bg-zinc-950/50 p-6">
            <h2 className="text-xl font-medium">{t.noAccount}</h2>
            <p className="mt-2 text-sm text-zinc-400">{t.noAccountText}</p>
          </section>
        ) : (
          <>
            <div className="grid min-h-[620px] overflow-hidden rounded-[18px] border border-[#8fd4a9]/20 bg-[#07100b]/80 lg:grid-cols-[360px_minmax(0,1fr)]">
              <aside className="via-messages-inbox border-b border-zinc-800 lg:border-b-0 lg:border-r">
                <div className="via-messages-search flex items-center gap-2 border-b border-zinc-800 p-3">
                  <Search className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden="true" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.search} className="min-w-0 flex-1 rounded-[10px] border border-zinc-800 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[#8fd4a9]/50" />
                  <button type="button" disabled title={t.identityNote} aria-label={t.newMessage} className="grid h-10 w-10 place-items-center rounded-[10px] border border-zinc-800 text-zinc-600"><SquarePen className="h-4 w-4" aria-hidden="true" /></button>
                </div>
                <div className="max-h-[560px] overflow-y-auto">
                  {loading ? <p className="p-4 text-sm text-zinc-500">{t.loading}</p> : null}
                  {error ? <p className="p-4 text-sm text-amber-300">{t.unavailable}</p> : null}
                  {!loading && !error && rows.length === 0 ? <p className="p-4 text-sm text-zinc-500">{t.empty}</p> : null}
                  {rows.map(({ thread, key, profile, name, index }) => {
                    const image = safeImage(profile?.ProfilePic)
                    const active = (selected?.key ?? selectedKey) === key
                    return (
                      <button key={key || index} type="button" onClick={() => { setSelectedKey(key); setMobileConversationOpen(true) }} className={`flex w-full items-center gap-3 border-b border-zinc-900 px-4 py-3 text-left transition-colors ${active ? "bg-[#10251a]" : "hover:bg-white/[.03]"}`}>
                        {image ? <img src={image} alt="" className="h-10 w-10 rounded-full object-cover" referrerPolicy="no-referrer" /> : <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#173326] text-sm font-bold text-[#9adbb2]">{name.replace(/^@/, "").slice(0,1).toUpperCase()}</span>}
                        <span className="min-w-0 flex-1">
                          <strong className="block truncate text-sm text-zinc-100">{name}</strong>
                          <span className="block truncate text-xs text-zinc-500">{t.encrypted}</span>
                        </span>
                        <span className="text-[10px] text-zinc-600">{formatThreadTime(thread.TimestampNanos)}</span>
                      </button>
                    )
                  })}
                </div>
              </aside>

              <section className={`via-messages-conversation flex min-h-[420px] flex-col ${mobileConversationOpen ? "via-messages-conversation-open" : ""}`}>
                {selected ? (
                  <>
                    <div className="flex items-center gap-3 border-b border-zinc-800 px-5 py-4">
                      <button type="button" onClick={() => setMobileConversationOpen(false)} aria-label={t.back} className="via-messages-thread-back hidden h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-zinc-800 text-zinc-300"><ArrowLeft className="h-4 w-4" aria-hidden="true" /></button>
                      <div className="min-w-0"><strong className="block truncate text-base">{selected.name}</strong>
                      <p className="mt-1 truncate text-xs text-zinc-500">{shortKey(selected.key)}</p></div>
                    </div>
                    <div className="flex flex-1 items-center justify-center p-6">
                      <div className="max-w-xl rounded-[16px] border border-[#8fd4a9]/15 bg-black/20 p-5 text-center">
                        <p className="text-sm leading-6 text-zinc-400">{t.identityNote}</p>
                      </div>
                    </div>
                    <div className="border-t border-zinc-800 p-4">
                      <div className="flex gap-2">
                        <textarea disabled rows={2} placeholder={t.encrypted} className="min-w-0 flex-1 resize-none rounded-[12px] border border-zinc-800 bg-black/25 px-3 py-2 text-sm text-zinc-500" />
                        <button type="button" disabled className="rounded-[12px] border border-zinc-800 px-4 text-sm font-semibold text-zinc-600">{t.newMessage}</button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="grid flex-1 place-items-center p-6 text-sm text-zinc-500">{t.selectConversation}</div>
                )}
              </section>
            </div>

            <p className="mt-3 text-xs leading-5 text-zinc-600">{t.identityNote}</p>
          </>
        )}
      </div>
      <style>{`
        @media (max-width: 720px) {
          .via-messages-page-header { margin-bottom: 12px; align-items: center; }
          .via-messages-page-header h1 { font-size: 24px; margin-top: 4px; }
          .via-messages-page-header p:not(.text-xs) { display: none; }
          .via-messages-back { width: 40px; min-height: 40px; padding: 0; justify-content: center; border-radius: 12px; }
          .via-messages-back span { display: none; }
          .via-messages-inbox { border-bottom: 0; }
          .via-messages-search { position: sticky; top: 0; z-index: 2; background: rgba(5,8,7,.96); }
          .via-messages-conversation { display: none; min-height: 360px; }
          .via-messages-conversation.via-messages-conversation-open { display: flex; }
          .via-messages-conversation-open + * { display: none; }
          .via-messages-inbox:has(+ .via-messages-conversation-open) { display: none; }
          .via-messages-thread-back { display: grid; }
        }
      `}</style>
    </main>
  )
}
