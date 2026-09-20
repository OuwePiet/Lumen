"use client"

import { useEffect, useMemo, useState } from "react"
import { AtSign, Badge, Check, CheckCircle2, ChevronsRight, CircleDot, Gem, MessageSquare, RefreshCw, Repeat2, ShieldOff, Smile, UserRound } from "lucide-react"
import { restoreIdentitySession, VIA_IDENTITY_EVENT, type ViaIdentitySession } from "../deso-identity-session"
import type { ViaLanguage } from "../via-local-settings"
import SponsorPlatform from "../sponsor-platform"

type NotificationItem = {
  Index?: number
  Metadata?: Record<string, unknown>
}

type NotificationResponse = {
  ok?: boolean
  error?: string
  lastSeenIndex?: number | null
  notifications?: NotificationItem[]
}

type ActorProfile = {
  username?: string
  profilePic?: string | null
}

type ProfileResponse = {
  ok?: boolean
  profile?: ActorProfile
}

type Category = "all" | "reaction" | "diamond1" | "diamondMany" | "creatorCoin" | "follow" | "mention5" | "mention6" | "reply" | "repost" | "nft" | "other"

function CategoryIcon({ category, className = "h-4 w-4" }: { category: Category; className?: string }) {
  if (category === "all") return <Check className={className} strokeWidth={2} />
  if (category === "reaction") return <Smile className={className} strokeWidth={2} />
  if (category === "diamond1" || category === "diamondMany") return <Gem className={className} strokeWidth={2} />
  if (category === "creatorCoin") return <span className="text-[13px] font-bold">$</span>
  if (category === "follow") return <UserRound className={className} strokeWidth={2} />
  if (category === "mention5" || category === "mention6") return <AtSign className={className} strokeWidth={2} />
  if (category === "reply") return <MessageSquare className={className} strokeWidth={2} />
  if (category === "repost") return <Repeat2 className={className} strokeWidth={2} />
  if (category === "nft") return <Badge className={className} strokeWidth={2} />
  return <CircleDot className={className} strokeWidth={2} />
}

type Copy = {
  categories: Record<Category, string>
  login: string
  heading: string
  active: string
  refresh: string
  refreshing: string
  loadingNotifications: string
  recentLoaded: (count: number) => string
  noRecent: string
  unavailable: string
  filters: string
  loading: string
  nothing: string
  open: string
  fresh: string
  actor: string
  descriptions: Record<Exclude<Category, "all">, (actor: string) => string>
}

