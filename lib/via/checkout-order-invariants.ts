export const VIA_CHECKOUT_ORDER_INVARIANTS = [
  "orderId identifies exactly one checkout order",
  "nftId identifies the NFT being purchased",
  "sellerPublicKey identifies the seller",
  "amountMinor and currency are the commercial terms presented for the order",
  "buyerPublicKey, when present, identifies the authenticated buyer",
  "pending order state never implies payment or ownership transfer",
] as const
