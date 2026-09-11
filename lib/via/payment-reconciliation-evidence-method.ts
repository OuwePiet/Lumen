export type ViaEvidenceAction = "view" | "open-session" | "close-session" | "revoke-session" | "copy-field"
export type ViaEvidenceHttpMethod = "GET" | "POST"

export function evidenceMethodAllowed(input: {
  action: ViaEvidenceAction
  method: ViaEvidenceHttpMethod
}): boolean {
  if (input.action === "view") return input.method === "GET"
  return input.method === "POST"
}

export const VIA_EVIDENCE_METHOD_RULES = {
  read:
    "Read-only rendering of already-authorized evidence uses GET and cannot mutate evidence-session state.",
  mutate:
    "Opening, closing or revoking a sensitive evidence session and explicit safe-field copy actions use POST.",
  reject:
    "Unsupported methods/actions are rejected before case/evidence processing and use generic protected-evidence errors.",
  csrf:
    "POST actions remain subject to the separate same-origin and server-validated anti-CSRF boundary.",
  noEffects:
    "HTTP method validation performs no case decision, payment confirmation, refund, settlement, signing or blockchain write.",
} as const
