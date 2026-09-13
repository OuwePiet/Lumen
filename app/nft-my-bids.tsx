"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { DESO_IDENTITY_ORIGIN, restoreIdentitySession, VIA_IDENTITY_EVENT, type ViaIdentitySession } from "./deso-identity-session"

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
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const [confirmedSerial, setConfirmedSerial] = useState<number | null>(null)
  const [status, setStatus] = useState<"idle"|"preparing"|"approval"|"submitting"|"done"|"error">("idle")
  const [message, setMessage] = useState("")
  const popupRef = useRef<Window | null>(null)

  useEffect(() => {
    setSession(restoreIdentitySession())
    const onSession = (event: Event) => setSession((event as CustomEvent<ViaIdentitySession | null>).detail ?? restoreIdentitySession())
    window.addEventListener(VIA_IDENTITY_EVENT, onSession)
    return () => window.removeEventListener(VIA_IDENTITY_EVENT, onSession)
  }, [])

  const myBids = useMemo(
    () => bids
      .filter((bid) => session && bid.bidderPublicKey === session.publicKey)
      .sort((a, b) => b.bidAmountNanos - a.bidAmountNanos),
    [bids, session],
  )

  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      if (event.origin !== DESO_IDENTITY_ORIGIN || event.source !== popupRef.current) return
      if (!event.data || typeof event.data !== "object") return
      const data = event.data as Record<string, unknown>
      if (data.service !== "identity") return
      const payload = data.payload
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) return
      const signedTransactionHex = (payload as Record<string, unknown>).signedTransactionHex
      if (typeof signedTransactionHex !== "string" || !signedTransactionHex) return

      popupRef.current?.close()
      popupRef.current = null
      setStatus("submitting")
      setMessage("Submitting bid withdrawal to DeSo…")

      try {
        const response = await fetch("/api/via/nft/withdraw-bid", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ action: "submit", signedTransactionHex }),
        })
        const result = await response.json() as { ok?: boolean; error?: string }
        if (!response.ok || !result.ok) throw new Error(result.error || "SUBMIT_FAILED")
        setStatus("done")
        setMessage("Bid withdrawal submitted to DeSo.")
        setConfirmedSerial(null)
      } catch {
        setStatus("error")
        setMessage("The bid withdrawal could not be submitted. VIA changed nothing.")
      }
    }

    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [])

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

      const popup = window.open(
        DESO_IDENTITY_ORIGIN + "/approve?tx=" + encodeURIComponent(result.transactionHex),
        "via-deso-withdraw-nft-bid",
        "popup=yes,width=800,height=900",
      )
      if (!popup) throw new Error("POPUP_BLOCKED")
      popupRef.current = popup
      setStatus("approval")
      setMessage("Review the bid withdrawal in DeSo Identity. DeSo represents withdrawal as the same NFT bid transaction with amount 0.")
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

      {message ? <p className={"mt-3 text-xs " + (status === "error" ? "text-amber-300" : status === "done" ? "text-green-300" : "text-zinc-500")} role="status">{message}</p> : null}
    </section>
  )
}
