"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import type { NFTActionReview } from "./nft-action"

const ReviewContext = createContext<((quote: NFTActionReview) => Promise<boolean>) | null>(null)
const names = { "update-sale": "Verkoop wijzigen", transfer: "NFT overdragen", burn: "NFT definitief burnen", "withdraw-bid": "Bod intrekken", "accept-bid": "Bod accepteren", "accept-transfer": "Overdracht accepteren", mint: "NFT minten", "source-post": "Publieke DeSo-post publiceren", bid: "NFT-bod plaatsen", "buy-now": "NFT direct kopen" }
export function NFTActionReviewProvider({ children }: { children: ReactNode }) {
  const [quote, setQuote] = useState<NFTActionReview | null>(null)
  const resolver = useRef<((confirmed: boolean) => void) | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const finish = useCallback((confirmed: boolean) => {
    const resolve = resolver.current; resolver.current = null; setQuote(null); resolve?.(confirmed)
  }, [])
  const review = useCallback((value: NFTActionReview) => new Promise<boolean>(resolve => {
    if (resolver.current) { resolve(false); return }
    resolver.current = resolve; setQuote(value)
  }), [])
  useEffect(() => {
    if (!quote) return
    dialog.current?.showModal()
    const timer = window.setInterval(() => { if (!quote.isCurrent() || Date.now() >= quote.expiresAt) finish(false) }, 250)
    return () => { window.clearInterval(timer); dialog.current?.close() }
  }, [quote, finish])
  useEffect(() => () => { resolver.current?.(false); resolver.current = null }, [])
  const mint = quote?.body.mint as Record<string, unknown> | undefined
  const details = quote ? [
    ["Actieve publieke sleutel", quote.publicKey], ["NFT / bronpost", quote.postHash], ["Editie", quote.serialNumber],
    ["Ontvanger", quote.body.receiverPublicKey], ["Bieder", quote.body.bidderPublicKey], ["Biedbedrag (nanos)", quote.body.bidAmountNanos],
    ["Te koop", typeof quote.body.isForSale === "boolean" ? quote.body.isForSale ? "Ja" : "Nee" : undefined], ["Minimumbod (nanos)", quote.body.minBidAmountNanos], ["Buy Now-prijs (nanos)", quote.body.buyNowPriceNanos],
    ["Aantal edities", mint?.numCopies], ["Creator royalty (basispunten)", mint?.creatorRoyaltyBasisPoints], ["Coin royalty (basispunten)", mint?.coinRoyaltyBasisPoints],
    ["Publieke post", quote.body.body], ["Netwerkkosten (nanos)", quote.feeNanos], ["Overige constructorbesteding (nanos)", quote.spendNanos], ["Totaal budget (nanos)", quote.feeNanos + quote.spendNanos],
  ].filter(([, value]) => value !== undefined && value !== null) : []
  return <ReviewContext.Provider value={review}>{children}{quote ? <dialog ref={dialog} aria-labelledby="nft-action-review-heading" onCancel={event => { event.preventDefault(); finish(false) }} style={{ width: "min(42rem, calc(100% - 2rem))" }} className="m-auto max-h-[90dvh] overflow-y-auto rounded-2xl border border-[#285f40] bg-[#070d09] p-5 text-zinc-100 backdrop:bg-black/80">
    <h2 id="nft-action-review-heading" className="text-xl font-semibold">Controleer: {names[quote.kind]}</h2>
    <dl className="mt-5 grid gap-3">{details.map(([label, value]) => <div key={String(label)}><dt className="text-xs text-zinc-500">{String(label)}</dt><dd className="mt-1 break-all whitespace-pre-wrap text-sm">{String(value)}</dd></div>)}</dl>
    <p className="mt-5 text-sm text-amber-200">Dit is een echte on-chain actie. Een ontvangstbevestiging bewijst nog geen definitieve verwerking. Bij een onzekere verzendstatus niet opnieuw verzenden.</p>
    {quote.kind === "burn" ? <p className="mt-3 text-sm font-semibold text-red-300">Burn vernietigt deze editie permanent. Dit kan niet worden teruggedraaid.</p> : null}
    {quote.kind === "transfer" ? <p className="mt-3 text-sm text-zinc-400">Schenking: verkoopbedrag 0 DESO. De ontvanger moet de overdracht zelf accepteren.</p> : null}
    <div className="mt-6 flex flex-wrap gap-3"><button type="button" autoFocus onClick={() => finish(false)} className="min-h-11 rounded-lg border border-zinc-700 px-4 py-2">Annuleren</button><button type="button" onClick={() => finish(quote.isCurrent() && Date.now() < quote.expiresAt)} className="min-h-11 rounded-lg border border-[#285f40] px-4 py-2 text-[#9adbb2]">Deze exacte actie goedkeuren</button></div>
  </dialog> : null}</ReviewContext.Provider>
}
export function useNFTActionReview() {
  const review = useContext(ReviewContext)
  if (!review) throw new Error("NFT_REVIEW_PROVIDER_REQUIRED")
  return review
}
