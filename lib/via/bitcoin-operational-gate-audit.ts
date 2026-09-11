export type ViaBitcoinGateAudit = {
  event: "bitcoin-operational-readiness-changed"
  occurredAt: string
  ready: boolean
  missingCategories: Array<"receiver" | "rate-provider" | "observer" | "integration-tests">
}

export function bitcoinGateAudit(input: {
  previousReady: boolean
  currentReady: boolean
  missingCategories: ViaBitcoinGateAudit["missingCategories"]
  occurredAt: string
}): ViaBitcoinGateAudit | null {
  if (input.previousReady === input.currentReady || !input.occurredAt.trim()) return null

  return {
    event: "bitcoin-operational-readiness-changed",
    occurredAt: input.occurredAt,
    ready: input.currentReady,
    missingCategories: [...input.missingCategories],
  }
}

export const VIA_BITCOIN_GATE_AUDIT_RULES = {
  transitionOnly:
    "A readiness audit event is created only when Bitcoin changes between unavailable and fully ready.",
  categories:
    "Audit records dependency categories only; it never stores receiving addresses, provider credentials, tokens or internal endpoints.",
  private:
    "Operational readiness history is private VIA owner/admin metadata.",
  trustedTime:
    "Production events use trusted server-side timestamps.",
  noPayment:
    "Readiness audit recording performs no signing, payment confirmation, settlement, forwarding or blockchain write.",
} as const
