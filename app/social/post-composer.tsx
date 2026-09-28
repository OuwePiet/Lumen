"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { DESO_IDENTITY_ORIGIN, restoreIdentitySession, VIA_IDENTITY_EVENT, type ViaIdentitySession } from "../deso-identity-session"
import { requestIdentityJwt } from "./identity-jwt"
import VideoUploadControl from "./video-upload-control"
import SponsorPlatform from "../sponsor-platform"

const MAX_POST_LENGTH = 5000
const MAX_IMAGES = 4
const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const MAX_POLL_OPTIONS = 5
const MAX_POLL_OPTION_LENGTH = 120
const SOCIAL_DRAFT_STORAGE_KEY = "via:social:draft:v1"
const SOCIAL_REPLY_DRAFT_PREFIX = "via:social:reply-draft:v1:"
const COMPOSER_EMOJI = ["😀", "😄", "😂", "😍", "😎", "🤔", "👏", "👍", "❤️", "🔥", "🎉", "🚀", "🌍", "🎨", "🎵", "✨"] as const
const ALLOWED_IMAGE_TYPES = new Set(["image/gif", "image/jpeg", "image/png", "image/webp"])

type PrepareResponse = { ok?: boolean; transactionHex?: string; feeNanos?: number | null; error?: string }
type SubmitResponse = { ok?: boolean; transaction?: Record<string, unknown>; error?: string }
type UploadResponse = { ok?: boolean; imageUrl?: string; error?: string }
type PostComposerProps = { parentStakeID?: string; compact?: boolean; onDone?: () => void }

function signedTransactionFromMessage(event: MessageEvent, source: Window | null) {
  if (event.origin !== DESO_IDENTITY_ORIGIN || event.source !== source) return null
  if (!event.data || typeof event.data !== "object") return null
  const data = event.data as Record<string, unknown>
  if (data.service !== "identity") return null
  const payload = data.payload
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null
  const signed = (payload as Record<string, unknown>).signedTransactionHex
  return typeof signed === "string" && signed.length > 0 ? signed : null
}

function httpsUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ""
  try {
    const url = new URL(trimmed)
    return url.protocol === "https:" && !url.username && !url.password ? url.toString() : null
  } catch { return null }
}

