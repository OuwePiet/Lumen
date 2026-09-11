export type ViaPaymentDataClass =
  | "order"
  | "provider-reference"
  | "public-receipt"
  | "audit"
  | "private-accounting"
  | "secret"

export type ViaPaymentDataExposure = "public" | "payer-only" | "admin-only" | "forbidden"

export const VIA_PAYMENT_DATA_EXPOSURE: Readonly<Record<ViaPaymentDataClass, ViaPaymentDataExposure>> = {
  order: "admin-only",
  "provider-reference": "admin-only",
  "public-receipt": "payer-only",
  audit: "admin-only",
  "private-accounting": "admin-only",
  secret: "forbidden",
}

export function paymentDataMayBeExposed(
  dataClass: ViaPaymentDataClass,
  audience: "public" | "payer" | "admin",
): boolean {
  const exposure = VIA_PAYMENT_DATA_EXPOSURE[dataClass]
  if (exposure === "forbidden") return false
  if (exposure === "public") return true
  if (exposure === "payer-only") return audience === "payer" || audience === "admin"
  return audience === "admin"
}

export const VIA_PAYMENT_DATA_MINIMIZATION_RULES = {
  collectMinimum:
    "VIA stores only payment data required for order handling, confirmation, reconciliation, accounting, receipts and audit.",
  secrets:
    "Raw card data, provider secrets, private keys and seed phrases are forbidden payment data and must never enter VIA persistence.",
  public:
    "Payment order, provider reference, audit and private accounting records are not public VIA content.",
  retention:
    "Retention periods must later be configured to legal/accounting requirements and should not be extended merely for analytics or advertising.",
  tracking:
    "Payment data is not repurposed for aggressive tracking or sponsor profiling.",
} as const