const COPY: Record<ViaLanguage, Copy> = {
  Dutch: {
    categories: { all: "Alles", reaction: "Reacties", diamond1: "1 diamant", diamondMany: "Meerdere diamanten", creatorCoin: "Creator Coin", follow: "Volgen", mention5: "Vermeldingen · max 5", mention6: "Vermeldingen · 6+", reply: "Antwoorden", repost: "Reposts", nft: "NFT", other: "Overig" },
    login: "Log in met DeSo om meldingen voor je actieve account te zien.",
    heading: "Wat bereikte jouw account?",
    active: "Actief account",
    refresh: "Vernieuwen",
    refreshing: "Vernieuwen…",
    loadingNotifications: "Meldingen laden…",
    recentLoaded: (count) => `${count} recente meldingen geladen.`,
    noRecent: "Geen recente meldingen.",
    unavailable: "Meldingen zijn tijdelijk niet beschikbaar.",
    filters: "Meldingsfilters",
    loading: "Laden…",
    nothing: "Niets in dit filter.",
    open: "Openen",
    fresh: "Nieuw",
    actor: "DeSo-account",
    descriptions: {
      reaction: (actor) => `${actor} reageerde op een van je berichten.`,
      diamond1: (actor) => `${actor} stuurde 1 diamant.`,
      diamondMany: (actor) => `${actor} stuurde meerdere diamanten.`,
      creatorCoin: (actor) => `${actor} veroorzaakte Creator Coin-activiteit.`,
      mention5: (actor) => `${actor} heeft je vermeld.`,
      mention6: (actor) => `${actor} heeft je vermeld in een bericht met 6 of meer tags.`,
      reply: (actor) => `${actor} reageerde op een bericht waarbij jij betrokken bent.`,
      follow: (actor) => `${actor} wijzigde de volgrelatie met jouw account.`,
      repost: (actor) => `${actor} heeft een bericht opnieuw gedeeld waarbij jij betrokken bent.`,
      nft: (actor) => `${actor} veroorzaakte NFT-activiteit voor jouw account.`,
      other: (actor) => `${actor} veroorzaakte accountactiviteit voor jou.`,
    },
  },
  English: {
    categories: { all: "All", reaction: "Reactions", diamond1: "Single Diamond", diamondMany: "Multiple Diamonds", creatorCoin: "Creator Coin", follow: "Follows", mention5: "Mentions · max 5", mention6: "Mentions · 6+", reply: "Replies", repost: "Reposts", nft: "NFT", other: "Other" },
    login: "Log in with DeSo to see notifications for your active account.",
    heading: "What reached your account?",
    active: "Active account",
    refresh: "Refresh",
    refreshing: "Refreshing…",
    loadingNotifications: "Loading notifications…",
    recentLoaded: (count) => `${count} recent notifications loaded.`,
    noRecent: "No recent notifications.",
    unavailable: "Notifications are temporarily unavailable.",
    filters: "Notification filters",
    loading: "Loading…",
    nothing: "Nothing in this filter.",
    open: "Open",
    fresh: "New",
    actor: "DeSo account",
    descriptions: {
      reaction: (actor) => `${actor} reacted to one of your posts.`,
      diamond1: (actor) => `${actor} sent 1 Diamond.`,
      diamondMany: (actor) => `${actor} sent multiple Diamonds.`,
      creatorCoin: (actor) => `${actor} generated Creator Coin activity.`,
      mention5: (actor) => `${actor} mentioned you.`,
      mention6: (actor) => `${actor} mentioned you in a post with 6 or more tags.`,
      reply: (actor) => `${actor} replied to a post involving you.`,
      follow: (actor) => `${actor} changed a follow relationship with your account.`,
      repost: (actor) => `${actor} reposted content involving you.`,
      nft: (actor) => `${actor} generated NFT activity for your account.`,
      other: (actor) => `${actor} generated account activity for you.`,
    },
  },
  French: {
    categories: { all: "Tout", reaction: "Réactions", diamond1: "1 diamant", diamondMany: "Plusieurs diamants", creatorCoin: "Creator Coin", follow: "Abonnements", mention5: "Mentions · max 5", mention6: "Mentions · 6+", reply: "Réponses", repost: "Reposts", nft: "NFT", other: "Autre" },
    login: "Connectez-vous avec DeSo pour voir les notifications du compte actif.",
    heading: "Qu’est-ce qui a atteint votre compte ?",
    active: "Compte actif",
    refresh: "Actualiser",
    refreshing: "Actualisation…",
    loadingNotifications: "Chargement des notifications…",
    recentLoaded: (count) => `${count} notifications récentes chargées.`,
    noRecent: "Aucune notification récente.",
    unavailable: "Les notifications sont temporairement indisponibles.",
    filters: "Filtres de notifications",
    loading: "Chargement…",
    nothing: "Aucun élément dans ce filtre.",
    open: "Ouvrir",
    fresh: "Nouveau",
    actor: "Compte DeSo",
    descriptions: {
      reaction: (actor) => `${actor} a réagi à l’une de vos publications.`,
      diamond1: (actor) => `${actor} a envoyé 1 diamant.`,
      diamondMany: (actor) => `${actor} a envoyé plusieurs diamants.`,
      creatorCoin: (actor) => `${actor} a généré une activité Creator Coin.`,
      mention5: (actor) => `${actor} vous a mentionné.`,
      mention6: (actor) => `${actor} vous a mentionné avec 6 tags ou plus.`,
      reply: (actor) => `${actor} a répondu à une publication qui vous concerne.`,
      follow: (actor) => `${actor} a modifié sa relation d’abonnement avec votre compte.`,
      repost: (actor) => `${actor} a repartagé du contenu qui vous concerne.`,
      nft: (actor) => `${actor} a généré une activité NFT pour votre compte.`,
      other: (actor) => `${actor} a généré une activité de compte pour vous.`,
    },
  },
  Spanish: {
    categories: { all: "Todo", reaction: "Reacciones", diamond1: "1 diamante", diamondMany: "Varios diamantes", creatorCoin: "Creator Coin", follow: "Seguimientos", mention5: "Menciones · máx 5", mention6: "Menciones · 6+", reply: "Respuestas", repost: "Reposts", nft: "NFT", other: "Otros" },
    login: "Inicia sesión con DeSo para ver las notificaciones de tu cuenta activa.",
    heading: "¿Qué llegó a tu cuenta?",
    active: "Cuenta activa",
    refresh: "Actualizar",
    refreshing: "Actualizando…",
    loadingNotifications: "Cargando notificaciones…",
    recentLoaded: (count) => `${count} notificaciones recientes cargadas.`,
    noRecent: "No hay notificaciones recientes.",
    unavailable: "Las notificaciones no están disponibles temporalmente.",
    filters: "Filtros de notificaciones",
    loading: "Cargando…",
    nothing: "No hay nada en este filtro.",
    open: "Abrir",
    fresh: "Nuevo",
    actor: "Cuenta DeSo",
    descriptions: {
      reaction: (actor) => `${actor} reaccionó a una de tus publicaciones.`,
      diamond1: (actor) => `${actor} envió 1 diamante.`,
      diamondMany: (actor) => `${actor} envió varios diamantes.`,
      creatorCoin: (actor) => `${actor} generó actividad de Creator Coin.`,
      mention5: (actor) => `${actor} te mencionó.`,
      mention6: (actor) => `${actor} te mencionó con 6 etiquetas o más.`,
      reply: (actor) => `${actor} respondió a una publicación en la que participas.`,
      follow: (actor) => `${actor} cambió la relación de seguimiento con tu cuenta.`,
      repost: (actor) => `${actor} volvió a compartir contenido relacionado contigo.`,
      nft: (actor) => `${actor} generó actividad NFT para tu cuenta.`,
      other: (actor) => `${actor} generó actividad de cuenta para ti.`,
    },
  },
  Chinese: {
    categories: { all: "全部", reaction: "反应", diamond1: "1 颗钻石", diamondMany: "多颗钻石", creatorCoin: "Creator Coin", follow: "关注", mention5: "提及 · 最多 5", mention6: "提及 · 6+", reply: "回复", repost: "转发", nft: "NFT", other: "其他" },
    login: "使用 DeSo 登录以查看当前账户的通知。",
    heading: "你的账户收到了什么？",
    active: "当前账户",
    refresh: "刷新",
    refreshing: "正在刷新…",
    loadingNotifications: "正在加载通知…",
    recentLoaded: (count) => `已加载 ${count} 条最近通知。`,
    noRecent: "没有最近通知。",
    unavailable: "通知暂时不可用。",
    filters: "通知筛选",
    loading: "正在加载…",
    nothing: "此筛选中没有内容。",
    open: "打开",
    fresh: "新",
    actor: "DeSo 账户",
    descriptions: {
      reaction: (actor) => `${actor} 对你的帖子作出了反应。`,
      diamond1: (actor) => `${actor} 发送了 1 颗钻石。`,
      diamondMany: (actor) => `${actor} 发送了多颗钻石。`,
      creatorCoin: (actor) => `${actor} 产生了 Creator Coin 活动。`,
      mention5: (actor) => `${actor} 提到了你。`,
      mention6: (actor) => `${actor} 在包含 6 个或更多标签的帖子中提到了你。`,
      reply: (actor) => `${actor} 回复了与你相关的帖子。`,
      follow: (actor) => `${actor} 更改了与你账户的关注关系。`,
      repost: (actor) => `${actor} 转发了与你相关的内容。`,
      nft: (actor) => `${actor} 为你的账户产生了 NFT 活动。`,
      other: (actor) => `${actor} 为你的账户产生了活动。`,
    },
  },
}

