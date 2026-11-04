"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
type Item = { hash: string; title: string; creator: string; image: string; forSale: number; buyNowNanos: number | null }
export default function NFTMarketRail() {
  const [items, setItems] = useState<Item[]>([])
  const [status, setStatus] = useState("NFT-markt laden…")
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    void fetch("/api/via/market/showcase", { signal: controller.signal }).then(async response => {
      const data = await response.json() as { ok?: boolean; items?: Item[] }
      if (!response.ok || !data.ok || !Array.isArray(data.items)) throw new Error()
      if (controller.signal.aborted) return
      setItems(data.items); setStatus(data.items.length ? "" : "Geen verkoopaanbod ontvangen van DeSo.")
    }).catch(() => { if (!controller.signal.aborted) setStatus("De NFT-markt is tijdelijk niet bereikbaar.") })
    return () => controller.abort()
  }, [])
  const cards = (duplicate: boolean) => items.map(item => <Link key={item.hash} href={"/nft/" + item.hash + "?returnTo=market"} tabIndex={duplicate ? -1 : 0} className="via-market-card">
    {item.image ? <img src={item.image} alt={duplicate ? "" : item.title} loading="lazy" className="h-32 w-full rounded-lg object-cover" /> : <div className="grid h-32 place-items-center rounded-lg bg-[#12251a] text-[#9adbb2]">NFT</div>}
    <strong className="mt-2 block overflow-hidden text-ellipsis whitespace-nowrap text-xs">{item.title}</strong>
    <span className="block truncate text-xs text-zinc-400">{item.creator ? "@" + item.creator : "DeSo creator"}</span>
    <span className="mt-1 block text-xs text-[#9adbb2]">{item.buyNowNanos !== null ? (item.buyNowNanos / 1e9).toLocaleString(undefined, { maximumFractionDigits: 9 }) + " DESO" : "Bieden"} · {item.forSale} te koop</span>
  </Link>)
  return <section className="my-3 min-w-0" aria-label="NFT Market">
    <div className="mb-2 flex items-center justify-between gap-3"><Link href="/market" className="font-semibold text-[#9adbb2]">Markt · NFT’s op DeSo</Link>{items.length ? <button type="button" className="rounded-lg border border-zinc-700 px-3 py-1 text-xs" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? "Afspelen" : "Pauzeren"}</button> : null}</div>
    {status ? <p role="status" className="text-sm text-zinc-400">{status}</p> : <div className="via-market-window" data-paused={paused}><div className="via-market-track"><div className="via-market-group">{cards(false)}</div><div className="via-market-group" aria-hidden="true">{cards(true)}</div></div></div>}
    <style>{".via-market-window{width:100%;overflow:hidden;border-radius:12px}.via-market-track{display:flex;width:max-content;animation:viaMarketMove 100s linear infinite}.via-market-group{display:flex;gap:10px;padding-right:10px}.via-market-card{width:158px;flex:0 0 158px;padding:8px;border:1px solid #285f40;border-radius:12px;background:#07100b;color:#edf4ef;text-decoration:none}.via-market-window:hover .via-market-track,.via-market-window:focus-within .via-market-track,.via-market-window[data-paused=true] .via-market-track{animation-play-state:paused}@keyframes viaMarketMove{to{transform:translateX(-50%)}}@media(prefers-reduced-motion:reduce){.via-market-track{animation:none}.via-market-window{overflow-x:auto}.via-market-group[aria-hidden=true]{display:none}}"}</style>
  </section>
}
