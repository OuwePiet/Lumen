export type ViaCheckoutOrderInput = {
  orderId: string
  nftId: string
  sellerPublicKey: string
  buyerPublicKey?: string
  amountMinor: number
  currency: "EUR" | "USD" | "BTC" | "DESO"
}

export type ViaCheckoutOrder = ViaCheckoutOrderInput & {
  status: "pending"
}

export function validateCheckoutOrder(input: ViaCheckoutOrderInput): boolean {
  if (!input.orderId.trim() || !input.nftId.trim() || !input.sellerPublicKey.trim()) return false
  if (input.buyerPublicKey !== undefined && !input.buyerPublicKey.trim()) return false
  if (!Number.isSafeInteger(input.amountMinor) || input.amountMinor <= 0) return false
  return ["EUR", "USD", "BTC", "DESO"].includes(input.currency)
}

export function createCheckoutOrder(input: ViaCheckoutOrderInput): ViaCheckoutOrder | null {
  return validateCheckoutOrder(input) ? { ...input, status: "pending" } : null
}

export const VIA_CHECKOUT_ORDER_RULES = {
  immutableCommercialTerms: "The order binds one NFT, seller, amount and currency; payment confirmation may not rewrite those terms.",
  buyerBinding: "A buyer public key is optional until authentication is available, but an empty supplied key is invalid.",
  pendingOnly: "The order boundary creates a pending representation only; it never confirms payment or ownership transfer.",
  noTransfer: "No provider charge, wallet signature, DeSo transaction, NFT transfer or delivery occurs in this layer.",
} as const
