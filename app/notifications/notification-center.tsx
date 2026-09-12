"use client"

import { useEffect, useMemo, useState } from "react"
import { restoreIdentitySession, VIA_IDENTITY_EVENT, type ViaIdentitySession } from "../deso-identity-session"

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

type Category = "all" | "diamond" | "like" | "follow" | "post" | "nft" | "other"

const categories: Array<{ id: Category; label: string }> = [
  { id: "all", label: "All" },
  { id: "diamond", label: "Diamonds" },
  { id: "like", label: "Likes" },
  { id: "follow", label: "Follows" },
  { id: "post", label: "Posts & replies" },
  { id: "nft", label: "NFT" },
  { id: "other", label: "Other" },
]

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null
}

function categoryOf(item: NotificationItem): Exclude<Category, "all"> {
  const metadata = record(item.Metadata) ?? {}
  const basic = record(metadata.BasicTransferTxindexMetadata)
  const creatorTransfer = record(metadata.CreatorCoinTransferTxindexMetadata)
  if ((typeof basic?.DiamondLevel === "number" && basic.DiamondLevel > 0) || (typeof creatorTransfer?.DiamondLevel === "number" && creatorTransfer.DiamondLevel > 0)) return "diamond"
  if (record(metadata.LikeTxindexMetadata)) return "like"
  if (record(metadata.FollowTxindexMetadata)) return "follow"
  if (record(metadata.SubmitPostTxindexMetadata)) return "post"
  if (record(metadata.NFTBidTxindexMetadata) || record(metadata.AcceptNFTBidTxindexMetadata) || record(metadata.NFTTransferTxindexMetadata) || record(metadata.CreateNFTTxindexMetadata) || record(metadata.UpdateNFTTxindexMetadata)) return "nft"
  return "other"
}

function shortKey(value: unknown) {
  if (typeof value !== "string" || value.length < 12) return "DeSo account"
  return `${value.slice(0, 8)}…${value.slice(-5)}`
}

function describe(item: NotificationItem) {
  const metadata = record(item.Metadata) ?? {}
  const actor = shortKey(metadata.TransactorPublicKeyBase58Check)
  const category = categoryOf(item)
  if (category === "diamond") return `${actor} sent a diamond.`
  if (category === "like") return `${actor} liked a post.`
  if (category === "follow") return `${actor} changed a follow relationship.`
  if (category === "post") {
    const post = record(metadata.SubmitPostTxindexMetadata)
    return post?.ParentPostHashHex ? `${actor} replied to a post.` : `${actor} created or updated a post.`
  }
  if (category === "nft") return `${actor} generated an NFT activity notification.`
  return `${actor} generated a DeSo activity notification.`
}

export default function NotificationCenter() {
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const [items, setItems] = useState<NotificationItem[]>([])
  const [category, setCategory] = useState<Category>("all")
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle")
  const [message, setMessage] = useState("")
  const [lastSeenIndex, setLastSeenIndex] = useState<number | null>(null)

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
      return
    }

    const publicKey = session.publicKey
    let cancelled = false
    async function load() {
      setStatus("loading")
      setMessage("Loading public DeSo notification data…")
      try {
        const response = await fetch("/api/via/social/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ publicKey, fetchStartIndex: -1, numToFetch: 40 }),
        })
        const data = await response.json() as NotificationResponse
        if (!response.ok || !data.ok || !Array.isArray(data.notifications)) throw new Error(data.error || "NOTIFICATIONS_FAILED")
        if (cancelled) return
        setItems(data.notifications)
        setLastSeenIndex(typeof data.lastSeenIndex === "number" ? data.lastSeenIndex : null)
        setStatus("ready")
        setMessage(data.notifications.length ? `${data.notifications.length} recent DeSo notifications loaded.` : "No recent notifications were returned by DeSo.")
      } catch {
        if (cancelled) return
        setItems([])
        setStatus("error")
        setMessage("DeSo notifications are temporarily unavailable. VIA did not change any account or blockchain state.")
      }
    }
    void load()
    return () => { cancelled = true }
  }, [session])

  const visible = useMemo(() => category === "all" ? items : items.filter((item) => categoryOf(item) === category), [items, category])

  if (!session) {
    return <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 text-sm leading-6 text-zinc-400">Connect with DeSo Identity to load notifications for the active public key. Reading notifications is view-only; VIA does not mark them read or change DeSo state here.</section>
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5" aria-labelledby="notification-center-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">Read-only DeSo activity</p>
          <h2 id="notification-center-heading" className="mt-2 text-xl font-semibold text-white">Notification center</h2>
          <p className="mt-2 text-sm text-zinc-500">Active key: {shortKey(session.publicKey)}{lastSeenIndex !== null ? ` · DeSo last-seen index ${lastSeenIndex}` : ""}</p>
        </div>
        <button type="button" onClick={() => window.location.reload()} className="rounded-full border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:border-green-700 hover:text-green-300">Refresh</button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" aria-label="Notification filters">
        {categories.map((option) => {
          const active = option.id === category
          const count = option.id === "all" ? items.length : items.filter((item) => categoryOf(item) === option.id).length
          return <button key={option.id} type="button" aria-pressed={active} onClick={() => setCategory(option.id)} className={`rounded-full border px-3 py-1.5 text-xs ${active ? "border-[#8fd4a9]/70 bg-[#0c1711] text-[#9adbb2]" : "border-zinc-800 text-zinc-400 hover:border-zinc-700"}`}>{option.label} · {count}</button>
        })}
      </div>

      <p className={`mt-4 text-xs ${status === "error" ? "text-amber-300" : "text-zinc-500"}`} role="status" aria-live="polite">{message}</p>

      <div className="mt-4 space-y-2">
        {status === "loading" ? <div className="rounded-xl border border-zinc-800 p-4 text-sm text-zinc-500">Loading…</div> : null}
        {status === "ready" && visible.length === 0 ? <div className="rounded-xl border border-zinc-800 p-4 text-sm text-zinc-500">No notifications in this filter.</div> : null}
        {visible.map((item, index) => {
          const itemCategory = categoryOf(item)
          const unread = typeof item.Index === "number" && lastSeenIndex !== null && item.Index > lastSeenIndex
          return <article key={`${item.Index ?? "n"}-${index}`} className="rounded-xl border border-zinc-800 bg-black/25 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-green-400">{itemCategory}</span>
              <span className="text-xs text-zinc-600">{unread ? "New on DeSo" : typeof item.Index === "number" ? `Index ${item.Index}` : "DeSo activity"}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-300">{describe(item)}</p>
          </article>
        })}
      </div>

      <p className="mt-4 text-xs leading-5 text-zinc-600">Filters are VIA display filters over the returned DeSo notification metadata. This page does not mark notifications read, send transactions or create reward mechanics.</p>
    </section>
  )
}
