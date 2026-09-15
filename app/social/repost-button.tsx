"use client"

import { useEffect, useRef, useState } from "react"
import { DESO_IDENTITY_ORIGIN, restoreIdentitySession, VIA_IDENTITY_EVENT, type ViaIdentitySession } from "../deso-identity-session"
import { requestIdentityJwt } from "./identity-jwt"
import VideoUploadControl from "./video-upload-control"

const MAX_QUOTE_LENGTH = 5000
const MAX_IMAGES = 4
const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const QUOTE_EMOJI = ["😀", "😄", "😂", "😍", "😎", "🤔", "👏", "👍", "❤️", "🔥", "🎉", "🚀", "🌍", "🎨", "🎵", "✨"] as const
const ALLOWED_IMAGE_TYPES = new Set(["image/gif", "image/jpeg", "image/png", "image/webp"])

type Props = {
  postHash: string
  initialCount: number
}

type PrepareResponse = { ok?: boolean; transactionHex?: string; feeNanos?: number | null; error?: string }
type SubmitResponse = { ok?: boolean; error?: string }
type UploadResponse = { ok?: boolean; imageUrl?: string; error?: string }

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

export default function RepostButton({ postHash, initialCount }: Props) {
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const [count, setCount] = useState(initialCount)
  const [busy, setBusy] = useState(false)
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [quote, setQuote] = useState("")
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [imageInputs, setImageInputs] = useState([""])
  const [videoInput, setVideoInput] = useState("")
  const [imageUploadStatus, setImageUploadStatus] = useState<"idle" | "jwt" | "uploading" | "error">("idle")
  const [imageUploadMessage, setImageUploadMessage] = useState("")
  const [videoUploading, setVideoUploading] = useState(false)
  const [message, setMessage] = useState("")
  const popupRef = useRef<Window | null>(null)
  const popupWatch = useRef<number | null>(null)
  const pendingQuote = useRef(false)
  const quoteRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    setSession(restoreIdentitySession())
    const onIdentity = (event: Event) => {
      const custom = event as CustomEvent<ViaIdentitySession | null>
      setSession(custom.detail ?? restoreIdentitySession())
    }
    window.addEventListener(VIA_IDENTITY_EVENT, onIdentity)
    return () => window.removeEventListener(VIA_IDENTITY_EVENT, onIdentity)
  }, [])

  useEffect(() => setCount(initialCount), [initialCount])

  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      const signedTransactionHex = signedTransactionFromMessage(event, popupRef.current)
      if (!signedTransactionHex) return
      if (popupWatch.current !== null) window.clearInterval(popupWatch.current)
      popupWatch.current = null
      popupRef.current?.close()
      popupRef.current = null
      try {
        const response = await fetch("/api/via/social/repost", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ action: "submit", signedTransactionHex }),
        })
        const data = await response.json() as SubmitResponse
        if (!response.ok || !data.ok) throw new Error(data.error || "SUBMIT_FAILED")
        setCount((current) => current + 1)
        setMessage(pendingQuote.current ? "Quote Repost submitted to DeSo." : "Reposted on DeSo.")
        setQuote("")
        setEmojiOpen(false)
        setImageInputs([""])
        setVideoInput("")
        setImageUploadStatus("idle")
        setImageUploadMessage("")
        setVideoUploading(false)
        setQuoteOpen(false)
      } catch {
        setMessage("Repost transaction failed. Nothing was changed by VIA.")
      } finally {
        setBusy(false)
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
  }, [])

  const parsedImages = imageInputs.map(httpsUrl)
  const parsedVideo = httpsUrl(videoInput)
  const mediaInvalid = parsedImages.some((value) => value === null) || parsedVideo === null
  const imageUrls = parsedImages.filter((value): value is string => typeof value === "string" && value.length > 0)
  const videoUrls = typeof parsedVideo === "string" && parsedVideo ? [parsedVideo] : []
  const imageUploading = imageUploadStatus === "jwt" || imageUploadStatus === "uploading"

  function insertEmoji(emoji: string) {
    if (quote.length + emoji.length > MAX_QUOTE_LENGTH) return
    const textarea = quoteRef.current
    const start = textarea?.selectionStart ?? quote.length
    const end = textarea?.selectionEnd ?? quote.length
    const next = `${quote.slice(0, start)}${emoji}${quote.slice(end)}`.slice(0, MAX_QUOTE_LENGTH)
    setQuote(next)
    window.requestAnimationFrame(() => {
      textarea?.focus()
      const cursor = Math.min(start + emoji.length, next.length)
      textarea?.setSelectionRange(cursor, cursor)
    })
  }

  function changeImage(index: number, value: string) {
    setImageInputs((current) => current.map((item, itemIndex) => itemIndex === index ? value : item))
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
      setImageUploadMessage("Authorizing this image upload with DeSo Identity…")
      const jwt = await requestIdentityJwt(session.publicKey)
      setImageUploadStatus("uploading")
      setImageUploadMessage("Uploading image to the DeSo media endpoint…")
      const form = new FormData()
      form.set("publicKey", session.publicKey)
      form.set("jwt", jwt)
      form.set("file", file, file.name)
      const response = await fetch("/api/via/social/image-upload", { method: "POST", body: form, cache: "no-store" })
      const data = await response.json() as UploadResponse
      if (!response.ok || !data.ok || !data.imageUrl) throw new Error(data.error || "IMAGE_UPLOAD_FAILED")
      addUploadedImage(data.imageUrl)
      setImageUploadStatus("idle")
      setImageUploadMessage("Image uploaded to DeSo and attached to this quote draft.")
    } catch (error) {
      setImageUploadStatus("error")
      const code = error instanceof Error ? error.message : "IMAGE_UPLOAD_FAILED"
      setImageUploadMessage(code === "IDENTITY_REAUTHORIZE_REQUIRED"
        ? "DeSo Identity needs renewed authorization before this upload. Reconnect and try again."
        : "The image was not attached. Nothing was published.")
    }
  }

  async function prepareRepost(asQuote: boolean) {
    if (!session || busy) return
    const quoteText = asQuote ? quote.trim() : ""
    if (asQuote && !quoteText) {
      setMessage("Write a quote before continuing.")
      return
    }
    if (quoteText.length > MAX_QUOTE_LENGTH || (asQuote && (mediaInvalid || imageUploading || videoUploading))) return

    pendingQuote.current = asQuote
    setBusy(true)
    setMessage(asQuote ? "Preparing DeSo Quote Repost…" : "Preparing DeSo repost…")

    try {
      const response = await fetch("/api/via/social/repost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          action: "prepare",
          publicKey: session.publicKey,
          repostedPostHash: postHash,
          quote: quoteText,
          imageUrls: asQuote ? imageUrls : [],
          videoUrls: asQuote ? videoUrls : [],
        }),
      })
      const data = await response.json() as PrepareResponse
      if (!response.ok || !data.ok || !data.transactionHex) throw new Error(data.error || "PREPARE_FAILED")

      const approveUrl = `${DESO_IDENTITY_ORIGIN}/approve?tx=${encodeURIComponent(data.transactionHex)}`
      const width = Math.min(800, window.screen.availWidth)
      const height = Math.min(900, window.screen.availHeight)
      const popup = window.open(approveUrl, "via-deso-repost-approve", `popup=yes,width=${Math.round(width)},height=${Math.round(height)}`)
      if (!popup) {
        setMessage("Approval window was blocked. Nothing changed.")
        setBusy(false)
        return
      }
      popupRef.current = popup
      if (popupWatch.current !== null) window.clearInterval(popupWatch.current)
      popupWatch.current = window.setInterval(() => {
        if (popupRef.current?.closed) {
          popupRef.current = null
          if (popupWatch.current !== null) window.clearInterval(popupWatch.current)
          popupWatch.current = null
          setBusy(false)
          setMessage("DeSo approval was closed. VIA changed nothing.")
        }
      }, 500)
      setMessage(typeof data.feeNanos === "number"
        ? `Review in DeSo Identity · network fee ${data.feeNanos.toLocaleString()} nanos`
        : `Review this ${asQuote ? "Quote Repost" : "repost"} in DeSo Identity.`)
    } catch {
      setMessage("Repost transaction could not be prepared. Nothing changed.")
      setBusy(false)
    }
  }

  if (!session) return <span>{count} reposts</span>

  return (
    <div className="inline-flex flex-wrap items-center gap-2">
      <button type="button" onClick={() => void prepareRepost(false)} disabled={busy} className="rounded-full border border-[#285f40]/70 px-3 py-1 text-[#9adbb2] hover:border-[#8fd4a9]/55 disabled:cursor-wait disabled:opacity-60">
        {busy && !pendingQuote.current ? "Waiting…" : `Repost · ${count}`}
      </button>
      <button type="button" onClick={() => setQuoteOpen((open) => !open)} disabled={busy} className="rounded-full border border-zinc-800 px-3 py-1 text-zinc-300 hover:border-zinc-700 disabled:opacity-60">
        Quote
      </button>

      {quoteOpen ? <div className="basis-full rounded-xl border border-zinc-800 bg-black/30 p-3">
        <label className="sr-only" htmlFor={`via-quote-${postHash}`}>Quote Repost text</label>
        <textarea ref={quoteRef} id={`via-quote-${postHash}`} value={quote} onChange={(event) => setQuote(event.target.value)} maxLength={MAX_QUOTE_LENGTH} rows={3} placeholder="Add your public quote…" className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-[#8fd4a9]/55" />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setEmojiOpen((open) => !open)} aria-expanded={emojiOpen} className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-300 hover:border-[#8fd4a9]/45 hover:text-[#9adbb2]">Emoji</button>
          <span className="text-[11px] text-zinc-600">{MAX_QUOTE_LENGTH - quote.length} characters left</span>
        </div>
        {emojiOpen ? <div className="mt-2 flex flex-wrap gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950/80 p-2" aria-label="Quote emoji picker">
          {QUOTE_EMOJI.map((emoji) => <button key={emoji} type="button" onClick={() => insertEmoji(emoji)} className="grid h-8 w-8 place-items-center rounded-md border border-zinc-800 text-base hover:border-[#8fd4a9]/45" aria-label={`Insert ${emoji}`}>{emoji}</button>)}
        </div> : null}

        <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
          <p className="text-xs font-medium text-zinc-300">Photo</p>
          {imageUrls.length < MAX_IMAGES ? <label className="mt-2 inline-flex cursor-pointer items-center rounded-lg border border-[#285f40] px-3 py-2 text-xs font-semibold text-[#9adbb2]">
            {imageUploading ? "Working with DeSo…" : "Choose image"}
            <input type="file" accept="image/gif,image/jpeg,image/png,image/webp" className="sr-only" disabled={imageUploading} onChange={(event) => { const file = event.target.files?.[0] ?? null; event.currentTarget.value = ""; void uploadImage(file) }} />
          </label> : null}
          <p className="mt-1 text-[11px] text-zinc-600">GIF, JPEG, PNG or WebP · smaller than 10 MB · max. 4</p>
          {imageUploadMessage ? <p className={`mt-2 text-xs ${imageUploadStatus === "error" ? "text-amber-300" : "text-zinc-400"}`}>{imageUploadMessage}</p> : null}
          <div className="mt-2 space-y-2">{imageInputs.map((value, index) => <input key={index} value={value} onChange={(event) => changeImage(index, event.target.value)} placeholder={`Image HTTPS URL ${index + 1}`} className="w-full rounded-lg border border-zinc-800 bg-black/40 px-3 py-2 text-xs text-zinc-300 outline-none focus:border-[#8fd4a9]/55" />)}</div>
          {imageInputs.length < MAX_IMAGES ? <button type="button" onClick={() => setImageInputs((current) => [...current, ""])} className="mt-2 text-xs text-[#9adbb2]">+ Add image URL</button> : null}
        </div>

        <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
          <p className="text-xs font-medium text-zinc-300">Video</p>
          <VideoUploadControl onReady={setVideoInput} onBusyChange={setVideoUploading} />
          <input value={videoInput} onChange={(event) => setVideoInput(event.target.value)} placeholder="Ready DeSo video HTTPS URL (optional)" className="mt-3 w-full rounded-lg border border-zinc-800 bg-black/40 px-3 py-2 text-xs text-zinc-300 outline-none focus:border-[#8fd4a9]/55" />
        </div>

        {mediaInvalid ? <p className="mt-2 text-xs text-amber-300">Use valid HTTPS media URLs only.</p> : null}
        <button type="button" onClick={() => void prepareRepost(true)} disabled={busy || !quote.trim() || mediaInvalid || imageUploading || videoUploading} className="mt-3 rounded-lg border border-[#285f40] px-3 py-1.5 text-xs font-medium text-[#9adbb2] disabled:border-zinc-800 disabled:text-zinc-600">Review Quote Repost in DeSo</button>
        {message ? <p className="mt-2 text-xs text-zinc-500" role="status" aria-live="polite">{message}</p> : null}
      </div> : null}

      {!quoteOpen && message ? <span className="sr-only" role="status" aria-live="polite">{message}</span> : null}
    </div>
  )
}
