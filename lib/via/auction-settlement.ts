export type ViaAuctionSettlementStage =
  | "awaiting-seller-payment"
  | "seller-payment-confirmed"
  | "nft-transfer-released"
  | "ownership-verified"
  | "completed"
  | "technical-failure"

export type ViaAuctionSettlement = {
  auctionId: string
  stage: ViaAuctionSettlementStage
  paymentReference: string | null
  transferReference: string | null
  verifiedOwnerPublicKey: string | null
}

export function createAuctionSettlement(auctionId: string): ViaAuctionSettlement | null {
  if (!auctionId.trim()) return null

  return {
    auctionId,
    stage: "awaiting-seller-payment",
    paymentReference: null,
    transferReference: null,
    verifiedOwnerPublicKey: null,
  }
}

export function confirmSellerPayment(
  settlement: ViaAuctionSettlement,
  paymentReference: string,
): ViaAuctionSettlement | null {
  if (settlement.stage !== "awaiting-seller-payment") return null
  if (!paymentReference.trim()) return null

  return {
    ...settlement,
    stage: "seller-payment-confirmed",
    paymentReference,
  }
}

export function releaseAuctionNft(
  settlement: ViaAuctionSettlement,
  transferReference: string,
): ViaAuctionSettlement | null {
  if (settlement.stage !== "seller-payment-confirmed") return null
  if (!settlement.paymentReference || !transferReference.trim()) return null

  return {
    ...settlement,
    stage: "nft-transfer-released",
    transferReference,
  }
}

export function verifyAuctionOwnership(
  settlement: ViaAuctionSettlement,
  ownerPublicKey: string,
): ViaAuctionSettlement | null {
  if (settlement.stage !== "nft-transfer-released") return null
  if (!settlement.transferReference || !ownerPublicKey.trim()) return null

  return {
    ...settlement,
    stage: "ownership-verified",
    verifiedOwnerPublicKey: ownerPublicKey,
  }
}

export function completeAuctionSettlement(
  settlement: ViaAuctionSettlement,
): ViaAuctionSettlement | null {
  if (settlement.stage !== "ownership-verified") return null
  if (!settlement.verifiedOwnerPublicKey) return null

  return {
    ...settlement,
    stage: "completed",
  }
}

export function markAuctionSettlementFailure(
  settlement: ViaAuctionSettlement,
): ViaAuctionSettlement {
  if (settlement.stage === "completed") return settlement

  return {
    ...settlement,
    stage: "technical-failure",
  }
}

export const VIA_AUCTION_SETTLEMENT_RULES = {
  paymentFirst:
    "Seller payment must be independently confirmed before VIA may release the NFT for transfer.",
  transferSecond:
    "NFT transfer may start only after seller payment confirmation.",
  ownershipThird:
    "Settlement is not complete until VIA verifies the winning bidder is the current owner.",
  notifications:
    "Winner and seller completion messages may be sent only after ownership verification.",
  failure:
    "A technical failure never changes the auction winner or silently skips payment, transfer or ownership verification.",
} as const
