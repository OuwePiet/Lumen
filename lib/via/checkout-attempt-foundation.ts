export type ViaCheckoutCurrency = "EUR" | "USD" | "BTC" | "DESO"

export type ViaCheckoutAttemptInput = {
  orderId: string
  amountMinor: number
  currency: ViaCheckoutCurrency
  method: "fiat-eur" | "fiat-usd" | "bitcoin" | "deso"
  createdAt: string
  expiresAt: string
}

export type ViaCheckoutAttempt = ViaCheckoutAttemptInput & {
  attemptId: string
  status: "created"
}

export function validateCheckoutAttemptInput(input: ViaCheckoutAttemptInput): boolean {
  if (!input.orderId.trim() || !input.createdAt || !input.expiresAt) return false
  if (!Number.isSafeInteger(input.amountMinor) || input.amountMinor <= 0) return false
  if (new Date(input.expiresAt).getTime() <= new Date(input.createdAt).getTime()) return false
  if (input.currency === "EUR" && input.method !== "fiat-eur") return false
  if (input.currency === "USD" && input.method !== "fiat-usd") return false
  if (input.currency === "BTC" && input.method !== "bitcoin") return false
  if (input.currency === "DESO" && input.method !== "deso") return false
  return true
}

export function createCheckoutAttempt(input: ViaCheckoutAttemptInput, attemptId: string): ViaCheckoutAttempt | null {
  if (!validateCheckoutAttemptInput(input) || !attemptId.trim()) return null
  return { ...input, attemptId, status: "created" }
}

export const VIA_CHECKOUT_ATTEMPT_RULES = {
  serverAuthority: "Checkout attempts are server-side state; browser state never confirms payment.",
  exactBinding: "An attempt binds one order, one amount, one currency and one payment method.",
  expiry: "The expiry timestamp must be later than creation time; expired attempts cannot be created from this foundation.",
  noPayment: "This foundation creates no provider session, charge, transfer, signature or blockchain write.",
} as const