const POST_HASH_RE = /^[0-9a-fA-F]{64}$/
const PUBLIC_KEY_RE = /^[1-9A-HJ-NP-Za-km-z]{20,100}$/

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null
}

function firstHash(source: Record<string, unknown> | null, keys: string[]) {
  if (!source) return null
  for (const key of keys) {
    const value = source[key]
    if (typeof value === "string" && POST_HASH_RE.test(value)) return value
  }
  return null
}

function mentionCount(source: Record<string, unknown> | null) {
  if (!source) return 0
  for (const key of ["MentionedPublicKeys", "MentionedUsernames", "MentionedUsers"]) {
    const value = source[key]
    if (Array.isArray(value)) return value.length
  }
  for (const key of ["MentionCount", "NumMentions", "MentionedUsersCount"]) {
    const value = source[key]
    if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, Math.floor(value))
  }
  return 0
}

function categoryOf(item: NotificationItem): Exclude<Category, "all"> {
  const metadata = record(item.Metadata) ?? {}
  const basic = record(metadata.BasicTransferTxindexMetadata)
  const creatorTransfer = record(metadata.CreatorCoinTransferTxindexMetadata)
  const diamond = basic?.DiamondLevel ?? creatorTransfer?.DiamondLevel
  if (typeof diamond === "number" && diamond > 0) return diamond > 1 ? "diamondMany" : "diamond1"
  if (record(metadata.LikeTxindexMetadata)) return "reaction"
  if (record(metadata.FollowTxindexMetadata)) return "follow"
  if (record(metadata.CreatorCoinTxindexMetadata) || (creatorTransfer && !(typeof creatorTransfer.DiamondLevel === "number" && creatorTransfer.DiamondLevel > 0))) return "creatorCoin"
  const post = record(metadata.SubmitPostTxindexMetadata)
  if (post) {
    if (firstHash(post, ["RepostedPostHashHex", "RepostPostHashHex"])) return "repost"
    if (firstHash(post, ["ParentPostHashHex"])) return "reply"
    return mentionCount(post) >= 6 ? "mention6" : "mention5"
  }
  if (record(metadata.NFTBidTxindexMetadata) || record(metadata.AcceptNFTBidTxindexMetadata) || record(metadata.NFTTransferTxindexMetadata) || record(metadata.CreateNFTTxindexMetadata) || record(metadata.UpdateNFTTxindexMetadata)) return "nft"
  return "other"
}

