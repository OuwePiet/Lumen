"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { restoreIdentitySession, VIA_IDENTITY_EVENT, type ViaIdentitySession } from "../deso-identity-session"

type MintQuote = {
  resolved?: boolean
  reason?: string
  quotedAt?: string
  quoteId?: string
  expiresAt?: string
  quote?: {
    feeNanos?: number | null
    spendAmountNanos?: number | null
    totalInputNanos?: number | null
    changeAmountNanos?: number | null
    viaServiceFeeNanos?: number | null
  }
  mintAuthorized?: boolean
  mint?: { updaterPublicKey?: string }
}

const field = "w-full rounded-[11px] border border-zinc-700/80 bg-[#050807] px-3 py-3 text-base text-zinc-100 outline-none focus:border-[#8fd4a9]/55 focus:ring-2 focus:ring-[#8fd4a9]/10"
const check = "h-4 w-4 accent-green-500"

function nanos(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? `${value.toLocaleString()} nanos` : "Not returned"
}

export default function MintPreflight() {
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const [postHash, setPostHash] = useState("")
  const [copies, setCopies] = useState("1")
  const [forSale, setForSale] = useState(false)
  const [buyNow, setBuyNow] = useState(false)
  const [minBid, setMinBid] = useState("0")
  const [buyNowPrice, setBuyNowPrice] = useState("0")
  const [creatorRoyalty, setCreatorRoyalty] = useState("0")
  const [coinRoyalty, setCoinRoyalty] = useState("0")
  const [unlockable, setUnlockable] = useState(false)
  const [loading, setLoading] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const [result, setResult] = useState<MintQuote | null>(null)
  const [quotedPublicKey, setQuotedPublicKey] = useState("")
  const [message, setMessage] = useState("Enter mint terms to request a fresh DeSo constructor quote.")

  useEffect(() => {
    setSession(restoreIdentitySession())
    const onSession = (event: Event) => setSession((event as CustomEvent<ViaIdentitySession | null>).detail ?? restoreIdentitySession())
    window.addEventListener(VIA_IDENTITY_EVENT, onSession)
    return () => window.removeEventListener(VIA_IDENTITY_EVENT, onSession)
  }, [])

  useEffect(() => {
    setResult(null)
    setQuotedPublicKey("")
    setMessage("Terms changed. Refresh the DeSo quote before any later approval.")
  }, [postHash, copies, forSale, buyNow, minBid, buyNowPrice, creatorRoyalty, coinRoyalty, unlockable])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const quoteSessionMismatch = Boolean(result?.resolved && quotedPublicKey && session?.publicKey !== quotedPublicKey)
  const quoteExpiresAt = result?.expiresAt ? Date.parse(result.expiresAt) : Number.NaN
  const quoteExpired = Boolean(result?.resolved && (!Number.isFinite(quoteExpiresAt) || now >= quoteExpiresAt))
  const quoteSecondsLeft = quoteExpired || !Number.isFinite(quoteExpiresAt) ? 0 : Math.max(0, Math.ceil((quoteExpiresAt - now) / 1000))

  const valid = useMemo(() => {
    const ints = [copies, minBid, buyNowPrice, creatorRoyalty, coinRoyalty].map(Number)
    return Boolean(session && /^[0-9a-fA-F]{64}$/.test(postHash.trim()) && ints.every(Number.isSafeInteger) && ints.every((n) => n >= 0) && Number(copies) >= 1 && Number(copies) <= 10000 && Number(creatorRoyalty) + Number(coinRoyalty) <= 10000 && (!buyNow || (forSale && Number(buyNowPrice) > 0 && !unlockable)))
  }, [session, postHash, copies, minBid, buyNowPrice, creatorRoyalty, coinRoyalty, buyNow, forSale, unlockable])

  async function runPreflight(event: FormEvent) {
    event.preventDefault()
    if (!valid || !session) return
    setLoading(true); setResult(null); setMessage("Requesting current DeSo mint fee and spend context…")
    try {
      const response = await fetch("/api/via/mint/preflight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updaterPublicKey: session.publicKey,
          nftPostHashHex: postHash.trim(),
          numCopies: Number(copies),
          hasUnlockable: unlockable,
          isForSale: forSale,
          minBidAmountNanos: forSale ? Number(minBid) : 0,
          creatorRoyaltyBasisPoints: Number(creatorRoyalty),
          coinRoyaltyBasisPoints: Number(coinRoyalty),
          isBuyNow: forSale && buyNow,
          buyNowPriceNanos: forSale && buyNow ? Number(buyNowPrice) : 0,
        }),
      })
      const data: MintQuote = await response.json().catch(() => ({}))
      setResult(data)
      setQuotedPublicKey(response.ok && data.resolved ? session.publicKey : "")
      setMessage(response.ok && data.resolved ? "Fresh unsigned DeSo mint quote loaded. Nothing has been signed or submitted." : `Preflight stopped: ${data.reason ?? "quote unavailable"}.`)
    } catch {
      setMessage("Preflight stopped: current DeSo quote could not be loaded.")
    } finally { setLoading(false) }
  }

  return (
    <section className="mb-4 rounded-[14px] border border-zinc-800/80 bg-zinc-950/55 p-5 sm:p-6" aria-labelledby="mint-preflight-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">NFT mint preflight</p><h2 id="mint-preflight-heading" className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100">Set terms. Check live cost. Approve later.</h2><p className="mt-3 text-sm leading-6 text-zinc-400">VIA uses DeSo's native create-nft constructor. This visible step only prepares an unsigned transaction to read the current fee/spend context; it cannot sign, broadcast, charge or mint.</p></div>
        <span className="rounded-[9px] border border-[#8fd4a9]/30 bg-[#0c1711]/40 px-3 py-2 text-xs font-semibold text-[#8fd4a9]">No blockchain write</span>
      </div>

      {!session ? <p className="mt-5 rounded-[11px] border border-amber-900/50 bg-amber-950/15 px-4 py-3 text-sm text-amber-100/80">Log in with DeSo Identity first. VIA will use only the active public key for this preflight.</p> : <p className="mt-5 text-xs text-zinc-500">Active DeSo Identity: <span className="break-all text-zinc-300">{session.publicKey}</span></p>}

      <form onSubmit={runPreflight} className="mt-5 grid gap-4">
        <label className="grid gap-2"><span className="text-sm font-semibold text-zinc-200">NFT post hash</span><input className={field} value={postHash} onChange={(e)=>setPostHash(e.target.value)} maxLength={64} autoCapitalize="none" autoCorrect="off" placeholder="64-character DeSo post hash"/></label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="grid gap-2"><span className="text-sm font-semibold text-zinc-200">Copies</span><input className={field} type="number" min="1" max="10000" step="1" value={copies} onChange={(e)=>setCopies(e.target.value)}/></label>
          <label className="grid gap-2"><span className="text-sm font-semibold text-zinc-200">Creator royalty (basis points)</span><input className={field} type="number" min="0" max="10000" step="1" value={creatorRoyalty} onChange={(e)=>setCreatorRoyalty(e.target.value)}/></label>
          <label className="grid gap-2"><span className="text-sm font-semibold text-zinc-200">Coin royalty (basis points)</span><input className={field} type="number" min="0" max="10000" step="1" value={coinRoyalty} onChange={(e)=>setCoinRoyalty(e.target.value)}/></label>
        </div>
        <div className="flex flex-wrap gap-5 rounded-[11px] border border-zinc-800/80 bg-black/20 p-4 text-sm text-zinc-300">
          <label className="flex items-center gap-2"><input className={check} type="checkbox" checked={forSale} onChange={(e)=>{setForSale(e.target.checked); if(!e.target.checked)setBuyNow(false)}}/>Offer for sale</label>
          <label className="flex items-center gap-2"><input className={check} type="checkbox" checked={buyNow} disabled={!forSale || unlockable} onChange={(e)=>setBuyNow(e.target.checked)}/>Buy Now</label>
          <label className="flex items-center gap-2"><input className={check} type="checkbox" checked={unlockable} onChange={(e)=>{setUnlockable(e.target.checked); if(e.target.checked)setBuyNow(false)}}/>Has unlockable</label>
        </div>
        {forSale ? <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2"><span className="text-sm font-semibold text-zinc-200">Minimum bid (nanos)</span><input className={field} type="number" min="0" step="1" value={minBid} onChange={(e)=>setMinBid(e.target.value)}/></label>{buyNow?<label className="grid gap-2"><span className="text-sm font-semibold text-zinc-200">Buy Now price (nanos)</span><input className={field} type="number" min="1" step="1" value={buyNowPrice} onChange={(e)=>setBuyNowPrice(e.target.value)}/></label>:null}</div> : null}

        <button type="submit" disabled={!valid || loading} className="min-h-11 w-fit rounded-[11px] border border-[#8fd4a9]/45 px-4 py-2 text-sm font-semibold text-[#9adbb2] disabled:border-zinc-800 disabled:text-zinc-600">{loading ? "Checking current DeSo cost…" : "Check current mint cost"}</button>
        <p className="text-sm leading-6 text-zinc-400" role="status">{message}</p>
      </form>

      {result?.resolved ? <div className="mt-4 grid gap-3 rounded-[12px] border border-zinc-800/80 bg-black/25 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div><p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Network fee</p><p className="mt-1 text-sm text-zinc-200">{nanos(result.quote?.feeNanos)}</p></div>
        <div><p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Spend amount</p><p className="mt-1 text-sm text-zinc-200">{nanos(result.quote?.spendAmountNanos)}</p></div>
        <div><p className="text-xs uppercase tracking-[0.12em] text-zinc-500">VIA service fee</p><p className="mt-1 text-sm text-zinc-200">{nanos(result.quote?.viaServiceFeeNanos)}</p></div>
        <div><p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Quote valid until</p><p className="mt-1 text-sm text-zinc-200">{result.expiresAt ? new Date(result.expiresAt).toLocaleTimeString() : "Unavailable"}{!quoteExpired && quoteSecondsLeft > 0 ? ` · ${Math.floor(quoteSecondsLeft / 60)}:${String(quoteSecondsLeft % 60).padStart(2, "0")} left` : ""}</p></div>
      </div> : null}

      {quoteSessionMismatch ? <div className="mt-4 rounded-[11px] border border-red-900/50 bg-red-950/15 px-4 py-3 text-sm leading-6 text-red-100/80">The active DeSo Identity changed after this quote was created. This quote is no longer valid for approval; request a fresh quote for the active account.</div> : null}\n      {quoteExpired ? <div className="mt-4 rounded-[11px] border border-red-900/50 bg-red-950/15 px-4 py-3 text-sm leading-6 text-red-100/80">This mint quote has expired. Refresh the current DeSo cost before any later approval.</div> : null}\n      <div className="mt-4 rounded-[11px] border border-amber-900/50 bg-amber-950/15 px-4 py-3 text-sm leading-6 text-amber-100/80">Any changed mint term invalidates the displayed quote. Before a future approval/sign step, VIA must refresh current costs again. DESO payment, provider checkout and NFT transfer remain blocked.</div>
      <button type="button" disabled aria-disabled="true" className="mt-4 min-h-11 rounded-[11px] border border-zinc-800 bg-transparent px-4 py-2 text-sm text-zinc-600">Approve &amp; mint — not released</button>
    </section>
  )
}
