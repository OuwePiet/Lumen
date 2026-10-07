"use client"

import { useEffect, useMemo, useState } from "react"
import { viaModernIdentity, type ViaModernIdentityUser } from "./deso-identity-modern"

type Bid = {
  serialNumber: number
  bidderPublicKey: string
  bidAmountNanos: number
}

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
  const [confirmedSerial, setConfirmedSerial] = useState<number | null>(null)
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

  async function withdrawBid(serialNumber: number) {
    if (!session || confirmedSerial !== serialNumber) return
    if (status === "preparing" || status === "approval" || status === "submitting") return

    setStatus("preparing")
    setMessage("Preparing exact DeSo bid withdrawal…")

    try {
      const response = await fetch("/api/via/nft/withdraw-bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          action: "prepare",
          publicKey: session.publicKey,
          postHash,
          serialNumber,
        }),
      })
      const result = await response.json() as PrepareResponse
      if (!response.ok || !result.ok || !result.transactionHex) throw new Error(result.error || "PREPARE_FAILED")

      const withdrawBidPermission = {
        NFTOperationLimitMap: {
          [postHash]: {
            [serialNumber]: {
              nft_bid: 1,
            },
          },
        },
      }
      if (!(await viaModernIdentity.hasPermissions(withdrawBidPermission))) {
        setMessage("Requesting permission to withdraw this exact DeSo NFT bid…")
        await viaModernIdentity.requestPermissions(withdrawBidPermission)
      }

      setStatus("approval")
      setMessage("Signing the exact bid withdrawal with DeSo Identity…")
      const signedTransactionHex = await viaModernIdentity.signTx(result.transactionHex)
      setStatus("submitting")
      setMessage("Submitting the approved bid withdrawal to DeSo…")
      const submitResponse = await fetch("/api/via/nft/withdraw-bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ action: "submit", signedTransactionHex }),
      })
      const submitResult = await submitResponse.json() as { ok?: boolean; error?: string }
      if (!submitResponse.ok || !submitResult.ok) throw new Error(submitResult.error || "SUBMIT_FAILED")
      setStatus("done")
      setMessage("Bid withdrawal submitted to DeSo.")
      setConfirmedSerial(null)
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error && error.message === "POPUP_BLOCKED"
        ? "Approval window was blocked. VIA changed nothing."
        : "Bid withdrawal could not be prepared. VIA changed nothing.")
    }
  }

  if (!session || myBids.length === 0) return null

  return (
    <section className="mt-5 rounded-xl border border-zinc-800 bg-black/25 p-4" aria-labelledby="via-my-bids-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Marketplace</p>
      <h2 id="via-my-bids-heading" className="mt-2 text-lg font-semibold">My bids</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-400">These are active DeSo bids from the currently connected account on this NFT.</p>

      <div className="mt-4 grid gap-3">
        {myBids.map((bid) => {
          const confirmed = confirmedSerial === bid.serialNumber
          return (
            <div key={bid.serialNumber} className="rounded-lg border border-zinc-800 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-zinc-200">Edition #{bid.serialNumber} · {formatDeso(bid.bidAmountNanos)} DESO</p>
                <button
                  type="button"
                  onClick={() => {
                    if (!confirmed) {
                      setConfirmedSerial(bid.serialNumber)
                      setMessage("Press Withdraw bid again to prepare removal of this exact bid.")
                    } else {
                      void withdrawBid(bid.serialNumber)
                    }
                  }}
                  disabled={status === "preparing" || status === "approval" || status === "submitting"}
                  className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-300 disabled:text-zinc-600"
                >
                  {confirmed ? "Confirm withdraw" : "Withdraw bid"}
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
