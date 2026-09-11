export type ViaPaymentAuditEventType =
  | "order-created"
  | "awaiting-payment"
  | "confirmation-received"
  | "confirmation-rejected"
  | "payment-confirmed"
  | "ledger-recorded"
  | "receipt-created"
  | "benefit-eligible"
  | "payment-failed"
  | "payment-expired"

export type ViaPaymentAuditEvent = {
  orderId: string
  type: ViaPaymentAuditEventType
  occurredAt: string
  source: "via" | "fiat-provider" | "bitcoin-observer"
  publicReference: string | null
}

export function createPaymentAuditEvent(
  input: ViaPaymentAuditEvent,
): ViaPaymentAuditEvent | null {
  if (!input.orderId.trim()) return null
  if (!input.occurredAt.trim()) return null

  return {
    orderId: input.orderId,
    type: input.type,
    occurredAt: input.occurredAt,
    source: input.source,
    publicReference: input.publicReference?.trim() || null,
  }
}

export const VIA_PAYMENT_AUDIT_RULES = {
  appendOnly:
    "Payment audit events are append-only records of state transitions; existing events are not rewritten to hide earlier outcomes.",
  noSecrets:
    "Audit events never contain card data, provider secrets, private keys, seed phrases, private wallet administration or internal security credentials.",
  traceability:
    "VIA keeps payment confirmation, ledger recording, receipt creation and benefit eligibility distinguishable for later reconciliation.",
  privateByDefault:
    "The payment audit trail is administrative data and is not exposed as a public VIA feed.",
  noAuthority:
    "An audit event records what happened and cannot authorize payment, refund, forwarding, signing or blockchain writes.",
} as const
