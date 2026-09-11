import type { ViaPaymentOrder } from "./payment-order"

export type ViaSponsorReviewStatus = "pending" | "approved" | "rejected"

export type ViaSponsorActivationInput = {
  reviewStatus: ViaSponsorReviewStatus
  materialRevisionApproved: boolean
  paymentOrder: ViaPaymentOrder
}

export function sponsorMayActivate(input: ViaSponsorActivationInput): boolean {
  return (
    input.reviewStatus === "approved" &&
    input.materialRevisionApproved &&
    input.paymentOrder.purpose === "sponsor" &&
    input.paymentOrder.status === "confirmed"
  )
}

export const VIA_SPONSOR_ACTIVATION_RULES = {
  approval:
    "Sponsor placement requires private owner approval before activation.",
  payment:
    "An approved sponsor remains inactive until its sponsor payment order is confirmed.",
  material:
    "Any material revision invalidates activation until the revised static advertisement is approved again.",
  privacy:
    "Activation decisions never expose private admin notes, payment references or other sponsor applications.",
  media:
    "Only the separately validated static sponsor material may be placed; activation does not permit animated or substituted creative.",
} as const
