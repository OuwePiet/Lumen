export type ViaPaymentMethod = "fiat" | "bitcoin" | "deso"
export type ViaFiatCurrency = "EUR" | "USD"

export const VIA_PAYMENT_METHODS = [
  {
    id: "fiat" as const,
    priority: 1,
    label: "Card / € / $",
    description: "Regular payment",
  },
  {
    id: "bitcoin" as const,
    priority: 2,
    label: "Bitcoin ₿",
    description: "Bitcoin payment",
  },
  {
    id: "deso" as const,
    priority: 3,
    label: "$DESO",
    description: "Other payment method",
  },
] as const

export type ViaPaymentOrder = {
  orderId: string
  amountMinor: number
  displayCurrency: ViaFiatCurrency
  method: ViaPaymentMethod
  purpose: "sponsor" | "community-support"
}

export function validatePaymentOrder(order: ViaPaymentOrder) {
  if (!order.orderId.trim()) return "missing-order" as const
  if (!Number.isSafeInteger(order.amountMinor) || order.amountMinor < 1) {
    return "invalid-amount" as const
  }
  return "valid" as const
}

export const VIA_PAYMENT_PRIORITY_GUIDE = {
  default:
    "VIA presents regular EUR/USD payment first, Bitcoin second and DESO only as an additional method.",
  externalUsers:
    "A sponsor or supporter does not need a DeSo account or DESO balance to pay VIA.",
  accounting:
    "Sponsor Admin records the order primarily in EUR or USD regardless of the selected settlement method.",
  activation:
    "Sponsorship and support acknowledgements activate only after the selected payment method is confirmed.",
  provider:
    "Card, bank-wallet and fiat processing must use a dedicated external payment provider; VIA must never collect raw card credentials itself.",
} as const
