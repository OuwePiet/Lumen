import type { ViaCheckoutOrder } from "./checkout-order-boundary"
import type { ViaCheckoutAttempt } from "./checkout-attempt-foundation"
import { validateCheckoutOrderForAttempt } from "./checkout-order-validation"
import { validateCheckoutAttemptInput } from "./checkout-attempt-foundation"

export type ViaProviderSessionPreflightValidation =
  | { valid: true }
  | {
      valid: false
      reason: "invalid-order" | "invalid-attempt" | "attempt-expired"
    }

export function validateProviderSessionPreflightInput(
  order: ViaCheckoutOrder,
  attempt: ViaCheckoutAttempt,
  nowMs = Date.now(),
): ViaProviderSessionPreflightValidation {
  if (!validateCheckoutOrderForAttempt(order).valid) {
    return { valid: false, reason: "invalid-order" }
  }

  if (
    attempt.status !== "created" ||
    !attempt.attemptId?.trim() ||
    !validateCheckoutAttemptInput(attempt)
  ) {
    return { valid: false, reason: "invalid-attempt" }
  }

  const expiresAtMs = Date.parse(attempt.expiresAt)
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= nowMs) {
    return { valid: false, reason: "attempt-expired" }
  }

  return { valid: true }
}

export const VIA_PROVIDER_SESSION_PREFLIGHT_VALIDATION_RULES = {
  orderFirst: "The server rejects malformed checkout orders before evaluating readiness or handoff eligibility.",
  attemptFirst: "The server rejects malformed checkout attempts, missing attempt identifiers and unexpected attempt states.",
  liveExpiry: "An attempt must still be unexpired when provider-session preflight is requested.",
  failClosed: "Invalid dates and stale attempts are rejected before any provider-session draft is returned.",
} as const
