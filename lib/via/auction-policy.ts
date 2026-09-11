export type ViaAuctionBid = {
  bidderPublicKey: string
  amountNanos: number
  confirmedAtNanos: number
}

export type ViaAuction = {
  nftPostHashHex: string
  serialNumber: number
  sellerPublicKey: string
  startsAtNanos: number
  endsAtNanos: number
  minimumBidNanos: number
  minimumIncrementNanos: number
}

export function bidIsValid(
  auction: ViaAuction,
  bid: ViaAuctionBid,
  currentHighestNanos?: number
) {
  if (bid.confirmedAtNanos < auction.startsAtNanos) return false
  if (bid.confirmedAtNanos >= auction.endsAtNanos) return false

  const floor = Math.max(
    auction.minimumBidNanos,
    typeof currentHighestNanos === "number"
      ? currentHighestNanos + auction.minimumIncrementNanos
      : auction.minimumBidNanos
  )

  return bid.amountNanos >= floor
}

export function determineAuctionWinner(
  auction: ViaAuction,
  bids: ViaAuctionBid[],
  nowNanos: number
) {
  if (nowNanos < auction.endsAtNanos) return null

  const ordered = [...bids]
    .filter((bid) => bid.confirmedAtNanos < auction.endsAtNanos)
    .sort((a, b) => b.amountNanos - a.amountNanos)

  return ordered[0] ?? null
}

export type ViaAuctionSettlementState =
  | "awaiting-payment"
  | "payment-confirmed"
  | "nft-transfer-confirmed"
  | "technical-failure"

/**
 * Settlement order is strict:
 * winner -> seller payment confirmed -> NFT release/transfer -> ownership verify.
 * VIA must never present an NFT as released before seller payment is confirmed.
 */
export function canReleaseAuctionNft(state: ViaAuctionSettlementState) {
  return state === "payment-confirmed"
}

export const VIA_AUCTION_GUIDE = {
  result:
    "The highest valid confirmed bid before the fixed end time wins automatically. A new bid must exceed the current highest bid by the required increment, so equal highest bids are not accepted.",
  finality:
    "The winner is determined by the published auction rules. There is no vote, manual selection or discretionary change to the result.",
  settlement:
    "Payment to the seller is confirmed first. Only then may the NFT be released for transfer to the winning bidder. VIA verifies the completed ownership change and notifies both parties.",
  failure:
    "A technical settlement failure is reported as a technical failure and does not silently rewrite the auction result.",
} as const
