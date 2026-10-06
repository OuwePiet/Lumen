"use client"

import { useEffect, useMemo, useState } from "react"
import { viaModernIdentity, type ViaModernIdentityUser } from "./deso-identity-modern"

type SaleEdition = {
  serialNumber: number
  minBidAmountNanos?: number
  buyNowPriceNanos?: number
  isBuyNow?: boolean
  ownerPublicKey?: string
}

type Props = {
  postHash: string
  editions: SaleEdition[]
}

type PrepareResponse = { ok?: boolean; transactionHex?: string; feeNanos?: number | null; spendAmountNanos?: number | null; error?: string }

function desoToSafeNanos(input: string) {
  const trimmed = input.trim()
  if (!/^\d+(?:\.\d{0,9})?$/.test(trimmed)) return null
  const [whole, fraction = ""] = trimmed.split(".")
  const nanos = BigInt(whole) * BigInt(1_000_000_000) + BigInt((fraction + "000000000").slice(0, 9))
  if (nanos <= BigInt(0) || nanos > BigInt(Number.MAX_SAFE_INTEGER)) return null
  return Number(nanos)
}

function formatDeso(nanos?: number) {
  if (typeof nanos !== "number" || !Number.isFinite(nanos)) return "—"
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 9 }).format(nanos / 1_000_000_000)
}

