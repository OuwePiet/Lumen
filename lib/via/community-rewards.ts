export type ViaRewardCategory =
  | "meaningful-activity"
  | "helpful"
  | "quality-creator"
  | "collector"
  | "newcomer"

export type ViaRewardCandidate = {
  publicKey: string
  activeDays: number
  originalPosts: number
  meaningfulReplies: number
  receivedDiamonds: number
  receivedLikes: number
}

export function rewardEligible(candidate: ViaRewardCandidate) {
  return candidate.activeDays >= 7 && candidate.originalPosts >= 2
}

export function rewardScore(candidate: ViaRewardCandidate) {
  if (!rewardEligible(candidate)) return 0
  return (
    candidate.activeDays * 5 +
    Math.min(candidate.originalPosts, 28) * 2 +
    Math.min(candidate.meaningfulReplies, 28) * 3 +
    Math.min(candidate.receivedDiamonds, 20) * 2 +
    Math.min(candidate.receivedLikes, 40)
  )
}

export type ViaRewardBudget = {
  availableCents: number
  rewardCents: number
}

export function canFundReward(budget: ViaRewardBudget) {
  return budget.rewardCents > 0 && budget.availableCents >= budget.rewardCents
}

/**
 * Scheduling/random winner selection and money movement deliberately live
 * outside this pure policy layer. VIA must verify funded budget before award.
 */
