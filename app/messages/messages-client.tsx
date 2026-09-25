"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Search, SquarePen } from "lucide-react"
import { restoreIdentitySession, VIA_IDENTITY_EVENT } from "../deso-identity-session"
import ParticipationGate from "../participation-gate"
import { fetchDeSo } from "../deso-api"
import { decryptViaMessages, encryptViaMessage, signViaMessageTransaction } from "../deso-identity-messages"
import { constructViaDMTransaction, getViaDefaultDMGroups, submitViaSignedTransaction } from "./deso-dm-transaction"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"

type AccessGroupInfo = {
  OwnerPublicKeyBase58Check?: string
  AccessGroupPublicKeyBase58Check?: string
  AccessGroupKeyName?: string
}

type MessageInfo = {
  EncryptedText?: string
  TimestampNanos?: number
  TimestampNanosString?: string
  ExtraData?: Record<string, string>
}

type ThreadEntry = {
  ChatType?: string
  SenderInfo?: AccessGroupInfo
  RecipientInfo?: AccessGroupInfo
  MessageInfo?: MessageInfo
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

type DMThreadResponse = {
  ThreadMessages?: ThreadEntry[]
  PublicKeyToProfileEntryResponse?: Record<string, Profile>
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
  loadMore: string
  typeMessage: string
  send: string
  recipient: string
  cancel: string
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
    loadMore: "Laad meer", typeMessage: "Typ een bericht…", send: "Verstuur", recipient: "DeSo gebruikersnaam of public key", cancel: "Annuleer",
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
    loadMore: "Load more", typeMessage: "Type a message…", send: "Send", recipient: "DeSo username or public key", cancel: "Cancel",
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
    loadMore: "Charger plus", typeMessage: "Écrivez un message…", send: "Envoyer", recipient: "Nom DeSo ou clé publique", cancel: "Annuler",
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
    loadMore: "Cargar más", typeMessage: "Escribe un mensaje…", send: "Enviar", recipient: "Usuario DeSo o clave pública", cancel: "Cancelar",
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
    loadMore: "加载更多", typeMessage: "输入消息…", send: "发送", recipient: "DeSo 用户名或公钥", cancel: "取消",
  },
  Hindi: {
    kicker: "VIA · संदेश", title: "संदेश", intro: "DeSo के माध्यम से निजी बातचीत। वार्तालाप सीधे DeSo नेटवर्क से लोड होते हैं।",
    back: "VIA पर वापस जाएँ", search: "बातचीत खोजें", noAccount: "कोई DeSo खाता कनेक्ट नहीं है",
    noAccountText: "अपनी निजी बातचीत लोड करने के लिए DeSo Identity से लॉग इन करें।", loading: "बातचीत लोड हो रही है…",
    unavailable: "संदेश अस्थायी रूप से उपलब्ध नहीं हैं।", empty: "अभी कोई बातचीत नहीं मिली।", encrypted: "एन्क्रिप्टेड DeSo संदेश",
    identityNote: "पढ़ने और भेजने में encryption और decryption के लिए DeSo Identity का उपयोग होता है। VIA निजी संदेश स्वयं संग्रहीत नहीं करता।",
    newMessage: "नया संदेश", selectConversation: "बातचीत चुनें", loadMore: "और लोड करें", typeMessage: "संदेश लिखें…", send: "भेजें", recipient: "DeSo उपयोगकर्ता नाम या public key", cancel: "रद्द करें",
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
    thread.SenderInfo?.OwnerPublicKeyBase58Check,
    thread.RecipientInfo?.OwnerPublicKeyBase58Check,
    thread.SenderAccessGroupOwnerPublicKeyBase58Check,
    thread.RecipientAccessGroupOwnerPublicKeyBase58Check,
    thread.SenderPublicKeyBase58Check,
    thread.RecipientPublicKeyBase58Check,
  ].filter((value): value is string => Boolean(value))
  return keys.find((key) => key !== self) ?? keys[0] ?? ""
}

