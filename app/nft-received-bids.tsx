"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { DESO_IDENTITY_ORIGIN, restoreIdentitySession, VIA_IDENTITY_EVENT, type ViaIdentitySession } from "./deso-identity-session"

type Bid = {
  serialNumber: number
  bidderPublicKey: string
  bidAmountNanos: number
}

type Edition = {
  serialNumber: number
  ownerPublicKey?: string
}

type Props = {
  postHash: string
  bids: Bid[]
  editions: Edition[]
  hasUnlockable: boolean
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

function shortKey(key: string) {
  return key.length > 22 ? `${key.slice(0, 10)}…${key.slice(-8)}` : key
}

export default function NFTReceivedBids({ postHash, bids, editions, hasUnlockable }: Props) {
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const [confirmedKey, setConfirmedKey] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle"|"preparing"|"approval"|"submitting"|"done"|"error">("idle")
  const [message, setMessage] = useState("")
  const popupRef = useRef<Window | null>(null)

  useEffect(() => {
    setSession(restoreIdentitySession())
    const onSession = (event: Event) => setSession((event as CustomEvent<ViaIdentitySession | null>).detail ?? restoreIdentitySession())
    window.addEventListener(VIA_IDENTITY_EVENT, onSession)
    return () => window.removeEventListener(VIA_IDENTITY_EVENT, onSession)
  }, [])

  const ownedSerials = useMemo(
    () => new Set(editions.filter((edition) => session && edition.ownerPublicKey === session.publicKey).map((edition) => edition.serialNumber)),
    [editions, session],
  )

  const received = useMemo(
    () => bids.filter((bid) => ownedSerials.has(bid.serialNumber)).sort((a, b) => b.bidAmountNanos - a.bidAmountNanos),
    [bids, ownedSerials],
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
      setMessage("Submitting accepted bid to DeSo…")
      try {
        const response = await fetch("/api/via/nft/accept-bid", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ action: "submit", signedTransactionHex }),
        })
        const result = await response.json() as { ok?: boolean; error?: string }
        if (!response.ok || !result.ok) throw new Error(result.error || "SUBMIT_FAILED")
        setStatus("done")
        setMessage("Bid accepted on DeSo.")
        setConfirmedKey(null)
      } catch {
        setStatus("error")
        setMessage("The accepted bid could not be submitted. VIA changed nothing.")
      }
    }

    window.addEventListener("message", onMessage)
    return () => {
      window.removeEventListener("message", onMessage)
      popupRef.current?.close()
      popupRef.current = null
    }
  }, [])

  async function acceptBid(bid: Bid) {
    if (!session || hasUnlockable) return
    const key = `${bid.serialNumber}:${bid.bidderPublicKey}:${bid.bidAmountNanos}`
    if (confirmedKey !== key || status === "preparing" || status === "approval" || status === "submitting") return

    setStatus("preparing")
    setMessage("Preparing exact DeSo bid acceptance…")
    try {
      const response = await fetch("/api/via/nft/accept-bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          action: "prepare",
          ownerPublicKey: session.publicKey,
          bidderPublicKey: bid.bidderPublicKey,
          postHash,
          serialNumber: bid.serialNumber,
          bidAmountNanos: bid.bidAmountNanos,
          hasUnlockable,
        }),
      })
      const result = await response.json() as PrepareResponse
      if (!response.ok || !result.ok || !result.transactionHex) throw new Error(result.error || "PREPARE_FAILED")
      const popup = window.open(
        DESO_IDENTITY_ORIGIN + "/approve?tx=" + encodeURIComponent(result.transactionHex),
        "via-deso-accept-nft-bid",
        "popup=yes,width=800,height=900",
      )
      if (!popup) throw new Error("POPUP_BLOCKED")
      popupRef.current = popup
      setStatus("approval")
      setMessage("Review the exact sale in DeSo Identity. Accepting a bid transfers the NFT and settles DeSo royalties.")
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error && error.message === "POPUP_BLOCKED"
        ? "Approval window was blocked. VIA changed nothing."
        : "Bid acceptance could not be prepared. VIA changed nothing.")
    }
  }

  if (!session || received.length === 0) return null

  return (
    <section className="mt-5 rounded-xl border border-zinc-800 bg-black/25 p-4" aria-labelledby="via-received-bids-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Marketplace</p>
      <h2 id="via-received-bids-heading" className="mt-2 text-lg font-semibold">Received bids</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-400">Only bids on editions owned by the active DeSo account are shown here.</p>

      {hasUnlockable ? (
        <p className="mt-3 text-xs text-zinc-500">Accept Bid is protected for unlockable NFTs until receiver-specific unlockable encryption is implemented.</p>
      ) : null}

      <div className="mt-4 grid gap-3">
        {received.map((bid) => {
          const key = `${bid.serialNumber}:${bid.bidderPublicKey}:${bid.bidAmountNanos}`
          const confirmed = confirmedKey === key
          return (
            <div key={key} className="rounded-lg border border-zinc-800 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-zinc-200">Edition #{bid.serialNumber} · {formatDeso(bid.bidAmountNanos)} DESO</p>
                  <p className="mt-1 text-xs text-zinc-500">Bidder {shortKey(bid.bidderPublicKey)}</p>
                </div>
                {!hasUnlockable ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (!confirmed) {
                        setConfirmedKey(key)
                        setMessage("Press Accept bid again to prepare this exact on-chain sale.")
                      } else {
                        void acceptBid(bid)
                      }
                    }}
                    disabled={status === "preparing" || status === "approval" || status === "submitting"}
                    className="rounded-lg border border-green-800 px-3 py-2 text-xs font-semibold text-green-300 disabled:text-zinc-600"
                  >
                    {confirmed ? "Confirm accept bid" : "Accept bid"}
                  </button>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      {message ? <p className={"mt-3 text-xs " + (status === "error" ? "text-amber-300" : status === "done" ? "text-green-300" : "text-zinc-500")} role="status">{message}</p> : null}
    </section>
  )
}
