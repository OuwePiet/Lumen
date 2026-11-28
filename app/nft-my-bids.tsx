"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { viaModernIdentity, type ViaModernIdentityUser } from "./deso-identity-modern"

type Bid = {
  serialNumber: number
  bidderPublicKey: string
  bidAmountNanos: number
}

import { submitNativeNFTBid } from "./nft-native-bid"

type Props = {
  postHash: string
  bids: Bid[]
}

type PrepareResponse = {
  ok?: boolean
  transactionHex?: string
  feeNanos?: number | null
  error?: string
}

function formatDeso(nanos: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 9 }).format(nanos / 1_000_000_000)
}

export default function NFTMyBids({ postHash, bids }: Props) {
  const [session, setSession] = useState<ViaModernIdentityUser | null>(null)
  const [status, setStatus] = useState<"idle"|"preparing"|"approval"|"submitting"|"done"|"error">("idle")
  const [message, setMessage] = useState("")

  useEffect(() => {
    void viaModernIdentity.currentUser().then(setSession)
    return viaModernIdentity.subscribe(setSession)
  }, [])

  const myBids = useMemo(
    () => bids
      .filter((bid) => session && bid.bidderPublicKey === session.publicKey)
      .sort((a, b) => b.bidAmountNanos - a.bidAmountNanos),
    [bids, session],
  )

  const lock=useRef(false)
  async function withdrawBid(serialNumber:number){
    if(!session||lock.current||!myBids.some(b=>b.serialNumber===serialNumber))return
    lock.current=true;setStatus("preparing")
    let submitting=false
    try{
      setMessage("Preparing withdrawal directly with DeSo...")
      await submitNativeNFTBid(session.publicKey,postHash,serialNumber,0,()=>{},()=>{submitting=true;setStatus("submitting")})
      setStatus("done");setMessage("Withdrawal submitted to DeSo. Refresh to verify.")
    }catch{setStatus("error");setMessage(submitting?"Submission uncertain. Verify on DeSo before retrying.":"Withdrawal not submitted. Review account and permissions.")}
    finally{lock.current=false}
  }

  if (!session || myBids.length === 0) return null

  return (
    <section className="mt-5 rounded-xl border border-zinc-800 bg-black/25 p-4" aria-labelledby="via-my-bids-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Marketplace</p>
      <h2 id="via-my-bids-heading" className="mt-2 text-lg font-semibold">My bids</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-400">These are active DeSo bids from the currently connected account on this NFT.</p>

      <div className="mt-4 grid gap-3">
        {myBids.map((bid) => {
          return (
            <div key={bid.serialNumber} className="rounded-lg border border-zinc-800 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-zinc-200">Edition #{bid.serialNumber} · {formatDeso(bid.bidAmountNanos)} DESO</p>
                <button
                  type="button"
                  onClick={() => void withdrawBid(bid.serialNumber)}
                  disabled={status === "preparing" || status === "approval" || status === "submitting"}
                  className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-300 disabled:text-zinc-600"
                >
                  Withdraw bid
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {message ? <p className={"mt-3 text-xs " + (status === "error" ? "text-amber-300" : status === "done" ? "text-[#9adbb2]" : "text-zinc-500")} role="status">{message}</p> : null}
    </section>
  )
}
