export type ViaBitcoinRequestReadinessBinding = {
  evaluatedAt: string
  gateReady: true
  stableReady: true
}

export function bitcoinRequestReadinessBinding(input: {
  evaluatedAt: string
  gateReady: boolean
  stableReady: boolean
}): ViaBitcoinRequestReadinessBinding | null {
  if (!input.evaluatedAt.trim() || !input.gateReady || !input.stableReady) return null
  return { evaluatedAt: input.evaluatedAt, gateReady: true, stableReady: true }
}

export const VIA_BITCOIN_REQUEST_READINESS_BINDING_RULES = {
  createTime:
    "A Bitcoin payment request is created only together with a fresh server-side record that both readiness gates were true at creation time.",
  metadata:
    "The binding records readiness booleans and trusted evaluation time only; it contains no credentials, tokens or internal endpoints.",
  notAuthority:
    "The binding is audit/diagnostic metadata for that request, not reusable authority for another request or later payment confirmation.",
  immutable:
    "Once attached to a payment request, the creation-time readiness binding is immutable.",
  noPayment:
    "Readiness binding performs no signing, payment confirmation, settlement, forwarding or blockchain write.",
} as const
