export type ViaBitcoinReceiverChangeError =
  | "access-denied"
  | "reauth-required"
  | "invalid-address"
  | "confirmation-expired"
  | "request-invalid"
  | "configuration-unavailable"

export function bitcoinReceiverChangeSafeError(kind: ViaBitcoinReceiverChangeError): {
  code: ViaBitcoinReceiverChangeError
  messageKey: string
} {
  return {
    code: kind,
    messageKey: `payment.bitcoin.receiver.${kind}`,
  }
}

export const VIA_BITCOIN_RECEIVER_CHANGE_ERROR_RULES = {
  generic:
    "Owner-facing receiver configuration errors never echo submitted security tokens, session IDs, stack traces or deployment/provider secrets.",
  address:
    "Invalid-address feedback may identify that the public address is invalid but does not attempt to auto-correct or substitute another destination.",
  auth:
    "Authorization/reauth failures do not reveal protected configuration state to an unauthorized requester.",
  logs:
    "Server logs use non-secret error codes and safe request correlation metadata; CSRF tokens/session secrets are never logged.",
  noPayment:
    "Error handling performs no Bitcoin signing, payment confirmation, refund, settlement, forwarding or blockchain write.",
} as const
