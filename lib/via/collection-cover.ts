import type { ViaCollection } from "./collection"

export type ViaCollectionCoverDecision = {
  postHashHex?: string
  source: "creator-selected" | "first-item" | "none"
}

export function chooseCollectionCover(
  collection: ViaCollection
): ViaCollectionCoverDecision {
  const explicit = collection.coverPostHashHex?.trim().toLowerCase()
  if (explicit) {
    const belongsToCollection = collection.items.some(
      (item) => item.postHashHex.trim().toLowerCase() === explicit
    )
    if (belongsToCollection) {
      return { postHashHex: explicit, source: "creator-selected" }
    }
  }

  const first = [...collection.items]
    .sort((a, b) => a.position - b.position)[0]
    ?.postHashHex.trim().toLowerCase()

  return first
    ? { postHashHex: first, source: "first-item" }
    : { source: "none" }
}
