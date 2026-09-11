export type ViaFiatProviderBinding = {
  providerId: string
  providerReference: string
}

export function fiatProviderBindingMatches(input: {
  order: ViaFiatProviderBinding
  callback: ViaFiatProviderBinding
}): boolean {
  const orderProvider = input.order.providerId.trim()
  const orderReference = input.order.providerReference.trim()
  const callbackProvider = input.callback.providerId.trim()
  const callbackReference = input.callback.providerReference.trim()

  if (!orderProvider || !orderReference || !callbackProvider || !callbackReference) {
    return false
  }

  return (
    orderProvider === callbackProvider &&
    orderReference === callbackReference
  )
}

export const VIA_FIAT_PROVIDER_BINDING_RULES = {
  sameProvider:
    "A trusted fiat callback must originate from the same provider that owns the VIA payment order.",
  sameReference:
    "The callback payment reference must exactly match the provider reference already bound to the order.",
  noReferenceSwap:
    "A valid signature for one provider payment cannot be used to confirm a different VIA order or provider reference.",
  beforeReconciliation:
    "Provider/reference binding is checked before amount/currency reconciliation and shared idempotent side effects.",
} as const