export default function PostComposer({ parentStakeID = "", compact = false, onDone }: PostComposerProps) {
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const [body, setBody] = useState("")
  const [imageInputs, setImageInputs] = useState([""])
  const [videoInput, setVideoInput] = useState("")
  const [pollOpen, setPollOpen] = useState(false)
  const [sensitiveContent, setSensitiveContent] = useState(false)
  const [pollOptions, setPollOptions] = useState(["", ""])
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [status, setStatus] = useState<"idle" | "preparing" | "awaiting-approval" | "submitting" | "done" | "error">("idle")
  const [message, setMessage] = useState("")
  const [feeNanos, setFeeNanos] = useState<number | null>(null)
  const [imageUploadStatus, setImageUploadStatus] = useState<"idle" | "jwt" | "uploading" | "error">("idle")
  const [imageUploadMessage, setImageUploadMessage] = useState("")
  const [videoUploading, setVideoUploading] = useState(false)
  const [mediaOpen, setMediaOpen] = useState(false)
  const [mediaChoice, setMediaChoice] = useState<"photo" | "video">("photo")
  const [draftMessage, setDraftMessage] = useState("")
  const popupRef = useRef<Window | null>(null)
  const popupWatch = useRef<number | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const isReply = Boolean(parentStakeID)

  useEffect(() => {
    setSession(restoreIdentitySession())
    const onSession = (event: Event) => setSession((event as CustomEvent<ViaIdentitySession | null>).detail ?? restoreIdentitySession())
    window.addEventListener(VIA_IDENTITY_EVENT, onSession)
    return () => window.removeEventListener(VIA_IDENTITY_EVENT, onSession)
  }, [])

  useEffect(() => {
    try {
      const key = isReply ? `${SOCIAL_REPLY_DRAFT_PREFIX}${parentStakeID}` : SOCIAL_DRAFT_STORAGE_KEY
      const stored = window.localStorage.getItem(key)
      if (stored) {
        setBody(stored.slice(0, MAX_POST_LENGTH))
        setDraftMessage(isReply ? "Unsent reply restored on this device." : "Local draft restored from this device.")
      }
    } catch {
      setDraftMessage("Local drafts are unavailable in this browser.")
    }
  }, [isReply, parentStakeID])

  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      const signedTransactionHex = signedTransactionFromMessage(event, popupRef.current)
      if (!signedTransactionHex) return
      if (popupWatch.current !== null) window.clearInterval(popupWatch.current)
      popupWatch.current = null
      popupRef.current?.close()
      popupRef.current = null
      setStatus("submitting")
      setMessage(isReply ? "Posting your approved reply…" : "Posting your approved post…")
      try {
        const response = await fetch("/api/via/social/post", {
          method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store",
          body: JSON.stringify({ action: "submit", signedTransactionHex }),
        })
        const data = await response.json() as SubmitResponse
        if (!response.ok || !data.ok) throw new Error(data.error || "SUBMIT_FAILED")
        setStatus("done")
        setMessage(isReply ? "Reply posted." : "Post published.")
        setBody("")
        setImageInputs([""])
        setVideoInput("")
        setPollOpen(false)
        setSensitiveContent(false)
        setPollOptions(["", ""])
        setEmojiOpen(false)
        setFeeNanos(null)
        setImageUploadStatus("idle")
        setImageUploadMessage("")
        setVideoUploading(false)
        setMediaOpen(false)
        try {
          window.localStorage.removeItem(isReply ? `${SOCIAL_REPLY_DRAFT_PREFIX}${parentStakeID}` : SOCIAL_DRAFT_STORAGE_KEY)
        } catch {}
        setDraftMessage(isReply ? "Reply sent; local safety copy cleared." : "Local draft cleared after publishing.")
        onDone?.()
      } catch {
        setStatus("error")
        setMessage(isReply ? "The reply could not be submitted. Nothing was posted by VIA." : "The post could not be submitted. Nothing was posted by VIA.")
      }
    }
    window.addEventListener("message", onMessage)
    return () => {
      window.removeEventListener("message", onMessage)
      if (popupWatch.current !== null) window.clearInterval(popupWatch.current)
      popupWatch.current = null
      popupRef.current?.close()
      popupRef.current = null
    }
  }, [compact, isReply, onDone])

  const parsedImages = imageInputs.map(httpsUrl)
  const parsedVideo = httpsUrl(videoInput)
  const mediaInvalid = parsedImages.some((value) => value === null) || parsedVideo === null
  const imageUrls = parsedImages.filter((value): value is string => typeof value === "string" && value.length > 0)
  const videoUrls = typeof parsedVideo === "string" && parsedVideo ? [parsedVideo] : []
  const preparedPollOptions = pollOpen ? pollOptions.map((option) => option.trim()).filter(Boolean) : []
  const pollUnique = new Set(preparedPollOptions.map((option) => option.toLocaleLowerCase())).size === preparedPollOptions.length
  const pollValid = !pollOpen || (preparedPollOptions.length >= 2 && preparedPollOptions.length <= MAX_POLL_OPTIONS && pollUnique)
  const hasContent = Boolean(body.trim() || imageUrls.length || videoUrls.length)
  const busy = status === "preparing" || status === "awaiting-approval" || status === "submitting"
  const imageUploading = imageUploadStatus === "jwt" || imageUploadStatus === "uploading"
  const canPrepare = Boolean(session && hasContent && body.length <= MAX_POST_LENGTH && !mediaInvalid && pollValid && !busy && !imageUploading && !videoUploading)
  const remaining = MAX_POST_LENGTH - body.length
  const feeLabel = useMemo(() => feeNanos === null ? null : `${feeNanos.toLocaleString()} nanos network fee in the prepared transaction`, [feeNanos])

  function insertEmoji(emoji: string) {
    if (body.length + emoji.length > MAX_POST_LENGTH) return
    const textarea = textareaRef.current
    const start = textarea?.selectionStart ?? body.length
    const end = textarea?.selectionEnd ?? body.length
    const next = `${body.slice(0, start)}${emoji}${body.slice(end)}`.slice(0, MAX_POST_LENGTH)
    setBody(next)
    setDraftMessage("")
    window.requestAnimationFrame(() => {
      textarea?.focus()
      const cursor = Math.min(start + emoji.length, next.length)
      textarea?.setSelectionRange(cursor, cursor)
    })
  }

  function saveDraft() {
    try {
      const key = isReply ? `${SOCIAL_REPLY_DRAFT_PREFIX}${parentStakeID}` : SOCIAL_DRAFT_STORAGE_KEY
      if (body.trim()) {
        window.localStorage.setItem(key, body.slice(0, MAX_POST_LENGTH))
        setDraftMessage(isReply ? "Reply kept safely on this device until DeSo confirms it." : "Draft saved on this device.")
      } else {
        window.localStorage.removeItem(key)
        setDraftMessage("Empty draft cleared.")
      }
    } catch {
      setDraftMessage("Draft could not be saved locally.")
    }
  }

  function clearDraft() {
    if (isReply) return
    try { window.localStorage.removeItem(SOCIAL_DRAFT_STORAGE_KEY) } catch {}
    setBody("")
    setSensitiveContent(false)
    setDraftMessage("Draft cleared.")
  }

  function changeImage(index: number, value: string) {
    setImageInputs((current) => current.map((item, itemIndex) => itemIndex === index ? value : item))
    if (status === "done" || status === "error") { setStatus("idle"); setMessage("") }
  }

  function addUploadedImage(imageUrl: string) {
    setImageInputs((current) => {
      const next = [...current]
      const emptyIndex = next.findIndex((value) => !value.trim())
      if (emptyIndex >= 0) next[emptyIndex] = imageUrl
      else if (next.length < MAX_IMAGES) next.push(imageUrl)
      return next.slice(0, MAX_IMAGES)
    })
  }

  async function uploadImage(file: File | null) {
    if (!session || !file || imageUrls.length >= MAX_IMAGES || imageUploading) return

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setImageUploadStatus("error")
      setImageUploadMessage("Use GIF, JPEG, PNG or WebP only.")
      return
    }
    if (file.size <= 0 || file.size >= MAX_IMAGE_BYTES) {
      setImageUploadStatus("error")
      setImageUploadMessage("Image must be smaller than 10 MB.")
      return
    }

    try {
      setImageUploadStatus("jwt")
      setImageUploadMessage("Preparing image upload approval…")
      const jwt = await requestIdentityJwt(session.publicKey)

      setImageUploadStatus("uploading")
      setImageUploadMessage("Uploading image…")
      const form = new FormData()
      form.set("publicKey", session.publicKey)
      form.set("jwt", jwt)
      form.set("file", file, file.name)

      const response = await fetch("/api/via/social/image-upload", { method: "POST", body: form, cache: "no-store" })
      const data = await response.json() as UploadResponse
      if (!response.ok || !data.ok || !data.imageUrl) throw new Error(data.error || "IMAGE_UPLOAD_FAILED")

      addUploadedImage(data.imageUrl)
      setImageUploadStatus("idle")
      setImageUploadMessage("Image attached. Your post has not been published yet.")
    } catch (error) {
      setImageUploadStatus("error")
      const code = error instanceof Error ? error.message : "IMAGE_UPLOAD_FAILED"
      setImageUploadMessage(code === "IDENTITY_REAUTHORIZE_REQUIRED"
        ? "Image upload approval expired. Reconnect and try again."
        : "The image was not attached. No post was published.")
    }
  }

  async function preparePost() {
    if (!session || !canPrepare) return
    if (isReply) saveDraft()
    setStatus("preparing")
    setMessage(isReply ? "Preparing your reply…" : "Preparing your post…")
    setFeeNanos(null)
    try {
      const response = await fetch("/api/via/social/post", {
        method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store",
        body: JSON.stringify({ action: "prepare", publicKey: session.publicKey, body, parentStakeID, imageUrls, videoUrls, pollOptions: preparedPollOptions, sensitiveContent: !isReply && sensitiveContent }),
      })
      const data = await response.json() as PrepareResponse
      if (!response.ok || !data.ok || !data.transactionHex) throw new Error(data.error || "PREPARE_FAILED")
      setFeeNanos(typeof data.feeNanos === "number" ? data.feeNanos : null)
      const approveUrl = `${DESO_IDENTITY_ORIGIN}/approve?tx=${encodeURIComponent(data.transactionHex)}`
      const width = Math.min(800, window.screen.availWidth)
      const height = Math.min(900, window.screen.availHeight)
      const popup = window.open(approveUrl, "via-deso-approve", `popup=yes,width=${Math.round(width)},height=${Math.round(height)}`)
      if (!popup) {
        setStatus("error")
        setMessage("Approval window was blocked. Nothing was posted. Allow the popup and try again.")
        return
      }
      popupRef.current = popup
      if (popupWatch.current !== null) window.clearInterval(popupWatch.current)
      popupWatch.current = window.setInterval(() => {
        if (popupRef.current?.closed) {
          popupRef.current = null
          if (popupWatch.current !== null) window.clearInterval(popupWatch.current)
          popupWatch.current = null
          setStatus("idle")
          setMessage(isReply ? "Approval closed. Your reply was not posted." : "Approval closed. Your post was not published.")
        }
      }, 500)
      setStatus("awaiting-approval")
      setMessage("Review the exact text, media and poll post in DeSo Identity. VIA will not submit it without that approval.")
    } catch (error) {
      setStatus("error")
      const code = error instanceof Error ? error.message : "PREPARE_FAILED"
      setMessage(`The post could not be prepared (${code}). Nothing was posted.`)
    }
  }

  if (!session) return <div className={`${compact ? "mt-3" : "mt-4"} rounded-xl border border-zinc-800 bg-black/30 p-4 text-sm text-zinc-500`}>Sign in before {isReply ? "replying" : "creating a post"}.</div>

  return (
    <div className={`${compact ? "mt-3" : "mt-2"} bg-transparent p-0`}>
      <label htmlFor={isReply ? `via-reply-${parentStakeID}` : "via-post-body"} className="sr-only">{isReply ? "Reply" : "Post"}</label>
      <div className="relative mt-2">
        <textarea ref={textareaRef} id={isReply ? `via-reply-${parentStakeID}` : "via-post-body"} value={body} onChange={(event) => { setBody(event.target.value); setDraftMessage(""); if (status === "done" || status === "error") { setStatus("idle"); setMessage("") } }} maxLength={MAX_POST_LENGTH} rows={compact ? 3 : 5} placeholder={isReply ? "Write a reply…" : "What do you want to share?"} className="min-h-[8rem] w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 pb-7 text-sm text-zinc-100 outline-none transition-[min-height] focus:min-h-[16rem] focus:border-[#8fd4a9]/55 sm:min-h-0 sm:focus:min-h-0" />
        {!isReply && body.length < 4900 ? <span aria-hidden="true" className="pointer-events-none absolute bottom-2 right-3 text-[10px] text-zinc-700">max. 5000 tekens</span> : null}
        {body.length >= 4900 ? <span className="pointer-events-none absolute bottom-2 right-3 text-[10px] text-zinc-500" aria-live="polite">{body.length.toLocaleString()} / {MAX_POST_LENGTH.toLocaleString()}</span> : null}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <button type="button" onClick={() => setEmojiOpen((open) => !open)} disabled={busy} className="min-h-10 rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:border-[#8fd4a9]/45 hover:text-[#9adbb2] disabled:opacity-50">Emoji</button>
        {!isReply ? <button type="button" onClick={() => setMediaOpen((open) => !open)} disabled={busy} className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:border-[#8fd4a9]/45 hover:text-[#9adbb2] disabled:opacity-50"><span onClick={(event) => { event.stopPropagation(); setMediaChoice("photo"); setMediaOpen(true) }}>Photo</span><span className="mx-2 text-zinc-700">|</span><span onClick={(event) => { event.stopPropagation(); setMediaChoice("video"); setMediaOpen(true) }}>Video</span></button> : null}
        {!isReply ? <>
          <button type="button" onClick={saveDraft} disabled={busy} className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:border-[#8fd4a9]/45 hover:text-[#9adbb2] disabled:opacity-50">Save</button>
          <button type="button" onClick={() => { setPollOpen((open) => !open); if (pollOpen) setPollOptions(["", ""]) }} disabled={busy} className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:border-[#8fd4a9]/45 hover:text-[#9adbb2] disabled:opacity-50">{pollOpen ? "Remove poll" : "Poll"}</button>

          <button type="button" onClick={preparePost} disabled={!canPrepare} className="rounded-lg border border-[#8fd4a9]/55 px-3 py-1.5 text-xs font-semibold text-[#9adbb2] disabled:cursor-not-allowed disabled:border-zinc-800 disabled:text-zinc-600">{status === "preparing" ? "Preparing…" : status === "awaiting-approval" ? "Awaiting approval…" : status === "submitting" ? "Sending…" : "Send"}</button>
        </> : null}
      </div>

      {emojiOpen ? <div className="mt-2 flex flex-wrap gap-1 rounded-xl border border-zinc-800 bg-zinc-950/70 p-2" aria-label="Insert emoji">
        {COMPOSER_EMOJI.map((emoji) => <button key={emoji} type="button" onClick={() => insertEmoji(emoji)} disabled={busy || body.length + emoji.length > MAX_POST_LENGTH} className="rounded-lg px-2 py-1 text-lg hover:bg-white/[0.06] disabled:opacity-40" aria-label={`Insert ${emoji}`}>{emoji}</button>)}
      </div> : null}
      {!isReply && draftMessage ? <p className="mt-2 text-xs text-zinc-500" role="status" aria-live="polite">{draftMessage}</p> : null}

      {!isReply && pollOpen ? <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
        <p className="text-sm font-medium text-zinc-200">Poll options</p>
        <p className="mt-1 text-xs text-zinc-500">Add 2–5 unique choices.</p>
        <div className="mt-3 space-y-2">
          {pollOptions.map((option, index) => <div key={index} className="flex gap-2">
            <input value={option} maxLength={MAX_POLL_OPTION_LENGTH} onChange={(event) => setPollOptions((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} placeholder={`Option ${index + 1}`} className="min-w-0 flex-1 rounded-lg border border-zinc-800 bg-black/40 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-[#8fd4a9]/55" />
            {pollOptions.length > 2 ? <button type="button" onClick={() => setPollOptions((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="rounded-lg border border-zinc-800 px-3 text-xs text-zinc-500 hover:text-zinc-300">Remove</button> : null}
          </div>)}
        </div>
        {pollOptions.length < MAX_POLL_OPTIONS ? <button type="button" onClick={() => setPollOptions((current) => [...current, ""])} className="mt-2 text-xs text-[#9adbb2]">+ Add option</button> : null}
        {!pollValid ? <p className="mt-2 text-xs text-amber-300">Use at least two different, non-empty poll options.</p> : null}
      </div> : null}

      {!isReply ? <label className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-zinc-600"><input type="checkbox" checked={sensitiveContent} onChange={(event)=>setSensitiveContent(event.target.checked)} className="h-3.5 w-3.5 accent-[#8fd4a9]" /><span>Sensitive content</span></label> : null}

      {isReply ? <button type="button" onClick={() => setMediaOpen((open) => !open)} className="mt-3 rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:border-[#8fd4a9]/45 hover:text-[#9adbb2]">{mediaOpen ? "Hide photo/video" : "Photo / Video"}</button> : null}

      {mediaOpen ? <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
        {mediaChoice === "photo" ? <>
        <p className="text-sm font-medium text-zinc-200">Images</p>
        <p className="mt-1 text-xs leading-5 text-zinc-500">Choose up to four images.</p>

        {imageUrls.length < MAX_IMAGES ? <label className="mt-3 inline-flex cursor-pointer items-center rounded-lg border border-[#285f40] px-3 py-2 text-xs font-semibold text-[#9adbb2]">
          {imageUploading ? "Uploading…" : "Choose image"}
          <input type="file" accept="image/gif,image/jpeg,image/png,image/webp" className="sr-only" disabled={imageUploading} onChange={(event) => { const file = event.target.files?.[0] ?? null; event.currentTarget.value = ""; void uploadImage(file) }} />
        </label> : null}
        <p className="mt-2 text-xs text-zinc-600">Up to {MAX_IMAGES} images · maximum 10 MB each.</p>
        {imageUploadMessage ? <p className={`mt-2 text-xs ${imageUploadStatus === "error" ? "text-amber-300" : "text-zinc-400"}`}>{imageUploadMessage}</p> : null}

        </>
        : <div>
          <p className="text-sm font-medium text-zinc-200">Video</p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">Choose one video.</p>
          <VideoUploadControl onReady={setVideoInput} onBusyChange={setVideoUploading} />
          <p className="mt-1 text-xs text-zinc-600">Your video is attached here. You approve the post before it is published.</p>
        </div>}
        {mediaInvalid ? <p className="mt-2 text-xs text-amber-300">One of the attached media items is not valid.</p> : null}
      </div> : null}

      {isReply ? <div className="mt-4 flex justify-end">
        <button type="button" onClick={preparePost} disabled={!canPrepare} className="rounded-xl border border-[#8fd4a9]/55 px-4 py-2 text-sm font-semibold text-[#9adbb2] disabled:cursor-not-allowed disabled:border-zinc-800 disabled:text-zinc-600">{status === "preparing" ? "Preparing…" : status === "awaiting-approval" ? "Awaiting approval…" : status === "submitting" ? "Posting…" : "Reply"}</button>
      </div> : null}
      {message ? <p className={`mt-3 text-sm ${status === "done" ? "text-[#9adbb2]" : status === "error" ? "text-amber-300" : "text-zinc-400"}`}>{message}</p> : null}
    </div>
  )
}
