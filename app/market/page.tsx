import Link from "next/link"
import { fetchDeSo } from "../deso-api"

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
  let sales: ReturnType<typeof flatten> = []
  let transfers: ReturnType<typeof flatten> = []
  let error = ""

  if (publicKey) {
    try {
      const [salesData, pendingData] = await Promise.all([
        loadNFTs(publicKey, { IsForSale: true }),
        loadNFTs(publicKey, { IsPending: true }),
      ])
      sales = flatten(salesData.NFTsMap)
      transfers = flatten(pendingData.NFTsMap)
    } catch {
      error = "VIA could not load the marketplace state for this DeSo account right now."
    }
  }

  const query = publicKey ? "?publicKey=" + encodeURIComponent(publicKey) : ""
  const collectionHref = publicKey ? `/?account=${encodeURIComponent(publicKey)}&accountKey=${encodeURIComponent(publicKey)}&view=nfts#collection-controls` : "/#account-lookup-heading"

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-10 text-zinc-100">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-500">VIA Marketplace</p>
          <h1 className="mt-2 text-3xl font-semibold">Market</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">One account view for bids, listed NFTs and pending transfers. Actions remain on the NFT detail page where VIA can apply the full confirmation flow.</p>
        </div>
        <Link href={collectionHref} className="text-sm text-green-400">Back to NFTs</Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href={"/market/received-bids" + query} className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-300">Received Bids</Link>
        <Link href={"/market/my-bids" + query} className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-300">My Bids</Link>
        <a href="#sales" className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-300">Sales</a>
        <a href="#transfers" className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-300">Transfers</a>
      </div>

      {!publicKey ? (
        <form className="mt-8 rounded-xl border border-zinc-800 bg-black/20 p-4">
          <label className="text-sm text-zinc-300">DeSo public key
            <input name="publicKey" required placeholder="BC1…" className="mt-2 block w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm" />
          </label>
          <button className="mt-3 rounded-lg border border-green-800 px-4 py-2 text-sm font-semibold text-green-300">Open market view</button>
        </form>
      ) : error ? <p className="mt-8 text-sm text-amber-300">{error}</p> : (
        <>
          <section id="sales" className="mt-10">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-xl font-semibold">For sale</h2>
              <span className="text-xs text-zinc-500">{sales.length} listed edition{sales.length === 1 ? "" : "s"}</span>
            </div>
            {sales.length === 0 ? <p className="mt-3 text-sm text-zinc-500">No NFT editions currently for sale.</p> : (
              <div className="mt-4 grid gap-3">
                {sales.map(({hash,post,entry},index)=><Link key={hash+":"+entry.SerialNumber+":"+index} href={"/nft/"+hash+(publicKey?"?returnTo=market&publicKey="+encodeURIComponent(publicKey):"")} className="rounded-xl border border-zinc-800 bg-black/20 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div><p className="text-sm font-semibold">{title(post.Body)}</p><p className="mt-1 text-xs text-zinc-500">{post.ProfileEntryResponse?.Username ? "@"+post.ProfileEntryResponse.Username+" · " : ""}Edition #{entry.SerialNumber ?? "?"}</p></div>
                    <p className="text-sm text-green-300">{entry.IsBuyNow && typeof entry.BuyNowPriceNanos === "number" ? "Buy now "+formatDeso(entry.BuyNowPriceNanos) : "Min bid "+formatDeso(entry.MinBidAmountNanos)} DESO</p>
                  </div>
                </Link>)}
              </div>
            )}
          </section>

          <section id="transfers" className="mt-10">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-xl font-semibold">Pending transfers</h2>
              <span className="text-xs text-zinc-500">{transfers.length} pending edition{transfers.length === 1 ? "" : "s"}</span>
            </div>
            {transfers.length === 0 ? <p className="mt-3 text-sm text-zinc-500">No pending NFT transfers found for this account.</p> : (
              <div className="mt-4 grid gap-3">
                {transfers.map(({hash,post,entry},index)=><Link key={hash+":"+entry.SerialNumber+":"+index} href={"/nft/"+hash+(publicKey?"?returnTo=market&publicKey="+encodeURIComponent(publicKey):"")} className="rounded-xl border border-zinc-800 bg-black/20 p-4">
                  <p className="text-sm font-semibold">{title(post.Body)}</p>
                  <p className="mt-1 text-xs text-zinc-500">{post.ProfileEntryResponse?.Username ? "@"+post.ProfileEntryResponse.Username+" · " : ""}Edition #{entry.SerialNumber ?? "?"} · pending on DeSo</p>
                </Link>)}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  )
}
