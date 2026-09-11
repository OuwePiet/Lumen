export const VIA_PROVIDER_SESSION_PREFLIGHT_RULES = {
  serverAuthority: "The provider-session preflight is evaluated only on the server using current payment readiness.",
  immutableBinding: "The order and checkout attempt must still match before a session draft can be returned.",
  liveMethodGate: "The payment method must still be actionable at preflight time.",
  noProviderNetworkCall: "This preflight never contacts a payment provider or creates a real provider session.",
  noPaymentProof: "A returned eligible draft is not payment confirmation, settlement, delivery or NFT ownership proof.",
  failClosed: "Malformed requests, readiness failures, binding failures and draft creation failures are rejected.",
} as const
