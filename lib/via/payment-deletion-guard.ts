export type ViaPaymentDeletionApproval =
  | { allowed: true; approvedBy: "via-owner"; reason: "retention-expired" }
  | {
      allowed: false
      reason: "not-eligible" | "active-order" | "active-dispute" | "required-record" | "owner-not-authorized"
    }

export function authorizePaymentRecordDeletion(input: {
  retentionEligible: boolean
  activeOrder: boolean
  activeDispute: boolean
  requiredRecord: boolean
  ownerAuthorized: boolean
}): ViaPaymentDeletionApproval {
  if (!input.retentionEligible) return { allowed: false, reason: "not-eligible" }
  if (input.activeOrder) return { allowed: false, reason: "active-order" }
  if (input.activeDispute) return { allowed: false, reason: "active-dispute" }
  if (input.requiredRecord) return { allowed: false, reason: "required-record" }
  if (!input.ownerAuthorized) return { allowed: false, reason: "owner-not-authorized" }

  return {
    allowed: true,
    approvedBy: "via-owner",
    reason: "retention-expired",
  }
}

export const VIA_PAYMENT_DELETION_GUARD_RULES = {
  twoStage:
    "Retention expiry makes a payment record deletion-eligible; it does not delete the record automatically.",
  ownerOnly:
    "Destructive payment-record deletion requires an explicit authorized VIA-owner action.",
  protected:
    "Active orders, active disputes and legally/accounting-required records cannot pass the deletion guard.",
  audit:
    "Production deletion must create a non-secret administrative audit event describing the deletion decision without retaining the deleted sensitive payload.",
  noBulkDefault:
    "Bulk destructive deletion is not enabled by this boundary and requires a separately reviewed administrative workflow.",
} as const
