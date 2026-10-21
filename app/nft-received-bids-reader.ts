import { fetchDeSo } from "./deso-api"
import { getNFTsForUser, type DeSoNFTPost } from "./deso-nfts"

export type ReceivedNFTBid = {
  hash: string
  post: DeSoNFTPost
  serial: number
  bidder: string
  amount: number
}

/** Never report a partial ownership/bid read as an empty or complete inbox. */
export async function getReceivedNFTBids(publicKey: string): Promise<ReceivedNFTBid[]> {
  if (!/^[1-9A-HJ-NP-Za-km-z]{40,128}$/.test(publicKey)) throw new Error("INVALID_PUBLIC_KEY")
  const owned = await getNFTsForUser(publicKey)
  const rows = new Map<string, ReceivedNFTBid>()
  // Bound requests even for accounts owning thousands of different works.
  for (let offset = 0; offset < owned.length; offset += 4) {
    await Promise.all(owned.slice(offset, offset + 4).map(async record => {
      const hash = record.PostEntryResponse!.PostHashHex!
      const serials = new Set((record.NFTEntryResponses ?? []).map(entry => entry.SerialNumber))
      if (!serials.size) return
      const response = await fetchDeSo("get-nft-bids-for-nft-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ReaderPublicKeyBase58Check: publicKey, PostHashHex: hash }),
        cache: "no-store",
      })
      if (!response.ok) throw new Error("NFT_BIDS_UNAVAILABLE")
      const data = await response.json()
      if (data.BidEntryResponses != null && !Array.isArray(data.BidEntryResponses)) throw new Error("NFT_BIDS_INVALID")
      for (const bid of data.BidEntryResponses ?? []) {
        if (!bid || typeof bid !== "object") throw new Error("NFT_BIDS_INVALID")
        if (!Number.isSafeInteger(bid.SerialNumber) || bid.SerialNumber < 0 ||
            !Number.isSafeInteger(bid.BidAmountNanos) || bid.BidAmountNanos < 0 ||
            typeof bid.PublicKeyBase58Check !== "string" ||
            !/^[1-9A-HJ-NP-Za-km-z]{40,128}$/.test(bid.PublicKeyBase58Check)) throw new Error("NFT_BIDS_INVALID")
        if (bid.BidAmountNanos === 0) continue
        // Keep edition-specific matching consistent with the existing inbox.
        const matching = [bid.SerialNumber]
        for (const serial of matching) {
          if (!serial || !serials.has(serial)) continue
          const key = `${hash}:${serial}:${bid.PublicKeyBase58Check}`
          const previous = rows.get(key)
          if (!previous || bid.BidAmountNanos > previous.amount) rows.set(key, {
            hash, post: record.PostEntryResponse!, serial,
            bidder: bid.PublicKeyBase58Check, amount: bid.BidAmountNanos,
          })
        }
      }
    }))
  }
  return [...rows.values()].sort((a, b) => b.amount - a.amount)
}

