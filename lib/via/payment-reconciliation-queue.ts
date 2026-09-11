export type ViaReconciliationQueueItem = {
  caseId: string
  openedAtMs: number
  followUp: boolean
}

export function sortReconciliationQueue(
  items: readonly ViaReconciliationQueueItem[],
): ViaReconciliationQueueItem[] | null {
  if (
    items.some(
      (item) =>
        !item.caseId.trim() ||
        !Number.isSafeInteger(item.openedAtMs) ||
        item.openedAtMs < 0,
    )
  ) {
    return null
  }

  return [...items].sort((a, b) => {
    if (a.followUp !== b.followUp) return a.followUp ? -1 : 1
    if (a.openedAtMs !== b.openedAtMs) return a.openedAtMs - b.openedAtMs
    return a.caseId.localeCompare(b.caseId)
  })
}

export const VIA_RECONCILIATION_QUEUE_RULES = {
  priority:
    "Linked follow-up cases are listed first, then cases are ordered oldest-first so long-waiting exceptions remain visible.",
  deterministic:
    "Case ID is the final deterministic tie-breaker when timestamps are equal.",
  private:
    "Queue ordering is private owner/admin presentation logic and exposes no case data publicly.",
  noRiskInference:
    "Ordering does not assign fraud/risk scores or infer payer intent; it only organizes already-open administrative cases.",
  noEffects:
    "Sorting the queue performs no case decision, payment, refund, settlement, signing or blockchain write.",
} as const
