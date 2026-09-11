import type { ViaBitcoinOperationalGate } from "./bitcoin-operational-gate"

export type ViaBitcoinReadinessLabel =
  | "payment.bitcoin.readiness.receiver"
  | "payment.bitcoin.readiness.rate-provider"
  | "payment.bitcoin.readiness.observer"
  | "payment.bitcoin.readiness.integration-tests"

const LABELS: Record<ViaBitcoinOperationalGate["missing"][number], ViaBitcoinReadinessLabel> = {
  receiver: "payment.bitcoin.readiness.receiver",
  "rate-provider": "payment.bitcoin.readiness.rate-provider",
  observer: "payment.bitcoin.readiness.observer",
  "integration-tests": "payment.bitcoin.readiness.integration-tests",
}

export function bitcoinReadinessLabels(
  gate: ViaBitcoinOperationalGate,
): ViaBitcoinReadinessLabel[] {
  return gate.missing.map((item) => LABELS[item])
}

export const VIA_BITCOIN_READINESS_UI_RULES = {
  owner:
    "Owner/admin readiness UI may show only dependency categories and ready/not-ready state.",
  noSecrets:
    "Readiness labels never expose receiving-address values, provider credentials, observer credentials, tokens or internal endpoints.",
  public:
    "Public checkout sees Bitcoin as unavailable until the operational gate is fully ready; it does not receive internal missing-dependency diagnostics.",
  neutral:
    "Unavailable state uses neutral wording and never claims a payment failure when Bitcoin was not offered.",
} as const
