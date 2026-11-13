"use client"

import { useEffect, useRef, useState } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { Popover } from "@base-ui/react/popover"
import { ImagePlus, Quote, Repeat2, Smile, Video, X } from "lucide-react"
import { viaModernIdentity, type ViaModernIdentityUser } from "../deso-identity-modern"
import VideoUploadControl from "./video-upload-control"

const MAX_QUOTE_LENGTH = 5000
const MAX_IMAGES = 4
const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const QUOTE_EMOJI = ["😀", "😄", "😂", "😍", "😎", "🤔", "👏", "👍", "❤️", "🔥", "🎉", "🚀", "🌍", "🎨", "🎵", "✨"] as const
const ALLOWED_IMAGE_TYPES = new Set(["image/gif", "image/jpeg", "image/png", "image/webp"])

type Props = {
  postHash: string
  initialCount: number
  quotedPost?: { username?: string; body: string }
  variant?: "default" | "icon"
}

type PrepareResponse = { ok?: boolean; transactionHex?: string; feeNanos?: number | null; error?: string }
type SubmitResponse = { ok?: boolean; error?: string }
type UploadResponse = { ok?: boolean; imageUrl?: string; error?: string }

function httpsUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ""
  try {
    const url = new URL(trimmed)
    return url.protocol === "https:" && !url.username && !url.password ? url.toString() : null
  } catch { return null }
}

