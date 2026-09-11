export type ViaVerificationState =
  | "unverified"
  | "verified-active"
  | "verified-inactive"

export type ViaVerificationSource = {
  kind: "deso-node"
  sourceId: string
  verified: boolean
  observedAt: string
}

export type ViaVerificationInput = {
  sources: ViaVerificationSource[]
  meaningfulActivityCount: number
  recentActivityCount: number
}

export function hasRecognizedSourceVerification(sources: ViaVerificationSource[]) {
  return sources.some(
    (source) =>
      source.kind === "deso-node" &&
      source.verified === true &&
      source.sourceId.trim().length > 0
  )
}

export function evaluateViaVerification(input: ViaVerificationInput): ViaVerificationState {
  if (!hasRecognizedSourceVerification(input.sources)) return "unverified"

  return input.meaningfulActivityCount > 0 && input.recentActivityCount > 1
    ? "verified-active"
    : "verified-inactive"
}

export function verificationMark(state: ViaVerificationState) {
  if (state === "verified-active") return "blue"
  if (state === "verified-inactive") return "grey"
  return "none"
}

/**
 * VIA verification is automatic. There is no popularity vote, personal
 * approval or creator/admin discretion in this policy. Activity can change
 * the VIA display state of a recognized source verification, but activity
 * alone can never create identity verification.
 */
export const VIA_VERIFICATION_GUIDE = {
  automatic:
    "VIA verification is automated. VIA does not use personal approval, popularity voting or manual selection to determine verification status.",
  source:
    "VIA records the verification source. A DeSo-node verification is not presented as universal blockchain verification.",
  blue:
    "Blue means a recognized source verification is present and the account has sufficient recent meaningful activity.",
  grey:
    "Grey means the recognized verification remains known, but the account has been inactive for an extended period.",
  restore:
    "A verified account returns to blue automatically after sufficient meaningful activity resumes.",
  antiSpam:
    "Posting volume alone cannot create verification. Activity is used only to determine the active/inactive display state of an already recognized verification.",
  trophy:
    "🏆 identifies only the current VIA Surprise Reward winner and moves automatically to the next confirmed winner.",
} as const
