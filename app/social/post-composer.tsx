"use client"
import {uploadNativeImage} from "./native-image"
import {publishNativePost} from "./native-post"

import { useEffect, useMemo, useRef, useState } from "react"
import { viaModernIdentity, type ViaModernIdentityUser } from "../deso-identity-modern"
import VideoUploadControl from "./video-upload-control"
import SponsorPlatform from "../sponsor-platform"



// DeSo backend MaxRequestBodySizeBytes (decimal MB).
const MAX_IMAGE_BYTES = 10_000_000


const SOCIAL_DRAFT_STORAGE_KEY = "via:social:draft:v1"
const SOCIAL_REPLY_DRAFT_PREFIX = "via:social:reply-draft:v1:"
const COMPOSER_EMOJI = ["😀", "😄", "😂", "😍", "😎", "🤔", "👏", "👍", "❤️", "🔥", "🎉", "🚀", "🌍", "🎨", "🎵", "✨"] as const
const ALLOWED_IMAGE_TYPES = new Set(["image/gif", "image/jpeg", "image/png", "image/webp"])
const POST_REQUEST_TIMEOUT_MS = 20_000
const DESO_NODE = "https://node.deso.org"

async function fetchJsonWithTimeout<T>(input: RequestInfo | URL, init: RequestInit = {}) {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), POST_REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(input, { ...init, signal: controller.signal })
    const data = await response.json() as T
    return { response, data }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`DeSo request timed out after ${POST_REQUEST_TIMEOUT_MS / 1000}s`)
    }
    if (error instanceof Error) {
      throw new Error(`DeSo browser request failed: ${error.name}: ${error.message}`)
    }
    throw new Error("DeSo browser request failed")
  } finally {
    window.clearTimeout(timeout)
  }
}

type PrepareResponse = { ok?: boolean; transactionHex?: string; feeNanos?: number | null; error?: string }
type SubmitResponse = { ok?: boolean; postHashHex?: string | null; transaction?: Record<string, unknown>; error?: string }
type UploadResponse = { ok?: boolean; imageUrl?: string; error?: string }
type PostComposerProps = { parentStakeID?: string; compact?: boolean; onDone?: () => void; onCancel?: () => void }

function httpsUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ""
  try {
    const url = new URL(trimmed)
    return url.protocol === "https:" && !url.username && !url.password ? url.toString() : null
  } catch { return null }
}

