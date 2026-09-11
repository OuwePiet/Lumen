export type ViaBitcoinReceiverConfig = {
  address: string
  network: "bitcoin-mainnet"
}

export type ViaBitcoinReceiverResult =
  | { configured: true; address: string; network: "bitcoin-mainnet" }
  | { configured: false; reason: "missing-address" | "invalid-address" }

function looksLikeBitcoinMainnetAddress(value: string) {
  const address = value.trim()
  return (
    /^bc1[ac-hj-np-z02-9]{11,87}$/i.test(address) ||
    /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)
  )
}

export function bitcoinReceiverFromConfig(
  configuredAddress?: string,
): ViaBitcoinReceiverResult {
  const address = configuredAddress?.trim()
  if (!address) return { configured: false, reason: "missing-address" }
  if (!looksLikeBitcoinMainnetAddress(address)) {
    return { configured: false, reason: "invalid-address" }
  }

  return {
    configured: true,
    address,
    network: "bitcoin-mainnet",
  }
}

export const VIA_BITCOIN_RECEIVER_RULES = {
  publicAddress:
    "Only the public Bitcoin receiving address may be shown to a payer.",
  configuration:
    "The VIA Bitcoin receiving address is supplied through deployment/server configuration rather than hardcoded into application source.",
  noSecret:
    "A Bitcoin private key, seed phrase or signing secret must never be stored in VIA source code, client code or public configuration.",
  failClosed:
    "If no valid mainnet receiving address is configured, VIA must not offer a Bitcoin payment destination.",
  replaceable:
    "The configured public receiving address can be replaced without changing the payment-state model.",
} as const
