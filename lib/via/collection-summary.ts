import type { ViaCollection } from "./collection"
import type { ViaCollectionPublication } from "./collection-publication"

export type ViaCollectionSummary = {
  id: string
  title: string
  description?: string
  category: ViaCollection["category"]
  coverPostHashHex?: string
  itemCount: number
  visibility: ViaCollectionPublication["visibility"]
  creatorPublicKey: string
}

export function buildCollectionSummary(
  collection: ViaCollection,
  publication: ViaCollectionPublication
): ViaCollectionSummary {
  return {
    id: collection.id,
    title: collection.title,
    description: collection.description,
    category: collection.category,
    coverPostHashHex: collection.coverPostHashHex,
    itemCount: collection.items.length,
    visibility: publication.visibility,
    creatorPublicKey: collection.creatorPublicKey,
  }
}

export function publicCollectionSummary(
  collection: ViaCollection,
  publication: ViaCollectionPublication
): ViaCollectionSummary | null {
  return publication.visibility === "public"
    ? buildCollectionSummary(collection, publication)
    : null
}
