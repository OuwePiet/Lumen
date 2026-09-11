export type ViaSponsorOwnerDecision = "approve" | "reject"

export type ViaSponsorDecisionRecord = {
  applicationId: string
  decision: ViaSponsorOwnerDecision
  decidedAt: string
  decidedBy: "via-owner"
}

export function recordSponsorOwnerDecision(input: {
  applicationId: string
  decision: ViaSponsorOwnerDecision
  decidedAt: string
  ownerAuthorized: boolean
}): ViaSponsorDecisionRecord | null {
  if (!input.ownerAuthorized) return null
  if (!input.applicationId.trim() || !input.decidedAt.trim()) return null

  return {
    applicationId: input.applicationId,
    decision: input.decision,
    decidedAt: input.decidedAt,
    decidedBy: "via-owner",
  }
}

export function sponsorDecisionNextStep(record: ViaSponsorDecisionRecord) {
  return record.decision === "approve"
    ? ("await-payment" as const)
    : ("closed-rejected" as const)
}

export const VIA_SPONSOR_OWNER_DECISION_RULES = {
  ownerOnly:
    "Only the authorized VIA owner may create the final sponsor Approve or Reject decision.",
  simpleControl:
    "The normal owner action is deliberately limited to Approve or Reject.",
  approval:
    "Approve opens the payment step but does not itself activate or render the advertisement.",
  rejection:
    "Reject closes the application and does not expose private review notes to the applicant.",
  audit:
    "The decision is recorded separately from automatic precheck, payment confirmation and placement activation.",
} as const
