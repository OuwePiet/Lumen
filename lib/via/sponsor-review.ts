import type { ViaSponsorApplication } from "./sponsor-application"

export type ViaSponsorReviewPacket = {
  applicationId: string
  advertiserName: string
  contactEmail: string
  websiteUrl: string
  creativeUploadName: string
  adType: ViaSponsorApplication["adType"]
  requestedDays: number
  requestedSpace: ViaSponsorApplication["requestedSpace"]
  paymentPlan: ViaSponsorApplication["paymentPlan"]
  submittedAt: string
  ownerDecisionRequired: true
}

export type ViaSponsorOwnerDecision =
  | { decision: "approved"; decidedAt: string }
  | { decision: "rejected"; decidedAt: string; reason?: string }

export function buildSponsorReviewPacket(
  application: ViaSponsorApplication
): ViaSponsorReviewPacket {
  return {
    applicationId: application.applicationId,
    advertiserName: application.advertiserName,
    contactEmail: application.contactEmail,
    websiteUrl: application.websiteUrl,
    creativeUploadName: application.creativeUploadName,
    adType: application.adType,
    requestedDays: application.requestedDays,
    requestedSpace: application.requestedSpace,
    paymentPlan: application.paymentPlan,
    submittedAt: application.submittedAt,
    ownerDecisionRequired: true,
  }
}

export const VIA_SPONSOR_REVIEW_GUIDE = {
  review:
    "The owner decision email must show the advertiser, verified website, requested placement, term, payment plan and the exact submitted static advertisement preview.",
  decision:
    "Only Approve or Reject is required from the VIA owner. All later payment, activation and expiry steps are designed to continue automatically.",
  immutableCreative:
    "Approval applies only to the exact reviewed creative. Replacing the advertisement requires a new review before it can go live.",
} as const
