export type ViaReconciliationCloseResult =
  | { closed: true; status: "resolved"; resolution: "accepted" | "rejected" }
  | { closed: false; status: "open"; reason: "needs-more-review" | "already-closed" }

export function closeReconciliationCase(input: {
  alreadyClosed: boolean
  decision: "accept-as-payment" | "reject-evidence" | "needs-more-review"
}): ViaReconciliationCloseResult {
  if (input.alreadyClosed) {
    return { closed: false, status: "open", reason: "already-closed" }
  }

  if (input.decision === "needs-more-review") {
    return { closed: false, status: "open", reason: "needs-more-review" }
  }

  return {
    closed: true,
    status: "resolved",
    resolution: input.decision === "accept-as-payment" ? "accepted" : "rejected",
  }
}

export const VIA_RECONCILIATION_CLOSE_RULES = {
  explicit:
    "A reconciliation case closes only after an explicit accepted/rejected owner decision; needs-more-review keeps it open.",
  immutable:
    "Once resolved, the case is not silently reopened or overwritten; a later discrepancy requires a new linked administrative case.",
  effectsSeparate:
    "Closing an accepted case does not itself execute confirmed-payment effects; those remain in the separate controlled workflow.",
  audit:
    "Resolution status and non-secret decision metadata remain available to the private administrative audit trail.",
  noWrite:
    "Case closure performs no refund, forwarding, settlement, signing, custody or blockchain write.",
} as const
