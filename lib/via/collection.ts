export type ViaCollectionCategory =
  | "art"
  | "photography"
  | "video"
  | "music"
  | "3d"
  | "avatar"
  | "ai"
  | "other"

export type ViaCollectionItem = {
  postHashHex: string
  edition?: number
  position: number
}

export type ViaCollection = {
  id: string
  creatorPublicKey: string
  title: string
  description?: string
  coverPostHashHex?: string
  category: ViaCollectionCategory
  items: ViaCollectionItem[]
}

/**
 * VIA collections are presentation/organization metadata. They do not change
 * DeSo NFT ownership, provenance or transfer state.
 */
export function normalizeCollection(input: Partial<ViaCollection>): ViaCollection | null {
  const id = typeof input.id === "string" ? input.id.trim().slice(0, 80) : ""
  const creatorPublicKey =
    typeof input.creatorPublicKey === "string" ? input.creatorPublicKey.trim().slice(0, 128) : ""
  const title = typeof input.title === "string" ? input.title.trim().slice(0, 120) : ""
  const categories: ViaCollectionCategory[] = [
    "art", "photography", "video", "music", "3d", "avatar", "ai", "other",
  ]

  if (!id || !creatorPublicKey || !title || !input.category || !categories.includes(input.category)) {
    return null
  }

  const items = Array.isArray(input.items)
    ? input.items
        .filter((item): item is ViaCollectionItem =>
          Boolean(item) &&
          typeof item.postHashHex === "string" &&
          item.postHashHex.length > 0 &&
          Number.isInteger(item.position) &&
          item.position >= 0
        )
        .slice(0, 5000)
    : []

  return {
    id,
    creatorPublicKey,
    title,
    description:
      typeof input.description === "string" ? input.description.trim().slice(0, 1000) : undefined,
    coverPostHashHex:
      typeof input.coverPostHashHex === "string" ? input.coverPostHashHex.trim() : undefined,
    category: input.category,
    items,
  }
}
