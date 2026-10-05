"use client"

import Link from "next/link"
import { MessageSquare } from "lucide-react"
import { readViaLocalSettings } from "../via-local-settings"
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
  comments?: PublicPost[]
}

type PostsResponse = { ok?: boolean; posts?: PublicPost[] }
type SinglePostResponse = { ok?: boolean; post?: PublicPost }

type CompactProfile = { username?: string; profilePic?: string | null; isVerified?: boolean }
type CompactProfileResponse = { ok?: boolean; profile?: CompactProfile }
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
  const [hasMore, setHasMore] = useState(true)
  const [message, setMessage] = useState("Choose a feed and load posts.")
  const [feedChoice, setFeedChoice] = useState<ChoiceId>("hot")
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyParent, setReplyParent] = useState<string | null>(null)
  const [commentPosts, setCommentPosts] = useState<PublicPost[]>([])
  const [commentsBusy, setCommentsBusy] = useState(false)
  const [commentsError, setCommentsError] = useState(false)
  const [commentsRefresh, setCommentsRefresh] = useState(0)
  useEffect(() => {
    if (!replyingTo) { setCommentPosts([]); return }
    const controller = new AbortController()
    setCommentsBusy(true); setCommentsError(false)
    fetch(`/api/via/post?hash=${encodeURIComponent(replyingTo)}&comments=1`, { cache: "no-store", signal: controller.signal })
      .then(async response => { if (!response.ok) throw new Error("COMMENTS_UNAVAILABLE"); return response.json() })
      .then((data: { comments?: PublicPost[] }) => { if (!controller.signal.aborted) setCommentPosts(Array.isArray(data.comments) ? data.comments : []) })
      .catch(() => { if (!controller.signal.aborted) setCommentsError(true) })
      .finally(() => { if (!controller.signal.aborted) setCommentsBusy(false) })
    return () => controller.abort()
  }, [replyingTo, commentsRefresh])
  const [actionLoginPost, setActionLoginPost] = useState<string | null>(null)
  const [sharedPostView, setSharedPostView] = useState(false)
  const [translationPost, setTranslationPost] = useState<string | null>(null)
  const [translationLanguage, setTranslationLanguage] = useState("en")
  const [translatedText, setTranslatedText] = useState("")
  const [translationMessage, setTranslationMessage] = useState("")
  const [translationBusy, setTranslationBusy] = useState(false)
  const [creatorProfiles, setCreatorProfiles] = useState<Record<string, CompactProfile>>({})
  const loadMoreSentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const missing = Array.from(new Set(posts.map((post) => post.publicKey))).filter((key) => key && !creatorProfiles[key])
    if (!missing.length) return
    let cancelled = false
    void Promise.all(missing.slice(0, 20).map(async (publicKey) => {
      try {
        const response = await fetch(`/api/via/profile?identity=${encodeURIComponent(publicKey)}&compact=1`)
        const data = (await response.json()) as CompactProfileResponse
        return response.ok && data.ok && data.profile ? [publicKey, data.profile] as const : null
      } catch { return null }
    })).then((entries) => {
      if (cancelled) return
      const valid = entries.filter((entry): entry is readonly [string, CompactProfile] => Boolean(entry))
      if (valid.length) setCreatorProfiles((current) => ({ ...current, ...Object.fromEntries(valid) }))
    })
    return () => { cancelled = true }
  }, [posts, creatorProfiles])

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const media = params.get("media")
      if (media === "image" || media === "video" || media === "nft") setMediaFilter(media)

      const sharedPost = params.get("post")?.trim().toLowerCase() ?? ""
      if (/^[0-9a-f]{64}$/.test(sharedPost)) {
        setSharedPostView(true)
        setHasMore(false)
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
      setSharedPostView(false)
      setHasMore(true)
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

  useEffect(() => {
    if (!translationPost) return
    document.getElementById(`via-translation-${translationPost}`)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    })
  }, [translationPost])

  async function translatePost(post: PublicPost, targetLanguage: string) {
    setTranslationPost(post.postHash)
    setTranslationLanguage(targetLanguage)
    setTranslatedText("")
    setTranslationMessage("")
    if (!post.body.trim()) {
      setTranslationMessage("This post has no text to translate.")
      return
    }
    // Local browser translation only: never send DeSo post text to a paid API.
    type LocalTranslator = {
      translate: (text: string) => Promise<string>
    }
    type BrowserTranslator = {
      create: (options: { sourceLanguage: string; targetLanguage: string }) => Promise<LocalTranslator>
    }
    const browser = globalThis as typeof globalThis & { Translator?: BrowserTranslator }
    if (!browser.Translator) {
      setTranslationMessage("Translation is not supported by this browser. Copy the original text to translate with your preferred app.")
      return
    }
    setTranslationBusy(true)
    try {
      // Let the browser detect the source language if supported by its model.
      const detector = globalThis as typeof globalThis & {
        LanguageDetector?: { create: () => Promise<{ detect: (text: string) => Promise<Array<{ detectedLanguage: string; confidence: number }>> }> }
      }
      if (!detector.LanguageDetector) throw new Error("DETECTION_UNAVAILABLE")
      const model = await detector.LanguageDetector.create()
      const detected = await model.detect(post.body)
      const sourceLanguage = detected[0]?.detectedLanguage
      if (!sourceLanguage || sourceLanguage === "und") throw new Error("LANGUAGE_UNAVAILABLE")
      if (sourceLanguage === targetLanguage) {
        setTranslatedText(post.body)
      } else {
        const translator = await browser.Translator.create({ sourceLanguage, targetLanguage })
        setTranslatedText(await translator.translate(post.body))
      }
    } catch {
      setTranslationMessage("Local translation is unavailable for this language or browser. Copy the original text to use your preferred translator.")
    } finally {
      setTranslationBusy(false)
    }
  }

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
    setHasMore(true)
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

  useEffect(() => {
    void loadPosts()
  }, [feedChoice, session?.publicKey])

  useEffect(() => {
    const refresh = () => { void loadPosts(); if (replyingTo) setCommentsRefresh((value) => value + 1) }
    window.addEventListener("via:social:post-published", refresh)
    return () => window.removeEventListener("via:social:post-published", refresh)
  }, [feedChoice, session?.publicKey, replyingTo])

  async function loadMorePosts() {
    if (loading || feedChoice === "following" || posts.length === 0) return
    requestController.current?.abort()
    const controller = new AbortController()
    requestController.current = controller
    setLoading(true)
    setMessage("Loading…")
    try {
      const seen = posts.map((post) => post.postHash).filter(Boolean).slice(-100).join(",")
      const endpoint = feedChoice === "hot"
        ? `/api/via/discovery?limit=20&seen=${encodeURIComponent(seen)}`
        : `/api/via/discovery?limit=20&sort=new&seen=${encodeURIComponent(seen)}`
      const response = await fetch(endpoint, { signal: controller.signal })
      const data = (await response.json()) as PostsResponse
      const nextPosts = response.ok && data.ok && Array.isArray(data.posts) ? data.posts : []
      setPosts((current) => {
        const known = new Set(current.map((post) => post.postHash))
        return [...current, ...nextPosts.filter((post) => !known.has(post.postHash))]
      })
      setHasMore(nextPosts.length > 0)
      setMessage(nextPosts.length ? `${nextPosts.length} more posts loaded.` : "No more posts found.")
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) setMessage("More posts are temporarily unavailable.")
    } finally {
      if (requestController.current === controller) {
        requestController.current = null
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    const sentinel = loadMoreSentinelRef.current
    if (!sentinel || sharedPostView || feedChoice === "following" || !hasMore || loading || posts.length === 0) return
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) void loadMorePosts()
    }, { rootMargin: "600px 0px" })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [sharedPostView, feedChoice, hasMore, loading, posts.length])

  return (
    <section className="rounded-2xl border border-white/10 bg-black/35 p-4 sm:p-5" aria-labelledby="public-posts-heading">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <h2 id="public-posts-heading" className="sr-only">Posts</h2>
        <div className="flex w-full gap-2 overflow-x-auto pb-1 sm:w-auto sm:flex-wrap sm:overflow-visible sm:pb-0" aria-label="Filter posts">
          {(["all", "image", "video", "nft"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              aria-pressed={mediaFilter === filter}
              onClick={() => setMediaFilter(filter)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs ${mediaFilter === filter ? "border-[#8fd4a9]/55 text-[#9adbb2]" : "border-zinc-800 text-zinc-500"}`}
            >
              {filter === "all" ? "All" : filter === "nft" ? "NFT" : filter[0].toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 hidden max-w-2xl sm:flex">
        <p className="flex-1 self-center text-sm text-zinc-500">
          {feedChoice === "following"
            ? session
              ? `Following for ${shortPublicKey(session.publicKey)}`
              : "DeSo login required for Following"
            : feedChoice === "hot"
              ? "Public Hot feed"
              : "Recent public DeSo posts"}
        </p>
      </div>

      <p className={`mt-3 text-xs text-zinc-500 ${loading || message.includes("unavailable") || message.includes("Log in") || message.includes("No posts") || message.includes("shared post") ? "" : "hidden sm:block"}`} role="status" aria-live="polite">{message}</p>

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
            const postedViaVIA = post.postExtraData?.ViaClient === "viadeso.online"
            const username = typeof post.username === "string" ? post.username.trim().replace(/^@/, "") : ""
            const creator = creatorProfiles[post.publicKey]
            const creatorUsername = creator?.username?.trim().replace(/^@/, "") || username
            const creatorPic = creator?.profilePic ? safeHttps(creator.profilePic) : null

            return (
              <article key={post.postHash} className="rounded-2xl border border-zinc-800/80 bg-[#050806]/80 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    {creatorPic ? <img src={creatorPic} alt="" loading="lazy" className="h-9 w-9 shrink-0 rounded-full object-cover" /> : <div aria-hidden="true" className="h-9 w-9 shrink-0 rounded-full border border-zinc-800 bg-black/30" />}
                    <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-300">
                      DeSo · <Link href={`/profile/${encodeURIComponent(post.publicKey)}`} className="text-zinc-200 transition hover:text-[#9adbb2]">{creatorUsername ? `@${creatorUsername}` : shortPublicKey(post.publicKey)}{creator?.isVerified ? " ✓" : ""}</Link>
                    </p>
                    {time ? <p className="mt-1 text-[11px] text-zinc-600">{time}</p> : null}
                    </div>
                  </div>
                  {post.isNft ? <span className="rounded-full border border-[#8fd4a9]/35 px-2.5 py-1 text-[11px] text-[#9adbb2]">NFT</span> : null}
                </div>

                {post.body ? <p className="mt-3 whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-sm leading-6 text-zinc-200">{post.body}</p> : <p className="mt-3 text-sm text-zinc-500">Media post</p>}
                {postedViaVIA ? <p className="mt-1 text-[11px] text-zinc-500">Gepost via VIA</p> : null}

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
                  <button type="button" onClick={() => (setReplyParent(null), setReplyingTo(isReplying ? null : post.postHash))} title="Reply" aria-label={`Reply · ${post.commentCount}`} className="inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-full border border-zinc-800 px-2 text-xs text-zinc-300 hover:border-[#8fd4a9]/45 hover:text-[#9adbb2]"><MessageSquare aria-hidden="true" className="h-4 w-4" /><span>{post.commentCount}</span></button>
                  {session ? <RepostButton postHash={post.postHash} initialCount={totalReposts} variant="icon" /> : <button type="button" title="Repost (DeSo login required)" onClick={() => setActionLoginPost(post.postHash)} className="inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-full border border-zinc-800 px-2 text-xs text-zinc-300">Repost · {totalReposts}</button>}
                  {session ? <LikeButton postHash={post.postHash} initialCount={post.likeCount} variant="icon" /> : <button type="button" title="Like (DeSo login required)" onClick={() => setActionLoginPost(post.postHash)} className="inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-full border border-zinc-800 px-2 text-xs text-zinc-300">Like · {post.likeCount}</button>}
                  {session ? <DiamondButton postHash={post.postHash} receiverPublicKey={post.publicKey} initialCount={post.diamondCount} variant="icon" /> : <button type="button" title="Diamond (DeSo login required)" onClick={() => setActionLoginPost(post.postHash)} className="inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-full border border-zinc-800 px-2 text-xs text-zinc-300">Diamond · {post.diamondCount}</button>}
                  <details className="relative">
                    <summary aria-label="Meer postacties" title="Meer postacties" className="cursor-pointer list-none rounded-full border border-zinc-800 px-3 py-1 text-zinc-400">•••</summary>
                    <div className="mt-2 flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-[#050806] text-left">
                      <button type="button" onClick={() => {
                        const lang = readViaLocalSettings().interfaceLanguage
                        const target = ({ Dutch: "nl", English: "en", French: "fr", Spanish: "es", Chinese: "zh", Hindi: "hi" } as Record<string, string>)[lang] ?? "en"
                        setTranslationPost(post.postHash)
                        setTranslationLanguage(target)
                        setTranslatedText("")
                        setTranslationMessage("")
                        ;(document.activeElement as HTMLElement | null)?.closest("details")?.removeAttribute("open")
                      }} className="px-3 py-2 text-left text-zinc-300 hover:bg-white/[0.04]">🌐 Translate / Vertalen</button>
                      <button type="button" onClick={() => void navigator.clipboard?.writeText(`${window.location.origin}/social?post=${encodeURIComponent(post.postHash)}`)} className="px-3 py-2 text-left text-zinc-300 hover:bg-white/[0.04]">Link to Post</button>
                      {session ? <button type="button" onClick={() => {
                        const url = `${window.location.origin}/social?post=${encodeURIComponent(post.postHash)}`
                        if (navigator.share) void navigator.share({ title: "VIA · DeSo post", url }).catch(() => {})
                        else void navigator.clipboard?.writeText(url)
                      }} className="px-3 py-2 text-left text-zinc-300 hover:bg-white/[0.04]">Share Post</button> : null}
                      <XShareButton href={`/social?post=${encodeURIComponent(post.postHash)}`} text={post.body ? post.body.slice(0, 180) : "VIA · DeSo post"} label="X" className="px-3 py-2 text-left text-zinc-300 hover:bg-white/[0.04]" />
                      {session ? <button type="button" onClick={() => {
                        const url = `${window.location.origin}/social?post=${encodeURIComponent(post.postHash)}`
                        const text = `VIA · DeSo post\n${url}`
                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer")
                      }} className="px-3 py-2 text-left text-zinc-300 hover:bg-white/[0.04]">WhatsApp</button> : null}
                      {session ? <div className="[&_button]:w-full [&_button]:rounded-none [&_button]:border-0 [&_button]:px-3 [&_button]:py-2 [&_button]:text-left">
                        <LocalSaveButton postHash={post.postHash} body={post.body} publicKey={post.publicKey} timestampNanos={post.timestampNanos} />
                      </div> : null}
                      {session ? <div className="[&_button]:w-full [&_button]:rounded-none [&_button]:border-0 [&_button]:px-3 [&_button]:py-2 [&_button]:text-left"><FollowButton followedPublicKey={post.publicKey} /></div> : null}
                      {session ? <Link href={`/?account=${encodeURIComponent(post.publicKey)}#collection-controls`} className="px-3 py-2 text-zinc-300 hover:bg-white/[0.04]">NFTs</Link> : null}
                      <button type="button" onClick={(event) => (event.currentTarget.closest("details") as HTMLDetailsElement | null)?.removeAttribute("open")} className="border-t border-zinc-800 px-3 py-2 text-left text-zinc-400 hover:bg-white/[0.04]">Sluiten</button>
                    </div>
                  </details>
                  {isOwnPost ? <Link href={`/edit-post?post=${encodeURIComponent(post.postHash)}`} className="rounded-full border border-[#8fd4a9]/45 px-3 py-1 text-[#9adbb2]">Edit</Link> : null}
                </div>

                {actionLoginPost === post.postHash && !session ? (
                  <div role="status" className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-[#8fd4a9]/35 p-3 text-sm text-zinc-300">
                    <span>Connect your DeSo account through VIA before replying, reposting, liking or sending Diamonds. No transaction was sent.</span>
                    <button type="button" onClick={() => setActionLoginPost(null)} className="rounded-full border border-zinc-700 px-3 py-1">Sluiten</button>
                  </div>
                ) : null}
                {translationPost === post.postHash ? (
                  <div id={`via-translation-${post.postHash}`} role="region" aria-label="Post translation" className="mt-3 scroll-mt-28 rounded-xl border border-[#8fd4a9]/35 bg-black/40 p-3 text-sm text-zinc-300">
                    <div className="flex flex-wrap items-center gap-2">
                      <span>Translate:</span>
                      {([["🇳🇱","nl"],["🇬🇧","en"],["🇫🇷","fr"],["🇪🇸","es"],["🇨🇳","zh"],["🇮🇳","hi"]] as const).map(([flag, code]) => (
                        <button key={code} type="button" aria-label={code} aria-pressed={translationLanguage === code} disabled={translationBusy} onClick={() => void translatePost(post, code)} className="rounded-md border border-zinc-700 px-2 py-1 disabled:opacity-50">{flag}</button>
                      ))}
                      <button type="button" onClick={() => { setTranslationPost(null); setTranslatedText(""); setTranslationMessage("") }} className="ml-auto rounded-md border border-zinc-700 px-2 py-1">Sluiten</button>
                    </div>
                    {translationBusy ? <p className="mt-2">Translating locally…</p> : null}
                    {translatedText ? <p className="mt-3 whitespace-pre-wrap break-words">{translatedText}</p> : null}
                    {translationMessage ? <p className="mt-2 text-zinc-400">{translationMessage}</p> : null}
                    <button type="button" onClick={() => void navigator.clipboard?.writeText(post.body)} className="mt-2 rounded-md border border-zinc-700 px-2 py-1">Copy original text</button>
                  </div>
                ) : null}

                {options.length >= 2 ? <PollVoteControl postHash={post.postHash} options={options} /> : null}
                {isReplying ? <section className="mt-3 space-y-3 rounded-xl border border-zinc-700 p-3" aria-label="DeSo replies">
                  <div className="flex items-center justify-between"><strong className="text-sm">DeSo replies</strong><button type="button" onClick={() => { setReplyingTo(null); setReplyParent(null) }} aria-label="Close replies">×</button></div>
                  {commentsBusy ? <p>Loading replies…</p> : commentsError ? <p role="alert">DeSo replies unavailable. <button type="button" onClick={() => setCommentsRefresh(n => n + 1)}>Retry</button></p> : commentPosts.length === 0 ? <p>No replies returned by DeSo.</p> : commentPosts.map(comment => <div key={comment.postHash} className="rounded-lg border border-zinc-800 p-2 text-sm"><p className="text-zinc-400">{comment.username ? `@${comment.username}` : shortPublicKey(comment.publicKey)}</p><p className="whitespace-pre-wrap break-words">{comment.body}</p>{comment.comments?.map(child => <div key={child.postHash} className="ml-4 mt-2 border-l border-zinc-700 pl-3"><p className="text-zinc-400">{child.username ? `@${child.username}` : shortPublicKey(child.publicKey)}</p><p className="whitespace-pre-wrap break-words">{child.body}</p><div className="mt-2 flex flex-wrap items-center gap-2"><button type="button" onClick={() => setReplyParent(child.postHash)}>Reply</button>{session ? <><LikeButton postHash={child.postHash} initialCount={child.likeCount} variant="icon" /><RepostButton postHash={child.postHash} initialCount={child.repostCount + child.quoteRepostCount} variant="icon" />{session.publicKey !== child.publicKey ? <DiamondButton postHash={child.postHash} receiverPublicKey={child.publicKey} initialCount={child.diamondCount} variant="icon" /> : <span>Diamonds · {child.diamondCount}</span>}</> : null}</div></div>)}<div className="flex flex-wrap gap-2"><button type="button" onClick={() => setReplyParent(comment.postHash)}>Reply</button>{session ? <><LikeButton postHash={comment.postHash} initialCount={comment.likeCount} variant="icon" /><RepostButton postHash={comment.postHash} initialCount={comment.repostCount + comment.quoteRepostCount} variant="icon" />{session.publicKey !== comment.publicKey ? <DiamondButton postHash={comment.postHash} receiverPublicKey={comment.publicKey} initialCount={comment.diamondCount} variant="icon" /> : <span>Diamonds · {comment.diamondCount}</span>}</> : null}</div></div>)}
                  <button type="button" onClick={() => setCommentsRefresh(n => n + 1)} disabled={commentsBusy}>Refresh replies</button>
                  {session ? <PostComposer key={replyParent ?? post.postHash} parentStakeID={replyParent ?? post.postHash} compact onCancel={() => setReplyParent(null)} onDone={() => { setReplyParent(null); setCommentsRefresh(n => n + 1); void loadPosts() }} /> : <p>Sign in with DeSo to reply.</p>}
                </section> : null}
              </article>
            )
          })}
        </div>
      ) : null}

      {posts.length > 0 && feedChoice !== "following" && !sharedPostView && hasMore ? (\n        <div ref={loadMoreSentinelRef} className="mt-5 text-center">
          <button type="button" onClick={() => void loadMorePosts()} disabled={loading} className="text-xs text-zinc-500 transition hover:text-[#9adbb2] disabled:cursor-wait disabled:opacity-50">
            {loading ? "Laden…" : "Meer laden"}
          </button>
        </div>
      ) : null}
    </section>
  )
}
