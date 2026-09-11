export type ViaCheckoutReview = {
  method: "fiat" | "bitcoin" | "deso"
  currency: "EUR" | "USD" | "BTC" | "DESO"
  baseAmount: string
  processingCost: string
  totalAmount: string
  purpose: "sponsor" | "community-support"
}

export function checkoutReviewIsComplete(review: ViaCheckoutReview): boolean {
  if (!review.baseAmount.trim() || !review.processingCost.trim() || !review.totalAmount.trim()) {
    return false
  }

  if (review.method === "bitcoin" && review.currency !== "BTC") return false
  if (review.method === "deso" && review.currency !== "DESO") return false
  if (review.method === "fiat" && review.currency !== "EUR" && review.currency !== "USD") return false

  return true
}

export const VIA_CHECKOUT_REVIEW_RULES = {
  beforeAction:
    "Before any actionable payment handoff, VIA shows the selected method, purpose, base amount, processing cost and total amount together.",
  costs:
    "Processing costs are shown separately and included only where legally and provider-technically permitted.",
  consent:
    "The payer must explicitly continue from the review step; opening checkout or choosing a method is not payment consent.",
  bitcoin:
    "For Bitcoin, the review precedes creation/display of the exact BTC payment request and does not itself confirm a quote or transaction.",
  noWrite:
    "Checkout review performs no charge, transfer, signing, custody or blockchain write.",
} as const
