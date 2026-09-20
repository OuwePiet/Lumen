"use client"

import { useEffect, useMemo, useState } from "react"
import { restoreIdentitySession, VIA_IDENTITY_EVENT, type ViaIdentitySession } from "../deso-identity-session"
import type { ViaLanguage } from "../via-local-settings"
import SponsorPlatform from "../sponsor-platform"
import ViaIdentityStatusMarks from "../via-identity-status"

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

type FilterId =
  | "reaction"
  | "diamond1"
  | "diamondMany"
  | "creatorCoin"
  | "follow"
  | "mention5"
  | "mention6"
  | "reply"
  | "repost"
  | "nft"

type ActorProfile = {
  username?: string
  profilePic?: string | null
  isVerified?: boolean
  isInactive?: boolean
}

type ProfileResponse = { ok?: boolean; profile?: ActorProfile }

type PublicPost = {
  postHash: string
  publicKey: string
  username?: string
  body: string
  imageUrls: string[]
  videoUrls: string[]
  timestampNanos: number
  likeCount: number
  diamondCount: number
  commentCount: number
  repostCount: number
  quoteRepostCount: number
}

type PostResponse = { ok?: boolean; post?: PublicPost }

const FILTERS: Array<{ id: FilterId; icon: string; label: string }> = [
  { id: "reaction", icon: "☺", label: "Reactions" },
  { id: "diamond1", icon: "◇", label: "Single Diamond" },
  { id: "diamondMany", icon: "◇◇", label: "Multiple Diamonds" },
  { id: "creatorCoin", icon: "$", label: "Creator Coin" },
  { id: "follow", icon: "♙", label: "Follows" },
  { id: "mention5", icon: "@5", label: "Mentions · max 5 tags" },
  { id: "mention6", icon: "@6+", label: "Mentions · 6 or more tags" },
  { id: "reply", icon: "▢", label: "Replies" },
  { id: "repost", icon: "↻", label: "Reposts" },
  { id: "nft", icon: "◈", label: "NFT" },
]

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

function actorKey(item: NotificationItem) {
  const metadata = record(item.Metadata)
  const value = metadata?.TransactorPublicKeyBase58Check
  return typeof value === "string" && PUBLIC_KEY_RE.test(value) ? value : ""
}

function diamondLevel(item: NotificationItem) {
  const metadata = record(item.Metadata) ?? {}
  const basic = record(metadata.BasicTransferTxindexMetadata)
  const creatorTransfer = record(metadata.CreatorCoinTransferTxindexMetadata)
  const level = basic?.DiamondLevel ?? creatorTransfer?.DiamondLevel
  return typeof level === "number" && Number.isFinite(level) ? level : 0
}

