"use client"

import Link from "next/link"
import { FormEvent, useEffect, useMemo, useRef, useState } from "react"
import { ChoiceId, defaultSocialFeedChoice, VIA_SOCIAL_FEED_EVENT, VIA_SOCIAL_FEED_STORAGE_KEY } from "./feed-choice"
import PostComposer from "./post-composer"
import LikeButton from "./like-button"
import FollowButton from "./follow-button"
import RepostButton from "./repost-button"
import DiamondButton from "./diamond-button"
import LocalSaveButton from "./local-save-button"
import PollVoteControl from "./poll-vote-control"
import XShareButton from "../x-share-button"
import { restoreIdentitySession, VIA_IDENTITY_EVENT, type ViaIdentitySession } from "../deso-identity-session"

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
  isNft: boolean
  postExtraData?: Record<string, string>
  sourcePublicKey?: string
}

type PostsResponse = { ok?: boolean; posts?: PublicPost[] }
type SinglePostResponse = { ok?: boolean; post?: PublicPost }

function safeHttps(url: string) {
  try {
    const parsed = new URL(url)
    return parsed.protocol === "https:" ? parsed.toString() : null
  } catch {
    return null
  }
}

function postTime(timestampNanos: number) {
  if (!Number.isFinite(timestampNanos) || timestampNanos <= 0) return ""
  const date = new Date(timestampNanos / 1_000_000)
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString()
}

function shortPublicKey(publicKey: string) {
  if (!publicKey) return "Unknown DeSo account"
  if (publicKey.length <= 20) return publicKey
  return `${publicKey.slice(0, 10)}…${publicKey.slice(-6)}`
}

function pollOptions(extraData?: Record<string, string>) {
  if (!extraData) return []
  const direct = ["PollOptions", "pollOptions", "PollOptionsJSON", "poll_options"]
    .map((key) => extraData[key])
    .find((value) => typeof value === "string" && value.trim())
  if (!direct) return []
  try {
    const parsed = JSON.parse(direct)
    if (Array.isArray(parsed)) {
      return parsed
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
        .slice(0, 5)
    }
  } catch {}
  return direct.split(/\r?\n|\|/).map((value) => value.trim()).filter(Boolean).slice(0, 5)
}

function feedReadyMessage(choice: ChoiceId) {
  if (choice === "following") return "Following uses your active DeSo account."
  if (choice === "recent") return "Newest public DeSo posts are ready."
  return "Hot is ready."
}

