export type ViaProviderSessionRequest = {
  orderId: string
  attemptId: string
  method: "fiat-eur" | "fiat-usd" | "bitcoin" | "deso"
}

export type ViaProviderSessionDraft = ViaProviderSessionRequest & {
  status: "eligible"
}

export function createProviderSessionDraft(
  request: ViaProviderSessionRequest,
  handoffEligible: boolean,
): ViaProviderSessionDraft | null {
  if (!handoffEligible) return null
  if (!request.orderId.trim() || !request.attemptId.trim()) return null
  if (!["fiat-eur", "fiat-usd", "bitcoin", "deso"].includes(request.method)) return null

  return { ...request, status: "eligible" }
}

export const VIA_PROVIDER_SESSION_RULES = {
  eligibilityOnly:
    "This boundary can only create an eligible provider-session draft after the checkout handoff gate has already approved the order/attempt/method state.",
  noProviderCall:
    "Creating a draft performs no network call to a payment provider and does not create a real provider session.",
  noSecrets:
    "Provider API keys, secrets, callback secrets and wallet credentials never enter this public session draft.",
  noPayment:
    "An eligible draft is not evidence of payment, settlement, NFT ownership, delivery or a blockchain write.",
  failClosed:
    "Missing identifiers, unsupported methods or a failed handoff gate produce no session draft.",
} as const
