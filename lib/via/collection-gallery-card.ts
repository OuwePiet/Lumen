import type { ViaCollection } from "./collection"
import type { ViaCollectionPublication } from "./collection-publication"
import { chooseCollectionCover } from "./collection-cover"
import { publicCollectionSummary, type ViaCollectionSummary } from "./collection-summary"

export type ViaCollectionGalleryCard = ViaCollectionSummary & {
  coverPostHashHex?: string
  coverSource: "creator-selected" | "first-item" | "none"
}

export function buildPublicCollectionGalleryCard(
  collection: ViaCollection,
  publication: ViaCollectionPublication
): ViaCollectionGalleryCard | null {
  const summary = publicCollectionSummary(collection, publication)
  if (!summary) return null

  const cover = chooseCollectionCover(collection)
  return {
    ...summary,
    coverPostHashHex: cover.postHashHex,
    coverSource: cover.source,
  }
}
