"use client"

import { useEffect, useMemo, useState } from "react"
import { viaModernIdentity, type ViaModernIdentityUser } from "./deso-identity-modern"
import { useNFTAction } from "./use-nft-action"

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

function formatDeso(nanos: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 9 }).format(nanos / 1_000_000_000)
}

function shortKey(key: string) {
  return key.length > 22 ? `${key.slice(0, 10)}…${key.slice(-8)}` : key
}

export default function NFTReceivedBids({ postHash, bids, editions, hasUnlockable }: Props) {
  const [session, setSession] = useState<ViaModernIdentityUser | null>(null)
  const [confirmationValue, setConfirmationValue] = useState<string | null>(null)
  const [confirmationAccount, setConfirmationAccount] = useState<string | null>(null)
  const confirmedKey = confirmationAccount === session?.publicKey ? confirmationValue : null
  function setConfirmedKey(value: string | null) { setConfirmationValue(value); setConfirmationAccount(value === null ? null : session?.publicKey ?? null) }
  const [status, setStatus] = useState<"idle"|"preparing"|"approval"|"submitting"|"done"|"error">("idle")
  const [message, setMessage] = useState("")
  const actionRunner = useNFTAction()

  useEffect(() => {
    return viaModernIdentity.subscribe(setSession)
  }, [])

  const ownedSerials = useMemo(
    () => new Set(editions.filter((edition) => session && edition.ownerPublicKey === session.publicKey).map((edition) => edition.serialNumber)),
    [editions, session],
  )

  const received = useMemo(
    () => bids.filter((bid) => ownedSerials.has(bid.serialNumber)).sort((a, b) => b.bidAmountNanos - a.bidAmountNanos),
    [bids, ownedSerials],
  )

  useEffect(() => { setConfirmedKey(null); actionRunner.current?.invalidate() }, [session?.publicKey])

  async function acceptBid(bid: Bid) {
    if (!session || hasUnlockable || !actionRunner.current || !ownedSerials.has(bid.serialNumber)) return
    const key = `${bid.serialNumber}:${bid.bidderPublicKey}:${bid.bidAmountNanos}`
    if (confirmedKey !== key) return
    const result = await actionRunner.current.run({ kind: "accept-bid", publicKey: session.publicKey, postHash, serialNumber: bid.serialNumber, body: { ownerPublicKey: session.publicKey, bidderPublicKey: bid.bidderPublicKey, postHash, serialNumber: bid.serialNumber, bidAmountNanos: bid.bidAmountNanos, hasUnlockable } }, (value, text) => { setStatus(value); setMessage(text) })
    if (result.outcome !== "stopped") setConfirmedKey(null)
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
                    className="rounded-lg border border-[#285f40] px-3 py-2 text-xs font-semibold text-[#9adbb2] disabled:text-zinc-600"
                  >
                    {confirmed ? "Confirm accept bid" : "Accept bid"}
                  </button>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      {message ? <p className={"mt-3 text-xs " + (status === "error" ? "text-amber-300" : status === "done" ? "text-[#9adbb2]" : "text-zinc-500")} role="status">{message}</p> : null}
    </section>
  )
}
