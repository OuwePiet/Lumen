"use client"

import { useEffect, useRef, useState } from "react"
import { DESO_IDENTITY_ORIGIN, restoreIdentitySession, VIA_IDENTITY_EVENT, type ViaIdentitySession } from "../deso-identity-session"

type Props = {
  followedPublicKey: string
  variant?: "default" | "profile"
  followedUsername?: string
}

type PrepareResponse = { ok?: boolean; transactionHex?: string; feeNanos?: number | null; error?: string }
type SubmitResponse = { ok?: boolean; error?: string }
type StatusResponse = { ok?: boolean; following?: boolean; self?: boolean; error?: string }

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

export default function FollowButton({ followedPublicKey, variant = "default", followedUsername = "this user" }: Props) {
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const [following, setFollowing] = useState(false)
  const [statusReady, setStatusReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [confirmUnfollow, setConfirmUnfollow] = useState(false)
  const popupRef = useRef<Window | null>(null)
  const popupWatch = useRef<number | null>(null)
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
    let cancelled = false
    async function loadStatus() {
      setStatusReady(false)
      if (!session || session.publicKey === followedPublicKey) return
      try {
        const response = await fetch(`/api/via/social/follow?follower=${encodeURIComponent(session.publicKey)}&followed=${encodeURIComponent(followedPublicKey)}`, { cache: "no-store" })
        const data = await response.json() as StatusResponse
        if (!cancelled && response.ok && data.ok) {
          setFollowing(data.following === true)
          setStatusReady(true)
        }
      } catch {
        if (!cancelled) setMessage("Follow status is temporarily unavailable.")
      }
    }
    void loadStatus()
    return () => { cancelled = true }
  }, [session, followedPublicKey])

  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      const signedTransactionHex = signedTransactionFromMessage(event, popupRef.current)
      if (!signedTransactionHex) return
      if (popupWatch.current !== null) window.clearInterval(popupWatch.current)
      popupWatch.current = null
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
        setStatusReady(true)
        setMessage(nextFollowing ? "Followed on DeSo." : "Unfollowed on DeSo.")
      } catch {
        setMessage("Follow transaction failed. Nothing was changed by VIA.")
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

  async function performToggle() {
    if (!session || !statusReady || busy || session.publicKey === followedPublicKey) return
    setConfirmUnfollow(false)
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
        : `Review this ${following ? "unfollow" : "follow"} in DeSo Identity.`)
    } catch {
      setMessage("Follow transaction could not be prepared. Nothing changed.")
      setBusy(false)
    }
  }

  function toggleFollow() {
    if (variant === "profile" && following && statusReady && !busy) {
      setConfirmUnfollow(true)
      return
    }
    void performToggle()
  }

  if (!session || session.publicKey === followedPublicKey) return null

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={toggleFollow}
        disabled={busy || !statusReady}
        aria-label={variant === "profile" ? (following ? `Unfollow @${followedUsername}` : `Follow @${followedUsername}`) : undefined}
        title={variant === "profile" ? (following ? "Following" : "Follow") : undefined}
        className={variant === "profile"
          ? `grid h-10 w-10 place-items-center rounded-full border text-base transition ${following ? "border-[#8fd4a9]/55 bg-[#102019] text-[#9adbb2]" : "border-zinc-700 text-zinc-300 hover:border-[#8fd4a9]/55 hover:text-[#9adbb2]"} disabled:cursor-wait disabled:opacity-60`
          : "rounded-full border border-[#285f40]/70 px-3 py-1 text-[#9adbb2] hover:border-[#8fd4a9]/55 disabled:cursor-wait disabled:opacity-60"}
      >
        {variant === "profile"
          ? (!statusReady || busy ? "…" : following ? "✓" : "+")
          : (!statusReady ? "Follow…" : busy ? "Waiting…" : following ? "Unfollow" : "Follow")}
      </button>
      {message ? <span className="sr-only" role="status" aria-live="polite">{message}</span> : null}

      {variant === "profile" && confirmUnfollow ? (
        <span className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-5" role="presentation" onClick={() => setConfirmUnfollow(false)}>
          <span className="w-full max-w-sm rounded-[16px] border border-zinc-700 bg-[#0a0d0b] p-5 text-left shadow-2xl" role="dialog" aria-modal="true" aria-label="Confirm unfollow" onClick={(event) => event.stopPropagation()}>
            <span className="block text-base font-medium text-zinc-100">Are you sure you want to unfollow @{followedUsername}?</span>
            <span className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmUnfollow(false)} className="rounded-[10px] border border-zinc-700 px-4 py-2 text-sm text-zinc-300">No</button>
              <button type="button" onClick={() => void performToggle()} className="rounded-[10px] border border-[#8fd4a9]/45 bg-[#102019] px-4 py-2 text-sm text-[#9adbb2]">Yes</button>
            </span>
          </span>
        </span>
      ) : null}
    </span>
  )
}
