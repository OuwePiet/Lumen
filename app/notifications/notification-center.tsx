"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowUpRight, AtSign, Badge, Check, CheckCircle2, ChevronsRight, CircleDot, Gem, Link2, MessageSquare, RefreshCw, Repeat2, ShieldCheck, ShieldOff, Smile, UserRound } from "lucide-react"

const QUALITY_SHIELD_STORAGE_KEY = "via:notifications:quality-shield"
import { restoreIdentitySession, VIA_IDENTITY_EVENT, type ViaIdentitySession } from "../deso-identity-session"
import type { ViaLanguage } from "../via-local-settings"
import LikeButton from "../social/like-button"
import PostComposer from "../social/post-composer"
import RepostButton from "../social/repost-button"
import DiamondButton from "../social/diamond-button"

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
  isVerified?: boolean
  followersCount?: number | null
  numberOfHolders?: number | null
}

type ProfileResponse = {
  ok?: boolean
  profile?: ActorProfile
}

type PublicPost = {
  postHash: string
  publicKey: string
  username: string
  body: string
  imageUrls: string[]
  timestampNanos: number
  likeCount: number
  diamondCount: number
}

type PostResponse = {
  ok?: boolean
  post?: PublicPost
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
  close: string
  selectAll: string
  fresh: string
  actor: string
  descriptions: Record<Exclude<Category, "all">, (actor: string) => string>
}

