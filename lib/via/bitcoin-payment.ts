export type ViaBitcoinPaymentStatus =
  | "created"
  | "awaiting-confirmation"
  | "confirmed"
  | "expired"
  | "failed"

export type ViaBitcoinPaymentReference = {
  orderId: string
  status: ViaBitcoinPaymentStatus
  providerReference: string | null
  transactionReference: string | null
}

export function createBitcoinPaymentReference(
  orderId: string,
): ViaBitcoinPaymentReference | null {
  if (!orderId.trim()) return null

  return {
    orderId,
    status: "created",
    providerReference: null,
    transactionReference: null,
  }
}

export function awaitBitcoinConfirmation(
  payment: ViaBitcoinPaymentReference,
  providerReference: string,
): ViaBitcoinPaymentReference | null {
  if (payment.status !== "created" || !providerReference.trim()) return null

  return {
    ...payment,
    status: "awaiting-confirmation",
    providerReference,
  }
}

export function confirmBitcoinPayment(
  payment: ViaBitcoinPaymentReference,
  transactionReference: string,
): ViaBitcoinPaymentReference | null {
  if (payment.status !== "awaiting-confirmation") return null
  if (!payment.providerReference || !transactionReference.trim()) return null

  return {
    ...payment,
    status: "confirmed",
    transactionReference,
  }
}

export const VIA_BITCOIN_PAYMENT_RULES = {
  confirmation:
    "Bitcoin sponsor or community-support benefits activate only after trusted confirmation, never from a browser return or unverified transaction claim.",
  externalUser:
    "Bitcoin payment does not require the sponsor or supporter to have a DeSo account.",
  references:
    "Public VIA interfaces must not expose internal provider references or private accounting details.",
  noCustody:
    "This boundary records confirmation state only; it does not create a custodial Bitcoin wallet or authorize spending.",
} as const
