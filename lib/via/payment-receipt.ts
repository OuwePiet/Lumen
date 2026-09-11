export type ViaPaymentReceiptMethod = "fiat" | "bitcoin"

export type ViaPaymentReceipt = {
  orderId: string
  method: ViaPaymentReceiptMethod
  currency: "EUR" | "USD" | "BTC"
  amount: string
  confirmedAt: string
  publicReference: string
}

export function createPaymentReceipt(input: ViaPaymentReceipt): ViaPaymentReceipt | null {
  if (!input.orderId.trim()) return null
  if (!input.amount.trim() || Number(input.amount) <= 0) return null
  if (!input.confirmedAt.trim()) return null
  if (!input.publicReference.trim()) return null

  if (input.method === "bitcoin" && input.currency !== "BTC") return null
  if (input.method === "fiat" && input.currency === "BTC") return null

  return { ...input }
}

export type ViaPublicReceiptView = Pick<
  ViaPaymentReceipt,
  "method" | "currency" | "amount" | "confirmedAt" | "publicReference"
>

export function publicPaymentReceipt(receipt: ViaPaymentReceipt): ViaPublicReceiptView {
  return {
    method: receipt.method,
    currency: receipt.currency,
    amount: receipt.amount,
    confirmedAt: receipt.confirmedAt,
    publicReference: receipt.publicReference,
  }
}

export const VIA_PAYMENT_RECEIPT_RULES = {
  confirmedOnly:
    "A receipt is created only after the corresponding VIA payment order has been independently confirmed.",
  privacy:
    "The payer-facing receipt excludes internal provider references, wallet administration, private ledger allocation and security metadata.",
  noProofOverride:
    "A displayed receipt summarizes a confirmed payment; it cannot itself be used to bypass provider or Bitcoin confirmation.",
  externalUser:
    "A fiat or Bitcoin payer can receive a VIA payment confirmation without requiring a DeSo account.",
} as const
