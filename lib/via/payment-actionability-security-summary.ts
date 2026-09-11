export const VIA_PAYMENT_ACTIONABILITY_SECURITY_SUMMARY = {
  release:
    "Payment-method support/release is separate from current operational readiness.",
  operational:
    "A released method is actionable only when its server-side production dependencies are currently operational.",
  invariant:
    "No method can be actionable unless both released and operational; inconsistent state fails closed.",
  projection:
    "Checkout uses one centralized actionable-method projection rather than independent static enabled lists.",
  priority:
    "EUR/USD remain primary, Bitcoin secondary and DESO an extra future route.",
  deso:
    "DESO stays non-actionable until its secure signing/payment-write boundary is explicitly released.",
  noSecrets:
    "Public payment-method projection exposes method availability only, never credentials, wallet administration or security internals.",
  noImplicitWrite:
    "Payment availability/actionability never itself authorizes signing, confirmation, refund, settlement, forwarding or blockchain writes.",
} as const

export const VIA_PAYMENT_ACTIONABILITY_SECURITY_REVIEW = {
  status: "boundary-complete",
  next:
    "Future payment-route work should integrate real provider/readiness implementations into this boundary rather than adding static enabled flags.",
} as const
