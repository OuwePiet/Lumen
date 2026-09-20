"use client"

import { useEffect, useMemo, useState } from "react"
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

type Category = "all" | "mention" | "reply" | "like" | "diamond" | "follow" | "repost" | "nft" | "other"

const CATEGORY_ICON: Record<Category, string> = {
  all: "●",
  mention: "@",
  reply: "↩",
  like: "♥",
  diamond: "◇",
  follow: "＋",
  repost: "↻",
  nft: "◆",
  other: "•",
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
    categories: { all: "Alles", mention: "Vermeldingen", reply: "Reacties", like: "Likes", diamond: "Diamanten", follow: "Volgen", repost: "Reposts", nft: "NFT", other: "Overig" },
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
      mention: (actor) => `${actor} heeft je vermeld in een bericht.`,
      reply: (actor) => `${actor} reageerde op een bericht waarbij jij betrokken bent.`,
      like: (actor) => `${actor} vond een van je berichten leuk.`,
      diamond: (actor) => `${actor} stuurde een diamant.`,
      follow: (actor) => `${actor} wijzigde de volgrelatie met jouw account.`,
      repost: (actor) => `${actor} heeft een bericht opnieuw gedeeld waarbij jij betrokken bent.`,
      nft: (actor) => `${actor} veroorzaakte NFT-activiteit voor jouw account.`,
      other: (actor) => `${actor} veroorzaakte accountactiviteit voor jou.`,
    },
  },
  English: {
    categories: { all: "All", mention: "Mentions", reply: "Replies", like: "Likes", diamond: "Diamonds", follow: "Follows", repost: "Reposts", nft: "NFT", other: "Other" },
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
      mention: (actor) => `${actor} mentioned you in a post.`,
      reply: (actor) => `${actor} replied to a post involving you.`,
      like: (actor) => `${actor} liked one of your posts.`,
      diamond: (actor) => `${actor} sent a diamond.`,
      follow: (actor) => `${actor} changed a follow relationship with your account.`,
      repost: (actor) => `${actor} reposted content involving you.`,
      nft: (actor) => `${actor} generated NFT activity for your account.`,
      other: (actor) => `${actor} generated account activity for you.`,
    },
  },
  French: {
    categories: { all: "Tout", mention: "Mentions", reply: "Réponses", like: "J’aime", diamond: "Diamants", follow: "Abonnements", repost: "Reposts", nft: "NFT", other: "Autre" },
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
      mention: (actor) => `${actor} vous a mentionné dans une publication.`,
      reply: (actor) => `${actor} a répondu à une publication qui vous concerne.`,
      like: (actor) => `${actor} a aimé l’une de vos publications.`,
      diamond: (actor) => `${actor} a envoyé un diamant.`,
      follow: (actor) => `${actor} a modifié sa relation d’abonnement avec votre compte.`,
      repost: (actor) => `${actor} a repartagé du contenu qui vous concerne.`,
      nft: (actor) => `${actor} a généré une activité NFT pour votre compte.`,
      other: (actor) => `${actor} a généré une activité de compte pour vous.`,
    },
  },
  Spanish: {
    categories: { all: "Todo", mention: "Menciones", reply: "Respuestas", like: "Me gusta", diamond: "Diamantes", follow: "Seguimientos", repost: "Reposts", nft: "NFT", other: "Otros" },
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
      mention: (actor) => `${actor} te mencionó en una publicación.`,
      reply: (actor) => `${actor} respondió a una publicación en la que participas.`,
      like: (actor) => `${actor} indicó que le gusta una de tus publicaciones.`,
      diamond: (actor) => `${actor} envió un diamante.`,
      follow: (actor) => `${actor} cambió la relación de seguimiento con tu cuenta.`,
      repost: (actor) => `${actor} volvió a compartir contenido relacionado contigo.`,
      nft: (actor) => `${actor} generó actividad NFT para tu cuenta.`,
      other: (actor) => `${actor} generó actividad de cuenta para ti.`,
    },
  },
  Chinese: {
    categories: { all: "全部", mention: "提及", reply: "回复", like: "点赞", diamond: "钻石", follow: "关注", repost: "转发", nft: "NFT", other: "其他" },
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
      mention: (actor) => `${actor} 在帖子中提到了你。`,
      reply: (actor) => `${actor} 回复了与你相关的帖子。`,
      like: (actor) => `${actor} 点赞了你的帖子。`,
      diamond: (actor) => `${actor} 发送了一颗钻石。`,
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

function categoryOf(item: NotificationItem): Exclude<Category, "all"> {
  const metadata = record(item.Metadata) ?? {}
  const basic = record(metadata.BasicTransferTxindexMetadata)
  const creatorTransfer = record(metadata.CreatorCoinTransferTxindexMetadata)
  if ((typeof basic?.DiamondLevel === "number" && basic.DiamondLevel > 0) || (typeof creatorTransfer?.DiamondLevel === "number" && creatorTransfer.DiamondLevel > 0)) return "diamond"
  if (record(metadata.LikeTxindexMetadata)) return "like"
  if (record(metadata.FollowTxindexMetadata)) return "follow"
  const post = record(metadata.SubmitPostTxindexMetadata)
  if (post) {
    if (firstHash(post, ["RepostedPostHashHex", "RepostPostHashHex"])) return "repost"
    if (firstHash(post, ["ParentPostHashHex"])) return "reply"
    return "mention"
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

  if (category === "mention" || category === "reply" || category === "repost") {
    const post = record(metadata.SubmitPostTxindexMetadata)
    const keys = category === "repost"
      ? ["RepostedPostHashHex", "RepostPostHashHex", "PostHashHex"]
      : ["PostHashHex", "PostHashBeingModifiedHex", "ParentPostHashHex"]
    const hash = firstHash(post, keys)
    return hash ? `/social?post=${encodeURIComponent(hash)}` : null
  }

  if (category === "like") {
    const like = record(metadata.LikeTxindexMetadata)
    const hash = firstHash(like, ["LikedPostHashHex", "PostHashHex"])
    return hash ? `/social?post=${encodeURIComponent(hash)}` : null
  }

  if (category === "diamond") {
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
        setItems(data.notifications)
        setLastSeenIndex(typeof data.lastSeenIndex === "number" ? data.lastSeenIndex : null)
        setStatus("ready")
        setMessageKey(data.notifications.length ? "loaded" : "empty")
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
    <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/60" aria-labelledby="notification-center-heading">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-4 py-4 sm:px-5">
        <div>
          <h2 id="notification-center-heading" className="text-xl font-semibold text-white">{copy.heading}</h2>
          <p className="mt-1 text-xs text-zinc-500">{copy.active}: {shortKey(session.publicKey, copy.actor)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2"><SponsorPlatform compact /><button type="button" onClick={() => setRefreshToken((value) => value + 1)} disabled={status === "loading"} className="rounded-full border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-[#8fd4a9]/55 hover:text-[#9adbb2] disabled:cursor-wait disabled:opacity-60">{status === "loading" ? copy.refreshing : copy.refresh}</button></div>
      </div>

      <div className="overflow-x-auto border-b border-zinc-800 px-3 py-3 sm:px-4" aria-label={copy.filters}>
        <div className="flex min-w-max gap-2">
          {categories.map((option) => {
            const active = option.id === category
            const count = option.id === "all" ? items.length : items.filter((item) => categoryOf(item) === option.id).length
            return <button key={option.id} type="button" aria-pressed={active} aria-label={`${option.label}: ${count}`} onClick={() => setCategory(option.id)} title={option.label} className={`inline-flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-full border px-2 text-xs font-semibold transition ${active ? "border-[#8fd4a9]/70 bg-[#0c1711] text-[#b8ebca]" : "border-zinc-800 bg-black/20 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"}`}>
              <span aria-hidden="true" className="grid h-5 min-w-5 place-items-center text-base leading-none">{CATEGORY_ICON[option.id]}</span>
              <span className="sr-only">{option.label}</span>
              <span className="min-w-3 text-center text-[9px] font-medium text-zinc-500">{count}</span>
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
          const actor = shortKey(metadata.TransactorPublicKeyBase58Check, copy.actor)
          return <article key={`${item.Index ?? "n"}-${index}`} className={`grid grid-cols-[42px_minmax(0,1fr)] gap-3 px-4 py-4 transition sm:grid-cols-[46px_minmax(0,1fr)_auto] sm:px-5 ${unread ? "bg-[#0b1510]/70" : "bg-black/10"}`}>
            <div aria-hidden="true" className={`grid h-10 w-10 place-items-center rounded-full border text-base font-bold sm:h-11 sm:w-11 ${unread ? "border-[#8fd4a9]/55 bg-[#102019] text-[#9adbb2]" : "border-zinc-800 bg-zinc-950 text-zinc-500"}`}>{CATEGORY_ICON[itemCategory]}</div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <strong className="truncate text-sm font-semibold text-zinc-100">{actor}</strong>
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7dbb93]">{copy.categories[itemCategory]}</span>
                {unread ? <span className="rounded-full border border-[#285f40] px-2 py-0.5 text-[10px] text-[#9adbb2]">{copy.fresh}</span> : null}
              </div>
              <p className="mt-1 text-sm leading-5 text-zinc-400">{copy.descriptions[itemCategory](actor)}</p>
              {destination ? <a href={destination} className="mt-2 inline-flex rounded-full border border-zinc-700 px-2.5 py-1 text-[11px] text-zinc-300 transition hover:border-[#8fd4a9]/55 hover:text-[#9adbb2] sm:hidden">{copy.open}</a> : null}
            </div>
            {destination ? <a href={destination} className="hidden self-center rounded-full border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-[#8fd4a9]/55 hover:text-[#9adbb2] sm:inline-flex">{copy.open}</a> : null}
          </article>
        })}
      </div>
    </section>
  )
}
