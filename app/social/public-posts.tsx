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
  parentStakeID?: string
  comments?: PublicPost[]
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
  const [commentPosts, setCommentPosts] = useState<PublicPost[]>([])
  const [commentsBusy, setCommentsBusy] = useState(false)
  const [commentsError, setCommentsError] = useState(false)
  const [commentsRefresh, setCommentsRefresh] = useState(0)
  const [showerTarget, setShowerTarget] = useState<{ publicKey: string; username: string } | null>(null)
  const [showerPosts, setShowerPosts] = useState(25)
  const [showerSkipHours, setShowerSkipHours] = useState(0)
  const [showerLevel, setShowerLevel] = useState(1)
  const [showerAdditionalUsers, setShowerAdditionalUsers] = useState("")
  const [showerAdditionalPreview, setShowerAdditionalPreview] = useState<Record<string, PublicPost[]>>({})
  const [showerAdditionalError, setShowerAdditionalError] = useState(false)
  const [showerAdditionalBusy, setShowerAdditionalBusy] = useState(false)
  useEffect(() => {
    if (!showerTarget) return
    const names = [...new Set(showerAdditionalUsers.split(/[\s,]+/).map((name) => name.replace(/^@/, "").trim()).filter((name) => /^[a-zA-Z0-9_-]{1,32}$/.test(name)))].slice(0, 5)
    const controller = new AbortController()
    setShowerAdditionalPreview({}); setShowerAdditionalError(false)
    if (!names.length) { setShowerAdditionalBusy(false); return () => controller.abort() }
    setShowerAdditionalBusy(true)
    Promise.all(names.map(async (name) => {
      const response = await fetch(`/api/via/posts?identity=${encodeURIComponent(name)}&limit=50`, { signal: controller.signal, cache: "no-store" })
      if (!response.ok) throw new Error("DESO_POST_READ_FAILED")
      const data = await response.json() as PostsResponse
      if (!data.ok || !Array.isArray(data.posts)) throw new Error("DESO_POST_READ_FAILED")
      return [name, data.posts] as const
    })).then((items) => { if (!controller.signal.aborted) setShowerAdditionalPreview(Object.fromEntries(items)) })
      .catch(() => { if (!controller.signal.aborted) setShowerAdditionalError(true) })
      .finally(() => { if (!controller.signal.aborted) setShowerAdditionalBusy(false) })
    return () => controller.abort()
  }, [showerTarget, showerAdditionalUsers])
  const [showerShowUsers, setShowerShowUsers] = useState(false)
  const [showerPreview, setShowerPreview] = useState<PublicPost[] | null>(null)
  const [showerLevels, setShowerLevels] = useState<Record<string, number> | null>(null)
  const [showerLevelsError, setShowerLevelsError] = useState(false)
  useEffect(() => {
    if (!showerTarget) return
    const controller = new AbortController()
    setShowerLevels(null); setShowerLevelsError(false)
    fetch("/api/via/social/diamond", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "levels" }), signal: controller.signal, cache: "no-store" })
      .then(async (response) => { if (!response.ok) throw new Error("DESO_LEVELS_UNAVAILABLE"); return response.json() as Promise<{ ok?: boolean; diamondLevelMap?: Record<string, number> }> })
      .then((data) => { if (!controller.signal.aborted) { if (!data.ok || !data.diamondLevelMap) throw new Error("DESO_LEVELS_UNAVAILABLE"); setShowerLevels(data.diamondLevelMap) } })
      .catch(() => { if (!controller.signal.aborted) setShowerLevelsError(true) })
    return () => controller.abort()
  }, [showerTarget])
  const [showerPreviewError, setShowerPreviewError] = useState(false)
  const showerSelectedPosts = useMemo(() => {
    if (!showerTarget || !showerPreview) return []
    const cutoff = (Date.now() - showerSkipHours * 3600000) * 1000000
    const combined = [...showerPreview, ...Object.values(showerAdditionalPreview).flat()]
    return [...new Map(combined.filter((post) => post.postHash && post.publicKey && !post.parentStakeID && post.timestampNanos <= cutoff).map((post) => [post.postHash, post])).values()]
      .sort((left, right) => right.timestampNanos - left.timestampNanos).slice(0, showerPosts)
  }, [showerTarget, showerPreview, showerAdditionalPreview, showerSkipHours, showerPosts])
  const [showerExisting, setShowerExisting] = useState<Record<string, number>>({})
  const showerEligiblePosts = useMemo(() => showerSelectedPosts.filter((post) => typeof showerExisting[post.postHash] === "number" && showerExisting[post.postHash] < showerLevel && (!session || post.publicKey !== session.publicKey)), [showerSelectedPosts, showerExisting, showerLevel, session])
  const [showerExistingBusy, setShowerExistingBusy] = useState(false)
  const [showerExistingError, setShowerExistingError] = useState(false)
  const [showerPreviewBusy, setShowerPreviewBusy] = useState(false)
  const showerValueNanos = showerEligiblePosts.reduce((sum, post) => {
    const selected = showerLevels?.[String(showerLevel)]
    const previous = showerExisting[post.postHash] === 0 ? 0 : showerLevels?.[String(showerExisting[post.postHash])]
    return typeof selected === "number" && typeof previous === "number" && selected > previous ? sum + selected - previous : sum
  }, 0)
  const showerUserTokens = showerAdditionalUsers.split(/[\s,]+/).map((name) => name.replace(/^@/, "").trim()).filter(Boolean)
  const showerUsersValid = showerUserTokens.length <= 5 && showerUserTokens.every((name) => /^[a-zA-Z0-9_-]{1,32}$/.test(name)) && new Set(showerUserTokens.map((name) => name.toLowerCase())).size === showerUserTokens.length
  const showerValueVerified = Boolean(showerUsersValid && showerLevels && session && !showerExistingBusy && !showerExistingError && !showerPreviewBusy && !showerPreviewError && !showerAdditionalBusy && !showerAdditionalError && showerSelectedPosts.every((post) => typeof showerExisting[post.postHash] === "number") && showerEligiblePosts.every((post) => typeof showerLevels[String(showerExisting[post.postHash])] === "number" || showerExisting[post.postHash] === 0))
  useEffect(() => {
    if (!showerTarget || !session?.publicKey || !showerPreview) return
    const controller = new AbortController()
    setShowerExisting({}); setShowerExistingBusy(true); setShowerExistingError(false)
    const candidates = showerSelectedPosts
    async function readLevels() {
      const levels: Record<string, number> = {}
      for (const post of candidates) {
        if (controller.signal.aborted) return
        const response = await fetch("/api/via/social/diamond", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reader-level", postHash: post.postHash, readerPublicKey: session!.publicKey }), signal: controller.signal, cache: "no-store" })
        const data = await response.json() as { ok?: boolean; diamondLevelBestowed?: number }
        if (!response.ok || !data.ok || !Number.isInteger(data.diamondLevelBestowed)) throw new Error("DESO_READER_UNAVAILABLE")
        levels[post.postHash] = data.diamondLevelBestowed as number
      }
      if (!controller.signal.aborted) setShowerExisting(levels)
    }
    readLevels().catch(() => { if (!controller.signal.aborted) setShowerExistingError(true) }).finally(() => { if (!controller.signal.aborted) setShowerExistingBusy(false) })
    return () => controller.abort()
  }, [showerTarget, showerPreview, showerSelectedPosts, session?.publicKey])
  useEffect(() => {
    if (!showerTarget) { setShowerPreview(null); return }
    const controller = new AbortController()
    setShowerPreview(null); setShowerPreviewError(false); setShowerPreviewBusy(true)
    fetch(`/api/via/posts?identity=${encodeURIComponent(showerTarget.publicKey)}&limit=50`, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => { if (!response.ok) throw new Error("POST_READ_FAILED"); return response.json() as Promise<PostsResponse> })
      .then((data) => { if (!controller.signal.aborted) { if (!data.ok || !Array.isArray(data.posts)) throw new Error("POST_READ_FAILED"); setShowerPreview(data.posts) } })
      .catch(() => { if (!controller.signal.aborted) setShowerPreviewError(true) })
      .finally(() => { if (!controller.signal.aborted) setShowerPreviewBusy(false) })
    return () => controller.abort()
  }, [showerTarget])
  useEffect(() => {
    if (!replyingTo) { setCommentPosts([]); return }
    const controller = new AbortController()
    setCommentsBusy(true)
    setCommentsError(false)
    fetch(`/api/via/post?hash=${encodeURIComponent(replyingTo)}&comments=1`, { cache: "no-store", signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error("DESO_COMMENTS_UNAVAILABLE"); return response.json() })
      .then((data: { comments?: PublicPost[] } | null) => { if (!controller.signal.aborted) setCommentPosts(Array.isArray(data?.comments) ? data.comments : []) })
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
      !post.parentStakeID && (
      mediaFilter === "all" ||
      (mediaFilter === "image" && post.imageUrls.length > 0) ||
      (mediaFilter === "video" && post.videoUrls.length > 0) ||
      (mediaFilter === "nft" && post.isNft)),
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
    const refresh = () => void loadPosts()
    window.addEventListener("via:social:post-published", refresh)
    return () => window.removeEventListener("via:social:post-published", refresh)
  }, [feedChoice, session?.publicKey])

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

      {showerTarget ? <div role="dialog" aria-modal="true" aria-label="Diamond Shower" className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 p-4"><div className="w-full max-w-lg rounded-xl border border-zinc-700 bg-[#080b09] p-5 text-zinc-200"><h2 className="text-lg font-semibold">Diamond Shower to @{showerTarget.username}</h2><div className="mt-4 space-y-3 text-sm"><label className="flex items-center justify-between gap-3">Posts <input type="number" min={1} max={100} value={showerPosts} onChange={(event) => setShowerPosts(Math.min(100, Math.max(1, Number(event.target.value) || 1)))} className="w-28 rounded border border-zinc-700 bg-black p-2" /></label><label className="flex items-center justify-between gap-3">Diamond <select value={showerLevel} onChange={(event) => setShowerLevel(Number(event.target.value))} className="rounded border border-zinc-700 bg-black p-2">{Array.from({length:8},(_,i)=><option key={i+1} value={i+1}>{i+1} 💎</option>)}</select></label><label className="flex items-center justify-between gap-3">Skip Hours <input type="number" min={0} max={8760} value={showerSkipHours} onChange={(event) => setShowerSkipHours(Math.min(8760, Math.max(0, Number(event.target.value) || 0)))} className="w-28 rounded border border-zinc-700 bg-black p-2" /></label><button type="button" onClick={() => setShowerShowUsers((current) => !current)} aria-expanded={showerShowUsers} className="rounded border border-zinc-600 px-3 py-2">Add Users {showerShowUsers ? "−" : "+"}</button>{showerShowUsers ? <label className="block">Additional DeSo usernames (one per line)<textarea value={showerAdditionalUsers} onChange={(event) => setShowerAdditionalUsers(event.target.value.slice(0, 2000))} rows={3} placeholder="@username" className="mt-2 w-full rounded border border-zinc-700 bg-black p-2" /><span className="text-xs text-zinc-400">{showerAdditionalBusy ? "Reading additional DeSo profiles…" : showerAdditionalError ? "One or more profiles could not be read." : `${Object.keys(showerAdditionalPreview).length} additional usernames read from DeSo (preview only).`} Maximum 5 unique valid usernames; no transactions. {!showerUsersValid ? "Please correct invalid or duplicate usernames before totals can be verified." : ""}</span></label> : null}<p className="text-zinc-400">{showerLevelsError ? "DeSo diamond levels unavailable." : showerLevels ? `DeSo level ${showerLevel}: ${typeof showerLevels[String(showerLevel)] === "number" ? (showerLevels[String(showerLevel)] / 1000000000).toLocaleString(undefined, { maximumFractionDigits: 9 }) + " DESO per new diamond (network fees and existing levels excluded)." : "unavailable"}` : "Reading DeSo diamond levels…"}</p><p className="text-zinc-400">{showerPreviewBusy ? "Reading public posts from DeSo…" : showerPreviewError ? "DeSo posts are unavailable." : showerPreview ? `${showerSelectedPosts.length} selected DeSo posts (up to 50 per profile read; no transactions).` : "No post data loaded."}</p><p className="text-zinc-400">{!session ? "Log in with DeSo to check diamonds already given." : showerExistingBusy ? "Checking existing DeSo diamond levels for selected posts…" : showerExistingError ? "Existing diamond levels could not be verified." : showerPreview ? `${Object.keys(showerExisting).length} post levels checked; ${Object.values(showerExisting).filter((level) => level >= showerLevel).length} already at or above selected level.` : "Existing diamond levels not checked."}</p><p className="text-zinc-400">{showerExistingBusy || showerExistingError || !session ? "Eligible transaction selection not verified." : `${showerEligiblePosts.length} posts eligible for a higher diamond level; ${showerSelectedPosts.length - showerEligiblePosts.length} skipped (already given, self-post or unverified).`}</p><p className="text-zinc-400">{showerValueVerified ? `DeSo diamond value for eligible upgrades: ${(showerValueNanos / 1000000000).toLocaleString(undefined, { maximumFractionDigits: 9 })} DESO (network fees not included).` : "Total DeSo diamond value unavailable until all reader levels are verified."}</p><p className="text-amber-300">DeSo transaction verification is not yet enabled for bulk sending. Start is unavailable; no Diamonds are sent.</p><button type="button" disabled className="w-full rounded bg-zinc-700 px-3 py-2 text-zinc-300 opacity-60">Start (unavailable)</button></div><button type="button" onClick={() => setShowerTarget(null)} className="mt-5 rounded-lg border border-zinc-600 px-4 py-2">Close</button></div></div> : null}
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

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-3 text-xs text-zinc-500">
                  <button type="button" onClick={() => setReplyingTo(isReplying ? null : post.postHash)} title="Reply" aria-label={`Reply · ${post.commentCount}`} className="inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-full border border-zinc-800 px-2 text-xs text-zinc-300 hover:border-[#8fd4a9]/45 hover:text-[#9adbb2]"><MessageSquare aria-hidden="true" className="h-4 w-4" /><span>{post.commentCount}</span></button>
                  {session ? <RepostButton postHash={post.postHash} initialCount={totalReposts} variant="icon" /> : <button type="button" title="Repost (DeSo login required)" onClick={() => setActionLoginPost(post.postHash)} className="inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-full border border-zinc-800 px-2 text-xs text-zinc-300">Repost · {totalReposts}</button>}
                  {session ? <LikeButton postHash={post.postHash} initialCount={post.likeCount} variant="icon" /> : <button type="button" title="Like (DeSo login required)" onClick={() => setActionLoginPost(post.postHash)} className="inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-full border border-zinc-800 px-2 text-xs text-zinc-300">Like · {post.likeCount}</button>}
                  {session ? <DiamondButton postHash={post.postHash} receiverPublicKey={post.publicKey} initialCount={post.diamondCount} variant="icon" /> : <button type="button" title="Diamond (DeSo login required)" onClick={() => setActionLoginPost(post.postHash)} className="inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-full border border-zinc-800 px-2 text-xs text-zinc-300">Diamond · {post.diamondCount}</button>}
                  <details className="relative" onClick={(event) => { if (event.target instanceof HTMLElement && event.target.closest("button, a") && !event.target.closest("summary")) (event.currentTarget as HTMLDetailsElement).removeAttribute("open") }}>
                    <summary aria-label="Meer postacties" title="Meer postacties" className="cursor-pointer list-none rounded-full border border-zinc-800 px-3 py-1 text-zinc-400">•••</summary>
                    <div className="absolute right-0 z-30 mt-2 flex max-h-[65vh] min-w-44 flex-col overflow-y-auto rounded-xl border border-zinc-800 bg-[#050806] text-left shadow-2xl">
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
                      {session && session.publicKey !== post.publicKey ? <button type="button" onClick={() => setShowerTarget({ publicKey: post.publicKey, username: creatorUsername || shortPublicKey(post.publicKey) })} className="px-3 py-2 text-left text-zinc-300 hover:bg-white/[0.04]">Diamond Shower</button> : null}
                      {session ? <div className="[&_button]:w-full [&_button]:rounded-none [&_button]:border-0 [&_button]:px-3 [&_button]:py-2 [&_button]:text-left"><FollowButton followedPublicKey={post.publicKey} followedUsername={creatorUsername || "this user"} /></div> : null}
                      
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
                {isReplying ? (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-2 sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setReplyingTo(null) }}>
                    <section role="dialog" aria-modal="true" aria-label="Reply to DeSo post" className="relative flex max-h-[94dvh] w-full max-w-2xl flex-col overflow-y-auto rounded-xl border border-zinc-700 bg-[#080b09] p-4 shadow-2xl sm:p-6">
                      <button type="button" onClick={() => setReplyingTo(null)} aria-label="Close reply" className="absolute right-3 top-3 rounded-full border border-zinc-700 px-3 py-1 text-xl text-zinc-200">×</button>
                      <div className="border-b border-zinc-800 pb-4 pr-12">
                        <p className="text-sm font-semibold text-zinc-100">{creatorUsername ? `@${creatorUsername}` : shortPublicKey(post.publicKey)}</p>
                        {post.body ? <p className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap break-words text-sm text-zinc-300">{post.body}</p> : null}
                        {images[0] ? <img src={images[0]} alt="Original post attachment" className="mt-2 max-h-36 rounded-lg object-contain" /> : null}
                      </div>
                      <div className="mt-3 max-h-40 space-y-2 overflow-y-auto" aria-label="DeSo reactions">
                        {commentsBusy ? <p className="text-xs text-zinc-400">Loading DeSo replies…</p> : null}
                        {commentsError ? <div role="alert" className="flex flex-wrap items-center gap-2 text-xs text-amber-300"><span>DeSo replies could not be loaded.</span><button type="button" onClick={() => setCommentsRefresh((value) => value + 1)} className="rounded-lg border border-amber-500/40 px-2 py-1">Retry</button></div> : null}
                        {!commentsBusy && !commentsError && commentPosts.length === 0 ? <p className="text-xs text-zinc-500">No replies returned by DeSo yet.</p> : null}
                    {!commentsBusy ? <button type="button" onClick={() => setCommentsRefresh((value) => value + 1)} className="rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-300">Refresh replies</button> : null}
                    {commentPosts.map((comment) => <div key={comment.postHash} className="rounded-lg border border-zinc-800 p-2 text-sm"><p className="text-xs text-zinc-400">{comment.username ? `@${comment.username}` : shortPublicKey(comment.publicKey)}</p><p className="mt-1 whitespace-pre-wrap break-words">{comment.body}</p><div className="mt-2 flex flex-wrap items-center gap-2">{session ? <><LikeButton postHash={comment.postHash} initialCount={comment.likeCount} variant="icon" />{session.publicKey !== comment.publicKey ? <DiamondButton postHash={comment.postHash} receiverPublicKey={comment.publicKey} initialCount={comment.diamondCount} variant="icon" /> : <span className="text-xs text-zinc-400">Diamonds · {comment.diamondCount}</span>}</> : <span className="text-xs text-zinc-400">Like · {comment.likeCount} · Diamonds · {comment.diamondCount}</span>}</div>{comment.comments?.map((child) => <div key={child.postHash} className="ml-4 mt-2 border-l border-zinc-700 pl-3"><p className="text-xs text-zinc-400">{child.username ? `@${child.username}` : shortPublicKey(child.publicKey)}</p><p className="whitespace-pre-wrap break-words">{child.body}</p><div className="mt-2 flex flex-wrap items-center gap-2">{session ? <><LikeButton postHash={child.postHash} initialCount={child.likeCount} variant="icon" />{session.publicKey !== child.publicKey ? <DiamondButton postHash={child.postHash} receiverPublicKey={child.publicKey} initialCount={child.diamondCount} variant="icon" /> : <span className="text-xs text-zinc-400">Diamonds · {child.diamondCount}</span>}</> : <span className="text-xs text-zinc-400">Like · {child.likeCount} · Diamonds · {child.diamondCount}</span>}</div></div>)}</div>)}
                      </div>
                      <p className="mt-4 text-sm text-zinc-400">Replying to {creatorUsername ? `@${creatorUsername}` : shortPublicKey(post.publicKey)}</p>
                      {session ? <PostComposer parentStakeID={post.postHash} compact onCancel={() => setReplyingTo(null)} onDone={() => { setCommentsRefresh((value) => value + 1); void loadPosts() }} /> : <p className="mt-4 text-sm text-zinc-400">Sign in with DeSo to write a reply. Existing replies are public.</p>}
                    </section>
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      ) : null}

      {posts.length > 0 && feedChoice !== "following" && !sharedPostView && hasMore ? (
        <div className="mt-5 text-center">
          <button type="button" onClick={() => void loadMorePosts()} disabled={loading} className="text-xs text-zinc-500 transition hover:text-[#9adbb2] disabled:cursor-wait disabled:opacity-50">
            {loading ? "Laden…" : "Meer laden"}
          </button>
        </div>
      ) : null}
    </section>
  )
}
