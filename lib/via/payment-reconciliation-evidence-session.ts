export type ViaEvidenceViewSession = {
  caseId: string
  openedAtMs: number
  expiresAtMs: number
}

export function evidenceViewSessionIsActive(input: {
  session: ViaEvidenceViewSession | null
  caseId: string
  nowMs: number
}): boolean {
  if (!input.session) return false
  if (input.session.caseId !== input.caseId) return false
  if (!Number.isSafeInteger(input.nowMs)) return false
  if (!Number.isSafeInteger(input.session.openedAtMs) || !Number.isSafeInteger(input.session.expiresAtMs)) return false
  if (input.session.expiresAtMs <= input.session.openedAtMs) return false

  return input.nowMs >= input.session.openedAtMs && input.nowMs < input.session.expiresAtMs
}

export const VIA_EVIDENCE_VIEW_SESSION_RULES = {
  shortLived:
    "Detailed reconciliation evidence access is represented by a short-lived case-scoped server-side session after fresh owner re-authentication.",
  caseScoped:
    "A session opened for one reconciliation case cannot be reused to view evidence from another case.",
  expiry:
    "After expiry, detailed evidence requires a new authorized access step; the browser cannot extend the session itself.",
  noPersistence:
    "Evidence content is not copied into browser storage by this session boundary.",
  noAuthority:
    "An evidence-view session grants no payment configuration, refund, settlement, signing, wallet or blockchain-write authority.",
} as const
