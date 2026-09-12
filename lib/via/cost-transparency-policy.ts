export type ViaCostCurrency = "EUR" | "USD"

function parseServiceFeeBps(): number {
  const raw = process.env.VIA_SERVICE_FEE_BPS?.trim()
  if (!raw) return 0
  const value = Number(raw)
  if (!Number.isInteger(value) || value < 0) return 0
  return Math.min(value, 100)
}

export function currentViaCostPolicy() {
  const serviceFeeBps = parseServiceFeeBps()

  return {
    serviceFeeBps,
    serviceFeeMaximumBps: 100,
    serviceFeeDefaultBps: 0,
    serviceFeeCurrencyRule: "same-fiat-currency-as-checkout" as const,
    desoServiceFeeEnabled: false,
    principles: [
      "No subscription is required for normal VIA use.",
      "The person who triggers a paid action should bear the external cost caused by that action.",
      "External provider, storage and blockchain costs must be shown before confirmation whenever they are known.",
      "VIA does not add a DESO-denominated service fee to the current checkout path.",
      "Any VIA service fee must be explicit, small and never exceed 1% without a new deliberate release decision.",
      "Old illustrative tariffs are not authoritative. Current verified provider or network costs take precedence.",
      "A stale or changed cost quote must be refreshed before the user can approve the action.",
      "No hidden spread may be added to exchange-rate conversions.",
    ] as const,
  }
}

export const VIA_COST_TRANSPARENCY_RULES = {
  actualCostFirst:
    "Use verified current external cost data where available; do not keep historical example tariffs as live prices.",
  upfront:
    "Show the cost breakdown before the irreversible or paid action whenever the component can be known in advance.",
  actorPays:
    "Creators pay costs caused by creator actions such as minting or premium storage; buyers pay costs caused by checkout/payment processing unless a product rule explicitly states otherwise.",
  dynamic:
    "Provider/network/storage prices are configuration or live-quote data, not permanent hardcoded business truth.",
  freshness:
    "Every external cost source should carry a source and freshness timestamp; stale data must fail closed where it affects a payment total.",
} as const
