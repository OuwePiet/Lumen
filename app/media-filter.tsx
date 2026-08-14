"use client"

import { Children, useState, type CSSProperties, type ReactNode } from "react"

export type MediaFilterType =
  | "image"
  | "video"
  | "audio"
  | "unavailable"

export type SaleFilterType = "for-sale" | "not-for-sale"

export type SortData = {
  title: string
  creator: string
  price?: number
}

type SortType = "collection" | "title" | "price-low" | "price-high"

type MediaFilterProps = {
  mediaTypes: MediaFilterType[]
  saleStatuses: SaleFilterType[]
  sortData: SortData[]
  gridStyle: CSSProperties
  children: ReactNode
}

const mediaFilterOptions: Array<{
  label: string
  value: "all" | MediaFilterType
}> = [
  { label: "All", value: "all" },
  { label: "Image", value: "image" },
  { label: "Video", value: "video" },
  { label: "Audio", value: "audio" },
  { label: "Unavailable", value: "unavailable" },
]

const saleFilterOptions: Array<{
  label: string
  value: "all" | SaleFilterType
}> = [
  { label: "All", value: "all" },
  { label: "For sale", value: "for-sale" },
  { label: "Not for sale", value: "not-for-sale" },
]

const styles = {
  filterBar: {
    display: "flex",
    flexWrap: "wrap" as const,
    alignItems: "center",
    gap: "18px 28px",
    margin: "0 0 24px",
  },
  controls: {
    display: "flex",
    flexWrap: "wrap" as const,
    alignItems: "center",
    gap: "10px",
  },
  label: {
    color: "#a9b8af",
    fontSize: "13px",
    fontWeight: 700,
    marginRight: "4px",
  },
  button: {
    appearance: "none" as const,
    color: "#a9b8af",
    background: "#0c120f",
    border: "1px solid #254233",
    borderRadius: "999px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 700,
    padding: "8px 12px",
  },
  activeButton: {
    color: "#050807",
    background: "#5cff9d",
    borderColor: "#5cff9d",
  },
  search: {
    width: "min(100%, 360px)",
    color: "#f4f7f5",
    background: "#0c120f",
    border: "1px solid #254233",
    borderRadius: "10px",
    fontSize: "14px",
    padding: "10px 12px",
  },
  select: {
    color: "#f4f7f5",
    background: "#0c120f",
    border: "1px solid #254233",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 700,
    padding: "8px 32px 8px 10px",
  },
  empty: {
    color: "#84958b",
    background: "#0c120f",
    border: "1px solid #254233",
    borderRadius: "18px",
    padding: "24px",
  },
}

export default function MediaFilter({
  mediaTypes,
  saleStatuses,
  sortData,
  gridStyle,
  children,
}: MediaFilterProps) {
  const [activeMediaFilter, setActiveMediaFilter] =
    useState<"all" | MediaFilterType>("all")
  const [activeSaleFilter, setActiveSaleFilter] =
    useState<"all" | SaleFilterType>("all")
  const [activeSort, setActiveSort] = useState<SortType>("collection")
  const [searchQuery, setSearchQuery] = useState("")
  const cards = Children.toArray(children)
  const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase("en")

  const visibleCards = cards
    .map((card, index) => ({
      card,
      index,
      title: sortData[index]?.title ?? "",
      creator: sortData[index]?.creator ?? "",
      price: sortData[index]?.price,
    }))
    .filter(
      ({ index }) =>
        (activeMediaFilter === "all" ||
          mediaTypes[index] === activeMediaFilter) &&
        (activeSaleFilter === "all" ||
          saleStatuses[index] === activeSaleFilter) &&
        (normalizedSearchQuery === "" ||
          sortData[index]?.title
            .toLocaleLowerCase("en")
            .includes(normalizedSearchQuery) ||
          sortData[index]?.creator
            .toLocaleLowerCase("en")
            .includes(normalizedSearchQuery))
    )

  const sortedCards = [...visibleCards].sort((first, second) => {
    if (activeSort === "title") {
      return first.title.localeCompare(second.title, "en", {
        sensitivity: "base",
      })
    }

    if (activeSort === "price-low" || activeSort === "price-high") {
      const firstPrice = first.price ?? Number.POSITIVE_INFINITY
      const secondPrice = second.price ?? Number.POSITIVE_INFINITY

      if (!Number.isFinite(firstPrice) && !Number.isFinite(secondPrice)) {
        return first.index - second.index
      }

      if (!Number.isFinite(firstPrice)) return 1
      if (!Number.isFinite(secondPrice)) return -1

      return activeSort === "price-low"
        ? firstPrice - secondPrice
        : secondPrice - firstPrice
    }

    return first.index - second.index
  })

  return (
    <>
      <div style={styles.filterBar}>
        <input
          type="search"
          aria-label="Search NFT collection"
          placeholder="Search by title or creator"
          value={searchQuery}
          style={styles.search}
          onChange={(event) => setSearchQuery(event.target.value)}
        />

        <div
          style={styles.controls}
          aria-label="Filter collection by media"
        >
          <span style={styles.label}>Media</span>
          {mediaFilterOptions.map((option) => {
            const isActive = activeMediaFilter === option.value

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isActive}
                style={{
                  ...styles.button,
                  ...(isActive ? styles.activeButton : {}),
                }}
                onClick={() => setActiveMediaFilter(option.value)}
              >
                {option.label}
              </button>
            )
          })}
        </div>

        <div
          style={styles.controls}
          aria-label="Filter collection by sale status"
        >
          <span style={styles.label}>Sale</span>
          {saleFilterOptions.map((option) => {
            const isActive = activeSaleFilter === option.value

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isActive}
                style={{
                  ...styles.button,
                  ...(isActive ? styles.activeButton : {}),
                }}
                onClick={() => setActiveSaleFilter(option.value)}
              >
                {option.label}
              </button>
            )
          })}
        </div>

        <label style={styles.controls}>
          <span style={styles.label}>Sort</span>
          <select
            aria-label="Sort NFT collection"
            value={activeSort}
            style={styles.select}
            onChange={(event) =>
              setActiveSort(event.target.value as SortType)
            }
          >
            <option value="collection">Collection order</option>
            <option value="title">Title A–Z</option>
            <option value="price-low">Price low–high</option>
            <option value="price-high">Price high–low</option>
          </select>
        </label>
      </div>

      {sortedCards.length > 0 ? (
        <div style={gridStyle}>
          {sortedCards.map(({ card }) => card)}
        </div>
      ) : (
        <div style={styles.empty}>No NFTs match these filters.</div>
      )}
    </>
  )
}
