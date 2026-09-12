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

  const createdAtMs = Date.parse(input.createdAt)
  const expiresAtMs = Date.parse(input.expiresAt)
  if (!Number.isFinite(createdAtMs) || !Number.isFinite(expiresAtMs)) return false
  if (expiresAtMs <= createdAtMs) return false

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
  expiry: "Creation and expiry timestamps must be valid dates and expiry must be later than creation time.",
  noPayment: "This foundation creates no provider session, charge, transfer, signature or blockchain write.",
} as const
