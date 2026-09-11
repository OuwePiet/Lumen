export type ViaPaymentAdminAction =
  | "view-order"
  | "view-ledger"
  | "view-audit"
  | "review-mismatch"
  | "approve-deletion"

export type ViaPaymentAdminAccess =
  | { allowed: true; actor: "via-owner"; action: ViaPaymentAdminAction }
  | { allowed: false; reason: "unauthenticated" | "not-owner" }

export function authorizePaymentAdminAction(input: {
  authenticated: boolean
  ownerAuthorized: boolean
  action: ViaPaymentAdminAction
}): ViaPaymentAdminAccess {
  if (!input.authenticated) return { allowed: false, reason: "unauthenticated" }
  if (!input.ownerAuthorized) return { allowed: false, reason: "not-owner" }

  return {
    allowed: true,
    actor: "via-owner",
    action: input.action,
  }
}

export const VIA_PAYMENT_ADMIN_ACCESS_RULES = {
  ownerOnly:
    "Payment orders, ledger, audit, mismatch review and deletion approval are private VIA-owner administrative capabilities.",
  serverEnforced:
    "Production authorization must be enforced server-side for every administrative request; hiding a browser route is not authorization.",
  noPublicFallback:
    "Failure to prove owner authorization never falls back to public or applicant access.",
  leastPrivilege:
    "Authorization for payment administration does not grant signing, refund, forwarding or blockchain-write authority.",
  audit:
    "Sensitive administrative actions should create a non-secret audit event after successful server-side authorization.",
} as const
