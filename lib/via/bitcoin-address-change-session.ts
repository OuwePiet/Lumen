export type ViaBitcoinReceiverChangeSessionDecision =
  | { allowed: true }
  | { allowed: false; reason: "session-mismatch" | "session-used" }

export function bitcoinReceiverChangeSessionDecision(input: {
  sessionId: string
  previewSessionId: string
  alreadyUsed: boolean
}): ViaBitcoinReceiverChangeSessionDecision {
  if (input.alreadyUsed) return { allowed: false, reason: "session-used" }
  if (!input.sessionId.trim() || input.sessionId !== input.previewSessionId) {
    return { allowed: false, reason: "session-mismatch" }
  }
  return { allowed: true }
}

export const VIA_BITCOIN_RECEIVER_CHANGE_SESSION_RULES = {
  bind:
    "Preview, explicit confirmation and protected commit are bound to the same server-side receiver-change session.",
  singleUse:
    "A receiver-change session becomes unusable immediately after a successful commit.",
  mismatch:
    "A confirmation from another/stale browser flow cannot be combined with the current protected receiver-change session.",
  secret:
    "The session identifier is opaque server-side security state and never contains the Bitcoin address, private key or seed.",
  noPayment:
    "Receiver-change session validation performs no Bitcoin signing, payment confirmation, refund, settlement, forwarding or blockchain write.",
} as const
