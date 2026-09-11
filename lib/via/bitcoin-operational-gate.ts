export type ViaBitcoinOperationalGate = {
  ready: boolean
  missing: Array<"receiver" | "rate-provider" | "observer" | "integration-tests">
}

export function bitcoinOperationalGate(input: {
  receiverReady: boolean
  rateProviderReady: boolean
  observerReady: boolean
  integrationTestsPassed: boolean
}): ViaBitcoinOperationalGate {
  const missing: ViaBitcoinOperationalGate["missing"] = []
  if (!input.receiverReady) missing.push("receiver")
  if (!input.rateProviderReady) missing.push("rate-provider")
  if (!input.observerReady) missing.push("observer")
  if (!input.integrationTestsPassed) missing.push("integration-tests")

  return { ready: missing.length === 0, missing }
}

export const VIA_BITCOIN_OPERATIONAL_GATE_RULES = {
  allRequired:
    "Bitcoin checkout stays unavailable until receiver, trusted rate provider, trusted transaction observer and integration tests are all ready.",
  failClosed:
    "A missing/unknown dependency keeps Bitcoin disabled rather than degrading to a partial payment flow.",
  independent:
    "Receiver configuration alone never activates Bitcoin checkout.",
  visible:
    "Admin/readiness UI may show which dependency categories remain missing without exposing secrets or provider credentials.",
  noPayment:
    "Operational readiness evaluation performs no signing, payment confirmation, settlement, forwarding or blockchain write.",
} as const
