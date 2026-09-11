import type { ViaCollection } from "./collection"

export type ViaCollectionVisibility = "private" | "unlisted" | "public"

export type ViaCollectionPublication = {
  collectionId: string
  visibility: ViaCollectionVisibility
  publishedAt?: string
  updatedAt?: string
}

export function normalizeCollectionPublication(input: {
  collection: ViaCollection
  visibility?: unknown
  publishedAt?: unknown
  updatedAt?: unknown
}): ViaCollectionPublication {
  const visibility: ViaCollectionVisibility =
    input.visibility === "public" || input.visibility === "unlisted"
      ? input.visibility
      : "private"

  const safeDate = (value: unknown) =>
    typeof value === "string" && !Number.isNaN(Date.parse(value)) ? value : undefined

  return {
    collectionId: input.collection.id,
    visibility,
    publishedAt: visibility === "private" ? undefined : safeDate(input.publishedAt),
    updatedAt: safeDate(input.updatedAt),
  }
}

export function collectionIsDiscoverable(publication: ViaCollectionPublication) {
  return publication.visibility === "public"
}
