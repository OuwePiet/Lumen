import type { ViaFiatCurrency } from "./fiat-currency-gate"

export type ViaFiatAmountGate =
  | { allowed: true; amountMinor: number; currency: ViaFiatCurrency }
  | { allowed: false; reason: "invalid-amount" | "outside-limits" }

export function fiatAmountGate(input: {
  amountMinor: number
  currency: ViaFiatCurrency
  minMinor: number
  maxMinor: number
}): ViaFiatAmountGate {
  if (
    !Number.isSafeInteger(input.amountMinor) ||
    !Number.isSafeInteger(input.minMinor) ||
    !Number.isSafeInteger(input.maxMinor) ||
    input.minMinor < 1 ||
    input.maxMinor < input.minMinor
  ) return { allowed: false, reason: "invalid-amount" }

  if (input.amountMinor < input.minMinor || input.amountMinor > input.maxMinor) {
    return { allowed: false, reason: "outside-limits" }
  }

  return { allowed: true, amountMinor: input.amountMinor, currency: input.currency }
}

export const VIA_FIAT_AMOUNT_GATE_RULES = {
  minorUnits:
    "Fiat amounts are represented as integer minor units (cents) and never binary floating-point currency values.",
  limits:
    "Minimum/maximum checkout amounts are explicit deployment/business configuration per supported payment context.",
  server:
    "The server recomputes/validates the payable amount from trusted order data; a browser-supplied amount is never authority.",
  exact:
    "The exact amountMinor + currency bound to the VIA order must reconcile with the trusted provider confirmation.",
  failClosed:
    "Invalid integers or out-of-range amounts are rejected before hosted checkout creation.",
} as const