function shortKey(value: unknown, fallback: string) {
  if (typeof value !== "string" || value.length < 12) return fallback
  return `${value.slice(0, 8)}…${value.slice(-5)}`
}

function notificationDestination(item: NotificationItem) {
  const metadata = record(item.Metadata) ?? {}
  const category = categoryOf(item)

  if (category === "follow") {
    const actor = metadata.TransactorPublicKeyBase58Check
    return typeof actor === "string" && PUBLIC_KEY_RE.test(actor)
      ? `/profile/${encodeURIComponent(actor)}`
      : null
  }

  if (category === "mention5" || category === "mention6" || category === "reply" || category === "repost") {
    const post = record(metadata.SubmitPostTxindexMetadata)
    const keys = category === "repost"
      ? ["RepostedPostHashHex", "RepostPostHashHex", "PostHashHex"]
      : ["PostHashHex", "PostHashBeingModifiedHex", "ParentPostHashHex"]
    const hash = firstHash(post, keys)
    return hash ? `/social?post=${encodeURIComponent(hash)}` : null
  }

  if (category === "reaction") {
    const like = record(metadata.LikeTxindexMetadata)
    const hash = firstHash(like, ["LikedPostHashHex", "PostHashHex"])
    return hash ? `/social?post=${encodeURIComponent(hash)}` : null
  }

  if (category === "diamond1" || category === "diamondMany") {
    const basic = record(metadata.BasicTransferTxindexMetadata)
    const creatorTransfer = record(metadata.CreatorCoinTransferTxindexMetadata)
    const hash = firstHash(basic, ["PostHashHex"]) ?? firstHash(creatorTransfer, ["PostHashHex"])
    return hash ? `/social?post=${encodeURIComponent(hash)}` : null
  }

  if (category === "nft") {
    const nftMetadata = [
      record(metadata.NFTBidTxindexMetadata),
      record(metadata.AcceptNFTBidTxindexMetadata),
      record(metadata.NFTTransferTxindexMetadata),
      record(metadata.CreateNFTTxindexMetadata),
      record(metadata.UpdateNFTTxindexMetadata),
    ]
    for (const entry of nftMetadata) {
      const hash = firstHash(entry, ["NFTPostHashHex", "PostHashHex"])
      if (hash) return `/nft/${encodeURIComponent(hash)}`
    }
  }

  return null
}

