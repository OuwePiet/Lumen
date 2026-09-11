export const VIA_PAYMENT_EVIDENCE_SECURITY_SUMMARY = {
  access:
    "Detailed reconciliation evidence is private, owner-only, case-scoped and requires fresh re-authentication.",
  lifetime:
    "Evidence sessions are short-lived, single-active, non-extending and revocable/auto-closed on security boundaries.",
  data:
    "Evidence is minimized, redacted, plain-text shaped and forbidden secrets/raw card data are excluded.",
  transport:
    "Protected responses are no-store/no-cache, no-referrer, anti-framing and never pass raw provider responses through.",
  requests:
    "Sensitive actions use same-origin + CSRF validation, explicit HTTP methods, JSON-only bounded allowlisted bodies and opaque case IDs.",
  abuse:
    "Evidence endpoints fail closed, use configurable server-side rate limiting and generic non-leaking errors.",
  extraction:
    "Bulk export is disabled; only explicit copying of individual safe fields is allowed and metadata-only audited.",
  authority:
    "Evidence review grants no payment configuration, confirmation, refund, settlement, signing, wallet or blockchain-write authority.",
} as const

export const VIA_PAYMENT_EVIDENCE_SECURITY_REVIEW = {
  status: "boundary-complete",
  note:
    "This summary marks the evidence-review security boundary as complete at policy/helper level; production route wiring must preserve every boundary above and be integration-tested before live payment evidence is enabled.",
} as const
