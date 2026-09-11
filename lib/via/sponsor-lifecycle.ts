export type ViaSponsorLifecycleStatus =
  | "submitted"
  | "under-review"
  | "rejected"
  | "approved-awaiting-payment"
  | "scheduled"
  | "active-first-half"
  | "awaiting-second-payment"
  | "active-second-half"
  | "expired"

export type ViaSponsorLifecycleEvent =
  | "submit"
  | "pass-precheck"
  | "reject"
  | "approve"
  | "confirm-full-payment"
  | "confirm-first-payment"
  | "reach-midpoint"
  | "confirm-second-payment"
  | "reach-end"

export function nextSponsorStatus(
  current: ViaSponsorLifecycleStatus,
  event: ViaSponsorLifecycleEvent,
  splitPayment: boolean
): ViaSponsorLifecycleStatus | null {
  if (current === "submitted" && event === "pass-precheck") return "under-review"
  if (current === "under-review" && event === "reject") return "rejected"
  if (current === "under-review" && event === "approve") return "approved-awaiting-payment"

  if (current === "approved-awaiting-payment") {
    if (!splitPayment && event === "confirm-full-payment") return "scheduled"
    if (splitPayment && event === "confirm-first-payment") return "scheduled"
  }

  if (current === "scheduled" && event === "confirm-full-payment" && !splitPayment) {
    return "active-second-half"
  }
  if (current === "scheduled" && event === "confirm-first-payment" && splitPayment) {
    return "active-first-half"
  }

  if (current === "active-first-half" && event === "reach-midpoint") {
    return "awaiting-second-payment"
  }
  if (current === "awaiting-second-payment" && event === "confirm-second-payment") {
    return "active-second-half"
  }
  if (current === "active-second-half" && event === "reach-end") return "expired"

  return null
}

export const VIA_SPONSOR_LIFECYCLE_GUIDE = {
  activation:
    "A sponsor placement cannot become active before owner approval and confirmed payment for the applicable term.",
  split:
    "For two-part payment, VIA pauses the placement at the midpoint if the second payment has not been confirmed.",
  expiry:
    "At the approved paid end time the placement expires automatically and is no longer publicly rendered.",
  manualWork:
    "The intended normal flow requires only the private owner Approve or Reject decision; later lifecycle transitions are automatic after verified events.",
} as const