export default function NotificationCenter({ language }: { language: ViaLanguage }) {
  const copy = COPY[language]
  const categories = useMemo(() => (Object.keys(copy.categories) as Category[]).map((id) => ({ id, label: copy.categories[id] })), [copy])
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const [items, setItems] = useState<NotificationItem[]>([])
  const [category, setCategory] = useState<Category>("all")
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle")
  const [messageKey, setMessageKey] = useState<"loading" | "loaded" | "empty" | "error" | "">("")
  const [lastSeenIndex, setLastSeenIndex] = useState<number | null>(null)
  const [refreshToken, setRefreshToken] = useState(0)
  const [expandedView, setExpandedView] = useState(false)
  const [profiles, setProfiles] = useState<Record<string, ActorProfile>>({})
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  useEffect(() => {
    const current = restoreIdentitySession()
    setSession(current)
    const onSession = (event: Event) => setSession((event as CustomEvent<ViaIdentitySession | null>).detail ?? restoreIdentitySession())
    window.addEventListener(VIA_IDENTITY_EVENT, onSession)
    return () => window.removeEventListener(VIA_IDENTITY_EVENT, onSession)
  }, [])

  useEffect(() => {
    if (!session) {
      setItems([])
      setStatus("idle")
      setMessageKey("")
      return
    }

    const publicKey = session.publicKey
    const controller = new AbortController()
    async function load() {
      setStatus("loading")
      setMessageKey("loading")
      try {
        const response = await fetch("/api/via/social/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          signal: controller.signal,
          body: JSON.stringify({ publicKey, fetchStartIndex: -1, numToFetch: 40 }),
        })
        const data = await response.json() as NotificationResponse
        if (!response.ok || !data.ok || !Array.isArray(data.notifications)) throw new Error(data.error || "NOTIFICATIONS_FAILED")
        const ordered = [...data.notifications].sort((a, b) => (b.Index ?? -1) - (a.Index ?? -1))
        setItems(ordered)
        setLastSeenIndex(typeof data.lastSeenIndex === "number" ? data.lastSeenIndex : null)
        setStatus("ready")
        setMessageKey(ordered.length ? "loaded" : "empty")
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return
        setItems([])
        setStatus("error")
        setMessageKey("error")
      }
    }
    void load()
    return () => controller.abort()
  }, [session, refreshToken])

  useEffect(() => {
    const publicKeys = Array.from(new Set(items.map((item) => {
      const metadata = record(item.Metadata) ?? {}
      const value = metadata.TransactorPublicKeyBase58Check
      return typeof value === "string" && PUBLIC_KEY_RE.test(value) ? value : ""
    }).filter(Boolean))).slice(0, 32)

    const missing = publicKeys.filter((publicKey) => !profiles[publicKey])
    if (!missing.length) return

    const controller = new AbortController()
    void Promise.all(missing.map(async (publicKey) => {
      try {
        const response = await fetch(`/api/via/profile?identity=${encodeURIComponent(publicKey)}`, {
          cache: "no-store",
          signal: controller.signal,
          headers: { Accept: "application/json" },
        })
        const data = response.ok ? await response.json() as ProfileResponse : null
        return [publicKey, data?.ok && data.profile ? data.profile : {}] as const
      } catch {
        return [publicKey, {}] as const
      }
    })).then((entries) => {
      if (!controller.signal.aborted) {
        setProfiles((current) => ({ ...current, ...Object.fromEntries(entries) }))
      }
    })

    return () => controller.abort()
  }, [items, profiles])

  const visible = useMemo(() => category === "all" ? items : items.filter((item) => categoryOf(item) === category), [items, category])
  const message = messageKey === "loading" ? copy.loadingNotifications
    : messageKey === "loaded" ? copy.recentLoaded(items.length)
    : messageKey === "empty" ? copy.noRecent
    : messageKey === "error" ? copy.unavailable
    : ""

  if (!session) {
    return <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 text-sm leading-6 text-zinc-400">{copy.login}</section>
  }

  return (
    <section className={`${expandedView ? "max-h-[calc(100vh-8rem)]" : "max-h-[76vh]"} overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950/60`} aria-labelledby="notification-center-heading">
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-950/95 px-4 py-4 backdrop-blur sm:px-5">
        <div>
          <h2 id="notification-center-heading" className="text-xl font-semibold text-white">{copy.heading}</h2>
          <p className="mt-1 text-xs text-zinc-500">{copy.active}: {shortKey(session.publicKey, copy.actor)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SponsorPlatform compact />
          <button type="button" disabled title="Filter out bots" aria-label="Filter out bots" className="grid h-9 w-9 place-items-center rounded-full border border-[#9b9b9b] bg-[#9b9b9b] text-white opacity-70 disabled:cursor-not-allowed">
            <ShieldOff className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setCategory("all")} title="Select All" aria-label="Select All" aria-pressed={category === "all"} className={`grid h-9 w-9 place-items-center rounded-full border text-white transition ${category === "all" ? "border-[#1687ff] bg-[#1687ff]" : "border-[#9b9b9b] bg-[#9b9b9b]"}`}>
            <CheckCircle2 className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setRefreshToken((value) => value + 1)} disabled={status === "loading"} title={copy.refresh} aria-label={copy.refresh} className="grid h-9 w-9 place-items-center rounded-full border border-[#1687ff] bg-[#1687ff] text-white transition disabled:cursor-wait disabled:opacity-60">
            <RefreshCw className={`h-4 w-4 ${status === "loading" ? "animate-spin" : ""}`} />
          </button>
          <button type="button" onClick={() => setExpandedView((value) => !value)} title="Expand View" aria-label="Expand View" aria-pressed={expandedView} className={`grid h-9 w-9 place-items-center rounded-full border text-white transition ${expandedView ? "border-[#1687ff] bg-[#1687ff]" : "border-[#9b9b9b] bg-[#9b9b9b]"}`}>
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="sticky top-[73px] z-20 overflow-x-auto border-b border-zinc-800 bg-zinc-950/95 px-3 py-3 backdrop-blur sm:px-4" aria-label={copy.filters}>
        <div className="flex min-w-max gap-2">
          {categories.map((option) => {
            const active = option.id === category
            const count = option.id === "all" ? items.length : items.filter((item) => categoryOf(item) === option.id).length
            return <button key={option.id} type="button" aria-pressed={active} onClick={() => setCategory(option.id)} title={option.label} className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3 text-xs font-semibold transition ${active ? "border-[#1687ff] bg-[#1687ff] text-white shadow-[0_0_0_1px_rgba(22,135,255,0.2)]" : "border-[#9b9b9b] bg-[#9b9b9b] text-white hover:border-[#7f7f7f] hover:bg-[#7f7f7f]"}`}>
              <span aria-hidden="true" className="grid h-5 min-w-5 place-items-center text-sm"><CategoryIcon category={option.id} /></span>
              <span>{option.label}</span>
              <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-500">{count}</span>
            </button>
          })}
        </div>
      </div>

      <p className={`px-4 pt-3 text-xs sm:px-5 ${status === "error" ? "text-amber-300" : "text-zinc-500"}`} role="status" aria-live="polite">{message}</p>

      <div className="mt-2 divide-y divide-zinc-800">
        {status === "loading" ? <div className="px-4 py-5 text-sm text-zinc-500 sm:px-5">{copy.loading}</div> : null}
        {status === "ready" && visible.length === 0 ? <div className="px-4 py-5 text-sm text-zinc-500 sm:px-5">{copy.nothing}</div> : null}
        {visible.map((item, index) => {
          const itemCategory = categoryOf(item)
          const unread = typeof item.Index === "number" && lastSeenIndex !== null && item.Index > lastSeenIndex
          const destination = notificationDestination(item)
          const metadata = record(item.Metadata) ?? {}
          const actorPublicKey = typeof metadata.TransactorPublicKeyBase58Check === "string" && PUBLIC_KEY_RE.test(metadata.TransactorPublicKeyBase58Check)
            ? metadata.TransactorPublicKeyBase58Check
            : ""
          const profile = actorPublicKey ? profiles[actorPublicKey] ?? {} : {}
          const username = profile.username?.trim().replace(/^@/, "")
          const actor = username ? `@${username}` : shortKey(actorPublicKey || metadata.TransactorPublicKeyBase58Check, copy.actor)
          const rowKey = `${item.Index ?? "n"}-${index}`
          const expanded = expandedKey === rowKey
          return <article key={rowKey} className={`grid grid-cols-[42px_minmax(0,1fr)] gap-3 px-4 py-4 transition sm:grid-cols-[46px_minmax(0,1fr)_auto] sm:px-5 ${unread ? "bg-[#0b1510]/70" : "bg-black/10"}`}>
            <div className="relative h-10 w-10 sm:h-11 sm:w-11">
              {profile.profilePic ? <img src={profile.profilePic} alt="" referrerPolicy="no-referrer" className="h-full w-full rounded-full border border-zinc-700 object-cover" /> : <div aria-hidden="true" className={`grid h-full w-full place-items-center rounded-full border text-base font-bold ${unread ? "border-[#1687ff] bg-[#1687ff] text-white" : "border-[#8e8e8e] bg-[#8e8e8e] text-white"}`}><CategoryIcon category={itemCategory} className="h-5 w-5" /></div>}
              <span aria-hidden="true" className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full border border-zinc-700 bg-black text-white"><CategoryIcon category={itemCategory} className="h-3 w-3" /></span>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <strong className="truncate text-sm font-semibold text-zinc-100">{actor}</strong>
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7dbb93]">{copy.categories[itemCategory]}</span>
                {unread ? <span className="rounded-full border border-[#285f40] px-2 py-0.5 text-[10px] text-[#9adbb2]">{copy.fresh}</span> : null}
              </div>
              <p className="mt-1 text-sm leading-5 text-zinc-400">{copy.descriptions[itemCategory](actor)}</p>
              {destination ? <button type="button" onClick={() => setExpandedKey(expanded ? null : rowKey)} className="mt-2 inline-flex rounded-full border border-zinc-700 px-2.5 py-1 text-[11px] text-zinc-300 transition hover:border-[#1687ff] hover:text-white">{expanded ? "Close" : copy.open}</button> : null}
              {expanded && destination ? <div className="mt-3 rounded-xl border border-zinc-800 bg-black/25 p-3 text-xs text-zinc-500">{destination}</div> : null}
            </div>
            {destination ? <button type="button" onClick={() => setExpandedKey(expanded ? null : rowKey)} className="hidden self-center rounded-full border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-[#1687ff] hover:text-white sm:inline-flex">{expanded ? "Close" : copy.open}</button> : null}
          </article>
        })}
      </div>
    </section>
  )
}
