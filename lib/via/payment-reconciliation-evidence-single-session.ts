export type ViaEvidenceSessionStartDecision =
  | { allowed: true; replaceExisting: false }
  | { allowed: false; reason: "active-session-exists" }

export function evidenceSessionMayStart(input: {
  activeSessionExists: boolean
}): ViaEvidenceSessionStartDecision {
  if (input.activeSessionExists) {
    return { allowed: false, reason: "active-session-exists" }
  }
  return { allowed: true, replaceExisting: false }
}

export const VIA_EVIDENCE_SESSION_SINGLE_RULES = {
  single:
    "Only one active detailed-evidence session is allowed for the VIA-owner at a time.",
  deliberate:
    "Opening evidence for another case requires closing/revoking the current evidence session first, then a fresh authorized access step.",
  noSilentReplace:
    "VIA never silently replaces one active evidence session with another because that could hide which sensitive case is being viewed.",
  serverSide:
    "The one-active-session rule must be enforced against trusted server-side session state.",
  noAuthority:
    "Session coordination grants no payment decision, configuration, refund, signing, wallet or blockchain-write authority.",
} as const
