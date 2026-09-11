export type ViaEditionState = {
  serialNumber: number
  ownerPublicKey: string
  forSale: boolean
}

export type ViaGiftDecision =
  | { allowed: true; serialNumber: number }
  | { allowed: false; reason: "edition-not-found" | "not-owned" | "remove-sale-first" }

export function evaluateGift(input: {
  editions: ViaEditionState[]
  serialNumber: number
  senderPublicKey: string
}): ViaGiftDecision {
  const edition = input.editions.find((item) => item.serialNumber === input.serialNumber)
  if (!edition) return { allowed: false, reason: "edition-not-found" }
  if (edition.ownerPublicKey !== input.senderPublicKey) return { allowed: false, reason: "not-owned" }
  if (edition.forSale) return { allowed: false, reason: "remove-sale-first" }
  return { allowed: true, serialNumber: edition.serialNumber }
}

export type ViaDistributionMode = "gift" | "giveaway" | "bulk"

export function availableGiftEditions(editions: ViaEditionState[], ownerPublicKey: string) {
  return editions.filter((item) => item.ownerPublicKey === ownerPublicKey && !item.forSale)
}
