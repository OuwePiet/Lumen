"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { restoreIdentitySession, VIA_IDENTITY_EVENT, type ViaIdentitySession } from "../deso-identity-session"

type MintQuote = {
  resolved?: boolean
  reason?: string
  quotedAt?: string
  quoteId?: string
  quotedForPublicKey?: string
  expiresAt?: string
  quote?: {
    feeNanos?: number | null
    spendAmountNanos?: number | null
    totalInputNanos?: number | null
    changeAmountNanos?: number | null
    viaServiceFeeNanos?: number | null
  }
  mintAuthorized?: boolean
  mint?: {
    nftPostHashHex?: string
    numCopies?: number
    hasUnlockable?: boolean
    isForSale?: boolean
    minBidAmountNanos?: number
    creatorRoyaltyBasisPoints?: number
    coinRoyaltyBasisPoints?: number
    isBuyNow?: boolean
    buyNowPriceNanos?: number
  }
}

const field = "w-full rounded-[11px] border border-zinc-700/80 bg-[#050807] px-3 py-3 text-base text-zinc-100 outline-none focus:border-[#8fd4a9]/55 focus:ring-2 focus:ring-[#8fd4a9]/10"
const check = "h-4 w-4 accent-green-500"

function nanos(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? `${value.toLocaleString()} nanos` : "Not returned"
}

