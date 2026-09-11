export type ViaFiatCallbackVerification =
  | { trusted: true; providerId: string; paymentReference: string }
  | { trusted: false; reason: "missing-signature" | "invalid-signature" | "missing-reference" }

export function fiatCallbackVerificationInput(input: {
  providerId: string
  paymentReference?: string
  signaturePresent: boolean
  signatureValid: boolean
}): ViaFiatCallbackVerification {
  if (!input.signaturePresent) return { trusted: false, reason: "missing-signature" }
  if (!input.signatureValid) return { trusted: false, reason: "invalid-signature" }

  const paymentReference = input.paymentReference?.trim()
  if (!paymentReference) return { trusted: false, reason: "missing-reference" }

  return {
    trusted: true,
    providerId: input.providerId,
    paymentReference,
  }
}

export const VIA_FIAT_CALLBACK_RULES = {
  signed:
    "A fiat payment callback is trusted only after the selected provider's server-side signature/authenticity verification succeeds.",
  secret:
    "Webhook or callback verification secrets remain server-side and are never exposed to VIA client code.",
  reference:
    "A trusted callback must include the provider payment reference used for order matching and idempotency.",
  browser:
    "A browser success/return URL never confirms a fiat payment by itself.",
  providerSpecific:
    "The concrete signature algorithm stays inside the selected replaceable payment-provider adapter.",
} as const
