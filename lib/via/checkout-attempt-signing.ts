import { createHmac, timingSafeEqual } from "node:crypto"
import type { ViaCheckoutAttempt } from "./checkout-attempt-foundation"

function signingSecret(): string | null {
  const value = process.env.VIA_CHECKOUT_ATTEMPT_SIGNING_SECRET?.trim()
  return value && value.length >= 32 ? value : null
}

function canonicalAttempt(attempt: ViaCheckoutAttempt): string {
  return JSON.stringify({
    orderId: attempt.orderId,
    amountMinor: attempt.amountMinor,
    currency: attempt.currency,
    method: attempt.method,
    createdAt: attempt.createdAt,
    expiresAt: attempt.expiresAt,
    attemptId: attempt.attemptId,
    status: attempt.status,
  })
}

export function checkoutAttemptSigningReady(): boolean {
  return signingSecret() !== null
}

export function signCheckoutAttempt(attempt: ViaCheckoutAttempt): string | null {
  const secret = signingSecret()
  if (!secret) return null
  return createHmac("sha256", secret).update(canonicalAttempt(attempt)).digest("base64url")
}

export function verifyCheckoutAttemptSignature(
  attempt: ViaCheckoutAttempt,
  signature: string,
): boolean {
  const expected = signCheckoutAttempt(attempt)
  if (!expected || !signature) return false

  const expectedBytes = Buffer.from(expected)
  const suppliedBytes = Buffer.from(signature)
  if (expectedBytes.length !== suppliedBytes.length) return false
  return timingSafeEqual(expectedBytes, suppliedBytes)
}

export const VIA_CHECKOUT_ATTEMPT_SIGNING_RULES = {
  serverOnly: "Checkout-attempt signatures are created and verified only on the server.",
  failClosed: "Missing or weak signing configuration disables issuance and blocks provider-session preflight.",
  immutablePayload: "Any change to order, amount, currency, method, timestamps, attempt ID or status invalidates the signature.",
  noSecretExposure: "The signing secret is never returned to the browser or included in an attempt payload.",
  noPayment: "A valid signature proves only server issuance of the attempt; it is not payment or ownership proof.",
} as const