function sumKnownNanos(...values: Array<number | null | undefined>) {
  return values.every((value) => typeof value === "number" && Number.isFinite(value)) ? values.reduce<number>((sum, value) => sum + Number(value), 0) : null
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

  const visibleCostBoundaryNanos = result?.resolved ? sumKnownNanos(result.quote?.feeNanos, result.quote?.spendAmountNanos, result.quote?.viaServiceFeeNanos) : null
  const quoteSessionMismatch = Boolean(result?.resolved && quotedPublicKey && session?.publicKey !== quotedPublicKey)
  const quoteExpiresAt = result?.expiresAt ? Date.parse(result.expiresAt) : Number.NaN
  const quoteExpired = Boolean(result?.resolved && (!Number.isFinite(quoteExpiresAt) || now >= quoteExpiresAt))
  const quoteSecondsLeft = quoteExpired || !Number.isFinite(quoteExpiresAt) ? 0 : Math.max(0, Math.ceil((quoteExpiresAt - now) / 1000))
  const quoteUsable = Boolean(result?.resolved && !quoteExpired && !quoteSessionMismatch && quotedPublicKey && quotedPublicKey === session?.publicKey)

  const validationMessage = useMemo(() => {
    if (!session) return "Log in with DeSo Identity to request a mint quote."
    if (!/^[0-9a-fA-F]{64}$/.test(postHash.trim())) return "Enter a valid 64-character DeSo NFT post hash."
    if (!Number.isSafeInteger(Number(copies)) || Number(copies) < 1 || Number(copies) > 10000) return "Copies must be a whole number from 1 to 10,000."
    if (![minBid, buyNowPrice, creatorRoyalty, coinRoyalty].map(Number).every((n) => Number.isSafeInteger(n) && n >= 0)) return "Prices and royalties must be non-negative whole numbers."
    if (Number(creatorRoyalty) + Number(coinRoyalty) > 10000) return "Creator and coin royalties together cannot exceed 100%."
    if (buyNow && (!forSale || Number(buyNowPrice) <= 0 || unlockable)) return "Buy Now requires a sale price above zero and cannot be combined with unlockable content in this flow."
    return ""
  }, [session, postHash, copies, minBid, buyNowPrice, creatorRoyalty, coinRoyalty, buyNow, forSale, unlockable])

  const valid = useMemo(() => {
    const ints = [copies, minBid, buyNowPrice, creatorRoyalty, coinRoyalty].map(Number)
    return Boolean(session && /^[0-9a-fA-F]{64}$/.test(postHash.trim()) && ints.every(Number.isSafeInteger) && ints.every((n) => n >= 0) && Number(copies) >= 1 && Number(copies) <= 10000 && Number(creatorRoyalty) + Number(coinRoyalty) <= 10000 && (!buyNow || (forSale && Number(buyNowPrice) > 0 && !unlockable)))
  }, [session, postHash, copies, minBid, buyNowPrice, creatorRoyalty, coinRoyalty, buyNow, forSale, unlockable])

  async function requestPreflight() {
    if (!valid || !session) return
    setLoading(true); setResult(null); setMessage("Requesting current DeSo mint fee and spend context…")
    try {
      const response = await fetch("/api/via/mint/preflight", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        cache: "no-store",
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
      setQuotedPublicKey(response.ok && data.resolved && data.quotedForPublicKey === session.publicKey ? data.quotedForPublicKey : "")
      setMessage(response.ok && data.resolved && data.quotedForPublicKey === session.publicKey ? "Fresh unsigned DeSo mint quote loaded. Nothing has been signed or submitted." : response.ok && data.resolved ? "Preflight stopped: quote account did not match the active DeSo Identity." : `Preflight stopped: ${data.reason ?? "quote unavailable"}.`)
    } catch {
      setMessage("Preflight stopped: current DeSo quote could not be loaded.")
    } finally { setLoading(false) }
  }

  function resetPreflight() {
    setResult(null)
    setQuotedPublicKey("")
    setMessage("Mint quote cleared. Enter or confirm terms, then request a fresh DeSo quote.")
  }

  async function runPreflight(event: FormEvent) {
    event.preventDefault()
    await requestPreflight()
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
          <label className="grid gap-2"><span className="text-sm font-semibold text-zinc-200">Creator royalty</span><span className="text-xs text-zinc-500">100 basis points = 1%. Creator + coin royalty may not exceed 100%.</span><input className={field} type="number" min="0" max="10000" step="1" value={creatorRoyalty} onChange={(e)=>setCreatorRoyalty(e.target.value)}/></label>
          <label className="grid gap-2"><span className="text-sm font-semibold text-zinc-200">Coin royalty</span><span className="text-xs text-zinc-500">Optional creator-coin royalty, entered in basis points.</span><input className={field} type="number" min="0" max="10000" step="1" value={coinRoyalty} onChange={(e)=>setCoinRoyalty(e.target.value)}/></label>
        </div>
        <div className="flex flex-wrap gap-5 rounded-[11px] border border-zinc-800/80 bg-black/20 p-4 text-sm text-zinc-300">
          <label className="flex items-center gap-2"><input className={check} type="checkbox" checked={forSale} onChange={(e)=>{setForSale(e.target.checked); if(!e.target.checked)setBuyNow(false)}}/>Offer for sale</label>
          <label className="flex items-center gap-2"><input className={check} type="checkbox" checked={buyNow} disabled={!forSale || unlockable} onChange={(e)=>setBuyNow(e.target.checked)}/>Buy Now</label>
          <label className="flex items-center gap-2"><input className={check} type="checkbox" checked={unlockable} onChange={(e)=>{setUnlockable(e.target.checked); if(e.target.checked)setBuyNow(false)}}/>Has unlockable</label>
        </div>
        {forSale ? <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2"><span className="text-sm font-semibold text-zinc-200">Minimum bid</span><span className="text-xs text-zinc-500">DeSo nanos; 1 DESO = 1,000,000,000 nanos. No fiat conversion is assumed here.</span><input className={field} type="number" min="0" step="1" value={minBid} onChange={(e)=>setMinBid(e.target.value)}/></label>{buyNow?<label className="grid gap-2"><span className="text-sm font-semibold text-zinc-200">Buy Now price</span><span className="text-xs text-zinc-500">DeSo nanos; VIA does not treat this as an EUR/USD checkout price.</span><input className={field} type="number" min="1" step="1" value={buyNowPrice} onChange={(e)=>setBuyNowPrice(e.target.value)}/></label>:null}</div> : null}

        {validationMessage ? <p className="rounded-[10px] border border-zinc-800/80 bg-black/20 px-3 py-2 text-xs leading-5 text-zinc-500">{validationMessage}</p> : null}\n        <button type="submit" disabled={!valid || loading} className="min-h-11 w-fit rounded-[11px] border border-[#8fd4a9]/45 px-4 py-2 text-sm font-semibold text-[#9adbb2] disabled:border-zinc-800 disabled:text-zinc-600">{loading ? "Checking current DeSo cost…" : "Check current mint cost"}</button>
        <p className="text-sm leading-6 text-zinc-400" role="status">{message}</p>
      </form>

      {result?.resolved ? <div className="mt-4 rounded-[12px] border border-zinc-800/80 bg-black/25 p-4"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">Preflight status</p><span className={`rounded-full border px-3 py-1 text-xs font-semibold ${quoteUsable ? "border-[#8fd4a9]/35 text-[#9adbb2]" : "border-red-900/60 text-red-200"}`}>{quoteUsable ? "Fresh · account matched" : "Not approval-ready"}</span></div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8fd4a9]">Mint terms confirmed by DeSo preflight</p><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div><p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Copies</p><p className="mt-1 text-sm text-zinc-200">{result.mint?.numCopies ?? "—"}</p></div><div><p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Sale</p><p className="mt-1 text-sm text-zinc-200">{result.mint?.isForSale ? (result.mint?.isBuyNow ? "Buy Now" : "Auction / bids") : "Not for sale"}</p></div><div><p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Creator royalty</p><p className="mt-1 text-sm text-zinc-200">{typeof result.mint?.creatorRoyaltyBasisPoints === "number" ? `${(result.mint.creatorRoyaltyBasisPoints / 100).toFixed(2)}%` : "—"}</p></div><div><p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Unlockable</p><p className="mt-1 text-sm text-zinc-200">{result.mint?.hasUnlockable ? "Yes" : "No"}</p></div><div><p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Coin royalty</p><p className="mt-1 text-sm text-zinc-200">{typeof result.mint?.coinRoyaltyBasisPoints === "number" ? `${(result.mint.coinRoyaltyBasisPoints / 100).toFixed(2)}%` : "—"}</p></div><div><p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Minimum bid</p><p className="mt-1 text-sm text-zinc-200">{result.mint?.isForSale ? nanos(result.mint?.minBidAmountNanos) : "Not applicable"}</p></div><div><p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Buy Now price</p><p className="mt-1 text-sm text-zinc-200">{result.mint?.isBuyNow ? nanos(result.mint?.buyNowPriceNanos) : "Not applicable"}</p></div><div><p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Post hash</p><p className="mt-1 break-all text-xs text-zinc-300">{result.mint?.nftPostHashHex ?? "—"}</p></div></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div><p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Network fee</p><p className="mt-1 text-sm text-zinc-200">{nanos(result.quote?.feeNanos)}</p></div>
        <div><p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Spend amount</p><p className="mt-1 text-sm text-zinc-200">{nanos(result.quote?.spendAmountNanos)}</p></div>
        <div><p className="text-xs uppercase tracking-[0.12em] text-zinc-500">VIA service fee</p><p className="mt-1 text-sm text-zinc-200">{nanos(result.quote?.viaServiceFeeNanos)}</p></div><div><p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Visible cost boundary</p><p className="mt-1 text-sm font-semibold text-zinc-100">{nanos(visibleCostBoundaryNanos)}</p><p className="mt-1 text-xs leading-5 text-zinc-500">Network fee + constructor spend + VIA service fee. Storage/provider costs are not included unless separately resolved.</p></div>
        <div><p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Quote valid until</p><p className="mt-1 text-sm text-zinc-200">{result.expiresAt ? new Date(result.expiresAt).toLocaleTimeString() : "Unavailable"}{!quoteExpired && quoteSecondsLeft > 0 ? ` · ${Math.floor(quoteSecondsLeft / 60)}:${String(quoteSecondsLeft % 60).padStart(2, "0")} left` : ""}</p></div><div><p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Quote reference</p><p className="mt-1 break-all font-mono text-xs text-zinc-400">{result.quoteId ?? "Unavailable"}</p></div>
      </div></div> : null}\n\n      {quoteSessionMismatch ? <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[11px] border border-red-900/50 bg-red-950/15 px-4 py-3 text-sm leading-6 text-red-100/80"><span>The active DeSo Identity changed after this quote was created. This quote is no longer valid for approval.</span><button type="button" disabled={!valid || loading} onClick={() => void requestPreflight()} className="rounded-[9px] border border-red-800/60 px-3 py-1.5 text-xs font-semibold text-red-100 disabled:opacity-40">{loading ? "Refreshing…" : "Quote active account"}</button></div> : null}\n      {quoteExpired ? <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[11px] border border-red-900/50 bg-red-950/15 px-4 py-3 text-sm leading-6 text-red-100/80"><span>This mint quote has expired. Refresh the current DeSo cost before any later approval.</span><button type="button" disabled={!valid || loading} onClick={() => void requestPreflight()} className="rounded-[9px] border border-red-800/60 px-3 py-1.5 text-xs font-semibold text-red-100 disabled:opacity-40">{loading ? "Refreshing…" : "Refresh quote"}</button></div> : null}\n      <div className="mt-4 rounded-[11px] border border-amber-900/50 bg-amber-950/15 px-4 py-3 text-sm leading-6 text-amber-100/80">Any changed mint term invalidates the displayed quote. Before a future approval/sign step, VIA must refresh current costs again. DESO payment, provider checkout and NFT transfer remain blocked.</div>
      <div className="mt-4 flex flex-wrap gap-3">{result?.resolved ? <button type="button" onClick={resetPreflight} className="min-h-11 rounded-[11px] border border-zinc-700 px-4 py-2 text-sm text-zinc-300">Clear quote</button> : null}<button type="button" disabled aria-disabled="true" className="min-h-11 rounded-[11px] border border-zinc-800 bg-transparent px-4 py-2 text-sm text-zinc-600">Approve &amp; mint — not released</button></div>
    </section>
  )
}
