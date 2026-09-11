export const VIA_RECONCILIATION_EVIDENCE_RESPONSE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
  "X-Content-Type-Options": "nosniff",
} as const

export const VIA_RECONCILIATION_EVIDENCE_CACHE_RULES = {
  noStore:
    "Detailed reconciliation evidence responses are marked no-store so browsers and intermediary caches are instructed not to retain them.",
  dynamic:
    "Protected evidence routes must remain dynamically authorized per request and must not be statically generated or cached as shared content.",
  noPublicCache:
    "Evidence responses must never use public/shared cache directives or CDN revalidation that could expose one case to another request.",
  browserStorage:
    "Client code must not persist detailed evidence in localStorage, sessionStorage, IndexedDB or service-worker caches.",
  noEffects:
    "Cache-control policy performs no case decision, payment confirmation, refund, settlement, signing or blockchain write.",
} as const
