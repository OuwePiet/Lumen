export type ViaBitcoinPublicPaymentStatus =
  | "awaiting-payment"
  | "confirming"
  | "confirmed"
  | "needs-review"
  | "expired"

export type ViaBitcoinPublicStatusView = {
  status: ViaBitcoinPublicPaymentStatus
  messageKey:
    | "bitcoin.awaiting"
    | "bitcoin.confirming"
    | "bitcoin.confirmed"
    | "bitcoin.review"
    | "bitcoin.expired"
}

export function bitcoinPublicStatusView(
  status: ViaBitcoinPublicPaymentStatus,
): ViaBitcoinPublicStatusView {
  const messageKeys: Record<ViaBitcoinPublicPaymentStatus, ViaBitcoinPublicStatusView["messageKey"]> = {
    "awaiting-payment": "bitcoin.awaiting",
    confirming: "bitcoin.confirming",
    confirmed: "bitcoin.confirmed",
    "needs-review": "bitcoin.review",
    expired: "bitcoin.expired",
  }

  return { status, messageKey: messageKeys[status] }
}

export const VIA_BITCOIN_PUBLIC_STATUS_RULES = {
  minimal:
    "The payer sees only a simple payment status and user-facing message, not internal reconciliation or provider data.",
  confirming:
    "A detected transaction may be shown as confirming while VIA waits for the required trusted confirmations.",
  review:
    "A mismatched payment is shown neutrally as needing review without exposing private fraud/risk or admin notes.",
  confirmed:
    "Confirmed is shown only after the trusted Bitcoin confirmation and order reconciliation boundaries succeed.",
  privacy:
    "Provider references, private accounting, internal wallet administration and security metadata are never included in this public status view.",
} as const
