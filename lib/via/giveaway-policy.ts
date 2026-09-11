export type ViaClaimRequirement =
  | { kind: "free" }
  | { kind: "diamond"; minimumLevel: 1 | 2 | 3 | 4 }
  | { kind: "via-key"; keyId: string }
  | { kind: "via-points"; points: number }
  | { kind: "paid"; currency: "DESO" | "fiat" | "external-wallet"; amount: number }

export type ViaGiveawayPolicy = {
  availableCopies: number
  perAccount: number
  requirements: ViaClaimRequirement[]
}

export function normalizeGiveawayPolicy(input: ViaGiveawayPolicy): ViaGiveawayPolicy {
  return {
    availableCopies: Math.max(0, Math.floor(input.availableCopies)),
    perAccount: Math.max(1, Math.floor(input.perAccount)),
    requirements: input.requirements.slice(0, 8),
  }
}
