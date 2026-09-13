"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { DESO_IDENTITY_ORIGIN, restoreIdentitySession, VIA_IDENTITY_EVENT, type ViaIdentitySession } from "./deso-identity-session"

type OwnerEdition = {
  serialNumber: number
  isForSale: boolean
  ownerPublicKey?: string
  minBidAmountNanos?: number
  isBuyNow?: boolean
  buyNowPriceNanos?: number
}

type Props = {
  postHash: string
  editions: OwnerEdition[]
  hasUnlockable: boolean
}

type PrepareResponse = {
  ok?: boolean
  transactionHex?: string
  feeNanos?: number | null
  error?: string
}

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
  if (nanos < BigInt(0) || nanos > BigInt(Number.MAX_SAFE_INTEGER)) return null
  return Number(nanos)
}

function formatDeso(nanos?: number) {
  if (typeof nanos !== "number" || !Number.isFinite(nanos)) return "0"
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 9 }).format(nanos / 1_000_000_000)
}

export default function NFTOwnerSaleControl({ postHash, editions, hasUnlockable }: Props) {
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const owned = useMemo(() => editions.filter((item) => session && item.ownerPublicKey === session.publicKey), [editions, session])
  const [serialNumber, setSerialNumber] = useState<number | null>(null)
  const [minBid, setMinBid] = useState("0")
  const [buyNowEnabled, setBuyNowEnabled] = useState(false)
  const [buyNowPrice, setBuyNowPrice] = useState("0")
  const [confirmed, setConfirmed] = useState(false)
  const [status, setStatus] = useState<"idle"|"preparing"|"approval"|"submitting"|"done"|"error">("idle")
  const [message, setMessage] = useState("")
  const [feeNanos, setFeeNanos] = useState<number | null>(null)
  const popupRef = useRef<Window | null>(null)
  const pendingMode = useRef<"list"|"remove"|null>(null)

  const selected = owned.find((item) => item.serialNumber === serialNumber) ?? owned[0]

  useEffect(() => {
    setSession(restoreIdentitySession())
    const onSession = (event: Event) => setSession((event as CustomEvent<ViaIdentitySession | null>).detail ?? restoreIdentitySession())
    window.addEventListener(VIA_IDENTITY_EVENT, onSession)
    return () => window.removeEventListener(VIA_IDENTITY_EVENT, onSession)
  }, [])

  useEffect(() => {
    if (!selected) return
    setSerialNumber(selected.serialNumber)
    setMinBid(formatDeso(selected.minBidAmountNanos))
    setBuyNowEnabled(Boolean(selected.isBuyNow && !hasUnlockable))
    setBuyNowPrice(formatDeso(selected.buyNowPriceNanos))
    setConfirmed(false)
  }, [selected?.serialNumber, selected?.isForSale, selected?.minBidAmountNanos, selected?.isBuyNow, selected?.buyNowPriceNanos, hasUnlockable])

  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      const signedTransactionHex = signedTransactionFromMessage(event, popupRef.current)
      if (!signedTransactionHex) return
      popupRef.current?.close()
      popupRef.current = null
      setStatus("submitting")
      setMessage("Submitting the approved NFT sale update to DeSo…")
      try {
        const response = await fetch("/api/via/nft/update-sale", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ action: "submit", signedTransactionHex }),
        })
        const data = await response.json() as { ok?: boolean; error?: string }
        if (!response.ok || !data.ok) throw new Error(data.error || "SUBMIT_FAILED")
        setStatus("done")
        setMessage(pendingMode.current === "remove" ? "NFT removed from sale on DeSo." : "NFT listed for sale on DeSo.")
        setConfirmed(false)
      } catch {
        setStatus("error")
        setMessage("The NFT sale update could not be submitted. VIA changed nothing.")
      } finally {
        pendingMode.current = null
      }
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [])

  async function prepare(mode: "list" | "remove") {
    if (!session || !selected || !confirmed || status === "preparing" || status === "approval" || status === "submitting") return

    const minBidNanos = mode === "remove" ? 0 : desoToSafeNanos(minBid)
    const buyNowNanos = mode === "remove" || !buyNowEnabled ? 0 : desoToSafeNanos(buyNowPrice)

    if (mode === "list" && minBidNanos === null) {
      setStatus("error")
      setMessage("Enter a valid minimum bid in DESO.")
      return
    }
    if (mode === "list" && buyNowEnabled && (buyNowNanos === null || buyNowNanos < (minBidNanos ?? 0))) {
      setStatus("error")
      setMessage("Buy Now must be at least the minimum bid.")
      return
    }

    setStatus("preparing")
    setMessage(mode === "remove" ? "Preparing removal from sale…" : "Preparing the NFT sale listing…")
    setFeeNanos(null)
    pendingMode.current = mode

    try {
      const response = await fetch("/api/via/nft/update-sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          action: "prepare",
          publicKey: session.publicKey,
          postHash,
          serialNumber: selected.serialNumber,
          isForSale: mode === "list",
          minBidAmountNanos: mode === "remove" ? 0 : minBidNanos,
          isBuyNow: mode === "list" && buyNowEnabled,
          buyNowPriceNanos: mode === "remove" || !buyNowEnabled ? 0 : buyNowNanos,
        }),
      })
      const data = await response.json() as PrepareResponse
      if (!response.ok || !data.ok || !data.transactionHex) throw new Error(data.error || "PREPARE_FAILED")
      setFeeNanos(typeof data.feeNanos === "number" ? data.feeNanos : null)
      const popup = window.open(
        ${DESO_IDENTITY_ORIGIN}/approve?tx=${encodeURIComponent(data.transactionHex)},
        "via-deso-nft-sale-approve",
        "popup=yes,width=800,height=900",
      )
      if (!popup) throw new Error("POPUP_BLOCKED")
      popupRef.current = popup
      setStatus("approval")
      setMessage("Review this NFT sale change in DeSo Identity. VIA submits only after your approval.")
    } catch (error) {
      pendingMode.current = null
      setStatus("error")
      setMessage(error instanceof Error && error.message === "POPUP_BLOCKED"
        ? "Approval window was blocked. VIA changed nothing."
        : "The NFT sale change could not be prepared. VIA changed nothing.")
    }
  }

  if (!session || owned.length === 0) return null

  const busy = status === "preparing" || status === "approval" || status === "submitting"

  return (
    <section className="mt-5 rounded-xl border border-zinc-800 bg-black/25 p-4" aria-labelledby="via-nft-owner-sale-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Owner control</p>
      <h2 id="via-nft-owner-sale-heading" className="mt-2 text-lg font-semibold">Manage sale</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-400">Only editions owned by the active DeSo account appear here. DeSo itself verifies ownership again when constructing and processing the transaction.</p>

      <label className="mt-4 block text-sm text-zinc-300">Owned edition
        <select value={selected?.serialNumber ?? ""} onChange={(event) => setSerialNumber(Number(event.target.value))} className="mt-2 block w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm">
          {owned.map((item) => <option key={item.serialNumber} value={item.serialNumber}>#{item.serialNumber} · {item.isForSale ? "for sale" : "not for sale"}</option>)}
        </select>
      </label>

      {!selected?.isForSale ? <>
        <label className="mt-3 block text-sm text-zinc-300">Minimum bid in DESO
          <input value={minBid} onChange={(event) => { setMinBid(event.target.value); setConfirmed(false) }} inputMode="decimal" className="mt-2 block w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm" />
        </label>
        {!hasUnlockable ? <label className="mt-3 flex items-center gap-2 text-sm text-zinc-300"><input type="checkbox" checked={buyNowEnabled} onChange={(event) => { setBuyNowEnabled(event.target.checked); setConfirmed(false) }} />Enable native DeSo Buy Now</label> : <p className="mt-3 text-xs text-zinc-500">Buy Now is unavailable for unlockable NFTs under DeSo rules.</p>}
        {buyNowEnabled && !hasUnlockable ? <label className="mt-3 block text-sm text-zinc-300">Buy Now price in DESO
          <input value={buyNowPrice} onChange={(event) => { setBuyNowPrice(event.target.value); setConfirmed(false) }} inputMode="decimal" className="mt-2 block w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm" />
        </label> : null}
      </> : <p className="mt-3 text-sm text-zinc-400">This edition is currently listed. Removing it from sale also clears outstanding bids according to DeSo rules.</p>}

      <label className="mt-3 flex items-start gap-2 text-xs text-amber-200"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />I understand this is a real on-chain NFT sale-status transaction.</label>
      {feeNanos !== null ? <p className="mt-2 text-xs text-zinc-500">Prepared network fee: {feeNanos.toLocaleString()} nanos.</p> : null}
      <button type="button" disabled={!confirmed || busy} onClick={() => void prepare(selected?.isForSale ? "remove" : "list")} className="mt-3 rounded-lg border border-green-700 px-4 py-2 text-sm font-semibold text-green-300 disabled:border-zinc-800 disabled:text-zinc-600">
        {status === "preparing" ? "Preparing…" : status === "approval" ? "Review in DeSo…" : status === "submitting" ? "Submitting…" : selected?.isForSale ? "Remove from sale" : "List for sale"}
      </button>
      {message ? <p className={"mt-3 text-xs " + (status === "error" ? "text-amber-300" : status === "done" ? "text-green-300" : "text-zinc-500")} role="status">{message}</p> : null}
    </section>
  )
}
