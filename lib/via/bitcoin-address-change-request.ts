export type ViaBitcoinReceiverChangeRequestDecision =
  | { allowed: true }
  | { allowed: false; reason: "origin-mismatch" | "csrf-invalid" | "method-invalid" }

export function bitcoinReceiverChangeRequestDecision(input: {
  method: string
  originMatchesVia: boolean
  csrfTokenValid: boolean
}): ViaBitcoinReceiverChangeRequestDecision {
  if (input.method.toUpperCase() !== "POST") {
    return { allowed: false, reason: "method-invalid" }
  }
  if (!input.originMatchesVia) return { allowed: false, reason: "origin-mismatch" }
  if (!input.csrfTokenValid) return { allowed: false, reason: "csrf-invalid" }
  return { allowed: true }
}

export const VIA_BITCOIN_RECEIVER_CHANGE_REQUEST_RULES = {
  post:
    "Preview-confirm/commit receiver configuration actions use POST; GET/navigation never changes the Bitcoin destination.",
  sameOrigin:
    "Receiver configuration POSTs require a trusted VIA same-origin request context.",
  csrf:
    "A server-validated anti-CSRF token is required in addition to owner authorization, fresh re-authentication and the receiver-change session.",
  failClosed:
    "Invalid method/origin/CSRF requests are rejected before configuration processing.",
  noPayment:
    "Request validation performs no Bitcoin signing, payment confirmation, refund, settlement, forwarding or blockchain write.",
} as const
