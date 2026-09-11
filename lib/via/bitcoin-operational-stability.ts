export type ViaBitcoinStableReadiness =
  | { ready: true }
  | { ready: false; reason: "gate-not-ready" | "stability-window-not-met" | "invalid-time" }

export function bitcoinStableReadiness(input: {
  gateReady: boolean
  readySinceMs: number
  nowMs: number
  requiredStableMs: number
}): ViaBitcoinStableReadiness {
  if (!input.gateReady) return { ready: false, reason: "gate-not-ready" }

  if (
    !Number.isSafeInteger(input.readySinceMs) ||
    !Number.isSafeInteger(input.nowMs) ||
    !Number.isSafeInteger(input.requiredStableMs) ||
    input.requiredStableMs < 0 ||
    input.nowMs < input.readySinceMs
  ) {
    return { ready: false, reason: "invalid-time" }
  }

  return input.nowMs - input.readySinceMs >= input.requiredStableMs
    ? { ready: true }
    : { ready: false, reason: "stability-window-not-met" }
}

export const VIA_BITCOIN_STABILITY_RULES = {
  stable:
    "Bitcoin may be publicly offered only after the full operational gate has remained continuously ready for a deployment-configured stability window.",
  reset:
    "If any required dependency becomes not-ready, the stability timer resets; readiness must become continuous again.",
  serverTime:
    "Production stability timing uses trusted server-side timestamps.",
  failClosed:
    "Invalid timing state keeps Bitcoin unavailable.",
  noPayment:
    "Stability evaluation performs no signing, payment confirmation, settlement, forwarding or blockchain write.",
} as const