export default function RepostButton({ postHash, initialCount, quotedPost, variant = "default" }: Props) {
  const [session, setSession] = useState<ViaModernIdentityUser | null>(null)
  const [count, setCount] = useState(initialCount)
  const [busy, setBusy] = useState(false)
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [repostMenuOpen, setRepostMenuOpen] = useState(false)
  const [quote, setQuote] = useState("")
  const [tool, setTool] = useState<"emoji" | "photo" | "video" | null>(null)
  const [imageInputs, setImageInputs] = useState([""])
  const [videoInput, setVideoInput] = useState("")
  const [imageUploadStatus, setImageUploadStatus] = useState<"idle" | "jwt" | "uploading" | "error">("idle")
  const [imageUploadMessage, setImageUploadMessage] = useState("")
  const [videoUploading, setVideoUploading] = useState(false)
  const [message, setMessage] = useState("")
  const pendingQuote = useRef(false)
  const quoteRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    void viaModernIdentity.currentUser().then(setSession)
    return viaModernIdentity.subscribe(setSession)
  }, [])

  useEffect(() => setCount(initialCount), [initialCount])

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
      const jwt = await viaModernIdentity.jwt()
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

      setMessage(asQuote ? "Signing your Quote Repost with your DeSo Identity session…" : "Signing your repost with your DeSo Identity session…")
      if ((await viaModernIdentity.currentUser())?.publicKey !== session.publicKey) throw new Error("DESO_ACCOUNT_CHANGED")
      const signedTransactionHex = await viaModernIdentity.signTx(data.transactionHex)
      if ((await viaModernIdentity.currentUser())?.publicKey !== session.publicKey) throw new Error("DESO_ACCOUNT_CHANGED")
      const submitResponse = await fetch("/api/via/social/repost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ action: "submit", signedTransactionHex }),
      })
      const submitData = await submitResponse.json() as SubmitResponse
      if (!submitResponse.ok || !submitData.ok) throw new Error(submitData.error || "SUBMIT_FAILED")
      setCount((current) => current + 1)
      window.dispatchEvent(new Event("via:social:post-published"))
      setMessage(asQuote ? "Quote Repost submitted to DeSo." : "Reposted on DeSo.")
      setQuote("")
      setTool(null)
      setImageInputs([""])
      setVideoInput("")
      setImageUploadStatus("idle")
      setImageUploadMessage("")
      setVideoUploading(false)
      setQuoteOpen(false)
      setBusy(false)
    } catch {
      setMessage("Repost transaction could not be prepared. Nothing changed.")
      setBusy(false)
    }
  }

  if (!session) return <span>{count} reposts</span>

  return (
    <div className="inline-flex flex-wrap items-center gap-2">
      {variant === "icon" ? <Popover.Root open={repostMenuOpen} onOpenChange={setRepostMenuOpen}>
        <Popover.Trigger
          type="button"
          disabled={busy}
          title="Repost"
          aria-label={`Repost · ${count}`}
          aria-expanded={repostMenuOpen}
          className="inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-full border border-zinc-800 px-2 text-xs text-zinc-300 transition hover:border-[#8fd4a9] hover:text-white disabled:cursor-wait disabled:opacity-60"
        >
          <Repeat2 className="h-4 w-4" aria-hidden="true" />
          <span>{count}</span>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner sideOffset={4} className="z-50">
          <Popover.Popup aria-label="Repost options" className="min-w-28 rounded-xl border border-zinc-800 bg-zinc-950 p-1 shadow-xl">
          <button type="button" onClick={() => { setRepostMenuOpen(false); void prepareRepost(false) }} className="flex min-h-10 w-full items-center gap-2 rounded-lg px-2 text-left text-xs text-zinc-200 hover:bg-zinc-900"><Repeat2 size={15} aria-hidden="true" />Repost</button>
          <button type="button" onClick={() => { setRepostMenuOpen(false); setTool(null); setMessage(""); setQuoteOpen(true) }} className="flex min-h-10 w-full items-center gap-2 rounded-lg px-2 text-left text-xs text-zinc-200 hover:bg-zinc-900"><Quote size={15} aria-hidden="true" />Quote</button>
          </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root> : <>
        <button type="button" onClick={() => void prepareRepost(false)} disabled={busy} className="rounded-full border border-[#285f40]/70 px-3 py-1 text-[#9adbb2] hover:border-[#8fd4a9]/55 disabled:cursor-wait disabled:opacity-60">{busy && !pendingQuote.current ? "Waiting…" : `Repost · ${count}`}</button>
        <button type="button" onClick={() => { setTool(null); setMessage(""); setQuoteOpen(true) }} disabled={busy} className="rounded-full border border-zinc-800 px-3 py-1 text-zinc-300 hover:border-zinc-700 disabled:opacity-60">Quote</button>
      </>}

      <Dialog.Root open={quoteOpen} onOpenChange={open => { if (open || !(busy || imageUploading || videoUploading)) setQuoteOpen(open) }}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-[950] bg-black/70" />
          <Dialog.Popup initialFocus={quoteRef} className="fixed inset-x-3 top-1/2 z-[951] mx-auto max-h-[calc(100dvh-1.5rem)] max-w-xl -translate-y-1/2 overflow-y-auto rounded-2xl border border-zinc-700 bg-[#0b100d] p-3 text-sm text-zinc-100 shadow-xl sm:p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <Dialog.Title className="font-semibold">Quote{quotedPost?.username ? " @" + quotedPost.username.replace(/^@/, "") : ""}</Dialog.Title>
          <Dialog.Close aria-label="Close quote" disabled={busy || imageUploading || videoUploading} className="grid size-10 place-items-center rounded-full hover:bg-white/10"><X size={18} /></Dialog.Close>
        </div>
        {quotedPost?.body ? <blockquote className="mb-2 line-clamp-2 break-words border-l border-[#285f40] pl-2 text-xs text-zinc-400">{quotedPost.body}</blockquote> : null}
        <label className="sr-only" htmlFor={`via-quote-${postHash}`}>Quote Repost text</label>
        <textarea ref={quoteRef} id={`via-quote-${postHash}`} value={quote} onChange={(event) => setQuote(event.target.value)} maxLength={MAX_QUOTE_LENGTH} rows={3} placeholder="Add your public quote…" className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-[#8fd4a9]/55" />
        <div className="mt-1 flex flex-wrap items-center gap-1">
          {([{ id: "emoji", label: "Emoji", Icon: Smile }, { id: "photo", label: "Photo", Icon: ImagePlus }, { id: "video", label: "Video", Icon: Video }] as const).map(({ id, label, Icon }) => (
            <button key={id} type="button" aria-label={label} title={label} aria-expanded={tool === id}
              onClick={() => setTool(current => current === id ? null : id)}
              className="grid size-11 place-items-center rounded-lg text-zinc-300 hover:bg-white/10 aria-expanded:bg-[#285f40]">
              <Icon size={18} aria-hidden="true" />
            </button>
          ))}
          <span className="text-xs tabular-nums text-zinc-400">{quote.length} / {MAX_QUOTE_LENGTH}</span>
          <button type="button" onClick={() => void prepareRepost(true)} disabled={busy || !quote.trim() || mediaInvalid || imageUploading || videoUploading} className="ml-auto min-h-11 rounded-lg bg-[#285f40] px-3 text-xs font-semibold text-white disabled:opacity-50">Post quote</button>
        </div>
        {tool === "emoji" ? <div className="mt-2 flex flex-wrap gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950/80 p-2" aria-label="Quote emoji picker">
          {QUOTE_EMOJI.map((emoji) => <button key={emoji} type="button" onClick={() => insertEmoji(emoji)} className="grid h-8 w-8 place-items-center rounded-md border border-zinc-800 text-base hover:border-[#8fd4a9]/45" aria-label={`Insert ${emoji}`}>{emoji}</button>)}
        </div> : null}

        <div hidden={tool !== "photo"} className="mt-2 border-t border-zinc-800 pt-2">
          {imageUrls.length < MAX_IMAGES ? <label className="mt-2 inline-flex cursor-pointer items-center rounded-lg border border-[#285f40] px-3 py-2 text-xs font-semibold text-[#9adbb2]">
            {imageUploading ? "Working with DeSo…" : "Choose image"}
            <input type="file" accept="image/gif,image/jpeg,image/png,image/webp" className="sr-only" disabled={imageUploading} onChange={(event) => { const file = event.target.files?.[0] ?? null; event.currentTarget.value = ""; void uploadImage(file) }} />
          </label> : null}
          <p className="mt-1 text-[11px] text-zinc-600">GIF, JPEG, PNG or WebP · smaller than 10 MB · max. 4</p>
          {imageUploadMessage ? <p className={`mt-2 text-xs ${imageUploadStatus === "error" ? "text-amber-300" : "text-zinc-400"}`}>{imageUploadMessage}</p> : null}
          <div className="mt-2 space-y-2">{imageInputs.map((value, index) => <input key={index} value={value} onChange={(event) => changeImage(index, event.target.value)} placeholder={`Image HTTPS URL ${index + 1}`} className="w-full rounded-lg border border-zinc-800 bg-black/40 px-3 py-2 text-xs text-zinc-300 outline-none focus:border-[#8fd4a9]/55" />)}</div>
          {imageInputs.length < MAX_IMAGES ? <button type="button" onClick={() => setImageInputs((current) => [...current, ""])} className="mt-2 text-xs text-[#9adbb2]">+ Add image URL</button> : null}
        </div>

        <div hidden={tool !== "video"} className="mt-2 border-t border-zinc-800 pt-2">
          <VideoUploadControl onReady={setVideoInput} onBusyChange={setVideoUploading} />
          <label htmlFor={`via-quote-youtube-${postHash}`} className="mt-3 block text-xs text-zinc-400">Or paste a YouTube link</label>
          <input id={`via-quote-youtube-${postHash}`} type="url" inputMode="url" value={videoUploading ? "" : videoInput} onChange={(event) => setVideoInput(event.target.value)} disabled={videoUploading} placeholder="https://www.youtube.com/watch?v=…" className="mt-2 w-full rounded-lg border border-zinc-800 bg-black/40 px-3 py-2 text-xs text-zinc-300 outline-none focus:border-[#8fd4a9]/55 disabled:opacity-50" />
          <p className="mt-1 text-[11px] text-zinc-600">DeSo video uploads may be up to 250 MB. External YouTube links are not uploaded by VIA.</p>
        </div>

        {mediaInvalid ? <p className="mt-2 text-xs text-amber-300">Use valid HTTPS media URLs only.</p> : null}
        {message ? <p className="mt-2 text-xs text-zinc-500" role="status" aria-live="polite">{message}</p> : null}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      {!quoteOpen && message ? <span className="sr-only" role="status" aria-live="polite">{message}</span> : null}
    </div>
  )
}
