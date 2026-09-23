"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowUpRight, AtSign, Badge, Check, CheckCircle2, ChevronsRight, CircleDot, Gem, Heart, Link2, MessageSquare, RefreshCw, Repeat2, ShieldCheck, ShieldOff, Smile, UserPlus, UserRound } from "lucide-react"

const QUALITY_SHIELD_STORAGE_KEY = "via:notifications:quality-shield"
import { DESO_IDENTITY_ORIGIN, restoreIdentitySession, VIA_IDENTITY_EVENT, type ViaIdentitySession } from "../deso-identity-session"
import { fetchViaRates, isViaRateStale } from "../via-live-rates"
import type { ViaLanguage } from "../via-local-settings"
import LikeButton from "../social/like-button"
import PostComposer from "../social/post-composer"
import RepostButton from "../social/repost-button"
import DiamondButton from "../social/diamond-button"
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
  expandView: string
  replyAction: string
  copyLink: string
  linkCopied: string
  postUnavailable: string
  rewardAction: string
  rewardAmount: string
  rewardSend: string
  rewardRateUnavailable: string
  rewardSending: string
  rewardSent: string
  rewardFailed: string
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
    expandView: "Uitgebreide weergave",
    replyAction: "Antwoorden",
    copyLink: "Link kopiëren",
    linkCopied: "Link gekopieerd",
    postUnavailable: "Bericht niet beschikbaar.",
    rewardAction: "Beloning in $", rewardAmount: "Bedrag in USD", rewardSend: "Verstuur beloning", rewardRateUnavailable: "Actuele DESO/USD-koers niet beschikbaar.", rewardSending: "Beloning voorbereiden…", rewardSent: "Beloning verzonden.", rewardFailed: "Beloning niet verzonden.",
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
    expandView: "Expand View",
    replyAction: "Reply",
    copyLink: "Copy link",
    linkCopied: "Link copied",
    postUnavailable: "Post unavailable.",
    rewardAction: "Reward in $", rewardAmount: "Amount in USD", rewardSend: "Send reward", rewardRateUnavailable: "Current DESO/USD rate unavailable.", rewardSending: "Preparing reward…", rewardSent: "Reward sent.", rewardFailed: "Reward not sent.",
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
    expandView: "Vue étendue",
    replyAction: "Répondre",
    copyLink: "Copier le lien",
    linkCopied: "Lien copié",
    postUnavailable: "Publication indisponible.",
    rewardAction: "Récompense en $", rewardAmount: "Montant en USD", rewardSend: "Envoyer la récompense", rewardRateUnavailable: "Taux DESO/USD actuel indisponible.", rewardSending: "Préparation de la récompense…", rewardSent: "Récompense envoyée.", rewardFailed: "Récompense non envoyée.",
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
    expandView: "Vista ampliada",
    replyAction: "Responder",
    copyLink: "Copiar enlace",
    linkCopied: "Enlace copiado",
    postUnavailable: "Publicación no disponible.",
    rewardAction: "Recompensa en $", rewardAmount: "Importe en USD", rewardSend: "Enviar recompensa", rewardRateUnavailable: "Tipo DESO/USD actual no disponible.", rewardSending: "Preparando recompensa…", rewardSent: "Recompensa enviada.", rewardFailed: "Recompensa no enviada.",
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
    loading: "लोड हो रहा है…", nothing: "इस फ़िल्टर में कुछ नहीं है।", open: "खोलें", close: "बंद करें", selectAll: "सभी चुनें", expandView: "विस्तृत दृश्य", replyAction: "जवाब दें", copyLink: "लिंक कॉपी करें", linkCopied: "लिंक कॉपी हो गया", postUnavailable: "पोस्ट उपलब्ध नहीं है।",
    rewardAction: "$ में इनाम", rewardAmount: "USD राशि", rewardSend: "इनाम भेजें", rewardRateUnavailable: "वर्तमान DESO/USD दर उपलब्ध नहीं है।", rewardSending: "इनाम तैयार हो रहा है…", rewardSent: "इनाम भेज दिया गया।", rewardFailed: "इनाम नहीं भेजा गया।", fresh: "नया", actor: "DeSo खाता",
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
    expandView: "展开视图",
    replyAction: "回复",
    copyLink: "复制链接",
    linkCopied: "链接已复制",
    postUnavailable: "帖子不可用。",
    rewardAction: "美元奖励", rewardAmount: "USD 金额", rewardSend: "发送奖励", rewardRateUnavailable: "当前 DESO/USD 汇率不可用。", rewardSending: "正在准备奖励…", rewardSent: "奖励已发送。", rewardFailed: "奖励未发送。",
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
  const [rewardPost, setRewardPost] = useState<string | null>(null)
  const [rewardUsd, setRewardUsd] = useState("1.00")
  const [rewardMessage, setRewardMessage] = useState("")
  const [rewardBusy, setRewardBusy] = useState(false)
  const rewardPopup = useRef<Window | null>(null)
  const rewardPending = useRef<{ postHash: string } | null>(null)

  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      if (event.origin !== DESO_IDENTITY_ORIGIN || event.source !== rewardPopup.current || !rewardPending.current) return
      const data = event.data as Record<string, unknown> | null
      const payload = data?.payload as Record<string, unknown> | undefined
      const signedTransactionHex = data?.service === "identity" && typeof payload?.signedTransactionHex === "string" ? payload.signedTransactionHex : null
      if (!signedTransactionHex) return
      rewardPopup.current?.close()
      rewardPopup.current = null
      try {
        const response = await fetch("/api/via/social/reward", { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", body: JSON.stringify({ action: "submit", signedTransactionHex }) })
        const result = await response.json() as { ok?: boolean }
        if (!response.ok || !result.ok) throw new Error("SUBMIT_FAILED")
        setRewardMessage(copy.rewardSent)
        setRewardPost(null)
      } catch {
        setRewardMessage(copy.rewardFailed)
      } finally {
        setRewardBusy(false)
        rewardPending.current = null
      }
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [copy])

  async function sendReward(post: PublicPost) {
    if (!session || rewardBusy) return
    const usd = Number(rewardUsd)
    if (!Number.isFinite(usd) || usd <= 0) { setRewardMessage(copy.rewardFailed); return }
    setRewardBusy(true)
    setRewardMessage(copy.rewardSending)
    try {
      const rates = await fetchViaRates()
      if (isViaRateStale(rates.checkedAt) || !rates.rates?.USD || rates.rates.USD <= 0) throw new Error("RATE")
      const amountNanos = Math.round((usd / rates.rates.USD) * 1_000_000_000)
      if (!Number.isSafeInteger(amountNanos) || amountNanos < 1) throw new Error("AMOUNT")
      const response = await fetch("/api/via/social/reward", { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", body: JSON.stringify({ action: "prepare", senderPublicKey: session.publicKey, recipientPublicKey: post.publicKey, amountNanos, confirmed: true }) })
      const result = await response.json() as { ok?: boolean; transactionHex?: string }
      if (!response.ok || !result.ok || !result.transactionHex) throw new Error("PREPARE")
      const popup = window.open(`${DESO_IDENTITY_ORIGIN}/approve?tx=${encodeURIComponent(result.transactionHex)}`, "via-post-reward-approve", `popup=yes,width=${Math.min(800, window.screen.availWidth)},height=${Math.min(900, window.screen.availHeight)}`)
      if (!popup) throw new Error("POPUP")
      rewardPopup.current = popup
      rewardPending.current = { postHash: post.postHash }
    } catch (error) {
      setRewardBusy(false)
      setRewardMessage(error instanceof Error && error.message === "RATE" ? copy.rewardRateUnavailable : copy.rewardFailed)
    }
  }

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
    if (id === "diamond1" || id === "diamondMany") {
      setActiveCategories((current) => {
        const bothActive = current.includes("diamond1") && current.includes("diamondMany")
        if (bothActive) return current.filter((value) => value !== "diamond1" && value !== "diamondMany")
        return filterCategoryIds.filter((value) => current.includes(value) || value === "diamond1" || value === "diamondMany")
      })
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
    <section className={`${expandedView ? "max-h-[calc(100vh-6rem)]" : "max-h-[88vh]"} overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950/60`} aria-labelledby="notification-center-heading">
      <div className="sticky top-0 z-20 flex flex-nowrap items-center justify-between gap-1 border-b border-zinc-800 bg-zinc-950/95 px-2 py-1 backdrop-blur max-sm:flex-col-reverse max-sm:items-stretch sm:flex-wrap sm:gap-3 sm:px-5 sm:py-4">
        <div className="hidden sm:block">
          <h2 id="notification-center-heading" className="whitespace-nowrap text-xl font-semibold text-white">{copy.heading}</h2>
          <p className="mt-1 text-xs text-zinc-500">{copy.active}: {shortKey(session.publicKey, copy.actor)}</p>
        </div>
        <div className="flex w-full shrink-0 flex-nowrap items-start justify-between sm:w-auto sm:flex-wrap sm:items-center sm:justify-start sm:gap-2">
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
            className={`relative grid h-7 w-7 place-items-center rounded-full border sm:h-9 sm:w-9 text-white transition ${qualityShield ? "border-[#8fd4a9] bg-[#285f40]" : "border-[#9b9b9b] bg-[#9b9b9b]"}`}
          >
            {qualityShield ? <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <ShieldOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            {qualityShield && shieldHiddenCount > 0 ? <span aria-hidden="true" className="absolute -right-1 -top-1 grid min-h-4 min-w-4 place-items-center rounded-full border border-black bg-[#8fd4a9] px-1 text-[9px] font-bold leading-none text-black">{shieldHiddenCount}</span> : null}
          </button>
          <button type="button" onClick={() => setActiveCategories(allCategoriesActive ? [] : filterCategoryIds)} title={copy.selectAll} aria-label={copy.selectAll} aria-pressed={allCategoriesActive} className={`grid h-7 w-7 place-items-center rounded-full border sm:h-9 sm:w-9 text-white transition ${allCategoriesActive ? "border-[#8fd4a9] bg-[#285f40]" : "border-[#9b9b9b] bg-[#9b9b9b]"}`}>
            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
          <button type="button" onClick={() => setRefreshToken((value) => value + 1)} disabled={status === "loading"} title={copy.refresh} aria-label={copy.refresh} className="grid h-7 w-7 place-items-center rounded-full border sm:h-9 sm:w-9 border-[#8fd4a9] bg-[#285f40] text-white transition disabled:cursor-wait disabled:opacity-60">
            <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${status === "loading" ? "animate-spin" : ""}`} />
          </button>
          <button type="button" onClick={() => setExpandedView((value) => !value)} title={copy.expandView} aria-label={copy.expandView} aria-pressed={expandedView} className={`grid h-7 w-7 place-items-center rounded-full border sm:h-9 sm:w-9 text-white transition ${expandedView ? "border-[#8fd4a9] bg-[#285f40]" : "border-[#9b9b9b] bg-[#9b9b9b]"}`}>
            <ChevronsRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
          <div className="hidden flex-col items-center gap-0.5 max-sm:flex">
            <div className="relative h-7 w-7 overflow-hidden rounded-full [&>button]:!absolute [&>button]:!inset-0 [&>button]:!z-0 [&>button]:!grid [&>button]:!h-7 [&>button]:!w-7 [&>button]:!min-h-0 [&>button]:!place-items-center [&>button]:!overflow-hidden [&>button]:!rounded-full [&>button]:!p-0 [&>button]:!text-[0] [&>button]:!leading-none [&>button>span]:!hidden [&>button>svg]:!m-0 [&>button>svg]:!h-4 [&>button>svg]:!w-4">
              <SponsorPlatform compact />
            </div>
            <span className="text-[8px] leading-[10px] text-zinc-500">Sponsor VIA</span>
          </div>
          <div className="hidden flex-col items-center gap-0.5 max-sm:flex">
            <Link href="/social" aria-label="Social" title="Social" className="grid h-7 w-7 place-items-center rounded-full border border-[#8fd4a9]/35 bg-[#050b08]/80 text-[#9adbb2]">
              <span className="text-lg font-light leading-none" aria-hidden="true">←</span>
            </Link>
            <span className="text-[8px] leading-[10px] text-zinc-500">Social</span>
          </div>
        </div>
      </div>

      <div className="sticky top-[36px] z-20 border-b border-zinc-800 bg-zinc-950/95 px-1 py-1 backdrop-blur sm:top-[73px] sm:px-4 sm:py-3" aria-label={copy.filters}>
        <div className="flex justify-between gap-0.5 overflow-visible px-0 pb-3 pt-0.5 sm:flex-wrap sm:justify-start sm:gap-2 sm:px-0 sm:pt-0 sm:pb-0">
          {([
            { id: "all", label: copy.categories.all, symbol: "●", ids: filterCategoryIds },
            { id: "likes", symbol: "♥", label: language === "Dutch" ? "Likes" : language === "French" ? "J’aime" : language === "Spanish" ? "Me gusta" : language === "Chinese" ? "点赞" : language === "Hindi" ? "लाइक्स" : "Likes", ids: ["reaction"] },
            { id: "diamonds", symbol: "◆", label: language === "Dutch" ? "Diamanten" : language === "French" ? "Diamants" : language === "Spanish" ? "Diamantes" : language === "Chinese" ? "钻石" : language === "Hindi" ? "डायमंड्स" : "Diamonds", ids: ["diamond1", "diamondMany"] },
            { id: "mentions", symbol: "@", label: language === "Dutch" ? "Vermeldingen" : language === "French" ? "Mentions" : language === "Spanish" ? "Menciones" : language === "Chinese" ? "提及" : language === "Hindi" ? "उल्लेख" : "Mentions", ids: ["mention5", "mention6"] },
            { id: "replies", symbol: "↩", label: copy.categories.reply, ids: ["reply"] },
            { id: "reposts", symbol: "↻", label: copy.categories.repost, ids: ["repost"] },
            { id: "follows", symbol: "+", label: copy.categories.follow, ids: ["follow"] },
          ] as { id: string; label: string; symbol: string; ids: Exclude<Category, "all">[] }[]).map((option) => {
            const active = option.ids.every((id) => activeCategories.includes(id))
            const count = option.id === "all" ? items.length : items.filter((item) => option.ids.includes(categoryOf(item))).length
            return <button key={option.id} type="button" aria-pressed={active} onClick={() => {
              setActiveCategories((current) => {
                if (option.id === "all") return allCategoriesActive ? [] : filterCategoryIds
                const allActive = option.ids.every((id) => current.includes(id))
                return allActive ? current.filter((id) => !option.ids.includes(id)) : Array.from(new Set([...current, ...option.ids]))
              })
            }} title={option.label} aria-label={`${option.label} · ${count}`} className={`relative inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border p-0 text-[11px] font-semibold transition sm:h-auto sm:w-auto sm:min-h-9 sm:gap-2 sm:rounded-xl sm:px-3 sm:py-1.5 sm:text-xs ${active ? "border-[#8fd4a9]/70 bg-[#10251a] text-white" : "border-zinc-800 bg-[#111214] text-zinc-300 hover:border-[#8fd4a9]/45"}`}>
              <span className="sm:hidden" aria-hidden="true">{option.id === "likes" ? <Heart className="h-3 w-3" /> : option.id === "diamonds" ? <Gem className="h-3 w-3" /> : option.id === "mentions" ? <AtSign className="h-3 w-3" /> : option.id === "replies" ? <MessageSquare className="h-3 w-3" /> : option.id === "reposts" ? <Repeat2 className="h-3 w-3" /> : option.id === "follows" ? <UserPlus className="h-3 w-3" /> : option.id === "all" ? <CircleDot className="h-3 w-3" /> : option.symbol}</span><span className="pointer-events-none absolute left-1/2 top-full mt-0.5 -translate-x-1/2 whitespace-nowrap text-[7px] font-normal leading-[9px] text-zinc-500 sm:hidden">{option.label}</span><span className="hidden sm:inline">{option.label}</span>
              {count > 0 ? <span aria-hidden="true" className="absolute -right-1 -top-1 grid min-h-3.5 min-w-3.5 place-items-center rounded-full bg-[#39d98a] px-0.5 text-[7px] font-bold leading-none text-[#041009] sm:-right-1.5 sm:-top-1.5 sm:min-h-5 sm:min-w-5 sm:text-[9px]">{count}</span> : null}
            </button>
          })}
        </div>
      </div>

      <div className="flex items-baseline gap-2 px-3 pt-1 sm:px-5 sm:pt-3"><span className="text-[9px] font-medium leading-4 text-[#8fd4a9] sm:hidden">Notifications</span><p className={`text-[9px] leading-4 sm:text-xs sm:leading-normal ${status === "error" ? "text-amber-300" : "text-zinc-500"}`} role="status" aria-live="polite">{message}</p></div>

      <div className="mt-1 sm:mt-2 sm:divide-y sm:divide-zinc-800">
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
          return <article key={rowKey} className={`mx-1 mb-1 grid grid-cols-[34px_minmax(0,1fr)] gap-2 rounded-xl border px-2 py-1.5 transition sm:mx-0 sm:mb-0 sm:rounded-none sm:border-x-0 sm:border-b-0 sm:grid-cols-[46px_minmax(0,1fr)_auto] sm:gap-3 sm:px-5 sm:py-4 ${unread ? "border-[#285f40]/70 bg-[#0b1510]/70" : "border-zinc-800 bg-black/10"}`}>
            <div className="relative h-8 w-8 sm:h-11 sm:w-11">
              {profile.profilePic ? <img src={profile.profilePic} alt="" referrerPolicy="no-referrer" className="h-full w-full rounded-full border border-zinc-700 object-cover" /> : <div aria-hidden="true" className={`grid h-full w-full place-items-center rounded-full border text-base font-bold ${unread ? "border-[#8fd4a9] bg-[#285f40] text-white" : "border-[#8e8e8e] bg-[#8e8e8e] text-white"}`}><CategoryIcon category={itemCategory} className="h-5 w-5" /></div>}
              <span aria-hidden="true" className="absolute -bottom-1 -right-1 grid h-4 w-4 sm:h-5 sm:w-5 place-items-center rounded-full border border-zinc-700 bg-black text-white"><CategoryIcon category={itemCategory} className="h-3 w-3" /></span>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <strong className="truncate text-[13px] font-semibold text-zinc-100 sm:text-sm">{actor}</strong>
                <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#7dbb93] sm:text-[11px] sm:tracking-[0.08em]">{copy.categories[itemCategory]}</span>
                {unread ? <span className="rounded-full border border-[#285f40] px-2 py-0.5 text-[10px] text-[#9adbb2]">{copy.fresh}</span> : null}
              </div>
              <p className="mt-0 text-[12px] leading-4 text-zinc-400 sm:mt-1 sm:text-sm sm:leading-5">{copy.descriptions[itemCategory](actor)}</p>
              {destination ? <button type="button" onClick={() => void toggleExpanded(item, rowKey)} className="mt-1 inline-flex rounded-full border border-zinc-700 px-1.5 py-0.5 text-[9px] leading-none text-zinc-300 transition hover:border-[#8fd4a9] hover:text-white sm:mt-2 sm:px-2.5 sm:py-1 sm:text-[11px] sm:leading-normal">{expanded ? copy.close : copy.open}</button> : null}
              {expanded && postHash ? <div className="mt-3 rounded-xl border border-zinc-800 bg-black/25 p-3">
                {post === undefined ? <p className="text-xs text-zinc-500">{copy.loading}</p> : post ? <>
                  <p className="text-xs font-semibold text-zinc-300">@{post.username?.replace(/^@/, "") || shortKey(post.publicKey, copy.actor)}</p>
                  {post.body ? <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-200">{post.body}</p> : null}
                  {post.imageUrls?.length ? <div className="mt-3 grid gap-2 sm:grid-cols-2">{post.imageUrls.slice(0, 4).map((url) => <img key={url} src={url} alt="" loading="lazy" className="max-h-72 w-full rounded-xl object-contain" />)}</div> : null}
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-zinc-800/70 pt-3">
                    <button
                      type="button"
                      onClick={() => setReplyingTo((current) => current === post.postHash ? null : post.postHash)}
                      title={copy.replyAction}
                      aria-label={copy.replyAction}
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
                      onClick={() => { setRewardPost((current) => current === post.postHash ? null : post.postHash); setRewardMessage("") }}
                      title={copy.rewardAction}
                      aria-label={copy.rewardAction}
                      aria-pressed={rewardPost === post.postHash}
                      className={`inline-flex h-9 min-w-9 items-center justify-center gap-0.5 rounded-full border px-2 text-xs transition ${rewardPost === post.postHash ? "border-[#8fd4a9] bg-[#285f40] text-white" : "border-zinc-800 text-zinc-300 hover:border-[#8fd4a9] hover:text-white"}`}
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
                      title={copiedPost === post.postHash ? copy.linkCopied : copy.copyLink}
                      aria-label={copiedPost === post.postHash ? copy.linkCopied : copy.copyLink}
                      className={`grid h-8 w-8 place-items-center rounded-full border sm:h-9 sm:w-9 text-xs transition ${copiedPost === post.postHash ? "border-[#8fd4a9] bg-[#285f40] text-white" : "border-zinc-800 text-zinc-300 hover:border-[#8fd4a9] hover:text-white"}`}
                    >
                      {copiedPost === post.postHash ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                    </button>
                    {Number.isFinite(post.timestampNanos) && post.timestampNanos > 0 ? <span className="ml-auto self-center whitespace-nowrap text-[11px] text-zinc-600">{new Date(post.timestampNanos / 1_000_000).toLocaleString()}</span> : null}
                  </div>
                  {rewardPost === post.postHash ? <div className="mt-3 rounded-xl border border-[#285f40]/70 bg-[#07110b] p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="text-xs text-zinc-400" htmlFor={`reward-${post.postHash}`}>{copy.rewardAmount}</label>
                      <div className="flex items-center rounded-lg border border-zinc-700 bg-black/30 px-2">
                        <span className="text-sm text-zinc-400">$</span>
                        <input id={`reward-${post.postHash}`} value={rewardUsd} onChange={(event) => setRewardUsd(event.target.value)} inputMode="decimal" className="w-20 bg-transparent px-1.5 py-1.5 text-sm text-white outline-none" aria-label={copy.rewardAmount} />
                      </div>
                      <span className="min-w-0 truncate text-[11px] text-zinc-500">@{post.username?.replace(/^@/, "") || shortKey(post.publicKey, copy.actor)}</span>
                      <button type="button" disabled={rewardBusy} onClick={() => void sendReward(post)} title={copy.rewardSend} aria-label={copy.rewardSend} className="inline-flex h-8 items-center gap-1 rounded-full border border-[#8fd4a9] bg-[#285f40] px-3 text-xs font-semibold text-white disabled:opacity-50">
                        <ArrowUpRight className="h-3.5 w-3.5" /><span>{rewardUsd ? `${rewardUsd}` : "$"}</span>
                      </button>
                    </div>
                    {rewardMessage ? <p className="mt-2 text-[11px] text-zinc-400" role="status">{rewardMessage}</p> : null}
                  </div> : null}
                  {replyingTo === post.postHash ? <div className="mt-3"><PostComposer parentStakeID={post.postHash} compact onDone={() => setReplyingTo(null)} /></div> : null}
                </> : <p className="text-xs text-zinc-500">{copy.postUnavailable}</p>}
              </div> : expanded && destination ? <div className="mt-3 rounded-xl border border-zinc-800 bg-black/25 p-3 text-xs text-zinc-500">{destination}</div> : null}
            </div>
            {destination ? <button type="button" onClick={() => void toggleExpanded(item, rowKey)} className="hidden self-center rounded-full border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-[#8fd4a9] hover:text-white sm:inline-flex">{expanded ? copy.close : copy.open}</button> : null}
          </article>
        })}
      </div>
    </section>
  )
}
