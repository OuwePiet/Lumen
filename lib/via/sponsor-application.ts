export type ViaSponsorAdType = "image" | "text-image" | "community-project" | "service"
export type ViaSponsorSpace = "small" | "medium" | "large"
export type ViaSponsorPaymentPlan = "full-upfront" | "two-parts"

export type ViaSponsorApplication = {
  applicationId: string
  contactEmail: string
  advertiserName: string
  websiteUrl: string
  creativeUploadName: string
  creativeMimeType: "image/png" | "image/jpeg" | "image/webp"
  creativeIsAnimated: boolean
  adType: ViaSponsorAdType
  requestedDays: number
  requestedSpace: ViaSponsorSpace
  paymentPlan: ViaSponsorPaymentPlan
  acceptedReviewTerms: boolean
  submittedAt: string
}

export type ViaSponsorApplicationStatus =
  | "submitted"
  | "automatic-check"
  | "awaiting-owner-email-decision"
  | "approved-awaiting-payment"
  | "rejected"
  | "active"
  | "awaiting-second-payment"
  | "expired"

export function validateSponsorApplication(input: ViaSponsorApplication) {
  if (!input.creativeUploadName.trim()) return "creative-upload-required" as const
  if (input.creativeIsAnimated) return "animated-creative-not-allowed" as const
  if (!["image/png", "image/jpeg", "image/webp"].includes(input.creativeMimeType)) return "unsupported-creative-format" as const
  if (!input.acceptedReviewTerms) return "review-terms-required" as const
  if (!input.contactEmail.includes("@")) return "email-required" as const
  if (input.requestedDays < 1 || input.requestedDays > 365) return "invalid-duration" as const

  try {
    const url = new URL(input.websiteUrl)
    if (url.protocol !== "https:") return "https-website-required" as const
  } catch {
    return "website-required" as const
  }

  return "valid" as const
}

export type ViaSponsorSchedule = {
  startsAt: string
  midpointAt?: string
  endsAt: string
}

export function paymentMilestones(input: {
  totalCents: number
  paymentPlan: ViaSponsorPaymentPlan
}) {
  if (!Number.isSafeInteger(input.totalCents) || input.totalCents < 1) return null

  if (input.paymentPlan === "full-upfront") {
    return [{ part: 1, amountCents: input.totalCents, activates: "full-term" as const }]
  }

  const first = Math.ceil(input.totalCents / 2)
  return [
    { part: 1, amountCents: first, activates: "first-half" as const },
    { part: 2, amountCents: input.totalCents - first, activates: "second-half" as const },
  ]
}

export const VIA_SPONSOR_APPLICATION_GUIDE = {
  language:
    "The application form uses plain everyday language and explains each choice without advertising jargon.",
  form:
    "Applicant chooses duration, advertising type, page-space size and payment plan, supplies a website for verification, and uploads the exact advertisement proposed for placement.",
  creative:
    "Sponsor review uses a static preview of the exact submitted creative. Animated, blinking, rotating, tilting or attention-grabbing motion advertising is not accepted.",
  consent:
    "Submission requires explicit agreement that VIA may review the advertiser, website and submitted advertising material.",
  automation:
    "Automatic checks run first. A passing application is then sent by email for the final VIA owner approve/reject decision.",
  decision:
    "No advertisement becomes active without that explicit email decision. Approval opens payment; rejection closes the application.",
  payment:
    "The advertiser may pay the full approved term upfront or in two parts. The second half activates only after its payment is confirmed.",
  expiry:
    "The advertisement is removed automatically when the paid approved term ends.",
} as const
