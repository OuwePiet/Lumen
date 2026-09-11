import type { ViaCollectionSummary } from "./collection-summary"

export type ViaCollectionSort = "title" | "largest" | "smallest"

export function filterPublicCollectionSummaries(
  summaries: ViaCollectionSummary[],
  input: {
    category?: ViaCollectionSummary["category"]
    creatorPublicKey?: string
    query?: string
    sort?: ViaCollectionSort
  } = {}
) {
  const query = input.query?.trim().toLocaleLowerCase()

  return summaries
    .filter((summary) => summary.visibility === "public")
    .filter((summary) => !input.category || summary.category === input.category)
    .filter(
      (summary) =>
        !input.creatorPublicKey ||
        summary.creatorPublicKey === input.creatorPublicKey
    )
    .filter(
      (summary) =>
        !query ||
        summary.title.toLocaleLowerCase().includes(query) ||
        summary.description?.toLocaleLowerCase().includes(query)
    )
    .sort((a, b) => {
      switch (input.sort) {
        case "largest":
          return b.itemCount - a.itemCount || a.title.localeCompare(b.title)
        case "smallest":
          return a.itemCount - b.itemCount || a.title.localeCompare(b.title)
        default:
          return a.title.localeCompare(b.title)
      }
    })
}
