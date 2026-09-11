import type { ViaCollection, ViaCollectionItem } from "./collection"

function itemKey(item: Pick<ViaCollectionItem, "postHashHex" | "edition">) {
  return `${item.postHashHex.toLowerCase()}:${item.edition ?? "*"}`
}

export function addCollectionItem(
  collection: ViaCollection,
  item: Omit<ViaCollectionItem, "position">
): ViaCollection {
  const key = itemKey(item)
  if (collection.items.some((existing) => itemKey(existing) === key)) return collection

  return {
    ...collection,
    items: [
      ...collection.items,
      { ...item, position: collection.items.length },
    ],
  }
}

export function removeCollectionItem(
  collection: ViaCollection,
  item: Pick<ViaCollectionItem, "postHashHex" | "edition">
): ViaCollection {
  const key = itemKey(item)
  return {
    ...collection,
    items: collection.items
      .filter((existing) => itemKey(existing) !== key)
      .map((existing, position) => ({ ...existing, position })),
  }
}

export function reorderCollectionItems(
  collection: ViaCollection,
  orderedKeys: string[]
): ViaCollection {
  const byKey = new Map(collection.items.map((item) => [itemKey(item), item]))
  const ordered: ViaCollectionItem[] = []

  for (const key of orderedKeys) {
    const item = byKey.get(key.toLowerCase())
    if (item) {
      ordered.push(item)
      byKey.delete(key.toLowerCase())
    }
  }

  ordered.push(...byKey.values())
  return {
    ...collection,
    items: ordered.map((item, position) => ({ ...item, position })),
  }
}
