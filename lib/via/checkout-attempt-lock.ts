export type ViaCheckoutAttemptLock = {
  orderId: string
  attemptId: string
  method: "fiat" | "bitcoin" | "deso"
  expiresAtMs: number
}

export function checkoutAttemptLockIsActive(input: {
  lock: ViaCheckoutAttemptLock | null
  orderId: string
  nowMs: number
}): boolean {
  if (!input.lock) return false
  if (input.lock.orderId !== input.orderId) return false
  if (!Number.isSafeInteger(input.nowMs)) return false
  return input.nowMs < input.lock.expiresAtMs
}

export function checkoutAttemptMayStart(input: {
  existingLock: ViaCheckoutAttemptLock | null
  orderId: string
  nowMs: number
}): boolean {
  return !checkoutAttemptLockIsActive(input)
}

export const VIA_CHECKOUT_ATTEMPT_LOCK_RULES = {
  oneActive:
    "A VIA payment order may have only one active checkout attempt at a time.",
  atomic:
    "Production persistence must acquire the attempt lock atomically before creating a provider session or Bitcoin payment request.",
  expiry:
    "Attempt locks expire so an abandoned checkout cannot block the order forever; concrete duration remains configurable.",
  retry:
    "A retry may start only after the earlier attempt is no longer active and must receive a new attempt ID/payment instruction.",
  noAuthority:
    "An attempt lock coordinates checkout concurrency and grants no payment, signing, custody, refund or blockchain-write authority.",
} as const
