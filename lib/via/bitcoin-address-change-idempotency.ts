export type ViaBitcoinReceiverChangeIdempotency =
  | { proceed: true }
  | { proceed: false; reason: "duplicate-change" | "key-mismatch" }

export function bitcoinReceiverChangeIdempotency(input: {
  idempotencyKey: string
  previousKey?: string
  previousAddress?: string
  submittedAddress: string
}): ViaBitcoinReceiverChangeIdempotency {
  const key = input.idempotencyKey.trim()
  if (!key) return { proceed: false, reason: "key-mismatch" }

  if (input.previousKey === key) {
    return input.previousAddress === input.submittedAddress
      ? { proceed: false, reason: "duplicate-change" }
      : { proceed: false, reason: "key-mismatch" }
  }

  return { proceed: true }
}

export const VIA_BITCOIN_RECEIVER_CHANGE_IDEMPOTENCY_RULES = {
  oneCommit:
    "A protected receiver-change submission carries a server-tracked idempotency key so retries cannot commit the same configuration change twice.",
  exact:
    "Reusing a key with a different address is rejected as a mismatch rather than treated as a new change.",
  audit:
    "Duplicate retries do not create duplicate receiver-change audit events.",
  scope:
    "Idempotency keys are scoped to the protected owner configuration operation and are not payer-controlled.",
  noPayment:
    "Receiver configuration idempotency performs no Bitcoin signing, payment confirmation, refund, settlement, forwarding or blockchain write.",
} as const
