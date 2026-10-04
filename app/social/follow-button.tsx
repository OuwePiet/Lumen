"use client"

import { useEffect, useState } from "react"
import { restoreIdentitySession, VIA_IDENTITY_EVENT, type ViaIdentitySession } from "../deso-identity-session"
import { signViaTransaction } from "../deso-identity-sign"

type Props = {
  followedPublicKey: string
  variant?: "default" | "profile"
  followedUsername?: string
}

type PrepareResponse = { ok?: boolean; transactionHex?: string; feeNanos?: number | null; error?: string }
type SubmitResponse = { ok?: boolean; error?: string }
type StatusResponse = { ok?: boolean; following?: boolean; self?: boolean; error?: string }

export default function FollowButton({ followedPublicKey, variant = "default", followedUsername = "this user" }: Props) {
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const [following, setFollowing] = useState(false)
  const [followsYou, setFollowsYou] = useState(false)
  const [statusReady, setStatusReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [confirmUnfollow, setConfirmUnfollow] = useState(false)

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
      setFollowsYou(false)
      if (!session || session.publicKey === followedPublicKey) return
      try {
        const followingRequest = fetch(`/api/via/social/follow?follower=${encodeURIComponent(session.publicKey)}&followed=${encodeURIComponent(followedPublicKey)}`, { cache: "no-store" })
        const followsYouRequest = variant === "profile"
          ? fetch(`/api/via/social/follow?follower=${encodeURIComponent(followedPublicKey)}&followed=${encodeURIComponent(session.publicKey)}`, { cache: "no-store" })
          : null

        const response = await followingRequest
        const data = await response.json() as StatusResponse
        if (!cancelled && response.ok && data.ok) {
          setFollowing(data.following === true)
          setStatusReady(true)
        }

        if (followsYouRequest) {
          const reverseResponse = await followsYouRequest
          const reverseData = await reverseResponse.json() as StatusResponse
          if (!cancelled && reverseResponse.ok && reverseData.ok) {
            setFollowsYou(reverseData.following === true)
          }
        }
      } catch {
        if (!cancelled) setMessage("Follow status is temporarily unavailable.")
      }
    }
    void loadStatus()
    return () => { cancelled = true }
  }, [session, followedPublicKey, variant])

  async function performToggle() {
    if (!session || !statusReady || busy || session.publicKey === followedPublicKey) return
    setConfirmUnfollow(false)
    setBusy(true)
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
      const signedTransactionHex = await signViaTransaction(session.publicKey, data.transactionHex)
      const submitResponse = await fetch("/api/via/social/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ action: "submit", signedTransactionHex }),
      })
      const submitData = await submitResponse.json() as SubmitResponse
      if (!submitResponse.ok || !submitData.ok) throw new Error(submitData.error || "SUBMIT_FAILED")
      const nextFollowing = !following
      setFollowing(nextFollowing)
      setStatusReady(true)
      setMessage(nextFollowing ? "Followed on DeSo." : "Unfollowed on DeSo.")
      setBusy(false)
    } catch {
      setMessage("Follow transaction could not be prepared. Nothing changed.")
      setBusy(false)
    }
  }

  function toggleFollow() {
    if (following && statusReady && !busy) {
      setConfirmUnfollow(true)
      return
    }
    void performToggle()
  }

  if (!session || session.publicKey === followedPublicKey) return null

  const mutual = variant === "profile" && following && followsYou

  return (
    <span className="inline-flex items-center gap-2">
      {mutual ? (
        <span className="rounded-full border border-zinc-700/80 bg-black/25 px-2.5 py-1 text-[11px] font-medium text-zinc-400" title={`You and @${followedUsername} follow each other`}>
          Mutual
        </span>
      ) : null}
      <button
        type="button"
        onClick={toggleFollow}
        disabled={busy || !statusReady}
        aria-label={variant === "profile" ? (following ? `Unfollow @${followedUsername}` : `Follow @${followedUsername}`) : undefined}
        title={variant === "profile" ? (mutual ? "Following · mutual" : following ? "Following" : followsYou ? "Follows you" : "Follow") : undefined}
        className={variant === "profile"
          ? `grid h-10 w-10 place-items-center rounded-full border text-base transition ${following ? "border-[#8fd4a9]/55 bg-[#102019] text-[#9adbb2]" : "border-zinc-700 text-zinc-300 hover:border-[#8fd4a9]/55 hover:text-[#9adbb2]"} disabled:cursor-wait disabled:opacity-60`
          : "rounded-full border border-[#285f40]/70 px-3 py-1 text-[#9adbb2] hover:border-[#8fd4a9]/55 disabled:cursor-wait disabled:opacity-60"}
      >
        {variant === "profile"
          ? (!statusReady || busy ? "…" : following ? "✓" : "+")
          : (!statusReady ? "Follow…" : busy ? "Waiting…" : following ? "Unfollow" : "Follow")}
      </button>
      {message ? <span className="sr-only" role="status" aria-live="polite">{message}</span> : null}

      {confirmUnfollow ? (
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
