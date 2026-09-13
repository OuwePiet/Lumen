"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { DESO_IDENTITY_ORIGIN, restoreIdentitySession, VIA_IDENTITY_EVENT, type ViaIdentitySession } from "./deso-identity-session"

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
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const [serialNumber, setSerialNumber] = useState(editions[0]?.serialNumber ?? 1)
  const [amount, setAmount] = useState("")
  const [confirmed, setConfirmed] = useState(false)
  const [status, setStatus] = useState<"idle"|"preparing"|"approval"|"submitting"|"done"|"error">("idle")
  const [message, setMessage] = useState("")
  const [feeNanos, setFeeNanos] = useState<number | null>(null)
  const popupRef = useRef<Window | null>(null)

  const edition = useMemo(() => editions.find((item) => item.serialNumber === serialNumber) ?? editions[0], [editions, serialNumber])
  const bidNanos = desoToSafeNanos(amount)
  const minBid = edition?.minBidAmountNanos ?? 0
  const amountValid = typeof bidNanos === "number" && bidNanos >= minBid
  const isOwner = Boolean(session && edition?.ownerPublicKey === session.publicKey)
  const canBuyNow = Boolean(edition?.isBuyNow && typeof edition?.buyNowPriceNanos === "number" && edition.buyNowPriceNanos > 0)
  const busy = status === "preparing" || status === "approval" || status === "submitting"

  useEffect(() => {
    setSession(restoreIdentitySession())
    const onSession = (event: Event) => setSession((event as CustomEvent<ViaIdentitySession | null>).detail ?? restoreIdentitySession())
    window.addEventListener(VIA_IDENTITY_EVENT, onSession)
    return () => window.removeEventListener(VIA_IDENTITY_EVENT, onSession)
  }, [])

  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      const signedTransactionHex = signedTransactionFromMessage(event, popupRef.current)
      if (!signedTransactionHex) return
      popupRef.current?.close()
      popupRef.current = null
      setStatus("submitting")
      setMessage("Submitting the approved NFT bid to DeSo…")
      try {
        const response = await fetch("/api/via/nft/bid", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ action: "submit", signedTransactionHex }),
        })
        const data = await response.json() as { ok?: boolean; error?: string }
        if (!response.ok || !data.ok) throw new Error(data.error || "SUBMIT_FAILED")
        setStatus("done")
        setMessage("NFT bid submitted to DeSo.")
        setConfirmed(false)
      } catch {
        setStatus("error")
        setMessage("The approved NFT bid could not be submitted. VIA did not place a bid.")
      }
    }
    window.addEventListener("message", onMessage)
    return () => {
      window.removeEventListener("message", onMessage)
      popupRef.current?.close()
      popupRef.current = null
    }
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
      const popup = window.open(
        `${DESO_IDENTITY_ORIGIN}/approve?tx=${encodeURIComponent(data.transactionHex)}`,
        "via-deso-nft-bid-approve",
        "popup=yes,width=800,height=900",
      )
      if (!popup) throw new Error("POPUP_BLOCKED")
      popupRef.current = popup
      setStatus("approval")
      setMessage(forBuyNow ? "Review the exact Buy Now purchase in DeSo Identity. DeSo executes Buy Now when the bid meets the listed Buy Now price." : "Review the exact NFT bid and spend in DeSo Identity. VIA will submit only after your approval.")
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error && error.message === "POPUP_BLOCKED"
        ? "Approval window was blocked. No bid was placed."
        : "The NFT bid transaction could not be prepared. No bid was placed.")
    }
  }

  if (editions.length === 0) return null

  return (
    <section className="mt-5 rounded-xl border border-green-900/50 bg-black/30 p-4" aria-labelledby="via-nft-bid-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-400">Controlled DeSo NFT action</p>
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
          <button type="button" onClick={() => void prepare(false)} disabled={!confirmed || !amountValid || isOwner || busy} className="rounded-lg border border-green-700 px-4 py-2 text-sm font-semibold text-green-300 disabled:border-zinc-800 disabled:text-zinc-600">
            {status === "preparing" ? "Preparing…" : status === "approval" ? "Review in DeSo…" : status === "submitting" ? "Submitting…" : "Review bid in DeSo"}
          </button>
          {canBuyNow ? <button type="button" onClick={() => void prepare(true)} disabled={!confirmed || isOwner || busy} className="rounded-lg border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-300 disabled:border-zinc-800 disabled:text-zinc-600">Buy now · {formatDeso(edition?.buyNowPriceNanos)} DESO</button> : null}
        </div>
        {message ? <p className={"mt-3 text-xs " + (status === "error" ? "text-amber-300" : status === "done" ? "text-green-300" : "text-zinc-500")} role="status">{message}</p> : null}
      </>}
    </section>
  )
}
