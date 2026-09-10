"use client"

import { useEffect, useRef, useState } from "react"
import { DESO_IDENTITY_ORIGIN, restoreIdentitySession, VIA_IDENTITY_EVENT, type ViaIdentitySession } from "../deso-identity-session"

type Props = {
  followedPublicKey: string
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

export default function FollowButton({ followedPublicKey }: Props) {
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const [following, setFollowing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const popupRef = useRef<Window | null>(null)
  const pendingUnfollow = useRef(false)

  useEffect(() => {
    setSession(restoreIdentitySession())
    const onIdentity = (event: Event) => {
      const custom = event as CustomEvent<ViaIdentitySession | null>
      setSession(custom.detail ?? restoreIdentitySession())
    }
    window.addEventListener(VIA_IDENTITY_EVENT, onIdentity)
    return () => window.removeEventListener(VIA_IDENTITY_EVENT, onIdentity)
  }, [])

  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      const signedTransactionHex = signedTransactionFromMessage(event, popupRef.current)
      if (!signedTransactionHex) return
      popupRef.current?.close()
      popupRef.current = null
      try {
        const response = await fetch("/api/via/social/follow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ action: "submit", signedTransactionHex }),
        })
        const data = await response.json() as SubmitResponse
        if (!response.ok || !data.ok) throw new Error(data.error || "SUBMIT_FAILED")
        const nextFollowing = !pendingUnfollow.current
        setFollowing(nextFollowing)
        setMessage(nextFollowing ? "Followed on DeSo." : "Unfollowed on DeSo.")
      } catch {
        setMessage("Follow transaction failed. Nothing was changed by VIA.")
      } finally {
        setBusy(false)
      }
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [])

  async function toggleFollow() {
    if (!session || busy || session.publicKey === followedPublicKey) return
    setBusy(true)
    pendingUnfollow.current = following
    setMessage(following ? "Preparing DeSo unfollow transaction…" : "Preparing DeSo follow transaction…")
    try {
      const response = await fetch("/api/via/social/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          action: "prepare",
          followerPublicKey: session.publicKey,
          followedPublicKey,
          isUnfollow: following,
        }),
      })
      const data = await response.json() as PrepareResponse
      if (!response.ok || !data.ok || !data.transactionHex) throw new Error(data.error || "PREPARE_FAILED")
      const approveUrl = `${DESO_IDENTITY_ORIGIN}/approve?tx=${encodeURIComponent(data.transactionHex)}`
      const popup = window.open(approveUrl, "via-deso-follow-approve", "popup=yes,width=800,height=900")
      if (!popup) {
        setMessage("Approval window was blocked. Nothing changed.")
        setBusy(false)
        return
      }
      popupRef.current = popup
      setMessage(typeof data.feeNanos === "number"
        ? `Review in DeSo Identity · network fee ${data.feeNanos.toLocaleString()} nanos`
        : `Review this ${following ? "unfollow" : "follow"} in DeSo Identity.`)
    } catch {
      setMessage("Follow transaction could not be prepared. Nothing changed.")
      setBusy(false)
    }
  }

  if (!session || session.publicKey === followedPublicKey) return null

  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" onClick={toggleFollow} disabled={busy} className="rounded-full border border-green-900/70 px-3 py-1 text-green-300 hover:border-green-700 disabled:cursor-wait disabled:opacity-60">
        {busy ? "Waiting…" : following ? "Unfollow" : "Follow"}
      </button>
      {message ? <span className="sr-only" role="status" aria-live="polite">{message}</span> : null}
    </span>
  )
}
