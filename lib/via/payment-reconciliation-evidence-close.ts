export type ViaEvidenceSessionCloseResult =
  | { closed: true; caseId: string; closedAt: string }
  | { closed: false; reason: "not-owner" | "no-active-session" | "case-mismatch" }

export function closeEvidenceSession(input: {
  ownerAuthorized: boolean
  activeCaseId: string | null
  requestedCaseId: string
  closedAt: string
}): ViaEvidenceSessionCloseResult {
  if (!input.ownerAuthorized) return { closed: false, reason: "not-owner" }
  if (!input.activeCaseId) return { closed: false, reason: "no-active-session" }
  if (input.activeCaseId !== input.requestedCaseId) {
    return { closed: false, reason: "case-mismatch" }
  }

  return { closed: true, caseId: input.requestedCaseId, closedAt: input.closedAt }
}

export const VIA_EVIDENCE_SESSION_CLOSE_RULES = {
  explicit:
    "The VIA-owner can explicitly close the currently active detailed-evidence session without changing the reconciliation case itself.",
  exact:
    "Close requests must match the active case-scoped evidence session and are rejected on case mismatch.",
  serverSide:
    "Production close invalidates trusted server-side evidence-session state, not only the browser view.",
  nextCase:
    "After successful close, another case still requires the normal fresh authorized evidence-access step.",
  noEffects:
    "Closing evidence access performs no case decision, payment confirmation, refund, settlement, signing or blockchain write.",
} as const
