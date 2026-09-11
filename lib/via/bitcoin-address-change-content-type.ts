export type ViaBitcoinReceiverContentTypeDecision =
  | { allowed: true }
  | { allowed: false; reason: "unsupported-content-type" }

export function bitcoinReceiverContentTypeDecision(input: {
  contentType: string
}): ViaBitcoinReceiverContentTypeDecision {
  const normalized = input.contentType.split(";")[0]?.trim().toLowerCase()
  return normalized === "application/json"
    ? { allowed: true }
    : { allowed: false, reason: "unsupported-content-type" }
}

export const VIA_BITCOIN_RECEIVER_CONTENT_TYPE_RULES = {
  jsonOnly:
    "Protected Bitcoin receiver configuration POSTs accept application/json only.",
  beforeParse:
    "Content-Type is validated before parsing the receiver-change body.",
  noForm:
    "Form-urlencoded, multipart/form-data, text payloads and file uploads are rejected for receiver configuration.",
  bounded:
    "Production routes apply a small request-body size limit appropriate only to address/session/security metadata.",
  noPayment:
    "Content-type validation performs no Bitcoin signing, payment confirmation, refund, settlement, forwarding or blockchain write.",
} as const
