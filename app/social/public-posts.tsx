"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { ChoiceId, VIA_SOCIAL_FEED_EVENT, VIA_SOCIAL_FEED_STORAGE_KEY } from "./feed-choice"
import PostComposer from "./post-composer"
import LikeButton from "./like-button"
import { restoreIdentitySession, VIA_IDENTITY_EVENT, type ViaIdentitySession } from "../deso-identity-session"

type PublicPost = {
  postHash: string
  publicKey: string
  body: string
  imageUrls: string[]
  videoUrls: string[]
  timestampNanos: number
  likeCount: number
  diamondCount: number
  commentCount: number
  repostCount: number
  quoteRepostCount: number
  isNft: boolean
  sourcePublicKey?: string
}

type PostsResponse = { ok?: boolean; posts?: PublicPost[] }

function safeHttps(url: string) {
  try {
    const parsed = new URL(url)
    return parsed.protocol === "https:" ? parsed.toString() : null
  } catch { return null }
}

function postTime(timestampNanos: number) {
  if (!Number.isFinite(timestampNanos) || timestampNanos <= 0) return ""
  const date = new Date(timestampNanos / 1_000_000)
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString()
}

function feedReadyMessage(choice: ChoiceId) {
  if (choice === "following") return "Following selected. Enter a public DeSo identity to read its follow graph."
  if (choice === "recent") return "Recent selected. Enter a public DeSo creator to read recent posts."
  return "Discovery selected. Explore the public DeSo Discovery feed."
}

