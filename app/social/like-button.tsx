"use client"

import { useEffect, useRef, useState } from "react"
import { DESO_IDENTITY_ORIGIN, restoreIdentitySession, VIA_IDENTITY_EVENT, type ViaIdentitySession } from "../deso-identity-session"

type Props = {
  postHash: string
  initialCount: number
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

export default function LikeButton({ postHash, initialCount }: Props) {
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const [count, setCount] = useState(initialCount)
  const [liked, setLiked] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const popupRef = useRef<Window | null>(null)
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
    return () => window.removeEventListener("message", onMessage)
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
      const approveUrl = `${DESO_IDENTITY_ORIGIN}/approve?tx=${encodeURIComponent(data.transactionHex)}`
      const popup = window.open(approveUrl, "via-deso-like-approve", "popup=yes,width=800,height=900")
      if (!popup) {
        setMessage("Approval window was blocked. Nothing changed.")
        setBusy(false)
        return
      }
      popupRef.current = popup
      setMessage(typeof data.feeNanos === "number" ? `Review in DeSo Identity · network fee ${data.feeNanos.toLocaleString()} nanos` : "Review this like in DeSo Identity.")
    } catch {
      setMessage("Like transaction could not be prepared. Nothing changed.")
      setBusy(false)
    }
  }

  if (!session) return <span>{count} likes</span>

  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" onClick={toggleLike} disabled={busy} className="rounded-full border border-green-900/70 px-3 py-1 text-green-300 hover:border-green-700 disabled:cursor-wait disabled:opacity-60">
        {busy ? "Waiting…" : liked ? `Unlike · ${count}` : `Like · ${count}`}
      </button>
      {message ? <span className="sr-only" role="status" aria-live="polite">{message}</span> : null}
    </span>
  )
}