function explicitMentionCount(source: Record<string, unknown> | null) {
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

function filterOf(item: NotificationItem): FilterId | "other" {
  const metadata = record(item.Metadata) ?? {}
  const level = diamondLevel(item)
  if (level > 0) return level > 1 ? "diamondMany" : "diamond1"
  if (record(metadata.LikeTxindexMetadata)) return "reaction"
  if (record(metadata.FollowTxindexMetadata)) return "follow"
  if (record(metadata.CreatorCoinTxindexMetadata) || record(metadata.CreatorCoinTransferTxindexMetadata)) return "creatorCoin"

  const post = record(metadata.SubmitPostTxindexMetadata)
  if (post) {
    if (firstHash(post, ["RepostedPostHashHex", "RepostPostHashHex"])) return "repost"
    if (firstHash(post, ["ParentPostHashHex"])) return "reply"
    return explicitMentionCount(post) >= 6 ? "mention6" : "mention5"
  }

  if (
    record(metadata.NFTBidTxindexMetadata) ||
    record(metadata.AcceptNFTBidTxindexMetadata) ||
    record(metadata.NFTTransferTxindexMetadata) ||
    record(metadata.CreateNFTTxindexMetadata) ||
    record(metadata.UpdateNFTTxindexMetadata)
  ) return "nft"

  return "other"
}

function notificationPostHash(item: NotificationItem) {
  const metadata = record(item.Metadata) ?? {}
  const kind = filterOf(item)

  if (kind === "reply" || kind === "mention5" || kind === "mention6" || kind === "repost") {
    const post = record(metadata.SubmitPostTxindexMetadata)
    const keys = kind === "repost"
      ? ["RepostedPostHashHex", "RepostPostHashHex", "PostHashHex"]
      : ["PostHashHex", "PostHashBeingModifiedHex", "ParentPostHashHex"]
    return firstHash(post, keys)
  }

  if (kind === "reaction") {
    return firstHash(record(metadata.LikeTxindexMetadata), ["LikedPostHashHex", "PostHashHex"])
  }

  if (kind === "diamond1" || kind === "diamondMany") {
    return firstHash(record(metadata.BasicTransferTxindexMetadata), ["PostHashHex"]) ??
      firstHash(record(metadata.CreatorCoinTransferTxindexMetadata), ["PostHashHex"])
  }

  if (kind === "nft") {
    for (const entry of [
      record(metadata.NFTBidTxindexMetadata),
      record(metadata.AcceptNFTBidTxindexMetadata),
      record(metadata.NFTTransferTxindexMetadata),
      record(metadata.CreateNFTTxindexMetadata),
      record(metadata.UpdateNFTTxindexMetadata),
    ]) {
      const hash = firstHash(entry, ["NFTPostHashHex", "PostHashHex"])
      if (hash) return hash
    }
  }

  return null
}

function notificationDestination(item: NotificationItem) {
  const kind = filterOf(item)
  const actor = actorKey(item)
  if (kind === "follow" && actor) return `/profile/${encodeURIComponent(actor)}`
  const hash = notificationPostHash(item)
  if (!hash) return null
  return kind === "nft" ? `/nft/${encodeURIComponent(hash)}` : `/social?post=${encodeURIComponent(hash)}`
}

function descriptionFor(item: NotificationItem, actor: string) {
  const kind = filterOf(item)
  if (kind === "reaction") return `${actor} reacted to your post.`
  if (kind === "diamond1") return `${actor} gave 1 Diamond.`
  if (kind === "diamondMany") return `${actor} gave ${Math.max(2, diamondLevel(item))} Diamonds.`
  if (kind === "creatorCoin") return `${actor} created Creator Coin activity.`
  if (kind === "follow") return `${actor} changed a follow relationship with your account.`
  if (kind === "mention5" || kind === "mention6") return `${actor} mentioned you.`
  if (kind === "reply") return `${actor} replied to you.`
  if (kind === "repost") return `${actor} reposted content involving you.`
  if (kind === "nft") return `${actor} created NFT activity.`
  return `${actor} created account activity.`
}

function shortKey(value: string) {
  if (value.length < 14) return value
  return `${value.slice(0, 8)}…${value.slice(-5)}`
}

function initial(name: string) {
  return name.trim().replace(/^@/, "").slice(0, 1).toUpperCase() || "V"
}

export default function NotificationCenter({ language }: { language: ViaLanguage }) {
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const [items, setItems] = useState<NotificationItem[]>([])
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle")
  const [message, setMessage] = useState("")
  const [lastSeenIndex, setLastSeenIndex] = useState<number | null>(null)
  const [refreshToken, setRefreshToken] = useState(0)
  const [selected, setSelected] = useState<Set<FilterId>>(() => new Set(FILTERS.map((filter) => filter.id)))
  const [expandedView, setExpandedView] = useState(false)
  const [profiles, setProfiles] = useState<Record<string, ActorProfile>>({})
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [postCache, setPostCache] = useState<Record<string, PublicPost | null>>({})
  const [postLoading, setPostLoading] = useState<string | null>(null)
  const [copiedHash, setCopiedHash] = useState<string | null>(null)

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
      setMessage("")
      return
    }

    const controller = new AbortController()
    async function load() {
      setStatus("loading")
      setMessage(language === "Dutch" ? "Meldingen laden…" : "Loading notifications…")
      try {
        const response = await fetch("/api/via/social/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          signal: controller.signal,
          body: JSON.stringify({ publicKey: session.publicKey, fetchStartIndex: -1, numToFetch: 50 }),
        })
        const data = await response.json() as NotificationResponse
        if (!response.ok || !data.ok || !Array.isArray(data.notifications)) throw new Error(data.error || "NOTIFICATIONS_FAILED")
        const ordered = [...data.notifications].sort((a, b) => (b.Index ?? -1) - (a.Index ?? -1))
        setItems(ordered)
        setLastSeenIndex(typeof data.lastSeenIndex === "number" ? data.lastSeenIndex : null)
        setStatus("ready")
        setMessage(ordered.length
          ? (language === "Dutch" ? `${ordered.length} recente meldingen.` : `${ordered.length} recent notifications.`)
          : (language === "Dutch" ? "Geen recente meldingen." : "No recent notifications."))
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return
        setItems([])
        setStatus("error")
        setMessage(language === "Dutch" ? "Meldingen zijn tijdelijk niet beschikbaar." : "Notifications are temporarily unavailable.")
      }
    }
    void load()
    return () => controller.abort()
  }, [session, refreshToken, language])

  useEffect(() => {
    const keys = Array.from(new Set(items.map(actorKey).filter(Boolean))).slice(0, 32)
    const missing = keys.filter((key) => !profiles[key])
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
      if (controller.signal.aborted) return
      setProfiles((current) => ({ ...current, ...Object.fromEntries(entries) }))
    })

    return () => controller.abort()
  }, [items, profiles])

  const visible = useMemo(() => items.filter((item) => {
    const kind = filterOf(item)
    return kind === "other" || selected.has(kind)
  }), [items, selected])

  function toggleFilter(id: FilterId) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected((current) => current.size === FILTERS.length ? new Set() : new Set(FILTERS.map((filter) => filter.id)))
  }

  async function toggleExpanded(item: NotificationItem, key: string) {
    const hash = notificationPostHash(item)
    if (!hash) return
    if (expandedKey === key) {
      setExpandedKey(null)
      return
    }
    setExpandedKey(key)
    if (Object.prototype.hasOwnProperty.call(postCache, hash)) return

    setPostLoading(hash)
    try {
      const response = await fetch(`/api/via/post?hash=${encodeURIComponent(hash)}`, { cache: "no-store" })
      const data = response.ok ? await response.json() as PostResponse : null
      setPostCache((current) => ({ ...current, [hash]: data?.ok && data.post ? data.post : null }))
    } catch {
      setPostCache((current) => ({ ...current, [hash]: null }))
    } finally {
      setPostLoading((current) => current === hash ? null : current)
    }
  }

  async function copyPostLink(hash: string) {
    const url = `${window.location.origin}/social?post=${encodeURIComponent(hash)}`
    try {
      await navigator.clipboard.writeText(url)
      setCopiedHash(hash)
      window.setTimeout(() => setCopiedHash((current) => current === hash ? null : current), 1400)
    } catch {}
  }

  if (!session) {
    return <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 text-sm leading-6 text-zinc-400">
      {language === "Dutch" ? "Log in met DeSo om meldingen voor je actieve account te zien." : "Log in with DeSo to see notifications for your active account."}
    </section>
  }

  const allSelected = selected.size === FILTERS.length

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/60" aria-labelledby="notification-center-heading">
      <div className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <div>
            <h2 id="notification-center-heading" className="text-xl font-semibold text-white">
              {language === "Dutch" ? "Meldingen" : "Notifications"}
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              {language === "Dutch" ? "Nieuwste melding staat bovenaan." : "Newest notification is shown first."}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <SponsorPlatform compact />
            <button type="button" disabled title={language === "Dutch" ? "Botfilter: betrouwbare bron nog niet gekoppeld" : "Bot filter: reliable source not connected yet"} className="grid h-9 w-9 place-items-center rounded-full border border-zinc-800 text-sm text-zinc-600 disabled:cursor-not-allowed">🛡</button>
            <button type="button" onClick={toggleAll} aria-pressed={allSelected} title={allSelected ? "Select none" : "Select all"} className={`grid h-9 w-9 place-items-center rounded-full border text-sm transition ${allSelected ? "border-[#8fd4a9]/55 text-[#9adbb2]" : "border-zinc-700 text-zinc-300"}`}>✓</button>
            <button type="button" onClick={() => setRefreshToken((value) => value + 1)} disabled={status === "loading"} title={language === "Dutch" ? "Vernieuwen" : "Refresh"} className="grid h-9 w-9 place-items-center rounded-full border border-zinc-700 text-base text-zinc-300 transition hover:border-[#8fd4a9]/55 hover:text-[#9adbb2] disabled:opacity-50">↻</button>
            <button type="button" onClick={() => setExpandedView((value) => !value)} aria-pressed={expandedView} title={language === "Dutch" ? "Weergave vergroten" : "Expand view"} className="grid h-9 w-9 place-items-center rounded-full border border-zinc-700 text-base text-zinc-300 transition hover:border-[#8fd4a9]/55 hover:text-[#9adbb2]">»</button>
          </div>
        </div>

        <div className="overflow-x-auto border-t border-zinc-900 px-3 py-2.5 sm:px-4" aria-label="Notification filters">
          <div className="flex min-w-max gap-2">
            {FILTERS.map((filter) => {
              const active = selected.has(filter.id)
              return <button key={filter.id} type="button" aria-pressed={active} onClick={() => toggleFilter(filter.id)} title={filter.label} className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-2 text-xs font-semibold transition ${active ? "border-[#8fd4a9]/65 bg-[#102019] text-[#b8ebca]" : "border-zinc-800 bg-black/20 text-zinc-600"}`}>
                <span aria-hidden="true" className="leading-none">{filter.icon}</span>
                <span className="sr-only">{filter.label}</span>
              </button>
            })}
          </div>
        </div>
      </div>

      <p className={`px-4 py-2 text-xs sm:px-5 ${status === "error" ? "text-amber-300" : "text-zinc-600"}`} role="status" aria-live="polite">{message}</p>

      <div className={`divide-y divide-zinc-800 overflow-y-auto ${expandedView ? "max-h-[calc(100vh-12rem)]" : "max-h-[68vh]"}`}>
        {status === "loading" ? <div className="px-4 py-8 text-center text-sm text-zinc-500 sm:px-5">{language === "Dutch" ? "Laden…" : "Loading…"}</div> : null}
        {status === "ready" && visible.length === 0 ? <div className="px-4 py-8 text-center text-sm text-zinc-500 sm:px-5">{language === "Dutch" ? "Geen meldingen in deze selectie." : "No notifications in this selection."}</div> : null}

        {visible.map((item, index) => {
          const key = `${item.Index ?? "n"}-${index}`
          const actorPublicKey = actorKey(item)
          const profile = profiles[actorPublicKey] ?? {}
          const username = profile.username?.trim().replace(/^@/, "")
          const actor = username ? `@${username}` : actorPublicKey ? shortKey(actorPublicKey) : "DeSo account"
          const avatar = profile.profilePic ?? null
          const kind = filterOf(item)
          const filter = FILTERS.find((entry) => entry.id === kind)
          const unread = typeof item.Index === "number" && lastSeenIndex !== null && item.Index > lastSeenIndex
          const hash = notificationPostHash(item)
          const destination = notificationDestination(item)
          const expanded = expandedKey === key
          const post = hash ? postCache[hash] : undefined

          return <article key={key} className={unread ? "bg-[#0b1510]/55" : "bg-black/10"}>
            <button type="button" onClick={() => void toggleExpanded(item, key)} disabled={!hash} className="grid w-full grid-cols-[44px_minmax(0,1fr)_auto] gap-3 px-4 py-3 text-left sm:grid-cols-[48px_minmax(0,1fr)_auto] sm:px-5 disabled:cursor-default">
              <div className="relative h-10 w-10 sm:h-11 sm:w-11">
                {avatar ? <img src={avatar} alt="" referrerPolicy="no-referrer" className="h-full w-full rounded-full border border-zinc-800 object-cover" /> : <span className="grid h-full w-full place-items-center rounded-full border border-zinc-800 bg-[#112019] text-sm font-semibold text-[#9adbb2]">{initial(actor)}</span>}
                {filter ? <span aria-hidden="true" className="absolute -bottom-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full border border-zinc-700 bg-black px-1 text-[9px] text-zinc-300">{filter.icon}</span> : null}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <strong className="truncate text-sm font-semibold text-zinc-100">{actor}</strong>
                  <ViaIdentityStatusMarks verified={Boolean(profile.isVerified)} inactive={Boolean(profile.isInactive)} viaRecognized={false} compact language={language} />
                  {unread ? <span className="rounded-full border border-[#285f40] px-1.5 py-0.5 text-[9px] text-[#9adbb2]">{language === "Dutch" ? "Nieuw" : "New"}</span> : null}
                </div>
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-zinc-400">{descriptionFor(item, actor)}</p>
              </div>

              <span className="self-center text-xs text-zinc-600">{hash ? (expanded ? "⌃" : "⌄") : ""}</span>
            </button>

            {expanded && hash ? <div className="border-t border-zinc-800/80 bg-black/25 px-4 py-4 sm:px-5">
              {postLoading === hash ? <p className="text-sm text-zinc-500">{language === "Dutch" ? "Bericht laden…" : "Loading post…"}</p> : null}

              {post ? <>
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-zinc-300">@{post.username?.replace(/^@/, "") || shortKey(post.publicKey)}</p>
                    {post.body ? <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-200">{post.body}</p> : null}
                  </div>
                </div>

                {post.imageUrls?.length ? <div className="mt-3 grid gap-2 sm:grid-cols-2">{post.imageUrls.slice(0, 4).map((url) => <img key={url} src={url} alt="" loading="lazy" className="max-h-80 w-full rounded-xl object-contain" />)}</div> : null}

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-zinc-800/70 pt-3 text-xs text-zinc-500">
                  <a href={`/social?post=${encodeURIComponent(hash)}&reply=1`} title="Reply" className="inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-full border border-zinc-800 px-2 text-zinc-300 hover:border-[#8fd4a9]/45 hover:text-[#9adbb2]">▢ <span>{post.commentCount}</span></a>
                  <a href={`/social?post=${encodeURIComponent(hash)}&repost=1`} title="Repost / Quote" className="inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-full border border-zinc-800 px-2 text-zinc-300 hover:border-[#8fd4a9]/45 hover:text-[#9adbb2]">↻ <span>{post.repostCount + post.quoteRepostCount}</span></a>
                  <a href={`/social?post=${encodeURIComponent(hash)}&like=1`} title="Reaction / Like" className="inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-full border border-zinc-800 px-2 text-zinc-300 hover:border-[#8fd4a9]/45 hover:text-[#9adbb2]">👍 <span>{post.likeCount}</span></a>
                  <a href={`/social?post=${encodeURIComponent(hash)}&diamond=1`} title="Diamond" className="inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-full border border-zinc-800 px-2 text-zinc-300 hover:border-[#8fd4a9]/45 hover:text-[#9adbb2]">◇ <span>{post.diamondCount}</span></a>
                  <button type="button" disabled title={language === "Dutch" ? "Waarde/$-actie: betekenis nog te bevestigen" : "Value/$ action: meaning still to confirm"} className="inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-zinc-900 px-2 text-zinc-700">↗$</button>
                  <button type="button" onClick={() => void copyPostLink(hash)} title={language === "Dutch" ? "Kopieer link" : "Copy link"} className="inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-zinc-800 px-2 text-zinc-300 hover:border-[#8fd4a9]/45 hover:text-[#9adbb2]">{copiedHash === hash ? "✓" : "🔗"}</button>
                </div>
              </> : post === null ? <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-zinc-500">{language === "Dutch" ? "Dit bericht kon niet worden geladen." : "This post could not be loaded."}</p>
                {destination ? <a href={destination} className="rounded-full border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300">{language === "Dutch" ? "Open" : "Open"}</a> : null}
              </div> : null}
            </div> : null}
          </article>
        })}
      </div>
    </section>
  )
}
