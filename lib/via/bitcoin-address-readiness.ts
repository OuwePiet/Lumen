export type ViaBitcoinAddressReadiness = {
  ready: boolean
  action: "none" | "configure-public-receiving-address"
  messageKey: "payment.bitcoin.address.ready" | "payment.bitcoin.address.required"
}

export function bitcoinAddressReadiness(input: {
  receiverConfigured: boolean
}): ViaBitcoinAddressReadiness {
  return input.receiverConfigured
    ? {
        ready: true,
        action: "none",
        messageKey: "payment.bitcoin.address.ready",
      }
    : {
        ready: false,
        action: "configure-public-receiving-address",
        messageKey: "payment.bitcoin.address.required",
      }
}

export const VIA_BITCOIN_ADDRESS_READINESS_RULES = {
  outstanding:
    "Bitcoin remains unavailable until the VIA-owner supplies a valid public Bitcoin mainnet receiving address through protected deployment/server configuration.",
  publicOnly:
    "Only a public receiving address is requested; VIA must never request or accept a Bitcoin private key or seed phrase for this configuration.",
  noPlaceholder:
    "No sample, generated or guessed Bitcoin destination may be used as a production fallback.",
  ownerAction:
    "Address configuration is an explicit owner deployment/admin action and is not editable by a payer.",
  noActivation:
    "Supplying the address alone does not make Bitcoin operational; rate-provider and trusted observer readiness are still independently required.",
} as const