export default function PostComposer({ parentStakeID = "", compact = false, onDone, onCancel }: PostComposerProps) {
  const [session, setSession] = useState<ViaModernIdentityUser | null | undefined>(undefined)
  const [body, setBody] = useState("")
  const [imageInputs, setImageInputs] = useState([""])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [videoInput, setVideoInput] = useState("")
  const [attachedVideos, setAttachedVideos] = useState<string[]>([])
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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const publishingRef = useRef(false)
  const uploadingImageRef = useRef(false)
  const isReply = Boolean(parentStakeID)

  useEffect(() => {
    void viaModernIdentity.currentUser().then(setSession)
    return viaModernIdentity.subscribe(setSession)
  }, [])

  useEffect(() => {
    try {
      const key = isReply ? `${SOCIAL_REPLY_DRAFT_PREFIX}${parentStakeID}` : SOCIAL_DRAFT_STORAGE_KEY
      const stored = window.localStorage.getItem(key)
      if (stored) {
        setBody(stored)
        setDraftMessage(isReply ? "Unsent reply restored on this device." : "Local draft restored from this device.")
      }
    } catch {
      setDraftMessage("Local drafts are unavailable in this browser.")
    }
  }, [isReply, parentStakeID])

  const parsedImages = imageInputs.map(httpsUrl)
  const parsedVideo = httpsUrl(videoInput)
  const mediaInvalid = parsedImages.some((value) => value === null) || parsedVideo === null
  const imageUrls = parsedImages.filter((value): value is string => typeof value === "string" && value.length > 0)
  const videoUrls = [...new Set([...attachedVideos, ...(typeof parsedVideo === "string" && parsedVideo ? [parsedVideo] : [])])]
  const preparedPollOptions = pollOpen ? pollOptions.map((option) => option.trim()).filter(Boolean) : []
  const pollUnique = new Set(preparedPollOptions.map((option) => option.toLocaleLowerCase())).size === preparedPollOptions.length
  const pollValid = !pollOpen || (preparedPollOptions.length >= 2 && preparedPollOptions.every(option => new TextEncoder().encode(option).length <= 256 && !option.includes(String.fromCharCode(0))) && pollUnique)
  const hasContent = Boolean(body.trim() || imageUrls.length || videoUrls.length)
  const busy = status === "preparing" || status === "awaiting-approval" || status === "submitting"
  const imageUploading = imageUploadStatus === "jwt" || imageUploadStatus === "uploading"
  const canPrepare = Boolean(session && hasContent && !mediaInvalid && pollValid && !busy && !imageUploading && !videoUploading)
  const sendBlockedReason = canPrepare ? "" : !session ? "DeSo session unavailable." : !hasContent ? "Add text, a photo or video." : mediaInvalid ? "One media link is invalid." : !pollValid ? "Complete or remove the poll." : imageUploading ? "Photo upload is still running." : videoUploading ? "Video upload is still running." : busy ? "Publishing is already in progress." : "Send is waiting for valid post content."

  const feeLabel = useMemo(() => feeNanos === null ? null : `${feeNanos.toLocaleString()} nanos network fee in the prepared transaction`, [feeNanos])

  function insertEmoji(emoji: string) {

    const textarea = textareaRef.current
    const start = textarea?.selectionStart ?? body.length
    const end = textarea?.selectionEnd ?? body.length
    const next = `${body.slice(0, start)}${emoji}${body.slice(end)}`
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
        window.localStorage.setItem(key, body)
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
    setImageInputs([""])
    setVideoInput(""); setAttachedVideos([])
    setPollOpen(false)
    setPollOptions(["", ""])
    setSensitiveContent(false)
    setEmojiOpen(false)
    setMediaOpen(false)
    setImageUploadStatus("idle")
    setImageUploadMessage("")
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
      else next.push(imageUrl)
      return next
    })
  }

  function removeUploadedImage(index: number) {
    setImageInputs((current) => {
      const attached = current.filter((value) => value.trim())
      attached.splice(index, 1)
      return attached.length ? [...attached, ""] : [""]
    })
    if (!uploadingImageRef.current) {
      setImageUploadStatus("idle")
      setImageUploadMessage("")
    }
  }

  async function uploadImage(file: File | null) {
    if (!session || !file || uploadingImageRef.current || publishingRef.current) return

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setImageUploadStatus("error")
      setImageUploadMessage("Choose a GIF, JPEG, PNG or WebP image.")
      return
    }
    if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
      setImageUploadStatus("error")
      setImageUploadMessage("DeSo accepts images up to 10 MB.")
      return
    }

    const previewUrl = URL.createObjectURL(file)
    uploadingImageRef.current = true
    setImagePreviews([previewUrl])

    try {
      setImageUploadStatus("jwt")
      setImageUploadMessage("Preparing image upload approval…")
      const data=await uploadNativeImage(session.publicKey,file)
      const userAfterUpload = await viaModernIdentity.currentUser()
      if (userAfterUpload?.publicKey !== session.publicKey) throw new Error("DESO_ACCOUNT_CHANGED_RECONNECT")

      addUploadedImage(data.imageUrl)
      setMediaOpen(false)
      setImageUploadStatus("idle")
      setImageUploadMessage("Image attached. Your post has not been published yet.")
    } catch (error) {
      setImageUploadStatus("error")
      const code = error instanceof Error ? error.message : "IMAGE_UPLOAD_FAILED"
      setImageUploadMessage(code === "IDENTITY_REAUTHORIZE_REQUIRED"
        ? "Image upload approval expired. Reconnect and try again."
        : code === "DESO_ACCOUNT_CHANGED_RECONNECT"
        ? "DeSo account changed. Select your account and attach the photo again."
        : "The image was not attached. No post was published.")
    } finally {
      URL.revokeObjectURL(previewUrl)
      setImagePreviews([])
      uploadingImageRef.current = false
    }
  }

  async function preparePost() {
    if (!session || !canPrepare || publishingRef.current || uploadingImageRef.current) return
    publishingRef.current = true
    setStatus("preparing")
    setMessage(isReply ? "Preparing your reply…" : "Preparing your post…")
    setFeeNanos(null)
    let submissionStarted = false
    try {
      if (isReply) saveDraft()
      setStatus("submitting")
      submissionStarted = true
      const submitted=await publishNativePost(session.publicKey,body,imageUrls,videoUrls,parentStakeID,preparedPollOptions,!isReply&&sensitiveContent)
      setStatus("done")
      setMessage(isReply ? "Reply posted." : "Post published.")
      setBody("")
      setImageInputs([""])
      setVideoInput(""); setAttachedVideos([])
      setPollOpen(false)
      setSensitiveContent(false)
      setPollOptions(["", ""])
      setEmojiOpen(false)
      setFeeNanos(null)
      setImageUploadStatus("idle")
      setImageUploadMessage("")
      setVideoUploading(false)
      setMediaOpen(false)
      try { window.localStorage.removeItem(isReply ? `${SOCIAL_REPLY_DRAFT_PREFIX}${parentStakeID}` : SOCIAL_DRAFT_STORAGE_KEY) } catch {}
      setDraftMessage(isReply ? "Reply sent; local safety copy cleared." : "Local draft cleared after publishing.")
      window.dispatchEvent(new CustomEvent("via:social:post-published", {
        detail: !isReply && submitted.postHashHex ? { hash: submitted.postHashHex, publicKey: session.publicKey, text: body.trim() } : undefined,
      }))
      onDone?.()
    } catch (error) {
      setStatus("error")
      const code = error instanceof Error ? error.message : "PREPARE_FAILED"
      setMessage(submissionStarted
        ? `${isReply ? "Reply" : "Post"} not confirmed (${code}). Check DeSo before retrying; do not send twice.`
        : code === "DESO_ACCOUNT_CHANGED_RECONNECT"
        ? "DeSo account changed. Select your account and review your draft before sending. Nothing was submitted."
        : `${isReply ? "The reply" : "The post"} could not be published (${code}). Nothing was submitted.`)
    } finally {
      publishingRef.current = false
    }
  }


  return (
    <div className={`${compact ? "mt-3" : ""} bg-transparent p-0`}>
      <label htmlFor={isReply ? `via-reply-${parentStakeID}` : "via-post-body"} className="sr-only">{isReply ? "Reply" : "Post"}</label>
      {session === null ? <p className="mb-2 text-sm text-zinc-500">DeSo login is required to publish. You can prepare your post first.</p> : null}
      <div className="relative">
        <textarea ref={textareaRef} id={isReply ? `via-reply-${parentStakeID}` : "via-post-body"} value={body} onChange={(event) => { setBody(event.target.value); setDraftMessage(""); if (status === "done" || status === "error") { setStatus("idle"); setMessage("") } }} rows={isReply ? 3 : 2} placeholder={isReply ? "Write a reply…" : "What do you want to share?"} className={`block min-h-16 w-full resize-y border border-zinc-800 bg-zinc-950 px-3 pb-5 pt-2 text-base text-zinc-100 outline-none focus:border-[#8fd4a9]/55 ${imagePreviews.length || imageUrls.length ? "rounded-t-xl rounded-b-none border-b-0" : "rounded-xl"}`} />
        {imagePreviews.length || imageUrls.length ? <div className="flex flex-wrap gap-2 rounded-b-xl border-x border-b border-zinc-800 bg-zinc-950 px-3 pb-3">{imagePreviews.map((url, index) => <div key={`local-${url}`} className="relative h-28 w-28 overflow-hidden rounded-lg border border-zinc-800 bg-black"><img src={url} alt={`Selected image ${index + 1}`} className="h-full w-full object-cover" /></div>)}{imageUrls.map((url, index) => <div key={`attached-${url}`} className="relative h-28 w-28 overflow-hidden rounded-lg border border-zinc-800 bg-black"><img src={url} alt={`Attached image ${index + 1}`} className="h-full w-full object-cover" /><button type="button" onClick={() => removeUploadedImage(index)} aria-label={`Remove attached image ${index + 1}`} className="absolute right-1 top-1 rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] text-zinc-200">×</button></div>)}</div> : null}
      </div>

      {!isReply && pollOpen ? <div data-via-poll-options className="mt-2 scroll-mt-32 rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
        <p className="text-sm font-medium text-zinc-200">Poll options</p>
        <p className="mt-1 hidden text-xs text-zinc-500 sm:block">Add 2–5 unique choices.</p>
        <div className="mt-3 space-y-2">
          {pollOptions.map((option, index) => <div key={index} className="flex gap-2">
            <input value={option} onChange={(event) => setPollOptions((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} placeholder={`Option ${index + 1}`} className="min-w-0 flex-1 rounded-lg border border-zinc-800 bg-black/40 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-[#8fd4a9]/55" />
            {pollOptions.length > 2 ? <button type="button" onClick={() => setPollOptions((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="rounded-lg border border-zinc-800 px-3 text-xs text-zinc-500 hover:text-zinc-300">Remove</button> : null}
          </div>)}
        </div>
        {<button type="button" onClick={() => setPollOptions((current) => [...current, ""])} className="mt-2 text-xs text-[#9adbb2]">+ Add option</button>}
        {!pollValid ? <p className="mt-2 text-xs text-amber-300">Use at least two different, non-empty options, each within the DeSo limit of 256 bytes and without null characters.</p> : null}
      </div> : null}

      {isReply ? <div className="mt-4 flex justify-end gap-2">
        {onCancel ? <button type="button" onClick={onCancel} disabled={busy} className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 disabled:opacity-60">Sluiten</button> : null}
        <button type="button" onClick={preparePost} disabled={!canPrepare} className="rounded-xl border border-[#8fd4a9]/55 px-4 py-2 text-sm font-semibold text-[#9adbb2] disabled:cursor-not-allowed disabled:border-zinc-800 disabled:text-zinc-600">{status === "preparing" ? "Preparing…" : status === "awaiting-approval" ? "Awaiting approval…" : status === "submitting" ? "Posting…" : "Reply"}</button>
      </div> : null}

      <div className="mt-3 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <button type="button" onClick={() => setEmojiOpen((open) => !open)} disabled={busy} className="min-h-10 rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:border-[#8fd4a9]/45 hover:text-[#9adbb2] disabled:opacity-50">Emoji</button>
        {!isReply ? <><label className="flex min-h-10 cursor-pointer items-center justify-center rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:border-[#8fd4a9]/45 hover:text-[#9adbb2]"><span>{imageUploading ? "Uploading…" : "Photo"}</span><input type="file" accept="image/*" className="sr-only" disabled={busy || imageUploading} onChange={(event) => { const file = event.target.files?.[0] ?? null; event.currentTarget.value = ""; void uploadImage(file) }} /></label><button type="button" onClick={() => { setMediaChoice("video"); setMediaOpen(true) }} disabled={busy} className="min-h-10 rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:border-[#8fd4a9]/45 hover:text-[#9adbb2] disabled:opacity-50">Video</button></> : null}
        {!isReply ? <>
          <button type="button" onClick={saveDraft} disabled={busy} className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:border-[#8fd4a9]/45 hover:text-[#9adbb2] disabled:opacity-50">Save</button>
          <button type="button" onClick={() => { setPollOpen((open) => !open); if (pollOpen) setPollOptions(["", ""]); else requestAnimationFrame(() => { const panel = document.querySelector<HTMLElement>("[data-via-poll-options]"); panel?.scrollIntoView({ behavior: "smooth", block: "center" }); panel?.querySelector("input")?.focus({ preventScroll: true }) }) }} disabled={busy} className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:border-[#8fd4a9]/45 hover:text-[#9adbb2] disabled:opacity-50">{pollOpen ? "Remove poll" : "Poll"}</button>

          <button type="button" onClick={preparePost} disabled={!canPrepare} className="rounded-lg border border-[#8fd4a9]/55 px-3 py-1.5 text-xs font-semibold text-[#9adbb2] disabled:cursor-not-allowed disabled:border-zinc-800 disabled:text-zinc-600">{imageUploading ? "Uploading…" : videoUploading ? "Uploading…" : status === "preparing" ? "Preparing…" : status === "awaiting-approval" ? "Awaiting approval…" : status === "submitting" ? "Sending…" : "Send"}</button>
        </> : null}
      </div>
      {!isReply && !canPrepare && hasContent ? <p className="mt-2 text-[11px] text-amber-300" role="status" aria-live="polite">Send unavailable: {sendBlockedReason}</p> : null}

      {emojiOpen ? <div className="mt-2 flex flex-wrap gap-1 rounded-xl border border-zinc-800 bg-zinc-950/70 p-2" aria-label="Insert emoji">
        {COMPOSER_EMOJI.map((emoji) => <button key={emoji} type="button" onClick={() => insertEmoji(emoji)} disabled={busy} className="rounded-lg px-2 py-1 text-lg hover:bg-white/[0.06] disabled:opacity-40" aria-label={`Insert ${emoji}`}>{emoji}</button>)}
      </div> : null}
      {!isReply && draftMessage ? <p className="mt-2 text-xs text-zinc-500" role="status" aria-live="polite">{draftMessage}</p> : null}



      {!isReply ? <label className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-zinc-600"><input type="checkbox" checked={sensitiveContent} onChange={(event)=>setSensitiveContent(event.target.checked)} className="h-3.5 w-3.5 accent-[#8fd4a9]" /><span>Sensitive content</span></label> : null}

      {isReply ? <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => { setMediaChoice("photo"); setMediaOpen(true) }} disabled={busy || imageUploading} className="min-h-10 rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:border-[#8fd4a9]/45 hover:text-[#9adbb2] disabled:opacity-50">{imageUploading ? "Uploading…" : "Photo"}</button>
        <button type="button" onClick={() => { setMediaChoice("video"); setMediaOpen(true) }} disabled={busy} className="min-h-10 rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:border-[#8fd4a9]/45 hover:text-[#9adbb2] disabled:opacity-50">Video</button>
      </div> : null}

      {imageUploadMessage ? <p role="status" className={`mt-2 text-xs ${imageUploadStatus === "error" ? "text-amber-300" : "text-zinc-400"}`}>{imageUploadMessage}</p> : null}

      {mediaOpen && (isReply || mediaChoice === "video") ? <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/70 p-3"><div className="flex justify-end"><button type="button" onClick={() => setMediaOpen(false)} className="text-xs text-zinc-500 hover:text-zinc-300">Sluiten</button></div>
        {mediaChoice === "photo" ? <>
        <p className="text-sm font-medium text-zinc-200">Images</p>
        <p className="mt-1 hidden text-xs leading-5 text-zinc-500 sm:block">Choose images.</p>

        {<label className="mt-3 inline-flex cursor-pointer items-center rounded-lg border border-[#285f40] px-3 py-2 text-xs font-semibold text-[#9adbb2]">
          {imageUploading ? "Uploading…" : "Choose image"}
          <input type="file" accept="image/*" className="sr-only" disabled={imageUploading} onChange={(event) => { const file = event.target.files?.[0] ?? null; event.currentTarget.value = ""; void uploadImage(file) }} />
        </label>}
        <p className="mt-2 text-xs text-zinc-600">Maximum 10 MB per image.</p>

        </>
        : <div>
          <p className="text-sm font-medium text-zinc-200">Video</p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">Choose videos.</p>
          <VideoUploadControl onReady={(url) => setAttachedVideos(current => [...new Set([...current, url])])} onBusyChange={setVideoUploading} />
            {attachedVideos.map((url, index) => <div key={url} className="mt-2 flex items-center justify-between text-xs"><span>Video {index + 1}</span><button type="button" disabled={busy} onClick={() => setAttachedVideos(current => current.filter(item => item !== url))}>Remove</button></div>)}
            <button type="button" disabled={busy || videoUploading || !parsedVideo} onClick={() => { if (parsedVideo) { setAttachedVideos(current => [...new Set([...current, parsedVideo])]); setVideoInput("") } }}>Add video link</button>
          <div className="mt-3">
            <label htmlFor={isReply ? `via-reply-youtube-${parentStakeID}` : "via-post-youtube"} className="text-xs text-zinc-400">Or paste a YouTube link</label>
            <input id={isReply ? `via-reply-youtube-${parentStakeID}` : "via-post-youtube"} type="url" inputMode="url" value={videoUploading ? "" : videoInput} onChange={(event) => setVideoInput(event.target.value)} disabled={videoUploading} placeholder="https://www.youtube.com/watch?v=…" className="mt-2 w-full rounded-lg border border-zinc-800 bg-black/40 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-[#8fd4a9]/55 disabled:opacity-50" />
          </div>
          <p className="mt-1 text-xs text-zinc-600">Video uploads are handled by DeSo. External YouTube links are not uploaded by VIA.</p>
        </div>}
        {mediaInvalid ? <p className="mt-2 text-xs text-amber-300">One of the attached media items is not valid.</p> : null}
      </div> : null}


      {message ? <p data-via-dynamic-text className={`mt-3 text-sm ${status === "done" ? "text-[#9adbb2]" : status === "error" ? "text-amber-300" : "text-zinc-400"}`}>{message}</p> : null}
    </div>
  )
}
