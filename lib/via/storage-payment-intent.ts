import type { ViaStorageQuote } from "./storage-fee"

export type ViaStoragePaymentMethod =
  | { kind: "external-wallet"; connectorId: string; publicAddress: string }
  | { kind: "provider-direct" }

export type ViaStoragePaymentIntent = {
  quote: ViaStorageQuote
  method: ViaStoragePaymentMethod
  acceptedAt?: string
  status: "quoted" | "accepted"
}

/**
 * A payment intent records the creator's explicit quote acceptance only.
 * VIA does not hold a prepaid balance here and this object cannot execute,
 * sign or authorize a wallet/provider payment.
 */
export function createStoragePaymentIntent(input: {
  quote: ViaStorageQuote
  method: ViaStoragePaymentMethod
  accepted?: boolean
}): ViaStoragePaymentIntent {
  return {
    quote: input.quote,
    method: input.method,
    acceptedAt: input.accepted ? new Date().toISOString() : undefined,
    status: input.accepted ? "accepted" : "quoted",
  }
}
