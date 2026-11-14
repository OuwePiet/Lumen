export type NFTCollectionManifest = {
  version: 1
  creatorPublicKey: string
  title: string
  description: string
  category: "art" | "photography" | "video" | "music" | "3d" | "avatar" | "ai" | "other"
  items: string[]
}
export const NFT_COLLECTION_EXTRA_KEY = "ViaNFTCollection"

/** A public curated series, never an ownership or copyright certificate. */
export function parseNFTCollectionManifest(value: unknown, creatorPublicKey: string): NFTCollectionManifest | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const data = value as Record<string, unknown>
  if (data.version !== 1 || !/^[1-9A-HJ-NP-Za-km-z]{40,128}$/.test(creatorPublicKey) || data.creatorPublicKey !== creatorPublicKey ||
    typeof data.title !== "string" || !data.title.trim() || data.title.length > 120 ||
    typeof data.description !== "string" || data.description.length > 1000 ||
    typeof data.category !== "string" || !["art", "photography", "video", "music", "3d", "avatar", "ai", "other"].includes(data.category) ||
    !Array.isArray(data.items) || data.items.length < 1 || data.items.length > 50 ||
    !data.items.every((hash: unknown) => typeof hash === "string" && /^[a-f0-9]{64}$/i.test(hash))) return null
  const items = (data.items as string[]).map(hash => hash.toLowerCase())
  if (new Set(items).size !== items.length) return null
  return { version: 1, creatorPublicKey, title: data.title.trim(), description: data.description.trim(), category: data.category as NFTCollectionManifest["category"], items }
}
