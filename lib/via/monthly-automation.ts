import type { ViaMonthlyIssue } from "./monthly-series"

export type ViaMonthlyAutomationStep =
  | "reserve-number"
  | "create-artwork"
  | "check-artwork"
  | "prepare-metadata"
  | "store-media"
  | "mint-1-of-1"
  | "start-24h-auction"
  | "settle-auction"
  | "allocate-reward-share"
  | "publish-result"

export type ViaMonthlyAutomationPlan = {
  issue: ViaMonthlyIssue
  steps: ViaMonthlyAutomationStep[]
  requiresSecureMintSigning: true
  requiresFundVerification: true
}

export function createViaMonthlyAutomationPlan(
  issue: ViaMonthlyIssue
): ViaMonthlyAutomationPlan {
  return {
    issue,
    steps: [
      "reserve-number",
      "create-artwork",
      "check-artwork",
      "prepare-metadata",
      "store-media",
      "mint-1-of-1",
      "start-24h-auction",
      "settle-auction",
      "allocate-reward-share",
      "publish-result",
    ],
    requiresSecureMintSigning: true,
    requiresFundVerification: true,
  }
}

export type ViaMonthlyArtworkBrief = {
  issueNumber: number
  creator: "VIA"
  collection: "VIA Monthly"
  uniqueRequired: true
  styleFixed: false
  peopleAllowedByDefault: false
}

export function monthlyArtworkBrief(issue: ViaMonthlyIssue): ViaMonthlyArtworkBrief {
  return {
    issueNumber: issue.number,
    creator: "VIA",
    collection: "VIA Monthly",
    uniqueRequired: true,
    styleFixed: false,
    peopleAllowedByDefault: false,
  }
}

export const VIA_MONTHLY_AUTOMATION_GUIDE = {
  authorship:
    "VIA Monthly is presented as an official VIA series. No personal @OuwePiet creator credit is added to the public series metadata.",
  artwork:
    "Each issue requires newly created artwork. Theme and style may change each month; uniqueness checks run before mint preparation.",
  execution:
    "The workflow is designed for end-to-end automation, but blockchain mint signing and money movement remain disabled until their dedicated security controls are operational.",
} as const
