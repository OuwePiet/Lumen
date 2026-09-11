export type ViaBitcoinReceiverChangeBody = {
  address: string
  changeSessionId: string
  csrfToken: string
  idempotencyKey: string
}

export function bitcoinReceiverChangeBody(input: unknown): ViaBitcoinReceiverChangeBody | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null
  const value = input as Record<string, unknown>
  const allowed = ["address", "changeSessionId", "csrfToken", "idempotencyKey"]
  if (Object.keys(value).some((key) => !allowed.includes(key))) return null
  if (allowed.some((key) => typeof value[key] !== "string")) return null

  const address = (value.address as string).trim()
  const changeSessionId = (value.changeSessionId as string).trim()
  const csrfToken = (value.csrfToken as string).trim()
  const idempotencyKey = (value.idempotencyKey as string).trim()

  if (
    !address || address.length > 128 ||
    !changeSessionId || changeSessionId.length > 256 ||
    !csrfToken || csrfToken.length > 512 ||
    !idempotencyKey || idempotencyKey.length > 256
  ) return null

  return { address, changeSessionId, csrfToken, idempotencyKey }
}

export const VIA_BITCOIN_RECEIVER_CHANGE_BODY_RULES = {
  allowlist:
    "Receiver configuration bodies accept only address, changeSessionId, csrfToken and idempotencyKey; unexpected/nested fields are rejected.",
  bounded:
    "Every accepted string is non-empty and length-bounded before address/session/security validation continues.",
  noSecrets:
    "Private keys, seed phrases, wallet secrets, payment evidence and arbitrary metadata are never accepted by this configuration body.",
  json:
    "Production receiver-change routes accept this body only as application/json after content-type validation.",
  noPayment:
    "Body validation performs no Bitcoin signing, payment confirmation, refund, settlement, forwarding or blockchain write.",
} as const