export default function NFTBidControl({ postHash, editions }: Props) {
  const [session, setSession] = useState<ViaModernIdentityUser | null>(null)
  const [serialNumber, setSerialNumber] = useState(editions[0]?.serialNumber ?? 1)
  const [amount, setAmount] = useState("")
  const [confirmed, setConfirmed] = useState(false)
  const [status, setStatus] = useState<"idle"|"preparing"|"approval"|"submitting"|"done"|"error">("idle")
  const [message, setMessage] = useState("")
  const [feeNanos, setFeeNanos] = useState<number | null>(null)

  const edition = useMemo(() => editions.find((item) => item.serialNumber === serialNumber) ?? editions[0], [editions, serialNumber])
  const bidNanos = desoToSafeNanos(amount)
  const minBid = edition?.minBidAmountNanos ?? 0
  const amountValid = typeof bidNanos === "number" && bidNanos >= minBid
  const isOwner = Boolean(session && edition?.ownerPublicKey === session.publicKey)
  const canBuyNow = Boolean(edition?.isBuyNow && typeof edition?.buyNowPriceNanos === "number" && edition.buyNowPriceNanos > 0)
  const busy = status === "preparing" || status === "approval" || status === "submitting"

  useEffect(() => {
    void viaModernIdentity.currentUser().then(setSession)
    return viaModernIdentity.subscribe(setSession)
  }, [])

  async function prepare(forBuyNow = false) {
    const effectiveBidNanos = forBuyNow && canBuyNow ? edition?.buyNowPriceNanos ?? null : bidNanos
    if (!session || !edition || typeof effectiveBidNanos !== "number" || effectiveBidNanos <= 0 || !confirmed || isOwner || busy) return
    if (!forBuyNow && !amountValid) return
    setStatus("preparing")
    setMessage("Preparing the exact DeSo NFT bid transaction…")
    setFeeNanos(null)
    try {
      const response = await fetch("/api/via/nft/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          action: "prepare",
          publicKey: session.publicKey,
          postHash,
          serialNumber: edition.serialNumber,
          bidAmountNanos: effectiveBidNanos,
        }),
      })
      const data = await response.json() as PrepareResponse
      if (!response.ok || !data.ok || !data.transactionHex) throw new Error(data.error || "PREPARE_FAILED")
      setFeeNanos(typeof data.feeNanos === "number" ? data.feeNanos : null)
      setStatus("approval")
      setMessage(forBuyNow ? "Signing the exact Buy Now purchase with DeSo Identity…" : "Signing the exact NFT bid with DeSo Identity…")
      const signedTransactionHex = await viaModernIdentity.signTx(data.transactionHex)
      setStatus("submitting")
      setMessage("Submitting the approved NFT bid to DeSo…")
      const submitResponse = await fetch("/api/via/nft/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ action: "submit", signedTransactionHex }),
      })
      const submitData = await submitResponse.json() as { ok?: boolean; error?: string }
      if (!submitResponse.ok || !submitData.ok) throw new Error(submitData.error || "SUBMIT_FAILED")
      setStatus("done")
      setMessage(forBuyNow ? "Buy Now purchase submitted to DeSo." : "NFT bid submitted to DeSo.")
      setConfirmed(false)
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error && error.message === "POPUP_BLOCKED"
        ? "Approval window was blocked. No bid was placed."
        : "The NFT bid transaction could not be prepared. No bid was placed.")
    }
  }

  if (editions.length === 0) return null

  return (
    <section className="mt-5 rounded-xl border border-[#285f40]/50 bg-black/30 p-4" aria-labelledby="via-nft-bid-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">Controlled DeSo NFT action</p>
      <h2 id="via-nft-bid-heading" className="mt-2 text-lg font-semibold">Place a bid</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-400">This creates a native DeSo NFT bid. VIA never signs or submits it without your DeSo Identity approval.</p>
      {!session ? <p className="mt-3 text-sm text-zinc-500">Connect through DeSo Identity on VIA before bidding.</p> : <>
        <label className="mt-4 block text-sm text-zinc-300">Edition
          <select value={serialNumber} onChange={(event) => { setSerialNumber(Number(event.target.value)); setConfirmed(false) }} className="mt-2 block w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm">
            {editions.map((item) => <option key={item.serialNumber} value={item.serialNumber}>#${item.serialNumber} · min ${formatDeso(item.minBidAmountNanos)} DESO${typeof item.buyNowPriceNanos === "number" ? ` · buy now ${formatDeso(item.buyNowPriceNanos)} DESO` : ""}</option>)}
          </select>
        </label>
        <label className="mt-3 block text-sm text-zinc-300">Bid amount in DESO
          <input value={amount} onChange={(event) => { setAmount(event.target.value); setConfirmed(false) }} inputMode="decimal" placeholder={minBid ? formatDeso(minBid) : "0.01"} className="mt-2 block w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm" />
        </label>
        {isOwner ? <p className="mt-2 text-xs text-amber-300">The active DeSo account owns this edition and cannot bid on itself through VIA.</p> : null}
        {!isOwner && amount && !amountValid ? <p className="mt-2 text-xs text-amber-300">Enter a valid amount of at least {formatDeso(minBid)} DESO.</p> : null}
        <label className="mt-3 flex items-start gap-2 text-xs text-amber-200"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />I understand this creates a real on-chain bid that may reserve/spend $DESO according to DeSo rules.</label>
        {feeNanos !== null ? <p className="mt-2 text-xs text-zinc-500">Prepared network fee: {feeNanos.toLocaleString()} nanos.</p> : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => void prepare(false)} disabled={!confirmed || !amountValid || isOwner || busy} className="rounded-lg border border-[#8fd4a9]/55 px-4 py-2 text-sm font-semibold text-[#9adbb2] disabled:border-zinc-800 disabled:text-zinc-600">
            {status === "preparing" ? "Preparing…" : status === "approval" ? "Review in DeSo…" : status === "submitting" ? "Submitting…" : "Review bid in DeSo"}
          </button>
          {canBuyNow ? <button type="button" onClick={() => void prepare(true)} disabled={!confirmed || isOwner || busy} className="rounded-lg border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-300 disabled:border-zinc-800 disabled:text-zinc-600">Buy now · {formatDeso(edition?.buyNowPriceNanos)} DESO</button> : null}
        </div>
        {message ? <p className={"mt-3 text-xs " + (status === "error" ? "text-amber-300" : status === "done" ? "text-[#9adbb2]" : "text-zinc-500")} role="status">{message}</p> : null}
      </>}
    </section>
  )
}
