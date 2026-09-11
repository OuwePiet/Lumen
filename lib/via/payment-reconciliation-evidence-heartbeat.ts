export type ViaEvidenceSessionHeartbeat =
  | { valid: true; expiresAtMs: number }
  | { valid: false; reason: "expired" | "case-mismatch" | "invalid-session" }

export function evidenceSessionHeartbeat(input: {
  sessionCaseId: string
  requestedCaseId: string
  expiresAtMs: number
  nowMs: number
}): ViaEvidenceSessionHeartbeat {
  if (
    !input.sessionCaseId.trim() ||
    !Number.isSafeInteger(input.expiresAtMs) ||
    !Number.isSafeInteger(input.nowMs)
  ) {
    return { valid: false, reason: "invalid-session" }
  }

  if (input.sessionCaseId !== input.requestedCaseId) {
    return { valid: false, reason: "case-mismatch" }
  }

  if (input.nowMs >= input.expiresAtMs) {
    return { valid: false, reason: "expired" }
  }

  return { valid: true, expiresAtMs: input.expiresAtMs }
}

export const VIA_EVIDENCE_SESSION_HEARTBEAT_RULES = {
  validateOnly:
    "Heartbeat validates the existing sensitive evidence session; it never extends its expiry.",
  serverClock:
    "Production validation uses trusted server-side time and trusted session state.",
  failClosed:
    "Invalid, expired or case-mismatched sessions fail closed and detailed evidence is no longer returned.",
  noRefresh:
    "Keeping a browser tab open or repeatedly requesting heartbeat cannot refresh fresh re-authentication or evidence-session lifetime.",
  noEffects:
    "Heartbeat performs no case decision, payment confirmation, refund, settlement, signing or blockchain write.",
} as const
