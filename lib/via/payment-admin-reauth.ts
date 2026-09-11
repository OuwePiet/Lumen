export type ViaSensitivePaymentAdminAction =
  | "approve-deletion"
  | "review-payment-mismatch"
  | "change-payment-configuration"

export function sensitivePaymentAdminMayProceed(input: {
  ownerAuthorized: boolean
  reauthenticatedAtMs: number
  nowMs: number
  maxReauthAgeMs: number
}): boolean {
  if (!input.ownerAuthorized) return false
  if (!Number.isSafeInteger(input.reauthenticatedAtMs) || input.reauthenticatedAtMs < 1) return false
  if (!Number.isSafeInteger(input.nowMs) || input.nowMs < input.reauthenticatedAtMs) return false
  if (!Number.isSafeInteger(input.maxReauthAgeMs) || input.maxReauthAgeMs < 1) return false

  return input.nowMs - input.reauthenticatedAtMs <= input.maxReauthAgeMs
}

export const VIA_SENSITIVE_PAYMENT_ADMIN_RULES = {
  freshProof:
    "Sensitive payment administration requires recent owner re-authentication in addition to an authenticated owner session.",
  serverSide:
    "The freshness check must be enforced server-side and cannot rely on a browser-only timestamp or UI state.",
  actions:
    "Deletion approval, payment mismatch intervention and payment-configuration changes are treated as sensitive administrative actions.",
  noSigning:
    "Fresh re-authentication grants only the requested VIA administrative action and never grants wallet signing, refunds, forwarding or blockchain-write authority.",
  configurableWindow:
    "The maximum accepted re-authentication age is a security configuration value and is not hardcoded by this boundary.",
} as const
