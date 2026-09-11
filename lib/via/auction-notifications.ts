import type { ViaAuctionBid } from "./auction-policy"

export type ViaAuctionNotification =
  | {
      kind: "winner"
      recipientPublicKey: string
      amountNanos: number
      message: string
    }
  | {
      kind: "seller"
      recipientPublicKey: string
      amountNanos: number
      message: string
    }

export function buildAuctionResultNotifications(input: {
  sellerPublicKey: string
  winner: ViaAuctionBid
}): ViaAuctionNotification[] {
  return [
    {
      kind: "winner",
      recipientPublicKey: input.winner.bidderPublicKey,
      amountNanos: input.winner.amountNanos,
      message:
        "You placed the highest valid confirmed bid. Payment settlement must be confirmed before the NFT is released to you.",
    },
    {
      kind: "seller",
      recipientPublicKey: input.sellerPublicKey,
      amountNanos: input.winner.amountNanos,
      message:
        "Your auction has a confirmed winner. The NFT remains locked until seller payment is confirmed.",
    },
  ]
}

export type ViaAuctionCompletionNotification = {
  recipientPublicKey: string
  message: string
}

export function buildAuctionCompletionNotifications(input: {
  sellerPublicKey: string
  winnerPublicKey: string
}): ViaAuctionCompletionNotification[] {
  return [
    {
      recipientPublicKey: input.winnerPublicKey,
      message:
        "Auction settlement completed. VIA has verified the NFT ownership change.",
    },
    {
      recipientPublicKey: input.sellerPublicKey,
      message:
        "Auction settlement completed. VIA has verified payment and the NFT ownership change.",
    },
  ]
}
