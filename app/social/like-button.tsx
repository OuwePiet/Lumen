"use client"

import { useEffect, useRef, useState } from "react"
import { restoreIdentitySession, VIA_IDENTITY_EVENT, type ViaIdentitySession } from "../deso-identity-session"
import { signViaTransaction } from "../deso-identity-sign"

type Props = {
  postHash: string
  initialCount: number
  variant?: "default" | "icon"
}

type PrepareResponse = { ok?: boolean; transactionHex?: string; feeNanos?: number | null; error?: string }
type SubmitResponse = { ok?: boolean; error?: string }

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

export default function LikeButton({ postHash, initialCount, variant = "default" }: Props) {
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const [count, setCount] = useState(initialCount)
  const [liked, setLiked] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const popupRef = useRef<Window | null>(null)
  const popupWatch = useRef<number | null>(null)
  const pendingUnlike = useRef(false)

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
        const response = await fetch("/api/via/social/like", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ action: "submit", signedTransactionHex }),
        })
        const data = await response.json() as SubmitResponse
        if (!response.ok || !data.ok) throw new Error(data.error || "SUBMIT_FAILED")
        const nextLiked = !pendingUnlike.current
        setLiked(nextLiked)
        setCount((current) => Math.max(0, current + (nextLiked ? 1 : -1)))
        setMessage(nextLiked ? "Liked on DeSo." : "Like removed on DeSo.")
      } catch {
        setMessage("Like transaction failed. Nothing was changed by VIA.")
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

  async function toggleLike() {
    if (!session || busy) return
    setBusy(true)
    setMessage("Preparing DeSo like transaction…")
    pendingUnlike.current = liked
    try {
      const response = await fetch("/api/via/social/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ action: "prepare", publicKey: session.publicKey, postHash, isUnlike: liked }),
      })
      const data = await response.json() as PrepareResponse
      if (!response.ok || !data.ok || !data.transactionHex) throw new Error(data.error || "PREPARE_FAILED")
      setMessage("Signing this like with your DeSo Identity session…")
      const signedTransactionHex = await signViaTransaction(session.publicKey, data.transactionHex)
      const submitResponse = await fetch("/api/via/social/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ action: "submit", signedTransactionHex }),
      })
      const submitData = await submitResponse.json() as SubmitResponse
      if (!submitResponse.ok || !submitData.ok) throw new Error(submitData.error || "SUBMIT_FAILED")
      const nextLiked = !liked
      setLiked(nextLiked)
      setCount((current) => Math.max(0, current + (nextLiked ? 1 : -1)))
      setMessage(nextLiked ? "Liked on DeSo." : "Like removed on DeSo.")
      setBusy(false)
    } catch {
      setMessage("Like transaction could not be prepared. Nothing changed.")
      setBusy(false)
    }
  }

  if (!session) return <span>{count} likes</span>

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={toggleLike}
        disabled={busy}
        title={liked ? "Unlike" : "Like"}
        aria-label={liked ? `Unlike · ${count}` : `Like · ${count}`}
        className={variant === "icon"
          ? `inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-full border px-2 text-xs transition disabled:cursor-wait disabled:opacity-60 ${liked ? "border-[#8fd4a9] bg-[#285f40] text-white" : "border-zinc-800 text-zinc-300 hover:border-[#8fd4a9] hover:text-white"}`
          : "rounded-full border border-[#285f40]/70 px-3 py-1 text-[#9adbb2] hover:border-[#8fd4a9]/55 disabled:cursor-wait disabled:opacity-60"}
      >
        {variant === "icon" ? <><span aria-hidden="true">👍</span><span>{count}</span></> : (busy ? "Waiting…" : liked ? `Unlike · ${count}` : `Like · ${count}`)}
      </button>
      {message ? <span className="sr-only" role="status" aria-live="polite">{message}</span> : null}
    </span>
  )
}
