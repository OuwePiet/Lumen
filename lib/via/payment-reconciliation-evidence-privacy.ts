export const VIA_RECONCILIATION_EVIDENCE_PRIVACY_HEADERS = {
  "Referrer-Policy": "no-referrer",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "frame-ancestors 'none'",
} as const

export const VIA_RECONCILIATION_EVIDENCE_PRIVACY_RULES = {
  noReferrer:
    "Protected evidence responses use no-referrer so sensitive case URLs/paths are not sent as Referer metadata to another origin.",
  noFraming:
    "Evidence views cannot be embedded in external frames; both legacy X-Frame-Options and CSP frame-ancestors deny framing.",
  internalNavigation:
    "Owner navigation away from detailed evidence should use normal VIA routes without placing evidence values in query strings or URL fragments.",
  identifiers:
    "Sensitive evidence values must never be encoded into URLs, route names, analytics labels or outbound-link parameters.",
  noEffects:
    "Privacy headers perform no case decision, payment confirmation, refund, settlement, signing or blockchain write.",
} as const
