export type ViaBitcoinReadinessSnapshot = {
  gateReady: boolean
  stableReady: boolean
  evaluatedAt: string
}

export function bitcoinReadinessSnapshot(input: {
  gateReady: boolean
  stableReady: boolean
  evaluatedAt: string
}): ViaBitcoinReadinessSnapshot | null {
  if (!input.evaluatedAt.trim()) return null
  if (input.stableReady && !input.gateReady) return null

  return {
    gateReady: input.gateReady,
    stableReady: input.stableReady,
    evaluatedAt: input.evaluatedAt,
  }
}

export const VIA_BITCOIN_READINESS_SNAPSHOT_RULES = {
  invariant:
    "Stable-ready can never be true while the underlying full operational gate is false.",
  server:
    "Production readiness snapshots are computed server-side from trusted dependency state and trusted time.",
  ephemeral:
    "A snapshot is an observation, not permanent authority; checkout re-evaluates readiness rather than trusting stale browser state.",
  noSecrets:
    "Snapshots contain readiness booleans/time only and never addresses, credentials, tokens or internal endpoints.",
  noPayment:
    "Snapshot creation performs no signing, payment confirmation, settlement, forwarding or blockchain write.",
} as const