export default function PublicPosts() {
  const [identity, setIdentity] = useState("")
  const [posts, setPosts] = useState<PublicPost[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("Public DeSo posts are read-only in VIA.")
  const [feedChoice, setFeedChoice] = useState<ChoiceId>("following")
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  useEffect(() => {
    setSession(restoreIdentitySession())
    const onIdentity = (event: Event) => {
      const custom = event as CustomEvent<ViaIdentitySession | null>
      setSession(custom.detail ?? restoreIdentitySession())
      if (!custom.detail && !restoreIdentitySession()) setReplyingTo(null)
    }
    window.addEventListener(VIA_IDENTITY_EVENT, onIdentity)
    return () => window.removeEventListener(VIA_IDENTITY_EVENT, onIdentity)
  }, [])

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(VIA_SOCIAL_FEED_STORAGE_KEY)
      if (stored === "following" || stored === "recent" || stored === "discovery") setFeedChoice(stored)
    } catch {}
    function onFeedChoice(event: Event) {
      const choice = (event as CustomEvent<ChoiceId>).detail
      if (choice === "following" || choice === "recent" || choice === "discovery") {
        setFeedChoice(choice)
        setPosts([])
        setLoading(false)
        setReplyingTo(null)
        setMessage(feedReadyMessage(choice))
      }
    }
    window.addEventListener(VIA_SOCIAL_FEED_EVENT, onFeedChoice)
    return () => window.removeEventListener(VIA_SOCIAL_FEED_EVENT, onFeedChoice)
  }, [])

  const visiblePosts = useMemo(() => {
    if (feedChoice !== "recent") return posts
    return [...posts].sort((a, b) => b.timestampNanos - a.timestampNanos)
  }, [feedChoice, posts])

  async function loadPosts(event?: FormEvent) {
    event?.preventDefault()
    const value = identity.trim().replace(/^@/, "")
    if (feedChoice !== "discovery" && !value) {
      setPosts([])
      setMessage(feedChoice === "following" ? "Enter a public DeSo username or public key to read Following." : "Enter a public DeSo username or public key to read recent posts.")
      return
    }

    setLoading(true)
    const isFollowing = feedChoice === "following"
    const isDiscovery = feedChoice === "discovery"
    setMessage(isFollowing ? "Loading public posts from followed creators…" : isDiscovery ? "Loading public DeSo Discovery…" : "Loading public DeSo posts…")

    try {
      const endpoint = isFollowing
        ? `/api/via/following?identity=${encodeURIComponent(value)}`
        : isDiscovery
          ? "/api/via/discovery?limit=20"
          : `/api/via/posts?identity=${encodeURIComponent(value)}&limit=20`
      const response = await fetch(endpoint)
      const data = (await response.json()) as PostsResponse
      const nextPosts = response.ok && data.ok && Array.isArray(data.posts) ? data.posts : []
      setPosts(nextPosts)
      setMessage(nextPosts.length
        ? `${nextPosts.length} public ${isFollowing ? "Following " : isDiscovery ? "Discovery " : ""}posts loaded.`
        : isFollowing ? "No public posts found from followed creators." : isDiscovery ? "No public Discovery posts found." : "No public posts found.")
    } catch {
      setPosts([])
      setMessage("Public posts are temporarily unavailable.")
    } finally { setLoading(false) }
  }

  const identityLabel = feedChoice === "following" ? "DeSo identity whose Following feed you want to read" : "DeSo creator whose recent posts you want to read"
  const identityPlaceholder = feedChoice === "following" ? "Username or public key for Following" : "Creator username or public key"

  return (
    <section className="mt-8 rounded-[14px] border border-zinc-800/80 bg-zinc-950/55 p-5" aria-labelledby="public-posts-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">Live public read</p>
      <h2 id="public-posts-heading" className="mt-2 text-2xl font-semibold text-zinc-100">Public DeSo posts</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">Read public posts without connecting a wallet. Following uses the entered identity&apos;s public follow graph; entering a username does not sign you in or prove account ownership. Discovery uses DeSo&apos;s public experimental hot-feed ranking as an exploration source, not as a trust or quality signal. Logged-in DeSo users may now reply and like through approval-controlled transaction flows; repost, Diamond and follow remain protected.</p>
      <div className="mt-3 inline-flex rounded-[10px] border border-zinc-800/80 bg-black/30 px-3 py-1.5 text-xs text-zinc-400">
        {feedChoice === "following" ? "Following active · public read only" : feedChoice === "recent" ? "Recent active · newest loaded post first" : "Discovery active · experimental public DeSo ranking"}
      </div>
      <form onSubmit={loadPosts} className="mt-4 flex max-w-2xl flex-col gap-3 sm:flex-row">
        {feedChoice !== "discovery" ? <><label className="sr-only" htmlFor="social-public-identity">{identityLabel}</label><input id="social-public-identity" value={identity} onChange={(event) => setIdentity(event.target.value)} maxLength={128} autoCapitalize="none" autoCorrect="off" placeholder={identityPlaceholder} className="min-w-0 flex-1 rounded-[12px] border border-zinc-700/80 bg-black/35 px-4 py-3 text-sm text-zinc-100 outline-none transition-[border-color,box-shadow] duration-200 ease-out focus:border-[#8fd4a9]/70 focus:ring-2 focus:ring-[#8fd4a9]/10" /></> : <p className="flex-1 self-center text-sm text-zinc-500">Discovery does not require an account.</p>}
        <button type="submit" disabled={loading} className="rounded-[12px] border border-[#8fd4a9]/45 bg-transparent px-5 py-3 text-sm font-medium text-[#9adbb2] transition-[background-color,border-color,box-shadow] duration-200 ease-out hover:border-[#8fd4a9]/70 hover:bg-[#0c1711]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/20 disabled:cursor-wait disabled:opacity-60">{loading ? "Loading…" : feedChoice === "following" ? "Read Following" : feedChoice === "discovery" ? "Explore Discovery" : "Read posts"}</button>
      </form>
      <p className="mt-3 text-sm text-zinc-500" role="status" aria-live="polite">{message}</p>
      {visiblePosts.length > 0 ? <div className="mt-5 space-y-3">{visiblePosts.map((post) => {
        const images = post.imageUrls.map(safeHttps).filter((url): url is string => Boolean(url)).slice(0, 4)
        const videos = post.videoUrls.map(safeHttps).filter((url): url is string => Boolean(url)).slice(0, 2)
        const time = postTime(post.timestampNanos)
        const isReplying = replyingTo === post.postHash
        return <article key={post.postHash} className="rounded-[12px] border border-zinc-800/80 bg-black/30 p-4">
          {time ? <p className="mb-2 text-xs text-zinc-600">{time}</p> : null}
          {post.body ? <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-200">{post.body}</p> : <p className="text-sm text-zinc-500">Media post</p>}
          {images.length ? <div className="mt-4 grid gap-2 sm:grid-cols-2">{images.map((url, index) => <img key={`${post.postHash}-image-${index}`} src={url} alt="Public media attached to this DeSo post" loading="lazy" decoding="async" referrerPolicy="no-referrer" className="max-h-[32rem] w-full rounded-[12px] border border-zinc-800/80 bg-zinc-950/70 object-contain" />)}</div> : null}
          {videos.length ? <div className="mt-4 space-y-2">{videos.map((url, index) => <video key={`${post.postHash}-video-${index}`} src={url} controls preload="none" playsInline controlsList="nodownload" disablePictureInPicture className="max-h-[32rem] w-full rounded-[12px] border border-zinc-800/80 bg-zinc-950/70">Your browser cannot play this public video.</video>)}</div> : null}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500">{session ? <LikeButton postHash={post.postHash} initialCount={post.likeCount} /> : <span>{post.likeCount} likes</span>}<span>{post.diamondCount} Diamonds</span><span>{post.commentCount} replies</span><span>{post.repostCount + post.quoteRepostCount} reposts</span>{post.isNft ? <span className="text-[#8fd4a9]">NFT</span> : null}{session ? <button type="button" onClick={() => setReplyingTo(isReplying ? null : post.postHash)} className="rounded-full border border-green-900/70 px-3 py-1 text-green-300 hover:border-green-700">{isReplying ? "Close reply" : "Reply"}</button> : <span className="text-zinc-600">Reply · DeSo login</span>}</div>
          {session && isReplying ? <PostComposer parentStakeID={post.postHash} compact onDone={() => { setReplyingTo(null); void loadPosts() }} /> : null}
        </article>
      })}</div> : null}
    </section>
  )
}