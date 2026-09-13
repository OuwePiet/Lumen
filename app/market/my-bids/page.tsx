import Link from "next/link"
import { fetchDeSo } from "../../deso-api"

export const dynamic = "force-dynamic"

type Bid = {
  PostHashHex?: string
  SerialNumber?: number
  BidAmountNanos?: number
}

type Post = {
  Body?: string
  ProfileEntryResponse?: { Username?: string }
}

function title(body?: string) {
  const text = (body ?? "").replace(/https?:\/\/\S+/g, "").trim()
  return text ? text.slice(0, 80) : "Untitled NFT"
}

function formatDeso(nanos?: number) {
  if (typeof nanos !== "number") return "—"
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 9 }).format(nanos / 1_000_000_000)
}

export default async function MarketMyBidsPage({ searchParams }: { searchParams: Promise<{ publicKey?: string }> }) {
  const { publicKey } = await searchParams
  let bids: Bid[] = []
  let posts: Record<string, Post> = {}
  let error = ""

  if (publicKey) {
    try {
      const response = await fetchDeSo("get-nft-bids-for-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ UserPublicKeyBase58Check: publicKey, ReaderPublicKeyBase58Check: publicKey }),
        cache: "no-store",
      })
      if (!response.ok) throw new Error("DeSo rejected request")
      const data = await response.json() as {
        NFTBidEntries?: Bid[]
        PostHashHexToPostEntryResponse?: Record<string, Post>
      }
      bids = (data.NFTBidEntries ?? []).filter((bid) =>
        typeof bid.BidAmountNanos === "number" &&
        bid.BidAmountNanos > 0 &&
        typeof bid.PostHashHex === "string" &&
        /^[0-9a-fA-F]{64}$/.test(bid.PostHashHex)
      )
      posts = data.PostHashHexToPostEntryResponse ?? {}
    } catch {
      error = "VIA could not load your DeSo bids right now."
    }
  }

  const marketHref = publicKey ? "/market?publicKey=" + encodeURIComponent(publicKey) : "/market"

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-10 text-zinc-100">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-500">VIA Marketplace</p>
          <h1 className="mt-2 text-3xl font-semibold">My bids</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">One quiet overview of active NFT bids from a DeSo account. Open an NFT to change or withdraw its bid.</p>
        </div>
        <Link href={marketHref} className="text-sm text-green-400 hover:text-green-300">Back to Market</Link>
      </div>

      {!publicKey ? (
        <form className="mt-8 rounded-xl border border-zinc-800 bg-black/20 p-4">
          <label className="text-sm text-zinc-300">DeSo public key
            <input name="publicKey" required placeholder="BC1…" className="mt-2 block w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm" />
          </label>
          <button className="mt-3 rounded-lg border border-green-800 px-4 py-2 text-sm font-semibold text-green-300">Show bids</button>
        </form>
      ) : error ? <p className="mt-8 text-sm text-amber-300">{error}</p> : bids.length === 0 ? (
        <p className="mt-8 rounded-xl border border-zinc-800 p-5 text-sm text-zinc-400">No active NFT bids found for this DeSo account.</p>
      ) : (
        <div className="mt-8 grid gap-3">
          {bids.sort((a,b)=>(b.BidAmountNanos??0)-(a.BidAmountNanos??0)).map((bid,index) => {
            const hash = bid.PostHashHex ?? ""
            const post = posts[hash]
            return (
              <Link key={hash+":"+bid.SerialNumber+":"+index} href={"/nft/"+hash+(publicKey?"?returnTo=my-bids&publicKey="+encodeURIComponent(publicKey):"")} className="rounded-xl border border-zinc-800 bg-black/20 p-4 transition hover:border-zinc-700">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{title(post?.Body)}</p>
                    <p className="mt-1 text-xs text-zinc-500">{post?.ProfileEntryResponse?.Username ? "@"+post.ProfileEntryResponse.Username+" · " : ""}Edition #{bid.SerialNumber ?? "?"}</p>
                  </div>
                  <p className="text-sm font-semibold text-green-300">{formatDeso(bid.BidAmountNanos)} DESO</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