export default function PublicPosts() {
  const requestController = useRef<AbortController | null>(null)
  const [posts, setPosts] = useState<PublicPost[]>([])
  const [mediaFilter, setMediaFilter] = useState<"all" | "image" | "video" | "nft">("all")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("Choose a feed and load posts.")
  const [feedChoice, setFeedChoice] = useState<ChoiceId>("hot")
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const media = params.get("media")
      if (media === "image" || media === "video" || media === "nft") setMediaFilter(media)

      const sharedPost = params.get("post")?.trim().toLowerCase() ?? ""
      if (/^[0-9a-f]{64}$/.test(sharedPost)) {
        const controller = new AbortController()
        requestController.current?.abort()
        requestController.current = controller
        setLoading(true)
        setMessage("Loading shared post…")
        void fetch(`/api/via/post?hash=${encodeURIComponent(sharedPost)}`, { signal: controller.signal })
          .then(async (response) => {
            const data = (await response.json()) as SinglePostResponse
            if (!response.ok || !data.ok || !data.post) throw new Error("POST_UNAVAILABLE")
            setPosts([data.post])
            setMessage("Shared post loaded.")
          })
          .catch((error) => {
            if (!(error instanceof DOMException && error.name === "AbortError")) {
              setPosts([])
              setMessage("This shared post is unavailable.")
            }
          })
          .finally(() => {
            if (requestController.current === controller) {
              requestController.current = null
              setLoading(false)
            }
          })
      }
    } catch {}
  }, [])

  useEffect(() => {
    setSession(restoreIdentitySession())
    const onIdentity = (event: Event) => {
      const custom = event as CustomEvent<ViaIdentitySession | null>
      const nextSession = custom.detail ?? restoreIdentitySession()
      setSession(nextSession)
      if (!nextSession) setReplyingTo(null)
      if (feedChoice === "following") {
        requestController.current?.abort()
        requestController.current = null
        setPosts([])
        setLoading(false)
        setMessage(nextSession ? "Following uses your active DeSo account." : "Log in with DeSo to open Following.")
      }
    }
    window.addEventListener(VIA_IDENTITY_EVENT, onIdentity)
    return () => window.removeEventListener(VIA_IDENTITY_EVENT, onIdentity)
  }, [feedChoice])

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(VIA_SOCIAL_FEED_STORAGE_KEY)
      const normalized = stored === "discovery" ? "hot" : stored
      const initial = normalized === "following" || normalized === "recent" || normalized === "hot"
        ? normalized
        : defaultSocialFeedChoice()
      setFeedChoice(initial)
      if (initial === "following" && !restoreIdentitySession()) setMessage("Log in with DeSo to open Following.")
      else setMessage(feedReadyMessage(initial))
    } catch {
      const initial = defaultSocialFeedChoice()
      setFeedChoice(initial)
      setMessage(initial === "following" && !restoreIdentitySession() ? "Log in with DeSo to open Following." : feedReadyMessage(initial))
    }

    function onFeedChoice(event: Event) {
      const choice = (event as CustomEvent<ChoiceId>).detail
      if (choice !== "following" && choice !== "recent" && choice !== "hot") return
      requestController.current?.abort()
      requestController.current = null
      setFeedChoice(choice)
      setPosts([])
      setMediaFilter("all")
      setLoading(false)
      setReplyingTo(null)
      if (choice === "following" && !restoreIdentitySession()) setMessage("Log in with DeSo to open Following.")
      else setMessage(feedReadyMessage(choice))
    }

    window.addEventListener(VIA_SOCIAL_FEED_EVENT, onFeedChoice)
    return () => window.removeEventListener(VIA_SOCIAL_FEED_EVENT, onFeedChoice)
  }, [])

  useEffect(() => () => requestController.current?.abort(), [])

  const visiblePosts = useMemo(() => {
    const ordered = feedChoice === "recent" ? [...posts].sort((a, b) => b.timestampNanos - a.timestampNanos) : posts
    return ordered.filter((post) =>
      mediaFilter === "all" ||
      (mediaFilter === "image" && post.imageUrls.length > 0) ||
      (mediaFilter === "video" && post.videoUrls.length > 0) ||
      (mediaFilter === "nft" && post.isNft),
    )
  }, [feedChoice, posts, mediaFilter])

  async function loadPosts(event?: FormEvent) {
    event?.preventDefault()
    requestController.current?.abort()
    const controller = new AbortController()
    requestController.current = controller

    if (feedChoice === "following" && !session) {
      setPosts([])
      setMessage("Log in with DeSo to open Following.")
      requestController.current = null
      return
    }

    setLoading(true)
    setMessage("Loading…")
    try {
      const endpoint = feedChoice === "following"
        ? `/api/via/following?identity=${encodeURIComponent(session?.publicKey ?? "")}`
        : feedChoice === "hot"
          ? "/api/via/discovery?limit=20"
          : "/api/via/discovery?limit=20&sort=new"
      const response = await fetch(endpoint, { signal: controller.signal })
      const data = (await response.json()) as PostsResponse
      const nextPosts = response.ok && data.ok && Array.isArray(data.posts) ? data.posts : []
      setPosts(nextPosts)
      setMessage(nextPosts.length ? `${nextPosts.length} posts loaded.` : "No posts found.")
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setPosts([])
        setMessage("Posts are temporarily unavailable.")
      }
    } finally {
      if (requestController.current === controller) {
        requestController.current = null
        setLoading(false)
      }
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-black/35 p-4 sm:p-5" aria-labelledby="public-posts-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8fd4a9]">Feed</p>
          <h2 id="public-posts-heading" className="mt-1 text-xl font-semibold text-zinc-100">Posts</h2>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Filter posts">
          {(["all", "image", "video", "nft"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              aria-pressed={mediaFilter === filter}
              onClick={() => setMediaFilter(filter)}
              className={`rounded-full border px-3 py-1.5 text-xs ${mediaFilter === filter ? "border-[#8fd4a9]/55 text-[#9adbb2]" : "border-zinc-800 text-zinc-500"}`}
            >
              {filter === "all" ? "All" : filter === "nft" ? "NFT" : filter[0].toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={loadPosts} className="mt-4 flex max-w-2xl flex-col gap-3 sm:flex-row">
        <p className="flex-1 self-center text-sm text-zinc-500">
          {feedChoice === "following"
            ? session
              ? `Following for ${shortPublicKey(session.publicKey)}`
              : "DeSo login required for Following"
            : feedChoice === "hot"
              ? "Public Hot feed"
              : "Newest public DeSo posts"}
        </p>
        <button type="submit" disabled={loading || (feedChoice === "following" && !session)} className="rounded-xl border border-[#8fd4a9]/45 px-5 py-3 text-sm font-medium text-[#9adbb2] disabled:opacity-50">
          {loading ? "Loading…" : feedChoice === "following" ? "Open Following" : feedChoice === "hot" ? "Open Hot" : "Open New"}
        </button>
      </form>

      <p className="mt-3 text-xs text-zinc-500" role="status" aria-live="polite">{message}</p>

      {posts.length > 0 && visiblePosts.length === 0 ? (
        <p className="mt-5 rounded-xl border border-zinc-800 bg-black/25 p-4 text-sm text-zinc-500">No loaded posts match this filter.</p>
      ) : null}

      {visiblePosts.length > 0 ? (
        <div className="mt-5 space-y-3">
          {visiblePosts.map((post) => {
            const images = post.imageUrls.map(safeHttps).filter((url): url is string => Boolean(url)).slice(0, 4)
            const videos = post.videoUrls.map(safeHttps).filter((url): url is string => Boolean(url)).slice(0, 2)
            const time = postTime(post.timestampNanos)
            const isReplying = replyingTo === post.postHash
            const totalReposts = post.repostCount + post.quoteRepostCount
            const isOwnPost = session?.publicKey === post.publicKey
            const options = pollOptions(post.postExtraData)
            const username = typeof post.username === "string" ? post.username.trim().replace(/^@/, "") : ""

            return (
              <article key={post.postHash} className="rounded-2xl border border-zinc-800/80 bg-[#050806]/80 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-300">
                      DeSo · <Link href={`/profile/${encodeURIComponent(post.publicKey)}`} className="text-zinc-200 transition hover:text-[#9adbb2]">{username ? `@${username}` : shortPublicKey(post.publicKey)}</Link>
                    </p>
                    {time ? <p className="mt-1 text-[11px] text-zinc-600">{time}</p> : null}
                  </div>
                  {post.isNft ? <span className="rounded-full border border-[#8fd4a9]/35 px-2.5 py-1 text-[11px] text-[#9adbb2]">NFT</span> : null}
                </div>

                {post.body ? <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-200">{post.body}</p> : <p className="mt-3 text-sm text-zinc-500">Media post</p>}

                {images.length ? (
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {images.map((url, index) => <img key={`${post.postHash}-image-${index}`} src={url} alt="DeSo post media" loading="lazy" className="max-h-[32rem] w-full rounded-xl object-contain" />)}
                  </div>
                ) : null}

                {videos.length ? (
                  <div className="mt-4 space-y-2">
                    {videos.map((url, index) => <video key={`${post.postHash}-video-${index}`} src={url} controls preload="none" playsInline className="max-h-[32rem] w-full rounded-xl" />)}
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3 text-xs text-zinc-500">
                  {session ? <LikeButton postHash={post.postHash} initialCount={post.likeCount} /> : <span>Like · {post.likeCount}</span>}
                  {session ? <button type="button" onClick={() => setReplyingTo(isReplying ? null : post.postHash)} className="rounded-full border border-zinc-800 px-3 py-1 text-zinc-300 hover:border-[#8fd4a9]/45 hover:text-[#9adbb2]">Reply · {post.commentCount}</button> : <span>Reply · {post.commentCount}</span>}
                  {session ? <RepostButton postHash={post.postHash} initialCount={totalReposts} /> : <span>Repost · {totalReposts}</span>}
                  {session ? <DiamondButton postHash={post.postHash} receiverPublicKey={post.publicKey} initialCount={post.diamondCount} /> : <span>Diamond · {post.diamondCount}</span>}
                  {session ? <LocalSaveButton postHash={post.postHash} body={post.body} publicKey={post.publicKey} timestampNanos={post.timestampNanos} /> : null}
                  {session ? <FollowButton followedPublicKey={post.publicKey} /> : null}
                  {session ? <button type="button" onClick={() => {
                    const url = `${window.location.origin}/social?post=${encodeURIComponent(post.postHash)}`
                    if (navigator.share) void navigator.share({ title: "VIA · DeSo post", url }).catch(() => {})
                    else void navigator.clipboard?.writeText(url)
                  }} className="rounded-full border border-zinc-800 px-3 py-1 text-zinc-400 hover:border-[#8fd4a9]/45 hover:text-[#9adbb2]">Share</button> : null}
                  <XShareButton href={`/social?post=${encodeURIComponent(post.postHash)}`} text={post.body ? post.body.slice(0, 180) : "VIA · DeSo post"} label="X" className="rounded-full border border-zinc-800 px-3 py-1 text-zinc-400 hover:border-[#8fd4a9]/45 hover:text-[#9adbb2]" />
                  {session ? <button type="button" onClick={() => {
                    const url = `${window.location.origin}/social?post=${encodeURIComponent(post.postHash)}`
                    const text = `VIA · DeSo post\n${url}`
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer")
                  }} className="rounded-full border border-zinc-800 px-3 py-1 text-zinc-400 hover:border-[#8fd4a9]/45 hover:text-[#9adbb2]">WhatsApp</button> : null}
                  {session ? <Link href={`/?account=${encodeURIComponent(post.publicKey)}#collection-controls`} className="rounded-full border border-zinc-800 px-3 py-1 text-zinc-400 hover:border-[#8fd4a9]/45 hover:text-[#9adbb2]">NFTs</Link> : null}
                  {isOwnPost ? <Link href={`/edit-post?post=${encodeURIComponent(post.postHash)}`} className="rounded-full border border-[#8fd4a9]/45 px-3 py-1 text-[#9adbb2]">Edit</Link> : null}
                </div>

                {options.length >= 2 ? <PollVoteControl postHash={post.postHash} options={options} /> : null}
                {session && isReplying ? <PostComposer parentStakeID={post.postHash} compact onDone={() => { setReplyingTo(null); void loadPosts() }} /> : null}
              </article>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}
