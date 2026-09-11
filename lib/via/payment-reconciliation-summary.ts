export type ViaReconciliationAdminSummary = {
  openCases: number
  resolvedCases: number
  followUpCases: number
  needsReview: boolean
}

export function reconciliationAdminSummary(input: {
  openCases: number
  resolvedCases: number
  followUpCases: number
}): ViaReconciliationAdminSummary | null {
  const values = [input.openCases, input.resolvedCases, input.followUpCases]
  if (values.some((value) => !Number.isSafeInteger(value) || value < 0)) return null

  return {
    ...input,
    needsReview: input.openCases > 0,
  }
}

export const VIA_RECONCILIATION_ADMIN_SUMMARY_RULES = {
  private:
    "Reconciliation counts and review indicators are visible only in the private owner/admin environment.",
  minimal:
    "The summary exposes counts/status only and does not include payer identity, provider secrets, addresses, raw evidence or financial credentials.",
  attention:
    "Open cases produce a review indicator so exceptional payments are not silently forgotten.",
  noEffects:
    "Viewing or calculating the summary never confirms, rejects, refunds, settles, forwards, signs or performs blockchain writes.",
} as const
