export type ViaPaymentMethodReadiness = {
  fiat: boolean
  bitcoin: boolean
}

export function paymentMethodReadiness(input: {
  fiatProviderConfigured: boolean
  fiatCallbackVerificationConfigured: boolean
  bitcoinReceiverConfigured: boolean
  bitcoinRateProviderConfigured: boolean
  bitcoinObserverConfigured: boolean
}): ViaPaymentMethodReadiness {
  return {
    fiat:
      input.fiatProviderConfigured &&
      input.fiatCallbackVerificationConfigured,
    bitcoin:
      input.bitcoinReceiverConfigured &&
      input.bitcoinRateProviderConfigured &&
      input.bitcoinObserverConfigured,
  }
}

export const VIA_PAYMENT_READINESS_RULES = {
  failClosed:
    "A payment method is unavailable unless every production dependency required to verify it is configured.",
  fiat:
    "Fiat requires both the selected provider and trusted server-side callback verification before it may be offered as operational.",
  bitcoin:
    "Bitcoin requires a valid receiving address, current-rate provider and trusted transaction observer/confirmation source before it may be offered as operational.",
  presentation:
    "Unavailable methods may be described as coming later but must not present an actionable payment destination or success path.",
  noActivation:
    "This readiness calculation does not itself activate payment writes, signing, custody, refunds or forwarding.",
} as const
