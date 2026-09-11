export type ViaCheckoutAttemptTerminalState = "confirmed" | "cancelled" | "expired" | "failed"

export type ViaCheckoutAttemptTransition =
  | { allowed: true; next: ViaCheckoutAttemptTerminalState }
  | { allowed: false; reason: "already-terminal" | "invalid-confirmation" }

export function checkoutAttemptMayFinish(input: {
  currentTerminalState: ViaCheckoutAttemptTerminalState | null
  next: ViaCheckoutAttemptTerminalState
  confirmationMatches: boolean
}): ViaCheckoutAttemptTransition {
  if (input.currentTerminalState) return { allowed: false, reason: "already-terminal" }
  if (input.next === "confirmed" && !input.confirmationMatches) {
    return { allowed: false, reason: "invalid-confirmation" }
  }
  return { allowed: true, next: input.next }
}

export const VIA_CHECKOUT_ATTEMPT_TERMINAL_RULES = {
  once:
    "A checkout attempt may enter a terminal state only once.",
  confirmed:
    "Confirmed is allowed only after trusted confirmation matches the exact order, attempt and payment method.",
  late:
    "Late callbacks or observations cannot rewrite a cancelled, expired, failed or already-confirmed attempt.",
  retry:
    "A retry uses a new attempt ID rather than reopening a terminal attempt.",
  noExecution:
    "Terminal-state validation does not itself perform settlement, transfer, signing, custody or blockchain writes.",
} as const
