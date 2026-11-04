import { fetchDeSo } from "./deso-api"

type Kind = "update-sale" | "transfer" | "burn" | "withdraw-bid" | "accept-bid" | "accept-transfer"
const isKey = (value: unknown): value is string => typeof value === "string" && /^[1-9A-HJ-NP-Za-km-z]{40,128}$/.test(value)
async function read(endpoint: string, body: Record<string, unknown>) {
  const response = await fetchDeSo(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store" })
  if (!response.ok) throw new Error("NFT_STATE_UNAVAILABLE")
  return await response.json() as Record<string, unknown>
}

/** Read-only checks before constructing a transaction; client flags never establish ownership. */
export async function assertNFTActionState(kind: Kind, body: Record<string, unknown>) {
  const actor = kind === "transfer" ? body.senderPublicKey : kind === "accept-bid" ? body.ownerPublicKey : body.publicKey
  if (!isKey(actor) || typeof body.postHash !== "string" || !/^[a-f0-9]{64}$/i.test(body.postHash) || typeof body.serialNumber !== "number" || !Number.isSafeInteger(body.serialNumber) || body.serialNumber < 1) throw new Error("INVALID_NFT_ACTION")
  const hash = body.postHash.toLowerCase()
  const entries = await read("get-nft-entries-for-nft-post", { PostHashHex: hash })
  const entry = Array.isArray(entries.NFTEntryResponses) ? entries.NFTEntryResponses.find((value: unknown) => value && typeof value === "object" && (value as Record<string, unknown>).SerialNumber === body.serialNumber) as Record<string, unknown> | undefined : undefined
  if (!entry || !isKey(entry.OwnerPublicKeyBase58Check) || typeof entry.IsPending !== "boolean" || typeof entry.IsForSale !== "boolean") throw new Error("NFT_EDITION_STATE_UNAVAILABLE")
  if (kind !== "withdraw-bid" && entry.OwnerPublicKeyBase58Check !== actor) throw new Error("NFT_OWNER_CHANGED")
  if (kind === "accept-transfer") {
    if (entry.IsPending !== true || entry.IsForSale) throw new Error("NFT_TRANSFER_NO_LONGER_PENDING")
  } else if (entry.IsPending) throw new Error("NFT_TRANSFER_PENDING")
  if ((kind === "transfer" || kind === "burn") && entry.IsForSale) throw new Error("NFT_STILL_FOR_SALE")
  if (kind === "transfer") {
    if (!isKey(body.receiverPublicKey) || body.receiverPublicKey === actor) throw new Error("INVALID_NFT_RECEIVER")
  }
  if (kind === "transfer" || kind === "accept-bid" || (kind === "update-sale" && body.isBuyNow === true)) {
    const result = await read("get-single-post", { PostHashHex: hash, ReaderPublicKeyBase58Check: actor, FetchParents: false, CommentLimit: 0 })
    const post = (result.PostFound ?? result.PostFoundResponse) as Record<string, unknown> | undefined
    if (!post || typeof post.HasUnlockable !== "boolean") throw new Error("NFT_UNLOCKABLE_STATE_UNAVAILABLE")
    if (post.HasUnlockable) throw new Error("NFT_UNLOCKABLE_REQUIRES_ENCRYPTION")
  }
  if (kind === "accept-bid" || kind === "withdraw-bid") {
    const bids = await read("get-nft-bids-for-nft-post", { PostHashHex: hash, ReaderPublicKeyBase58Check: actor })
    if (!Array.isArray(bids.BidEntryResponses)) throw new Error("NFT_BID_STATE_UNAVAILABLE")
    const bidder = kind === "withdraw-bid" ? actor : body.bidderPublicKey
    const matching = bids.BidEntryResponses.some((value: unknown) => {
      if (!value || typeof value !== "object") return false
      const bid = value as Record<string, unknown>
      return bid.PublicKeyBase58Check === bidder && bid.SerialNumber === body.serialNumber && typeof bid.BidAmountNanos === "number" && Number.isSafeInteger(bid.BidAmountNanos) && bid.BidAmountNanos > 0 && (kind === "withdraw-bid" || bid.BidAmountNanos === body.bidAmountNanos)
    })
    if (!matching || (kind === "accept-bid" && (!entry.IsForSale || bidder === actor))) throw new Error("NFT_BID_CHANGED")
  }
}
