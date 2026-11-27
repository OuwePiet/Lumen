"use client"
import { updateLikeStatus, identity } from 'deso-protocol'

import { useEffect, useState, useRef } from "react"
import { Heart } from "lucide-react"
import { viaModernIdentity, type ViaModernIdentityUser } from "../deso-identity-modern"

type Props = {
  postHash: string
  initialCount: number
  initialLiked?: boolean
  variant?: "default" | "icon"
}

type PrepareResponse = { ok?: boolean; transactionHex?: string; feeNanos?: number | null; error?: string }
type SubmitResponse = { ok?: boolean; error?: string }

export default function LikeButton({ postHash, initialCount, initialLiked = false, variant = "default" }: Props) {
  const [session, setSession] = useState<ViaModernIdentityUser | null>(null)
  const [count, setCount] = useState(initialCount)
  const [liked, setLiked] = useState(initialLiked)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    void viaModernIdentity.currentUser().then(setSession)
    return viaModernIdentity.subscribe(setSession)
  }, [])

  useEffect(() => setCount(initialCount), [initialCount])
  useEffect(() => setLiked(initialLiked), [initialLiked])

  const actionLock=useRef(false)
  async function toggleLike() {
    if (!session || busy || actionLock.current) return
    actionLock.current=true
    setBusy(true)
    setMessage("Preparing DeSo like transaction…")
    try {
      const key=session.publicKey
      await updateLikeStatus({ReaderPublicKeyBase58Check:key,LikedPostHashHex:postHash,IsUnlike:liked,MinFeeRateNanosPerKB:1000,TransactionFees:[]},{localConstruction:false})
      const nextLiked = !liked
      setLiked(nextLiked)
      setCount((current) => Math.max(0, current + (nextLiked ? 1 : -1)))
      setMessage(nextLiked ? "Liked on DeSo." : "Like removed on DeSo.")
      window.dispatchEvent(new Event("via:social:post-published"))
      actionLock.current=false
      setBusy(false)
    } catch {
      setMessage("Controleer de actuele DeSo-status voordat je opnieuw probeert.")
      actionLock.current=false
      setBusy(false)
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={toggleLike}
        disabled={busy || !session}
        title={!session ? "Log in via VIA to like" : liked ? "Unlike" : "Like"}
        aria-label={liked ? `Unlike · ${count}` : `Like · ${count}`}
        className={variant === "icon"
          ? `inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-full border px-2 text-xs transition disabled:cursor-wait disabled:opacity-60 ${liked ? "border-[#8fd4a9] bg-[#285f40] text-white" : "border-zinc-800 text-zinc-300 hover:border-[#8fd4a9] hover:text-white"}`
          : "rounded-full border border-[#285f40]/70 px-3 py-1 text-[#9adbb2] hover:border-[#8fd4a9]/55 disabled:cursor-wait disabled:opacity-60"}
      >
        {variant === "icon" ? <><Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} aria-hidden="true" /><span>{count}</span></> : (busy ? "Waiting…" : liked ? `Unlike · ${count}` : `Like · ${count}`)}
      </button>
      {message ? <span className="text-xs text-zinc-400" role="status" aria-live="polite">{message}</span> : null}
    </span>
  )
}
