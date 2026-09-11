export type ViaEvidenceError =
  | "access-denied"
  | "session-expired"
  | "case-not-found"
  | "evidence-unavailable"

export function evidenceSafeError(input: {
  kind: ViaEvidenceError
}): { code: ViaEvidenceError; publicMessageKey: string } {
  return {
    code: input.kind,
    publicMessageKey: `payment.reconciliation.evidence.${input.kind}`,
  }
}

export const VIA_EVIDENCE_ERROR_RULES = {
  generic:
    "Owner-facing evidence errors are concise and do not echo provider payloads, raw evidence, secrets, stack traces or internal infrastructure details.",
  logs:
    "Server logs use non-secret identifiers/error codes only; detailed evidence and forbidden secret fields are never included.",
  auth:
    "Access-denied and expired-session responses do not reveal whether another case, payer or provider reference exists.",
  recovery:
    "Recovery directs the owner back through normal case review/fresh authorization rather than exposing debug details in the browser.",
  noEffects:
    "Error handling performs no case decision, payment confirmation, refund, settlement, signing or blockchain write.",
} as const