const COPY: Record<ViaLanguage | "Hindi", Copy> = {
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
    close: "Sluiten",
    selectAll: "Alles selecteren",
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
    close: "Close",
    selectAll: "Select All",
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
    close: "Fermer",
    selectAll: "Tout sélectionner",
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
    close: "Cerrar",
    selectAll: "Seleccionar todo",
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
  Hindi: {
    categories: { all: "सभी", reaction: "प्रतिक्रियाएँ", diamond1: "1 Diamond", diamondMany: "कई Diamonds", creatorCoin: "Creator Coin", follow: "फ़ॉलो", mention5: "उल्लेख · अधिकतम 5", mention6: "उल्लेख · 6+", reply: "जवाब", repost: "रीपोस्ट", nft: "NFT", other: "अन्य" },
    login: "अपने सक्रिय खाते की सूचनाएँ देखने के लिए DeSo से लॉग इन करें।",
    heading: "आपके खाते तक क्या पहुँचा?", active: "सक्रिय खाता", refresh: "रीफ़्रेश", refreshing: "रीफ़्रेश हो रहा है…",
    loadingNotifications: "सूचनाएँ लोड हो रही हैं…", recentLoaded: (count) => `${count} हाल की सूचनाएँ लोड हुईं।`,
    noRecent: "कोई हाल की सूचना नहीं।", unavailable: "सूचनाएँ अस्थायी रूप से उपलब्ध नहीं हैं।", filters: "सूचना फ़िल्टर",
    loading: "लोड हो रहा है…", nothing: "इस फ़िल्टर में कुछ नहीं है।", open: "खोलें", close: "बंद करें", fresh: "नया", actor: "DeSo खाता",
    descriptions: {
      reaction: (actor) => `${actor} ने आपकी एक पोस्ट पर प्रतिक्रिया दी।`,
      diamond1: (actor) => `${actor} ने 1 Diamond भेजा।`,
      diamondMany: (actor) => `${actor} ने कई Diamonds भेजे।`,
      creatorCoin: (actor) => `${actor} ने Creator Coin गतिविधि की।`,
      mention5: (actor) => `${actor} ने आपका उल्लेख किया।`,
      mention6: (actor) => `${actor} ने 6 या अधिक टैग वाली पोस्ट में आपका उल्लेख किया।`,
      reply: (actor) => `${actor} ने आपसे संबंधित पोस्ट का जवाब दिया।`,
      follow: (actor) => `${actor} ने आपके खाते के साथ फ़ॉलो संबंध बदला।`,
      repost: (actor) => `${actor} ने आपसे संबंधित सामग्री रीपोस्ट की।`,
      nft: (actor) => `${actor} ने आपके खाते के लिए NFT गतिविधि की।`,
      other: (actor) => `${actor} ने आपके खाते से संबंधित गतिविधि की।`,
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
    close: "关闭",
    selectAll: "全选",
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
  const filterCategoryIds = useMemo(() => categories.map((option) => option.id).filter((id): id is Exclude<Category, "all"> => id !== "all"), [categories])
  const [activeCategories, setActiveCategories] = useState<Exclude<Category, "all">[]>(() => ["reaction", "diamond1", "diamondMany", "creatorCoin", "follow", "mention5", "mention6", "reply", "repost", "nft", "other"])
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle")
  const [messageKey, setMessageKey] = useState<"loading" | "loaded" | "empty" | "error" | "">("")
  const [lastSeenIndex, setLastSeenIndex] = useState<number | null>(null)
  const [refreshToken, setRefreshToken] = useState(0)
  const [expandedView, setExpandedView] = useState(false)
  const [qualityShield, setQualityShield] = useState(false)
  const [profiles, setProfiles] = useState<Record<string, ActorProfile>>({})
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [postCache, setPostCache] = useState<Record<string, PublicPost | null>>({})
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [copiedPost, setCopiedPost] = useState<string | null>(null)

  useEffect(() => {
    try {
      setQualityShield(window.localStorage.getItem(QUALITY_SHIELD_STORAGE_KEY) === "on")
    } catch {}
  }, [])

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

  function postHashFor(item: NotificationItem) {
    const href = notificationDestination(item)
    if (!href || !href.startsWith("/social?post=")) return null
    try {
      return new URL(href, "https://viadeso.online").searchParams.get("post")
    } catch {
      return null
    }
  }

  async function toggleExpanded(item: NotificationItem, rowKey: string) {
    if (expandedKey === rowKey) {
      setExpandedKey(null)
      return
    }

    setExpandedKey(rowKey)
    const hash = postHashFor(item)
    if (!hash || Object.prototype.hasOwnProperty.call(postCache, hash)) return

    try {
      const response = await fetch(`/api/via/post?hash=${encodeURIComponent(hash)}`, { cache: "no-store" })
      const data = response.ok ? await response.json() as PostResponse : null
      setPostCache((current) => ({ ...current, [hash]: data?.ok && data.post ? data.post : null }))
    } catch {
      setPostCache((current) => ({ ...current, [hash]: null }))
    }
  }

  const allCategoriesActive = filterCategoryIds.every((id) => activeCategories.includes(id))
  const actorActivityCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const item of items) {
      const metadata = record(item.Metadata) ?? {}
      const publicKey = metadata.TransactorPublicKeyBase58Check
      if (typeof publicKey === "string" && PUBLIC_KEY_RE.test(publicKey)) counts[publicKey] = (counts[publicKey] ?? 0) + 1
    }
    return counts
  }, [items])

  function qualityShieldHides(item: NotificationItem) {
    if (!qualityShield) return false
    const metadata = record(item.Metadata) ?? {}
    const publicKey = metadata.TransactorPublicKeyBase58Check
    if (typeof publicKey !== "string" || !PUBLIC_KEY_RE.test(publicKey)) return false
    const profile = profiles[publicKey]
    if (!profile) return false

    const repeatedBurst = (actorActivityCounts[publicKey] ?? 0) >= 4
    const weakProfile = profile.isVerified !== true
      && !profile.profilePic
      && profile.followersCount === 0
      && profile.numberOfHolders === 0

    return repeatedBurst && weakProfile
  }

  const visible = useMemo(
    () => items.filter((item) => activeCategories.includes(categoryOf(item)) && !qualityShieldHides(item)),
    [items, activeCategories, qualityShield, profiles, actorActivityCounts],
  )
  const shieldHiddenCount = useMemo(
    () => qualityShield ? items.filter((item) => qualityShieldHides(item)).length : 0,
    [items, qualityShield, profiles, actorActivityCounts],
  )

  function toggleCategory(id: Category) {
    if (id === "all") {
      setActiveCategories(allCategoriesActive ? [] : filterCategoryIds)
      return
    }
    setActiveCategories((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id])
  }
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
          <button
            type="button"
            onClick={() => setQualityShield((value) => {
              const next = !value
              try {
                window.localStorage.setItem(QUALITY_SHIELD_STORAGE_KEY, next ? "on" : "off")
              } catch {}
              return next
            })}
            title={qualityShield ? `Quality Shield on · ${shieldHiddenCount} hidden` : "Quality Shield off"}
            aria-label={qualityShield ? `Quality Shield on · ${shieldHiddenCount} hidden` : "Quality Shield off"}
            aria-pressed={qualityShield}
            className={`relative grid h-9 w-9 place-items-center rounded-full border text-white transition ${qualityShield ? "border-[#8fd4a9] bg-[#285f40]" : "border-[#9b9b9b] bg-[#9b9b9b]"}`}
          >
            {qualityShield ? <ShieldCheck className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
            {qualityShield && shieldHiddenCount > 0 ? <span aria-hidden="true" className="absolute -right-1 -top-1 grid min-h-4 min-w-4 place-items-center rounded-full border border-black bg-[#8fd4a9] px-1 text-[9px] font-bold leading-none text-black">{shieldHiddenCount}</span> : null}
          </button>
          <button type="button" onClick={() => setActiveCategories(allCategoriesActive ? [] : filterCategoryIds)} title={copy.selectAll} aria-label={copy.selectAll} aria-pressed={allCategoriesActive} className={`grid h-9 w-9 place-items-center rounded-full border text-white transition ${allCategoriesActive ? "border-[#8fd4a9] bg-[#285f40]" : "border-[#9b9b9b] bg-[#9b9b9b]"}`}>
            <CheckCircle2 className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setRefreshToken((value) => value + 1)} disabled={status === "loading"} title={copy.refresh} aria-label={copy.refresh} className="grid h-9 w-9 place-items-center rounded-full border border-[#8fd4a9] bg-[#285f40] text-white transition disabled:cursor-wait disabled:opacity-60">
            <RefreshCw className={`h-4 w-4 ${status === "loading" ? "animate-spin" : ""}`} />
          </button>
          <button type="button" onClick={() => setExpandedView((value) => !value)} title="Expand View" aria-label="Expand View" aria-pressed={expandedView} className={`grid h-9 w-9 place-items-center rounded-full border text-white transition ${expandedView ? "border-[#8fd4a9] bg-[#285f40]" : "border-[#9b9b9b] bg-[#9b9b9b]"}`}>
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="sticky top-[73px] z-20 border-b border-zinc-800 bg-zinc-950/95 px-3 py-3 backdrop-blur sm:px-4" aria-label={copy.filters}>
        <div className="flex flex-wrap gap-2">
          {categories.map((option) => {
            const active = option.id === "all" ? allCategoriesActive : activeCategories.includes(option.id)
            const count = option.id === "all" ? items.length : items.filter((item) => categoryOf(item) === option.id).length
            return <button key={option.id} type="button" aria-pressed={active} onClick={() => toggleCategory(option.id)} title={option.label} className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-2.5 text-xs font-semibold transition sm:gap-2 sm:px-3 ${active ? "border-[#8fd4a9] bg-[#285f40] text-white shadow-[0_0_0_1px_rgba(143,212,169,0.18)]" : "border-[#9b9b9b] bg-[#9b9b9b] text-white hover:border-[#7f7f7f] hover:bg-[#7f7f7f]"}`}>
              <span aria-hidden="true" className="grid h-5 min-w-5 place-items-center text-sm"><CategoryIcon category={option.id} /></span>
              <span className="hidden sm:inline">{option.label}</span>
              <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-300">{count}</span>
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
          const postHash = postHashFor(item)
          const post = postHash ? postCache[postHash] : undefined
          return <article key={rowKey} className={`grid grid-cols-[42px_minmax(0,1fr)] gap-3 px-4 py-4 transition sm:grid-cols-[46px_minmax(0,1fr)_auto] sm:px-5 ${unread ? "bg-[#0b1510]/70" : "bg-black/10"}`}>
            <div className="relative h-10 w-10 sm:h-11 sm:w-11">
              {profile.profilePic ? <img src={profile.profilePic} alt="" referrerPolicy="no-referrer" className="h-full w-full rounded-full border border-zinc-700 object-cover" /> : <div aria-hidden="true" className={`grid h-full w-full place-items-center rounded-full border text-base font-bold ${unread ? "border-[#8fd4a9] bg-[#285f40] text-white" : "border-[#8e8e8e] bg-[#8e8e8e] text-white"}`}><CategoryIcon category={itemCategory} className="h-5 w-5" /></div>}
              <span aria-hidden="true" className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full border border-zinc-700 bg-black text-white"><CategoryIcon category={itemCategory} className="h-3 w-3" /></span>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <strong className="truncate text-sm font-semibold text-zinc-100">{actor}</strong>
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7dbb93]">{copy.categories[itemCategory]}</span>
                {unread ? <span className="rounded-full border border-[#285f40] px-2 py-0.5 text-[10px] text-[#9adbb2]">{copy.fresh}</span> : null}
              </div>
              <p className="mt-1 text-sm leading-5 text-zinc-400">{copy.descriptions[itemCategory](actor)}</p>
              {destination ? <button type="button" onClick={() => void toggleExpanded(item, rowKey)} className="mt-2 inline-flex rounded-full border border-zinc-700 px-2.5 py-1 text-[11px] text-zinc-300 transition hover:border-[#8fd4a9] hover:text-white">{expanded ? copy.close : copy.open}</button> : null}
              {expanded && postHash ? <div className="mt-3 rounded-xl border border-zinc-800 bg-black/25 p-3">
                {post === undefined ? <p className="text-xs text-zinc-500">{copy.loading}</p> : post ? <>
                  <p className="text-xs font-semibold text-zinc-300">@{post.username?.replace(/^@/, "") || shortKey(post.publicKey, copy.actor)}</p>
                  {post.body ? <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-200">{post.body}</p> : null}
                  {post.imageUrls?.length ? <div className="mt-3 grid gap-2 sm:grid-cols-2">{post.imageUrls.slice(0, 4).map((url) => <img key={url} src={url} alt="" loading="lazy" className="max-h-72 w-full rounded-xl object-contain" />)}</div> : null}
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-zinc-800/70 pt-3">
                    <button
                      type="button"
                      onClick={() => setReplyingTo((current) => current === post.postHash ? null : post.postHash)}
                      title="Reply"
                      aria-label="Reply"
                      aria-pressed={replyingTo === post.postHash}
                      className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-2 text-xs transition ${replyingTo === post.postHash ? "border-[#8fd4a9] bg-[#285f40] text-white" : "border-zinc-800 text-zinc-300 hover:border-[#8fd4a9] hover:text-white"}`}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                    <RepostButton postHash={post.postHash} initialCount={0} variant="icon" />
                    <LikeButton postHash={post.postHash} initialCount={post.likeCount} variant="icon" />
                    <DiamondButton postHash={post.postHash} receiverPublicKey={post.publicKey} initialCount={post.diamondCount} variant="icon" />
                    <button
                      type="button"
                      disabled
                      title="Value/$ action — meaning still to confirm"
                      aria-label="Value/$ action — meaning still to confirm"
                      className="inline-flex h-9 min-w-9 items-center justify-center gap-0.5 rounded-full border border-zinc-900 px-2 text-xs text-zinc-700 disabled:cursor-not-allowed"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                      <span>$</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const url = `${window.location.origin}/social?post=${encodeURIComponent(post.postHash)}`
                        void navigator.clipboard?.writeText(url).then(() => {
                          setCopiedPost(post.postHash)
                          window.setTimeout(() => setCopiedPost((current) => current === post.postHash ? null : current), 1400)
                        }).catch(() => {})
                      }}
                      title={copiedPost === post.postHash ? "Link copied" : "Copy link"}
                      aria-label={copiedPost === post.postHash ? "Link copied" : "Copy link"}
                      className={`grid h-9 w-9 place-items-center rounded-full border text-xs transition ${copiedPost === post.postHash ? "border-[#8fd4a9] bg-[#285f40] text-white" : "border-zinc-800 text-zinc-300 hover:border-[#8fd4a9] hover:text-white"}`}
                    >
                      {copiedPost === post.postHash ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                    </button>
                    {Number.isFinite(post.timestampNanos) && post.timestampNanos > 0 ? <span className="ml-auto self-center whitespace-nowrap text-[11px] text-zinc-600">{new Date(post.timestampNanos / 1_000_000).toLocaleString()}</span> : null}
                  </div>
                  {replyingTo === post.postHash ? <div className="mt-3"><PostComposer parentStakeID={post.postHash} compact onDone={() => setReplyingTo(null)} /></div> : null}
                </> : <p className="text-xs text-zinc-500">Post unavailable.</p>}
              </div> : expanded && destination ? <div className="mt-3 rounded-xl border border-zinc-800 bg-black/25 p-3 text-xs text-zinc-500">{destination}</div> : null}
            </div>
            {destination ? <button type="button" onClick={() => void toggleExpanded(item, rowKey)} className="hidden self-center rounded-full border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-[#8fd4a9] hover:text-white sm:inline-flex">{expanded ? copy.close : copy.open}</button> : null}
          </article>
        })}
      </div>
    </section>
  )
}
