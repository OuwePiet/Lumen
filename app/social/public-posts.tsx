"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { ChoiceId, VIA_SOCIAL_FEED_EVENT, VIA_SOCIAL_FEED_STORAGE_KEY } from "./feed-choice"

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

export default function PublicPosts() {
  const [identity, setIdentity] = useState("OuwePiet")
  const [posts, setPosts] = useState<PublicPost[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("Public DeSo posts are read-only in VIA.")
  const [feedChoice, setFeedChoice] = useState<ChoiceId>("following")

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(VIA_SOCIAL_FEED_STORAGE_KEY)
      if (stored === "following" || stored === "recent" || stored === "discovery") setFeedChoice(stored)
    } catch {}
    function onFeedChoice(event: Event) {
      const choice = (event as CustomEvent<ChoiceId>).detail
      if (choice === "following" || choice === "recent" || choice === "discovery") setFeedChoice(choice)
    }
    window.addEventListener(VIA_SOCIAL_FEED_EVENT, onFeedChoice)
    return () => window.removeEventListener(VIA_SOCIAL_FEED_EVENT, onFeedChoice)
  }, [])

  const visiblePosts = useMemo(() => {
    if (feedChoice !== "recent") return posts
    return [...posts].sort((a, b) => b.timestampNanos - a.timestampNanos)
  }, [feedChoice, posts])

  async function loadPosts(event: FormEvent) {
    event.preventDefault()
    const value = identity.trim().replace(/^@/, "")
    if (!value) return
    setLoading(true)
    const isFollowing = feedChoice === "following"
    setMessage(isFollowing ? "Loading public posts from followed creators…" : "Loading public DeSo posts…")
    try {
      const endpoint = isFollowing
        ? `/api/via/following?identity=${encodeURIComponent(value)}`
        : `/api/via/posts?identity=${encodeURIComponent(value)}&limit=20`
      const response = await fetch(endpoint)
      const data = (await response.json()) as PostsResponse
      const nextPosts = response.ok && data.ok && Array.isArray(data.posts) ? data.posts : []
      setPosts(nextPosts)
      setMessage(nextPosts.length
        ? `${nextPosts.length} public ${isFollowing ? "Following " : ""}posts loaded.`
        : isFollowing ? "No public posts found from followed creators." : "No public posts found.")
    } catch {
      setPosts([])
      setMessage("Public posts are temporarily unavailable.")
    } finally { setLoading(false) }
  }

  return (
    <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-5" aria-labelledby="public-posts-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-400">Live public read</p>
      <h2 id="public-posts-heading" className="mt-2 text-2xl font-semibold">Public DeSo posts</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">Read public posts without connecting a wallet. Following reads posts from a bounded sample of accounts the selected DeSo identity publicly follows. VIA does not like, repost, Diamond, follow or publish from this view.</p>
      <div className="mt-3 inline-flex rounded-full border border-zinc-800 bg-black px-3 py-1.5 text-xs text-zinc-400">
        {feedChoice === "following" ? "Following active · public read only" : feedChoice === "recent" ? "Recent active · newest loaded post first" : "Discovery preference active · creator read"}
      </div>
      <form onSubmit={loadPosts} className="mt-4 flex max-w-2xl flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="social-public-identity">Creator username or public key</label>
        <input id="social-public-identity" value={identity} onChange={(event) => setIdentity(event.target.value)} maxLength={128} autoCapitalize="none" autoCorrect="off" placeholder="Creator username or public key" className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-black px-4 py-3 text-sm text-white outline-none focus:border-green-600" />
        <button type="submit" disabled={loading} className="rounded-xl border border-green-800 px-5 py-3 text-sm font-medium text-green-300 hover:border-green-600 disabled:cursor-wait disabled:opacity-60">{loading ? "Loading…" : feedChoice === "following" ? "Read Following" : "Read posts"}</button>
      </form>
      <p className="mt-3 text-sm text-zinc-500" role="status" aria-live="polite">{message}</p>
      {visiblePosts.length > 0 ? <div className="mt-5 space-y-3">{visiblePosts.map((post) => {
        const images = post.imageUrls.map(safeHttps).filter((url): url is string => Boolean(url)).slice(0, 4)
        const videos = post.videoUrls.map(safeHttps).filter((url): url is string => Boolean(url)).slice(0, 2)
        const time = postTime(post.timestampNanos)
        return <article key={post.postHash} className="rounded-xl border border-zinc-800 bg-black p-4">
          {time ? <p className="mb-2 text-xs text-zinc-600">{time}</p> : null}
          {post.body ? <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-200">{post.body}</p> : <p className="text-sm text-zinc-500">Media post</p>}
          {images.length ? <div className="mt-4 grid gap-2 sm:grid-cols-2">{images.map((url, index) => <img key={`${post.postHash}-image-${index}`} src={url} alt="Public media attached to this DeSo post" loading="lazy" decoding="async" referrerPolicy="no-referrer" className="max-h-[32rem] w-full rounded-xl border border-zinc-800 bg-zinc-950 object-contain" />)}</div> : null}
          {videos.length ? <div className="mt-4 space-y-2">{videos.map((url, index) => <video key={`${post.postHash}-video-${index}`} src={url} controls preload="none" playsInline controlsList="nodownload" disablePictureInPicture className="max-h-[32rem] w-full rounded-xl border border-zinc-800 bg-zinc-950">Your browser cannot play this public video.</video>)}</div> : null}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500"><span>{post.likeCount} likes</span><span>{post.diamondCount} Diamonds</span><span>{post.commentCount} replies</span><span>{post.repostCount + post.quoteRepostCount} reposts</span>{post.isNft ? <span className="text-green-400">NFT</span> : null}</div>
        </article>
      })}</div> : null}
    </section>
  )
}
