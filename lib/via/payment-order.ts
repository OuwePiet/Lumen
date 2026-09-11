export type ViaPaymentOrderPurpose = "sponsor" | "community-support"

export type ViaPaymentOrderStatus =
  | "created"
  | "awaiting-payment"
  | "confirmed"
  | "failed"
  | "expired"
  | "refunded"

export type ViaPaymentOrder = {
  id: string
  purpose: ViaPaymentOrderPurpose
  currency: "EUR" | "USD"
  amountMinor: number
  processingCostMinor: number
  totalDueMinor: number
  status: ViaPaymentOrderStatus
  providerId: string | null
  providerReference: string | null
}

export function createViaPaymentOrder(input: {
  id: string
  purpose: ViaPaymentOrderPurpose
  currency: "EUR" | "USD"
  amountMinor: number
  processingCostMinor: number
}): ViaPaymentOrder | null {
  if (!input.id.trim()) return null
  if (!Number.isSafeInteger(input.amountMinor) || input.amountMinor < 1) return null
  if (!Number.isSafeInteger(input.processingCostMinor) || input.processingCostMinor < 0) return null

  const totalDueMinor = input.amountMinor + input.processingCostMinor
  if (!Number.isSafeInteger(totalDueMinor)) return null

  return {
    id: input.id,
    purpose: input.purpose,
    currency: input.currency,
    amountMinor: input.amountMinor,
    processingCostMinor: input.processingCostMinor,
    totalDueMinor,
    status: "created",
    providerId: null,
    providerReference: null,
  }
}

export function markViaPaymentAwaitingProvider(
  order: ViaPaymentOrder,
  input: { providerId: string; providerReference: string },
): ViaPaymentOrder | null {
  if (order.status !== "created") return null
  if (!input.providerId.trim() || !input.providerReference.trim()) return null

  return {
    ...order,
    status: "awaiting-payment",
    providerId: input.providerId,
    providerReference: input.providerReference,
  }
}

export function applyViaProviderPaymentResult(
  order: ViaPaymentOrder,
  result: "confirmed" | "failed" | "expired",
): ViaPaymentOrder | null {
  if (order.status !== "awaiting-payment") return null
  if (!order.providerId || !order.providerReference) return null

  return {
    ...order,
    status: result,
  }
}

export function markViaPaymentRefunded(order: ViaPaymentOrder): ViaPaymentOrder | null {
  if (order.status !== "confirmed") return null

  return {
    ...order,
    status: "refunded",
  }
}

export const VIA_PAYMENT_ORDER_RULES = {
  providerConfirmationRequired:
    "VIA must not activate sponsorship or support benefits from a browser redirect alone. Confirmation requires trusted provider-side status.",
  cardDataBoundary:
    "Payment orders store only VIA order data and provider references; raw card or wallet credentials never belong in this model.",
  sponsorActivation:
    "Sponsor placement may start only after the related payment order has status confirmed.",
  supportPulse:
    "VIA Pulse may activate only after the related community-support payment order has status confirmed.",
} as const
