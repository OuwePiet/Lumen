export type ViaCheckoutAttemptExpiry = {
  expired: boolean
  reason: "within-window" | "deadline-reached" | "invalid-deadline"
}

export function checkoutAttemptExpiry(input: {
  expiresAtMs: number
  nowMs: number
}): ViaCheckoutAttemptExpiry {
  if (
    !Number.isSafeInteger(input.expiresAtMs) ||
    !Number.isSafeInteger(input.nowMs) ||
    input.expiresAtMs < 1 ||
    input.nowMs < 0
  ) {
    return { expired: true, reason: "invalid-deadline" }
  }

  if (input.nowMs >= input.expiresAtMs) {
    return { expired: true, reason: "deadline-reached" }
  }

  return { expired: false, reason: "within-window" }
}

export const VIA_CHECKOUT_ATTEMPT_EXPIRY_RULES = {
  failClosed:
    "Invalid or missing trusted expiry data is treated as expired rather than extending a checkout attempt.",
  serverClock:
    "Production expiry decisions use trusted server-side time and persisted attempt deadlines, not browser clock values.",
  exactBoundary:
    "At the stored expiry instant the attempt is expired; it is not valid for an extra grace millisecond by default.",
  confirmation:
    "An expired attempt cannot become confirmed through the normal confirmation path; late evidence is handled by reconciliation without reopening the attempt.",
  configurable:
    "Concrete checkout duration remains configuration-specific to the payment method/provider and is not hardcoded here.",
} as const
