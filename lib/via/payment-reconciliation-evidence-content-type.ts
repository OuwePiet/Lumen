export type ViaEvidenceContentTypeDecision =
  | { allowed: true }
  | { allowed: false; reason: "unsupported-content-type" }

export function evidenceContentTypeDecision(input: {
  action: "open-session" | "close-session" | "revoke-session" | "copy-field"
  contentType: string
}): ViaEvidenceContentTypeDecision {
  const normalized = input.contentType.split(";")[0]?.trim().toLowerCase()
  return normalized === "application/json"
    ? { allowed: true }
    : { allowed: false, reason: "unsupported-content-type" }
}

export const VIA_EVIDENCE_CONTENT_TYPE_RULES = {
  jsonOnly:
    "Sensitive evidence POST actions accept application/json only; form posts, multipart bodies and text payloads are rejected.",
  validateBeforeParse:
    "Content-Type is validated before request-body processing to reduce ambiguous parser behavior.",
  boundedBody:
    "Production routes apply a small request-body size limit appropriate to identifiers/action metadata, never evidence uploads.",
  noUpload:
    "Detailed payment evidence is provider/server-derived; the owner browser does not upload arbitrary evidence files through these action routes.",
  noEffects:
    "Content-type validation performs no case decision, payment confirmation, refund, settlement, signing or blockchain write.",
} as const
