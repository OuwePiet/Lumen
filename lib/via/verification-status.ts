export type ViaVerificationState =
  | "unverified"
  | "verified-active"
  | "verified-inactive"

export type ViaVerificationInput = {
  sourceVerified: boolean
  meaningfulActivityCount: number
  recentActivityCount: number
}

export function evaluateViaVerification(input: ViaVerificationInput): ViaVerificationState {
  if (!input.sourceVerified) return "unverified"
  return input.meaningfulActivityCount > 0 && input.recentActivityCount > 1
    ? "verified-active"
    : "verified-inactive"
}

export function verificationMark(state: ViaVerificationState) {
  if (state === "verified-active") return "blue"
  if (state === "verified-inactive") return "grey"
  return "none"
}

export const VIA_VERIFICATION_GUIDE = {
  blue: "Verified account with sufficient recent meaningful activity.",
  grey: "Verification is still recognized, but the account has been inactive for an extended period.",
  restore: "A verified account returns to blue automatically after sufficient meaningful activity resumes.",
  source: "VIA does not revoke the underlying source verification; the colour adds VIA activity context.",
  trophy: "🏆 identifies only the current VIA Surprise Reward winner and moves to the next confirmed winner.",
} as const
