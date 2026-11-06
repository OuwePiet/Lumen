"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"

type Item = {
  hash: string
  title: string
  creator: string
  image: string
  forSale: number
  buyNowNanos: number | null
}

const copy: Record<ViaLanguage, { heading: string; source: string; loading: string; empty: string; unavailable: string; bid: string; sale: string }> = {
  Dutch: { heading: "Openbare DeSo-selectie", source: "Beperkte selectie uit DeSo NFT Showcase; geen volledige marktindex.", loading: "Openbare NFT-selectie laden…", empty: "DeSo leverde momenteel geen openbare verkoopselectie.", unavailable: "De openbare NFT-selectie is tijdelijk niet bereikbaar.", bid: "Bieden", sale: "te koop" },
  English: { heading: "Public DeSo selection", source: "Limited selection from DeSo NFT Showcase; not a complete market index.", loading: "Loading public NFT selection…", empty: "DeSo currently returned no public sale selection.", unavailable: "The public NFT selection is temporarily unavailable.", bid: "Bid", sale: "for sale" },
  French: { heading: "Sélection publique DeSo", source: "Sélection limitée de DeSo NFT Showcase, pas un index complet du marché.", loading: "Chargement de la sélection NFT publique…", empty: "DeSo ne propose actuellement aucune sélection publique en vente.", unavailable: "La sélection NFT publique est temporairement indisponible.", bid: "Enchérir", sale: "en vente" },
  Spanish: { heading: "Selección pública de DeSo", source: "Selección limitada de DeSo NFT Showcase; no es un índice completo del mercado.", loading: "Cargando selección NFT pública…", empty: "DeSo no devolvió una selección pública en venta.", unavailable: "La selección NFT pública no está disponible temporalmente.", bid: "Pujar", sale: "en venta" },
  Chinese: { heading: "公开 DeSo 精选", source: "来自 DeSo NFT Showcase 的有限精选，并非完整市场索引。", loading: "正在加载公开 NFT 精选…", empty: "DeSo 当前未返回公开在售精选。", unavailable: "公开 NFT 精选暂时不可用。", bid: "出价", sale: "在售" },
  Hindi: { heading: "सार्वजनिक DeSo चयन", source: "DeSo NFT Showcase से सीमित चयन; यह पूर्ण बाज़ार सूची नहीं है।", loading: "सार्वजनिक NFT चयन लोड हो रहा है…", empty: "DeSo ने अभी कोई सार्वजनिक बिक्री चयन नहीं दिया।", unavailable: "सार्वजनिक NFT चयन अस्थायी रूप से उपलब्ध नहीं है।", bid: "बोली", sale: "बिक्री के लिए" },
}

export default function PublicShowcase() {
  const [language, setLanguage] = useState<ViaLanguage>("English")
  const [items, setItems] = useState<Item[]>([])
  const [state, setState] = useState<"loading" | "ready" | "empty" | "error">("loading")

  useEffect(() => {
    const refresh = () => setLanguage(readViaLocalSettings().interfaceLanguage)
    refresh()
    window.addEventListener(VIA_SETTINGS_EVENT, refresh)
    return () => window.removeEventListener(VIA_SETTINGS_EVENT, refresh)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void fetch("/api/via/market/showcase", { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json() as { ok?: boolean; items?: Item[] }
        if (!response.ok || !data.ok || !Array.isArray(data.items)) throw new Error("SHOWCASE_UNAVAILABLE")
        if (controller.signal.aborted) return
        setItems(data.items)
        setState(data.items.length ? "ready" : "empty")
      })
      .catch(() => { if (!controller.signal.aborted) setState("error") })
    return () => controller.abort()
  }, [])

  const t = copy[language]
  return <section className="mt-8" aria-labelledby="public-nft-selection">
    <h2 id="public-nft-selection" className="text-xl font-semibold">{t.heading}</h2>
    <p className="mt-1 text-xs text-zinc-500">{t.source}</p>
    {state !== "ready" ? <p className="mt-4 text-sm text-zinc-400" role="status">{state === "loading" ? t.loading : state === "empty" ? t.empty : t.unavailable}</p> : null}
    {state === "ready" ? <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => <Link key={item.hash} href={`/nft/${item.hash}?returnTo=market`} className="min-w-0 rounded-xl border border-zinc-800 bg-black/20 p-3 transition hover:border-[#8fd4a9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8fd4a9]">
        {item.image ? <img src={item.image} alt="" loading="lazy" className="h-44 w-full rounded-lg object-cover" /> : <div className="grid h-44 place-items-center rounded-lg bg-[#12251a] text-[#9adbb2]" aria-hidden="true">NFT</div>}
        <strong className="mt-3 block truncate text-sm">{item.title}</strong>
        <span className="mt-1 block truncate text-xs text-zinc-400">{item.creator ? `@${item.creator}` : "DeSo creator"}</span>
        <span className="mt-2 block text-xs text-[#9adbb2]">{item.buyNowNanos !== null ? `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 9 }).format(item.buyNowNanos / 1_000_000_000)} DESO` : t.bid} · {item.forSale} {t.sale}</span>
      </Link>)}
    </div> : null}
  </section>
}
