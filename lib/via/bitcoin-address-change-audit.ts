export type ViaBitcoinAddressChangeAudit = {
  event: "bitcoin-receiver-configured" | "bitcoin-receiver-replaced"
  actor: "via-owner"
  occurredAt: string
  addressFingerprint: string
  network: "bitcoin-mainnet"
}

export function bitcoinAddressFingerprint(address: string): string | null {
  const value = address.trim()
  if (value.length < 12) return null
  return `${value.slice(0, 6)}…${value.slice(-6)}`
}

export function bitcoinAddressChangeAudit(input: {
  previousConfigured: boolean
  newAddress: string
  occurredAt: string
}): ViaBitcoinAddressChangeAudit | null {
  const addressFingerprint = bitcoinAddressFingerprint(input.newAddress)
  if (!addressFingerprint || !input.occurredAt.trim()) return null

  return {
    event: input.previousConfigured
      ? "bitcoin-receiver-replaced"
      : "bitcoin-receiver-configured",
    actor: "via-owner",
    occurredAt: input.occurredAt,
    addressFingerprint,
    network: "bitcoin-mainnet",
  }
}

export const VIA_BITCOIN_ADDRESS_AUDIT_RULES = {
  fingerprint:
    "Private audit history records only a shortened public-address fingerprint, not private keys/seeds and not the full destination unless operationally required elsewhere.",
  event:
    "Audit distinguishes first configuration from replacement and records actor, time and bitcoin-mainnet network.",
  afterCommit:
    "The audit event is written only after the protected configuration change succeeds.",
  private:
    "Bitcoin receiver configuration history is private owner/admin metadata.",
  noEffects:
    "Audit recording performs no Bitcoin signing, payment confirmation, refund, settlement, forwarding or blockchain write.",
} as const
