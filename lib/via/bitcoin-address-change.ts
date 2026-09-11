export type ViaBitcoinAddressChangeDecision =
  | { allowed: true; requiresReauth: true; requiresConfirmation: true }
  | { allowed: false; reason: "not-owner" | "invalid-address" }

export function bitcoinAddressChangeDecision(input: {
  ownerAuthorized: boolean
  addressValid: boolean
}): ViaBitcoinAddressChangeDecision {
  if (!input.ownerAuthorized) return { allowed: false, reason: "not-owner" }
  if (!input.addressValid) return { allowed: false, reason: "invalid-address" }

  return { allowed: true, requiresReauth: true, requiresConfirmation: true }
}

export const VIA_BITCOIN_ADDRESS_CHANGE_RULES = {
  protected:
    "Adding or replacing the public Bitcoin receiving address is a protected VIA-owner/admin configuration action.",
  reauth:
    "A valid owner session alone is insufficient: fresh re-authentication is required before committing an address change.",
  confirm:
    "The normalized destination address and bitcoin-mainnet network are shown back to the owner for explicit confirmation before save.",
  audit:
    "A successful change records private non-secret audit metadata (actor/time/change event); private keys/seeds are never involved.",
  noRetroactive:
    "Changing the configured address affects new payment requests only and never rewrites the destination bound to an existing Bitcoin order/attempt.",
} as const
