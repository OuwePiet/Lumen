export type ViaExternalWalletFamily =
  | "evm"
  | "solana"
  | "hardware"
  | "other"

export type ViaExternalWalletConnector = {
  id: string
  label: string
  family: ViaExternalWalletFamily
  nonCustodial: true
  enabled: boolean
}

export type ViaWalletConnection = {
  connectorId: string
  publicAddress: string
  connectedAt: string
}

/**
 * VIA external-wallet integrations are connector based and non-custodial.
 * Private keys, seed phrases and recovery secrets must never be requested,
 * accepted or stored by VIA.
 */
export function normalizeExternalWalletConnector(
  input: Partial<ViaExternalWalletConnector>
): ViaExternalWalletConnector | null {
  const id = typeof input.id === "string" ? input.id.trim().slice(0, 64) : ""
  const label = typeof input.label === "string" ? input.label.trim().slice(0, 120) : ""
  const families: ViaExternalWalletFamily[] = ["evm", "solana", "hardware", "other"]

  if (!id || !label || !input.family || !families.includes(input.family)) return null

  return {
    id,
    label,
    family: input.family,
    nonCustodial: true,
    enabled: input.enabled === true,
  }
}
