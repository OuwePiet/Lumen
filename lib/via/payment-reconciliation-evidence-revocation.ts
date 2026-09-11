export type ViaEvidenceSessionRevocationReason =
  | "owner-closed"
  | "case-resolved"
  | "security-event"

export type ViaEvidenceSessionRevocation = {
  caseId: string
  revoked: true
  reason: ViaEvidenceSessionRevocationReason
  revokedAt: string
}

export function revokeEvidenceSession(input: {
  caseId: string
  reason: ViaEvidenceSessionRevocationReason
  revokedAt: string
  ownerAuthorized: boolean
}): ViaEvidenceSessionRevocation | null {
  if (!input.ownerAuthorized) return null
  if (!input.caseId.trim() || !input.revokedAt.trim()) return null

  return {
    caseId: input.caseId,
    revoked: true,
    reason: input.reason,
    revokedAt: input.revokedAt,
  }
}

export const VIA_EVIDENCE_SESSION_REVOCATION_RULES = {
  immediate:
    "A case-scoped evidence session can be invalidated before natural expiry when the owner closes it, the case resolves, or a security event requires it.",
  serverSide:
    "Revocation is enforced against server-side session state; removing browser UI alone is not sufficient.",
  noReuse:
    "A revoked evidence session cannot be restored or reused; fresh owner re-authentication is required for later access.",
  audit:
    "Revocation reason and time may be recorded as non-secret private audit metadata.",
  noEffects:
    "Revocation performs no payment decision, refund, settlement, signing, wallet or blockchain write.",
} as const