function accessGroupFor(thread: ThreadEntry, owner: string) {
  if (thread.SenderInfo?.OwnerPublicKeyBase58Check === owner) return thread.SenderInfo
  if (thread.RecipientInfo?.OwnerPublicKeyBase58Check === owner) return thread.RecipientInfo
  return undefined
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
  const [threadMessages, setThreadMessages] = useState<ThreadEntry[]>([])
  const [threadLoading, setThreadLoading] = useState(false)
  const [threadError, setThreadError] = useState("")
  const [threadHasMore, setThreadHasMore] = useState(false)
  const [decryptedMessages, setDecryptedMessages] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState("")
  const [newMessageOpen, setNewMessageOpen] = useState(false)
  const [recipientInput, setRecipientInput] = useState("")
  const [recipientResults, setRecipientResults] = useState<Profile[]>([])
  const [recipientLoading, setRecipientLoading] = useState(false)

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

  useEffect(() => {
    if (!publicKey || !selected) {
      setThreadMessages([])
      setThreadError("")
      setThreadLoading(false)
      return
    }

    const userGroup = accessGroupFor(selected.thread, publicKey)
    const partyGroup = accessGroupFor(selected.thread, selected.key)
    if (!userGroup?.AccessGroupKeyName || !partyGroup?.AccessGroupKeyName) {
      setThreadMessages([])
      setThreadError("")
      setThreadLoading(false)
      return
    }

    const controller = new AbortController()
    setThreadLoading(true)
    setThreadError("")
    void fetchDeSo("get-paginated-messages-for-dm-thread", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        UserGroupOwnerPublicKeyBase58Check: publicKey,
        UserGroupKeyName: userGroup.AccessGroupKeyName,
        PartyGroupOwnerPublicKeyBase58Check: selected.key,
        PartyGroupKeyName: partyGroup.AccessGroupKeyName,
        StartTimeStampString: (Date.now() * 1_000_000).toString(),
        MaxMessagesToFetch: 25,
      }),
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("MESSAGES_UNAVAILABLE")
        return await response.json() as DMThreadResponse
      })
      .then((data) => {
        const messages = Array.isArray(data.ThreadMessages) ? data.ThreadMessages : []
        setThreadMessages(messages)
        setThreadHasMore(messages.length === 25)
      })
      .catch((reason) => {
        if (!(reason instanceof DOMException && reason.name === "AbortError")) setThreadError("MESSAGES_UNAVAILABLE")
      })
      .finally(() => setThreadLoading(false))

    return () => controller.abort()
  }, [publicKey, selected?.key, selected?.thread])

  useEffect(() => {
    if (!publicKey || threadMessages.length === 0) {
      setDecryptedMessages({})
      return
    }

    const encryptedMessages = threadMessages.flatMap((message) => {
      const encryptedHex = message.MessageInfo?.EncryptedText ?? message.EncryptedText
      if (!encryptedHex) return []
      const senderOwner = message.SenderInfo?.OwnerPublicKeyBase58Check ?? message.SenderPublicKeyBase58Check ?? ""
      const recipientOwner = message.RecipientInfo?.OwnerPublicKeyBase58Check ?? message.RecipientPublicKeyBase58Check ?? ""
      const isSender = senderOwner === publicKey
      const publicKeyForDecrypt = isSender
        ? message.RecipientInfo?.AccessGroupPublicKeyBase58Check ?? recipientOwner
        : message.SenderInfo?.AccessGroupPublicKeyBase58Check ?? senderOwner
      if (!publicKeyForDecrypt) return []
      return [{
        EncryptedHex: encryptedHex,
        PublicKey: publicKeyForDecrypt,
        IsSender: isSender,
        Legacy: false,
        Version: 3,
        SenderMessagingPublicKey: message.SenderInfo?.AccessGroupPublicKeyBase58Check,
        SenderMessagingGroupKeyName: message.SenderInfo?.AccessGroupKeyName,
        RecipientMessagingPublicKey: message.RecipientInfo?.AccessGroupPublicKeyBase58Check,
        RecipientMessagingGroupKeyName: message.RecipientInfo?.AccessGroupKeyName,
      }]
    })

    if (encryptedMessages.length === 0) {
      setDecryptedMessages({})
      return
    }

    let cancelled = false
    void decryptViaMessages(publicKey, encryptedMessages)
      .then((result) => {
        if (cancelled) return
        const readable = Object.fromEntries(Object.entries(result).filter((entry): entry is [string, string] => typeof entry[1] === "string"))
        setDecryptedMessages(readable)
      })
      .catch(() => {
        if (!cancelled) setDecryptedMessages({})
      })

    return () => { cancelled = true }
  }, [publicKey, threadMessages])

  const loadMoreMessages = async () => {
    if (!publicKey || !selected || threadLoading || !threadHasMore || threadMessages.length === 0) return
    const userGroup = accessGroupFor(selected.thread, publicKey)
    const partyGroup = accessGroupFor(selected.thread, selected.key)
    const oldestTimestampString = threadMessages.at(-1)?.MessageInfo?.TimestampNanosString
    if (!userGroup?.AccessGroupKeyName || !partyGroup?.AccessGroupKeyName || !oldestTimestampString) return

    setThreadLoading(true)
    setThreadError("")
    try {
      const response = await fetchDeSo("get-paginated-messages-for-dm-thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          UserGroupOwnerPublicKeyBase58Check: publicKey,
          UserGroupKeyName: userGroup.AccessGroupKeyName,
          PartyGroupOwnerPublicKeyBase58Check: selected.key,
          PartyGroupKeyName: partyGroup.AccessGroupKeyName,
          StartTimeStampString: oldestTimestampString,
          MaxMessagesToFetch: 25,
        }),
        cache: "no-store",
      })
      if (!response.ok) throw new Error("MESSAGES_UNAVAILABLE")
      const data = await response.json() as DMThreadResponse
      const next = Array.isArray(data.ThreadMessages) ? data.ThreadMessages : []
      setThreadMessages((current) => [...current, ...next])
      setThreadHasMore(next.length === 25)
    } catch {
      setThreadError("MESSAGES_UNAVAILABLE")
    } finally {
      setThreadLoading(false)
    }
  }


  const searchRecipients = async () => {
    const query = recipientInput.trim()
    if (!publicKey || !query || recipientLoading) return
    setRecipientLoading(true)
    setSendError("")
    try {
      if (/^[1-9A-HJ-NP-Za-km-z]{20,100}$/.test(query)) {
        setRecipientResults([{ PublicKeyBase58Check: query }])
        return
      }
      const response = await fetchDeSo("get-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          PublicKeyBase58Check: "",
          Username: "",
          UsernamePrefix: query.replace(/^@/, ""),
          Description: "",
          OrderBy: "",
          NumToFetch: 10,
          ReaderPublicKeyBase58Check: publicKey,
          ModerationType: "",
          FetchUsersThatHODL: false,
          AddGlobalFeedBool: false,
        }),
        cache: "no-store",
      })
      if (!response.ok) throw new Error("PROFILE_SEARCH_UNAVAILABLE")
      const data = await response.json() as { ProfilesFound?: Profile[] | null }
      setRecipientResults((data.ProfilesFound ?? []).filter((profile) => profile.PublicKeyBase58Check && profile.PublicKeyBase58Check !== publicKey))
    } catch {
      setSendError("MESSAGES_UNAVAILABLE")
      setRecipientResults([])
    } finally {
      setRecipientLoading(false)
    }
  }

  const startConversation = async (profile: Profile) => {
    const recipientKey = profile.PublicKeyBase58Check
    if (!publicKey || !recipientKey || recipientKey === publicKey) return
    setSendError("")
    try {
      const groups = await getViaDefaultDMGroups(publicKey, recipientKey)
      const syntheticThread: ThreadEntry = { SenderInfo: groups.sender, RecipientInfo: groups.recipient }
      setProfiles((current) => ({ ...current, [recipientKey]: profile }))
      setThreads((current) => [syntheticThread, ...current.filter((thread) => counterpartKey(thread, publicKey) !== recipientKey)])
      setSelectedKey(recipientKey)
      setNewMessageOpen(false)
      setRecipientInput("")
      setRecipientResults([])
      setMobileConversationOpen(true)
    } catch {
      setSendError("MESSAGES_UNAVAILABLE")
    }
  }

  const sendCurrentMessage = async () => {
  const message = draft.trim()
  if (!publicKey || !selected || !message || sending) return
  const senderGroup = accessGroupFor(selected.thread, publicKey)
  const recipientGroup = accessGroupFor(selected.thread, selected.key)
  if (!senderGroup?.AccessGroupPublicKeyBase58Check || !senderGroup.AccessGroupKeyName || !recipientGroup?.AccessGroupPublicKeyBase58Check || !recipientGroup.AccessGroupKeyName) {
    setSendError("MESSAGES_UNAVAILABLE")
    return
  }

  setSending(true)
  setSendError("")
  try {
    const encryptedMessage = await encryptViaMessage(publicKey, recipientGroup.AccessGroupPublicKeyBase58Check, message, senderGroup.AccessGroupKeyName)
    const transactionHex = await constructViaDMTransaction(senderGroup, recipientGroup, encryptedMessage)
    const signedTransactionHex = await signViaMessageTransaction(publicKey, transactionHex)
    await submitViaSignedTransaction(signedTransactionHex)
    setDraft("")
    const response = await fetchDeSo("get-paginated-messages-for-dm-thread", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        UserGroupOwnerPublicKeyBase58Check: publicKey,
        UserGroupKeyName: senderGroup.AccessGroupKeyName,
        PartyGroupOwnerPublicKeyBase58Check: selected.key,
        PartyGroupKeyName: recipientGroup.AccessGroupKeyName,
        StartTimeStampString: (Date.now() * 1_000_000).toString(),
        MaxMessagesToFetch: 25,
      }),
      cache: "no-store",
    })
    if (response.ok) {
      const data = await response.json() as DMThreadResponse
      const messages = Array.isArray(data.ThreadMessages) ? data.ThreadMessages : []
      setThreadMessages(messages)
      setThreadHasMore(messages.length === 25)
    }
  } catch {
    setSendError("MESSAGES_UNAVAILABLE")
  } finally {
    setSending(false)
  }
  }
  return (
    <main className="via-messages-page min-h-screen px-4 py-6 text-zinc-100 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="via-messages-page-header mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#61b7ff]">{t.kicker}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">{t.intro}</p>
          </div>
          <Link href="/" aria-label={t.back} title={t.back} className="via-messages-back inline-flex min-h-10 items-center gap-2 rounded-[10px] border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:border-[#61b7ff]/50"><ArrowLeft className="h-4 w-4" aria-hidden="true" /><span>{t.back}</span></Link>
        </header>

        {!publicKey ? (
          <section className="via-messages-login rounded-[16px] border border-[#4aa8ff]/30 bg-[#041226]/75 p-4 shadow-[0_18px_55px_rgba(0,35,90,.35)] backdrop-blur-sm sm:p-6">
            <ParticipationGate title={t.noAccount} text={t.noAccountText} compact />
          </section>
        ) : (
          <>
            <div className="via-messages-shell grid min-h-[620px] overflow-hidden rounded-[18px] border border-[#4aa8ff]/30 bg-[#031225]/80 shadow-[0_22px_70px_rgba(0,30,85,.35)] backdrop-blur-sm md:grid-cols-[300px_minmax(0,1fr)] lg:grid-cols-[360px_minmax(0,1fr)]">
              <aside className="via-messages-inbox border-b border-[#4aa8ff]/20 md:border-b-0 md:border-r md:border-[#4aa8ff]/20">
                <div className="via-messages-search flex items-center gap-2 border-b border-[#4aa8ff]/20 bg-[#031225]/75 p-3">
                  <Search className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden="true" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.search} className="min-w-0 flex-1 rounded-[10px] border border-zinc-800 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[#61b7ff]/50" />
                  <button type="button" onClick={() => { setNewMessageOpen((open) => !open); setRecipientResults([]); setSendError("") }} title={t.newMessage} aria-label={t.newMessage} className="grid h-10 w-10 place-items-center rounded-[10px] border border-[#61b7ff]/30 text-[#8fd0ff]"><SquarePen className="h-4 w-4" aria-hidden="true" /></button>
                </div>
                {newMessageOpen ? <div className="border-b border-zinc-800 p-3">
                  <div className="flex gap-2"><input value={recipientInput} onChange={(event) => setRecipientInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void searchRecipients() }} placeholder={t.recipient} className="min-w-0 flex-1 rounded-[10px] border border-zinc-800 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[#61b7ff]/50" /><button type="button" onClick={() => void searchRecipients()} disabled={!recipientInput.trim() || recipientLoading} className="rounded-[10px] border border-[#61b7ff]/30 px-3 text-sm text-[#8fd0ff] disabled:opacity-40"><Search className="h-4 w-4" /></button></div>
                  {recipientResults.length ? <div className="mt-2 max-h-48 overflow-y-auto rounded-[10px] border border-zinc-800">{recipientResults.map((profile, index) => { const key = profile.PublicKeyBase58Check ?? ""; const name = profile.Username ? `@${profile.Username}` : shortKey(key); return <button key={key || index} type="button" onClick={() => void startConversation(profile)} className="flex w-full items-center gap-2 border-b border-zinc-900 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-white/[.03]"><span className="min-w-0 flex-1 truncate">{name}</span><span className="text-[10px] text-zinc-600">{shortKey(key)}</span></button> })}</div> : null}
                  <button type="button" onClick={() => { setNewMessageOpen(false); setRecipientResults([]) }} className="mt-2 text-xs text-zinc-500">{t.cancel}</button>
                </div> : null}
                <div className="max-h-[560px] overflow-y-auto">
                  {loading ? <p className="p-4 text-sm text-zinc-500">{t.loading}</p> : null}
                  {error ? <p className="p-4 text-sm text-amber-300">{t.unavailable}</p> : null}
                  {!loading && !error && rows.length === 0 ? <p className="p-4 text-sm text-zinc-500">{t.empty}</p> : null}
                  {rows.map(({ thread, key, profile, name, index }) => {
                    const image = safeImage(profile?.ProfilePic)
                    const active = (selected?.key ?? selectedKey) === key
                    return (
                      <button key={key || index} type="button" onClick={() => { setSelectedKey(key); setMobileConversationOpen(true) }} className={`flex w-full items-center gap-3 border-b border-zinc-900 px-4 py-3 text-left transition-colors ${active ? "bg-[#0b3159]" : "hover:bg-white/[.03]"}`}>
                        {image ? <img src={image} alt="" className="h-10 w-10 rounded-full object-cover" referrerPolicy="no-referrer" /> : <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#0d3b68] text-sm font-bold text-[#8fd0ff]">{name.replace(/^@/, "").slice(0,1).toUpperCase()}</span>}
                        <span className="min-w-0 flex-1">
                          <strong className="block truncate text-sm text-zinc-100">{name}</strong>
                          <span className="block truncate text-xs text-zinc-500">{t.encrypted}</span>
                        </span>
                        <span className="text-[10px] text-zinc-600">{formatThreadTime(thread.MessageInfo?.TimestampNanos ?? thread.TimestampNanos)}</span>
                      </button>
                    )
                  })}
                </div>
              </aside>

              <section className={`via-messages-conversation flex min-h-[420px] flex-col ${mobileConversationOpen ? "via-messages-conversation-open" : ""}`}>
                {selected ? (
                  <>
                    <div className="via-messages-thread-header flex items-center gap-3 border-b border-[#4aa8ff]/20 bg-[#04172d]/70 px-5 py-4">
                      <button type="button" onClick={() => setMobileConversationOpen(false)} aria-label={t.back} className="via-messages-thread-back hidden h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-zinc-800 text-zinc-300"><ArrowLeft className="h-4 w-4" aria-hidden="true" /></button>
                      <div className="min-w-0"><strong className="block truncate text-base">{selected.name}</strong>
                      <p className="mt-1 truncate text-xs text-zinc-500">{shortKey(selected.key)}</p></div>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-5">
                      {threadHasMore && threadMessages.length > 0 ? <button type="button" onClick={() => void loadMoreMessages()} disabled={threadLoading} className="mx-auto rounded-[10px] border border-[#61b7ff]/30 px-4 py-2 text-sm text-[#8fd0ff] disabled:opacity-50">{threadLoading ? t.loading : t.loadMore}</button> : null}
                      {threadLoading && threadMessages.length === 0 ? <p className="m-auto text-sm text-zinc-500">{t.loading}</p> : null}
                      {threadError ? <p className="m-auto text-sm text-amber-300">{t.unavailable}</p> : null}
                      {!threadLoading && !threadError && threadMessages.length === 0 ? <p className="m-auto text-sm text-zinc-500">{t.identityNote}</p> : null}
                      {[...threadMessages].reverse().map((message, index) => {
                        const encryptedHex = message.MessageInfo?.EncryptedText ?? message.EncryptedText ?? ""
                        const body = decryptedMessages[encryptedHex] || t.encrypted
                        const mine = (message.SenderInfo?.OwnerPublicKeyBase58Check ?? message.SenderPublicKeyBase58Check) === publicKey
                        return <div key={`${encryptedHex.slice(0,16)}-${index}`} className={`max-w-[78%] rounded-[16px] px-4 py-3 text-sm leading-6 ${mine ? "ml-auto bg-[#0d3b68] text-zinc-100" : "mr-auto border border-zinc-800 bg-black/30 text-zinc-200"}`}><p className="whitespace-pre-wrap break-words">{body}</p></div>
                      })}
                    </div>
                    <div className="via-messages-composer border-t border-[#4aa8ff]/20 bg-[#031225]/70 p-4">
                      <div className="flex gap-2">
                        <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={2} maxLength={5000} placeholder={t.typeMessage} className="min-w-0 flex-1 resize-none rounded-[12px] border border-zinc-800 bg-black/25 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-[#61b7ff]/50" />
                        <button type="button" onClick={() => void sendCurrentMessage()} disabled={!draft.trim() || sending} title={t.identityNote} className="rounded-[12px] border border-[#61b7ff]/25 px-4 text-sm font-semibold text-[#8fd0ff] disabled:border-zinc-800 disabled:text-zinc-600">{sending ? "…" : t.send}</button>
                      </div>
                    </div>
                    {sendError ? <p className="px-4 pb-3 text-xs text-amber-300">{t.unavailable}</p> : null}
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
      <style>{`\n        .via-messages-page {\n          position: relative;\n          isolation: isolate;\n          background-color: #020b18;\n          background-image: linear-gradient(rgba(1,9,22,.22), rgba(1,9,22,.42)), url("/via-messages-background-approved.jpeg");\n          background-size: cover;\n          background-position: center;\n          background-attachment: fixed;\n        }\n        .via-messages-page > div { position: relative; z-index: 1; }
        @media (min-width: 721px) and (max-width: 1024px) {\n          .via-messages-page { padding-left: 20px; padding-right: 20px; }\n          .via-messages-shell { min-height: 68vh; }\n          .via-messages-inbox > div:last-child { max-height: 68vh; }\n          .via-messages-conversation { min-height: 68vh; }\n        }\n        @media (min-width: 1025px) {\n          .via-messages-shell { min-height: 70vh; }\n          .via-messages-inbox > div:last-child { max-height: 70vh; }\n        }\n        @media (max-width: 720px) {
          .via-messages-page { padding: 16px 12px 24px; background-attachment: scroll; background-position: 58% center; }\n          .via-messages-page-header { margin-bottom: 12px; align-items: center; gap: 10px; }\n          .via-messages-login { padding: 12px !important; }\n          .via-messages-login > * { margin: 0 !important; }
          .via-messages-page-header h1 { font-size: 24px; margin-top: 4px; }
          .via-messages-page-header p:not(.text-xs) { display: none; }
          .via-messages-back { width: 40px; min-height: 40px; padding: 0; justify-content: center; border-radius: 12px; }
          .via-messages-back span { display: none; }
          .via-messages-shell { min-height: calc(100dvh - 190px); border-radius: 14px; }\n          .via-messages-inbox { border-bottom: 0; min-width: 0; }
          .via-messages-search { position: sticky; top: 0; z-index: 2; background: rgba(3,18,37,.96); }
          .via-messages-conversation { display: none; min-height: calc(100dvh - 190px); }\n          .via-messages-thread-header { padding: 12px; }\n          .via-messages-conversation > div:nth-child(2) { padding: 14px; }\n          .via-messages-composer { padding: 10px; }\n          .via-messages-composer textarea { max-height: 120px; }
          .via-messages-conversation.via-messages-conversation-open { display: flex; }
          .via-messages-conversation-open + * { display: none; }
          .via-messages-inbox:has(+ .via-messages-conversation-open) { display: none; }
          .via-messages-thread-back { display: grid; }
        }
      `}</style>
    </main>
  )
}
