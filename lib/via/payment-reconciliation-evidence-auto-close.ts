export type ViaEvidenceSessionAutoCloseReason =
  | "case-resolved"
  | "owner-signed-out"
  | "reauth-invalidated"

export function evidenceSessionMustAutoClose(input: {
  caseResolved: boolean
  ownerSignedOut: boolean
  reauthStillValid: boolean
}): ViaEvidenceSessionAutoCloseReason | null {
  if (input.caseResolved) return "case-resolved"
  if (input.ownerSignedOut) return "owner-signed-out"
  if (!input.reauthStillValid) return "reauth-invalidated"
  return null
}

export const VIA_EVIDENCE_SESSION_AUTO_CLOSE_RULES = {
  resolution:
    "Resolving the reconciliation case immediately invalidates any detailed-evidence session for that case.",
  signOut:
    "Owner sign-out invalidates the active detailed-evidence session.",
  reauth:
    "If the fresh re-authentication backing sensitive evidence access is invalidated, evidence access closes rather than remaining usable.",
  serverSide:
    "Automatic close is enforced in trusted server-side session state and cannot depend only on browser navigation.",
  noEffects:
    "Automatic evidence-session closure performs no case decision, payment confirmation, refund, settlement, signing or blockchain write.",
} as const
