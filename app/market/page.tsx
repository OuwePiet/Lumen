import Link from "next/link"
import { fetchDeSo } from "../deso-api"
import MarketLocalizedText from "./market-localized-text"

export const dynamic = "force-dynamic"

type NFTEntry = {
  SerialNumber?: number
  IsForSale?: boolean
  IsPending?: boolean
  MinBidAmountNanos?: number
  IsBuyNow?: boolean
  BuyNowPriceNanos?: number
}

type Post = {
  Body?: string
  ProfileEntryResponse?: { Username?: string }
}

type NFTRecord = {
  PostEntryResponse?: Post
  NFTEntryResponses?: NFTEntry[]
}

type NFTMapResponse = {
  NFTsMap?: Record<string, NFTRecord>
}

function title(body?: string) {
  const text = (body ?? "").replace(/https?:\/\/nftz\.me\/\S+/gi, "").replace(/\s+/g, " ").trim()
  return text ? (text.length > 78 ? text.slice(0, 75) + "..." : text) : "Untitled NFT"
}

function formatDeso(nanos?: number) {
  if (typeof nanos !== "number" || !Number.isFinite(nanos)) return "—"
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 9 }).format(nanos / 1_000_000_000)
}

async function loadNFTs(publicKey: string, filter: { IsForSale?: boolean; IsPending?: boolean }) {
  const response = await fetchDeSo("get-nfts-for-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      UserPublicKeyBase58Check: publicKey,
      ReaderPublicKeyBase58Check: publicKey,
      ...filter,
    }),
    cache: "no-store",
  })
  if (!response.ok) throw new Error("DESO_NFTS_UNAVAILABLE")
  return await response.json() as NFTMapResponse
}

function flatten(map?: Record<string, NFTRecord>) {
  const rows: Array<{ hash: string; post: Post; entry: NFTEntry }> = []
  for (const [hash, record] of Object.entries(map ?? {})) {
    if (!/^[0-9a-fA-F]{64}$/.test(hash)) continue
    for (const entry of record.NFTEntryResponses ?? []) {
      rows.push({ hash, post: record.PostEntryResponse ?? {}, entry })
    }
  }
  return rows
}

export default async function MarketPage({ searchParams }: { searchParams: Promise<{ publicKey?: string }> }) {
  const { publicKey } = await searchParams
  let listings: ReturnType<typeof flatten> = []
  let transfers: ReturnType<typeof flatten> = []
  let error = false

  if (publicKey) {
    try {
      const [listingData, pendingData] = await Promise.all([
        loadNFTs(publicKey, { IsForSale: true }),
        loadNFTs(publicKey, { IsPending: true }),
      ])
      listings = flatten(listingData.NFTsMap)
      transfers = flatten(pendingData.NFTsMap)
    } catch {
      error = true
    }
  }

  const query = publicKey ? "?publicKey=" + encodeURIComponent(publicKey) : ""

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-10 text-zinc-100">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8fd4a9]"><MarketLocalizedText kind="marketplace" /></p>
        <h1 className="mt-2 text-3xl font-semibold"><MarketLocalizedText kind="heading" /></h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400"><MarketLocalizedText kind="intro" /></p>
      </header>

      <nav aria-label="Marketplace sections" className="mt-6 flex flex-wrap gap-2">
        <Link href="/collection" className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-300"><MarketLocalizedText kind="collection" /></Link>
        <Link href={"/market/received-bids" + query} className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-300"><MarketLocalizedText kind="receivedBids" /></Link>
        <Link href={"/market/my-bids" + query} className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-300"><MarketLocalizedText kind="myBids" /></Link>
        <a href="#listings" className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-300"><MarketLocalizedText kind="listings" /></a>
        <a href="#transfers" className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-300"><MarketLocalizedText kind="transfers" /></a>
      </nav>

      {!publicKey ? (
        <section className="mt-8 rounded-xl border border-zinc-800 bg-black/20 p-4" aria-labelledby="market-account-heading">
          <h2 id="market-account-heading" className="text-sm font-semibold text-zinc-200"><MarketLocalizedText kind="chooseAccount" /></h2>
          <p className="mt-1 text-sm text-zinc-500"><MarketLocalizedText kind="readOnly" /></p>
          <form className="mt-4 flex flex-wrap gap-3">
            <input name="publicKey" required placeholder="DeSo public key (BC1…)" aria-label="DeSo public key" className="min-w-0 flex-1 rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm" />
            <button className="rounded-lg border border-[#285f40] px-4 py-2 text-sm font-semibold text-[#9adbb2]"><MarketLocalizedText kind="openMarket" /></button>
          </form>
        </section>
      ) : error ? <p className="mt-8 text-sm text-amber-300"><MarketLocalizedText kind="loadError" /></p> : (
        <>
          <section id="listings" className="mt-10 scroll-mt-24">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-xl font-semibold"><MarketLocalizedText kind="listings" /></h2>
              <span className="text-xs text-zinc-500"><MarketLocalizedText kind="listedCount" count={listings.length} /></span>
            </div>
            {listings.length === 0 ? <p className="mt-3 text-sm text-zinc-500"><MarketLocalizedText kind="noForSale" /></p> : (
              <div className="mt-4 grid gap-3">
                {listings.map(({hash,post,entry},index)=><Link key={hash+":"+entry.SerialNumber+":"+index} href={"/nft/"+hash+(publicKey?"?returnTo=market&publicKey="+encodeURIComponent(publicKey):"")} className="rounded-xl border border-zinc-800 bg-black/20 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div><p className="text-sm font-semibold">{title(post.Body)}</p><p className="mt-1 text-xs text-zinc-500">{post.ProfileEntryResponse?.Username ? "@"+post.ProfileEntryResponse.Username+" · " : ""}<MarketLocalizedText kind="edition" /> #{entry.SerialNumber ?? "?"}</p></div>
                    <p className="text-sm text-[#9adbb2]">{entry.IsBuyNow && typeof entry.BuyNowPriceNanos === "number" ? <><MarketLocalizedText kind="buyNow" /> {formatDeso(entry.BuyNowPriceNanos)} DESO</> : <><MarketLocalizedText kind="minBid" /> {formatDeso(entry.MinBidAmountNanos)} DESO</>}</p>
                  </div>
                </Link>)}
              </div>
            )}
          </section>

          <section id="transfers" className="mt-10 scroll-mt-24">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-xl font-semibold"><MarketLocalizedText kind="transfers" /></h2>
              <span className="text-xs text-zinc-500"><MarketLocalizedText kind="pendingCount" count={transfers.length} /></span>
            </div>
            {transfers.length === 0 ? <p className="mt-3 text-sm text-zinc-500"><MarketLocalizedText kind="noTransfers" /></p> : (
              <div className="mt-4 grid gap-3">
                {transfers.map(({hash,post,entry},index)=><Link key={hash+":"+entry.SerialNumber+":"+index} href={"/nft/"+hash+(publicKey?"?returnTo=market&publicKey="+encodeURIComponent(publicKey):"")} className="rounded-xl border border-zinc-800 bg-black/20 p-4">
                  <p className="text-sm font-semibold">{title(post.Body)}</p>
                  <p className="mt-1 text-xs text-zinc-500">{post.ProfileEntryResponse?.Username ? "@"+post.ProfileEntryResponse.Username+" · " : ""}<MarketLocalizedText kind="edition" /> #{entry.SerialNumber ?? "?"} · <MarketLocalizedText kind="pendingOnDeSo" /></p>
                </Link>)}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  )
}
