import type { ViaPaymentOrder } from "./payment-order"

export const VIA_SUPPORT_PULSE_DURATION_MS = 8_000

export type ViaSupportPulse = {
  active: boolean
  durationMs: number
  motion: "subtle"
  blinking: false
}

export function supportPulseForPayment(order: ViaPaymentOrder): ViaSupportPulse {
  const active = order.purpose === "community-support" && order.status === "confirmed"

  return {
    active,
    durationMs: active ? VIA_SUPPORT_PULSE_DURATION_MS : 0,
    motion: "subtle",
    blinking: false,
  }
}

export const VIA_SUPPORT_PULSE_RULES = {
  trigger:
    "VIA Pulse is eligible only after a confirmed community-support payment; redirects, created orders and pending payments never trigger it.",
  duration: "The visual acknowledgement lasts approximately eight seconds.",
  motion: "The acknowledgement remains subtle and must never blink or flash.",
  privacy:
    "The public pulse acknowledges support without exposing payment references, wallet details or private accounting data.",
} as const
