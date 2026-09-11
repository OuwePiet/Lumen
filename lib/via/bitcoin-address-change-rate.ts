export type ViaBitcoinReceiverRateDecision =
  | { allowed: true }
  | { allowed: false; reason: "too-many-attempts" }

export function bitcoinReceiverRateDecision(input: {
  attemptsInWindow: number
  maxAttemptsInWindow: number
}): ViaBitcoinReceiverRateDecision {
  if (
    !Number.isSafeInteger(input.attemptsInWindow) ||
    !Number.isSafeInteger(input.maxAttemptsInWindow) ||
    input.attemptsInWindow < 0 ||
    input.maxAttemptsInWindow < 1
  ) {
    return { allowed: false, reason: "too-many-attempts" }
  }

  return input.attemptsInWindow < input.maxAttemptsInWindow
    ? { allowed: true }
    : { allowed: false, reason: "too-many-attempts" }
}

export const VIA_BITCOIN_RECEIVER_RATE_RULES = {
  serverSide:
    "Protected Bitcoin receiver configuration attempts are rate-limited server-side per authenticated owner/security context.",
  configurable:
    "Concrete thresholds and windows are deployment configuration rather than hardcoded policy constants.",
  failClosed:
    "Invalid limiter state fails closed and never grants unrestricted receiver configuration attempts.",
  generic:
    "Rate-limit failures use safe generic owner-facing errors and do not expose configuration/security state.",
  noPayment:
    "Rate limiting performs no Bitcoin signing, payment confirmation, refund, settlement, forwarding or blockchain write.",
} as const
