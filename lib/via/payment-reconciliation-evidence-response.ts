export type ViaEvidenceResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: "access-denied" | "session-expired" | "unavailable" }

export function evidenceResponse<T>(input: {
  allowed: boolean
  data?: T
  error?: "access-denied" | "session-expired" | "unavailable"
}): ViaEvidenceResponse<T> {
  if (input.allowed && input.data !== undefined) {
    return { ok: true, data: input.data }
  }

  return { ok: false, error: input.error ?? "unavailable" }
}

export const VIA_EVIDENCE_RESPONSE_RULES = {
  minimal:
    "Protected evidence APIs return a small explicit success/error envelope rather than raw provider responses.",
  noProviderPayload:
    "Provider status bodies, headers, debug fields and upstream error objects are never passed through directly to the browser.",
  genericFailure:
    "Failure envelopes remain generic and do not reveal payer, provider, transaction or case-existence details.",
  redactedData:
    "Successful data must already have passed authorization, session validation, redaction and safe-display shaping.",
  noEffects:
    "Response shaping performs no case decision, payment confirmation, refund, settlement, signing or blockchain write.",
} as const
