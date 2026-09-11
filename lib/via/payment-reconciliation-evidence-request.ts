export type ViaEvidenceRequestDecision =
  | { allowed: true }
  | { allowed: false; reason: "origin-mismatch" | "csrf-invalid" }

export function evidenceRequestDecision(input: {
  originMatchesVia: boolean
  csrfTokenValid: boolean
}): ViaEvidenceRequestDecision {
  if (!input.originMatchesVia) return { allowed: false, reason: "origin-mismatch" }
  if (!input.csrfTokenValid) return { allowed: false, reason: "csrf-invalid" }
  return { allowed: true }
}

export const VIA_EVIDENCE_REQUEST_RULES = {
  sameOrigin:
    "Sensitive reconciliation evidence actions require a trusted VIA same-origin request context.",
  csrf:
    "State-changing evidence-session actions such as open/close/revoke require a server-validated anti-CSRF token in addition to owner authorization.",
  noGetMutation:
    "GET/navigation requests must not open, extend, revoke or otherwise mutate a sensitive evidence session.",
  generic:
    "Rejected origin/CSRF requests use generic protected-evidence errors without revealing case/payment/provider details.",
  noEffects:
    "Request validation performs no case decision, payment confirmation, refund, settlement, signing or blockchain write.",
} as const
