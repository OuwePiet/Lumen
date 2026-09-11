export type ViaSponsorRisk =
  | "scam"
  | "misleading-finance"
  | "gambling"
  | "adult"
  | "malware"
  | "deceptive-token"
  | "aggressive-tracking"
  | "unverifiable"

export type ViaSponsorReview = {
  sponsorId: string
  risks: ViaSponsorRisk[]
  destinationHttps: boolean
  identityVerifiable: boolean
}

export type ViaSponsorReviewDecision =
  | { approved: true }
  | { approved: false; reason: "unsafe" | "unverifiable" | "invalid-destination" }

export function reviewSponsor(input: ViaSponsorReview): ViaSponsorReviewDecision {
  if (!input.destinationHttps) {
    return { approved: false, reason: "invalid-destination" }
  }
  if (!input.identityVerifiable || input.risks.includes("unverifiable")) {
    return { approved: false, reason: "unverifiable" }
  }
  if (input.risks.length > 0) {
    return { approved: false, reason: "unsafe" }
  }
  return { approved: true }
}

export const VIA_COMMUNITY_SUPPORT_GUIDE = {
  page:
    "Sponsorship belongs primarily on a separate Community Support page so VIA's main experience remains clean.",
  safety:
    "VIA rejects scams, misleading financial promotions, gambling, adult advertising, malware, deceptive tokens, aggressive tracking and unverifiable sponsors.",
  doubt:
    "When VIA cannot establish sufficient sponsor quality or legitimacy, the placement stays empty.",
  principle:
    "Trust and community safety take priority over sponsor revenue. Zero sponsor revenue is preferable to unsafe advertising.",
  independence:
    "Sponsorship never buys verification, feed ranking, rewards, auction outcomes or NFT ownership.",
} as const
