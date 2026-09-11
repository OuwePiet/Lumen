import type { ViaAuction, ViaAuctionBid } from "./auction-policy"
import { determineAuctionWinner } from "./auction-policy"

export type ViaAuctionStatus =
  | "scheduled"
  | "live"
  | "ended-no-bids"
  | "ended-winner"

export type ViaAuctionReadModel = {
  status: ViaAuctionStatus
  secondsRemaining: number
  bidCount: number
  highestBidNanos?: number
  winnerPublicKey?: string
}

export function buildAuctionReadModel(
  auction: ViaAuction,
  bids: ViaAuctionBid[],
  nowNanos: number
): ViaAuctionReadModel {
  const confirmed = bids.filter(
    (bid) =>
      bid.confirmedAtNanos >= auction.startsAtNanos &&
      bid.confirmedAtNanos < auction.endsAtNanos
  )
  const highest = [...confirmed].sort((a, b) => b.amountNanos - a.amountNanos)[0]

  if (nowNanos < auction.startsAtNanos) {
    return {
      status: "scheduled",
      secondsRemaining: Math.ceil((auction.startsAtNanos - nowNanos) / 1e9),
      bidCount: 0,
    }
  }

  if (nowNanos < auction.endsAtNanos) {
    return {
      status: "live",
      secondsRemaining: Math.max(0, Math.ceil((auction.endsAtNanos - nowNanos) / 1e9)),
      bidCount: confirmed.length,
      highestBidNanos: highest?.amountNanos,
    }
  }

  const winner = determineAuctionWinner(auction, confirmed, nowNanos)
  return {
    status: winner ? "ended-winner" : "ended-no-bids",
    secondsRemaining: 0,
    bidCount: confirmed.length,
    highestBidNanos: winner?.amountNanos,
    winnerPublicKey: winner?.bidderPublicKey,
  }
}

export const VIA_AUCTION_STATUS_GUIDE = {
  scheduled: "Auction has not started yet.",
  live: "Auction is live. The timer shows the remaining time.",
  endedNoBids: "Auction ended without a valid bid.",
  endedWinner: "Auction ended. The highest valid confirmed bidder is the winner.",
} as const
