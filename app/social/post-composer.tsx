"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { DESO_IDENTITY_ORIGIN, restoreIdentitySession, VIA_IDENTITY_EVENT, type ViaIdentitySession } from "../deso-identity-session"
import { requestIdentityJwt } from "./identity-jwt"

const MAX_POST_LENGTH = 5000
const MAX_IMAGES = 4
const MAX_IMAGE_BYTES = 10 * 1024 * 1024
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
  const [status, setStatus] = useState<"idle" | "preparing" | "awaiting-approval" | "submitting" | "done" | "error">("idle")
  const [message, setMessage] = useState("")
  const [feeNanos, setFeeNanos] = useState<number | null>(null)
  const [imageUploadStatus, setImageUploadStatus] = useState<"idle" | "jwt" | "uploading" | "error">("idle")
  const [imageUploadMessage, setImageUploadMessage] = useState("")
  const popupRef = useRef<Window | null>(null)
  const isReply = Boolean(parentStakeID)

  useEffect(() => {
    setSession(restoreIdentitySession())
    const onSession = (event: Event) => setSession((event as CustomEvent<ViaIdentitySession | null>).detail ?? restoreIdentitySession())
    window.addEventListener(VIA_IDENTITY_EVENT, onSession)
    return () => window.removeEventListener(VIA_IDENTITY_EVENT, onSession)
  }, [])

  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      const signedTransactionHex = signedTransactionFromMessage(event, popupRef.current)
      if (!signedTransactionHex) return
      popupRef.current?.close()
      popupRef.current = null
      setStatus("submitting")
      setMessage(isReply ? "Submitting the approved reply to DeSo…" : "Submitting the approved post to DeSo…")
      try {
        const response = await fetch("/api/via/social/post", {
          method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store",
          body: JSON.stringify({ action: "submit", signedTransactionHex }),
        })
        const data = await response.json() as SubmitResponse
        if (!response.ok || !data.ok) throw new Error(data.error || "SUBMIT_FAILED")
        setStatus("done")
        setMessage(isReply ? "Reply submitted to DeSo." : "Post submitted to DeSo.")
        setBody("")
        setImageInputs([""])
        setVideoInput("")
        setFeeNanos(null)
        setImageUploadStatus("idle")
        setImageUploadMessage("")
        onDone?.()
      } catch {
        setStatus("error")
        setMessage(isReply ? "The reply could not be submitted. Nothing was posted by VIA." : "The post could not be submitted. Nothing was posted by VIA.")
      }
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [isReply, onDone])

  const parsedImages = imageInputs.map(httpsUrl)
  const parsedVideo = httpsUrl(videoInput)
  const mediaInvalid = parsedImages.some((value) => value === null) || parsedVideo === null
  const imageUrls = parsedImages.filter((value): value is string => typeof value === "string" && value.length > 0)
  const videoUrls = typeof parsedVideo === "string" && parsedVideo ? [parsedVideo] : []
  const hasContent = Boolean(body.trim() || imageUrls.length || videoUrls.length)
  const busy = status === "preparing" || status === "awaiting-approval" || status === "submitting"
  const imageUploading = imageUploadStatus === "jwt" || imageUploadStatus === "uploading"
  const canPrepare = Boolean(session && hasContent && body.length <= MAX_POST_LENGTH && !mediaInvalid && !busy && !imageUploading)
  const remaining = MAX_POST_LENGTH - body.length
  const feeLabel = useMemo(() => feeNanos === null ? null : `${feeNanos.toLocaleString()} nanos network fee in the prepared transaction`, [feeNanos])

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
      setImageUploadMessage("Image uploaded to DeSo and attached by URL. The post itself is not published yet.")
    } catch (error) {
      setImageUploadStatus("error")
      const code = error instanceof Error ? error.message : "IMAGE_UPLOAD_FAILED"
      setImageUploadMessage(code === "IDENTITY_REAUTHORIZE_REQUIRED"
        ? "DeSo Identity needs renewed authorization before this upload. Reconnect and try again."
        : "The image was not attached. No post was published.")
    }
  }

  async function preparePost() {
    if (!session || !canPrepare) return
    setStatus("preparing")
    setMessage(isReply ? "Preparing the exact DeSo reply transaction…" : "Preparing the exact DeSo post transaction with its media URLs…")
    setFeeNanos(null)
    try {
      const response = await fetch("/api/via/social/post", {
        method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store",
        body: JSON.stringify({ action: "prepare", publicKey: session.publicKey, body, parentStakeID, imageUrls, videoUrls }),
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
      setStatus("awaiting-approval")
      setMessage("Review the exact text and media post in DeSo Identity. VIA will not submit it without that approval.")
    } catch {
      setStatus("error")
      setMessage("The post transaction could not be prepared. Nothing was posted.")
    }
  }

  if (!session) return <div className={`${compact ? "mt-3" : "mt-4"} rounded-xl border border-zinc-800 bg-black/30 p-4 text-sm text-zinc-500`}>Connect through the DeSo participation gate before {isReply ? "replying" : "composing a public post"}.</div>

  return (
    <div className={`${compact ? "mt-3" : "mt-5"} rounded-2xl border border-green-900/60 bg-black/35 p-4`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-400">{isReply ? "Released write action · DeSo reply" : "Controlled write action · DeSo post + media"}</p>
          <p className="mt-1 text-xs text-zinc-500">Connected key: {session.publicKey.slice(0, 10)}…{session.publicKey.slice(-6)}</p>
        </div>
        <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400">Approval required every {isReply ? "reply" : "post"}</span>
      </div>

      <label htmlFor={isReply ? `via-reply-${parentStakeID}` : "via-post-body"} className="mt-4 block text-sm font-medium text-zinc-200">{isReply ? "Reply text" : "Post text"}</label>
      <textarea id={isReply ? `via-reply-${parentStakeID}` : "via-post-body"} value={body} onChange={(event) => { setBody(event.target.value); if (status === "done" || status === "error") { setStatus("idle"); setMessage("") } }} maxLength={MAX_POST_LENGTH} rows={compact ? 3 : 5} placeholder={isReply ? "Write a public reply on DeSo…" : "What would you like to share on DeSo?"} className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm text-zinc-100 outline-none focus:border-green-700" />

      {!compact ? <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
        <p className="text-sm font-medium text-zinc-200">Images</p>
        <p className="mt-1 text-xs leading-5 text-zinc-500">Choose an image to upload through DeSo, or paste an existing durable HTTPS URL. VIA does not keep a permanent copy. A short-lived Identity JWT is requested only for the upload.</p>

        {imageUrls.length < MAX_IMAGES ? <label className="mt-3 inline-flex cursor-pointer items-center rounded-lg border border-green-800 px-3 py-2 text-xs font-semibold text-green-300">
          {imageUploading ? "Working with DeSo…" : "Choose image for DeSo upload"}
          <input type="file" accept="image/gif,image/jpeg,image/png,image/webp" className="sr-only" disabled={imageUploading} onChange={(event) => { const file = event.target.files?.[0] ?? null; event.currentTarget.value = ""; void uploadImage(file) }} />
        </label> : null}
        <p className="mt-2 text-xs text-zinc-600">GIF, JPEG, PNG or WebP · smaller than 10 MB · maximum {MAX_IMAGES} images per post.</p>
        {imageUploadMessage ? <p className={`mt-2 text-xs ${imageUploadStatus === "error" ? "text-amber-300" : "text-zinc-400"}`}>{imageUploadMessage}</p> : null}

        <div className="mt-3 space-y-2">{imageInputs.map((value, index) => <input key={index} value={value} onChange={(event) => changeImage(index, event.target.value)} placeholder={`Image HTTPS URL ${index + 1}`} className="w-full rounded-lg border border-zinc-800 bg-black/40 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-green-700" />)}</div>
        {imageInputs.length < MAX_IMAGES ? <button type="button" onClick={() => setImageInputs((current) => [...current, ""])} className="mt-2 text-xs text-green-300">+ Add image URL</button> : null}
        <input value={videoInput} onChange={(event) => setVideoInput(event.target.value)} placeholder="Video HTTPS URL (optional)" className="mt-3 w-full rounded-lg border border-zinc-800 bg-black/40 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-green-700" />
        <p className="mt-1 text-xs text-zinc-600">Direct video upload remains separate because DeSo uses a different tokenized tus upload flow.</p>
        {mediaInvalid ? <p className="mt-2 text-xs text-amber-300">Media links must be valid HTTPS URLs without embedded credentials.</p> : null}
      </div> : null}

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500"><span>{remaining.toLocaleString()} characters left</span>{feeLabel ? <span>{feeLabel}</span> : null}</div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={preparePost} disabled={!canPrepare} className="rounded-xl border border-green-700 px-4 py-2 text-sm font-semibold text-green-300 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:text-zinc-600">{status === "preparing" ? "Preparing…" : status === "awaiting-approval" ? "Awaiting DeSo approval…" : status === "submitting" ? "Submitting…" : isReply ? "Review in DeSo & reply" : "Review in DeSo & post"}</button>
        <span className="text-xs text-zinc-600">VIA never signs this transaction itself.</span>
      </div>
      {message ? <p className={`mt-3 text-sm ${status === "done" ? "text-green-300" : status === "error" ? "text-amber-300" : "text-zinc-400"}`}>{message}</p> : null}
    </div>
  )
}
