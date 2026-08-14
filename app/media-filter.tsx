"use client"

import {
  Children,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react"

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
type DensityType = "comfortable" | "compact"

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

const PAGE_SIZE = 8
const SESSION_STORAGE_KEY = "lumen-collection-controls"

const sortLabels: Record<SortType, string> = {
  collection: "Collection order",
  title: "Title A–Z",
  "price-low": "Price low–high",
  "price-high": "Price high–low",
}

type StoredControls = {
  mediaFilter: "all" | MediaFilterType
  saleFilter: "all" | SaleFilterType
  sort: SortType
  search: string
  visibleLimit: number
  density?: DensityType
}

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
  activeLabels: {
    display: "flex",
    flexWrap: "wrap" as const,
    alignItems: "center",
    gap: "8px",
    margin: "-8px 0 22px",
  },
  activeLabel: {
    color: "#b9ffd4",
    background: "#10261a",
    border: "1px solid #285f40",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
    overflowWrap: "anywhere" as const,
    padding: "6px 10px",
  },
  resultCount: {
    color: "#84958b",
    fontSize: "13px",
    fontWeight: 700,
    margin: "-10px 0 24px",
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
  loadMore: {
    display: "flex",
    justifyContent: "center",
    marginTop: "28px",
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
  const [visibleLimit, setVisibleLimit] = useState(PAGE_SIZE)
  const [density, setDensity] = useState<DensityType>("comfortable")
  const [isStateRestored, setIsStateRestored] = useState(false)
  const cards = Children.toArray(children)
  const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase("en")
  useEffect(() => {
    try {
      const storedValue = sessionStorage.getItem(SESSION_STORAGE_KEY)

      if (storedValue) {
        const stored = JSON.parse(storedValue) as Partial<StoredControls>
        const validMediaFilter = mediaFilterOptions.some(
          ({ value }) => value === stored.mediaFilter
        )
        const validSaleFilter = saleFilterOptions.some(
          ({ value }) => value === stored.saleFilter
        )
        const validSort = [
          "collection",
          "title",
          "price-low",
          "price-high",
        ].includes(stored.sort ?? "")

        if (validMediaFilter && stored.mediaFilter) {
          setActiveMediaFilter(stored.mediaFilter)
        }

        if (validSaleFilter && stored.saleFilter) {
          setActiveSaleFilter(stored.saleFilter)
        }

        if (validSort && stored.sort) {
          setActiveSort(stored.sort)
        }

        if (typeof stored.search === "string") {
          setSearchQuery(stored.search)
        }

        if (
          stored.density === "comfortable" ||
          stored.density === "compact"
        ) {
          setDensity(stored.density)
        }

        if (
          typeof stored.visibleLimit === "number" &&
          Number.isFinite(stored.visibleLimit) &&
          stored.visibleLimit >= PAGE_SIZE
        ) {
          setVisibleLimit(Math.floor(stored.visibleLimit))
        }
      }
    } catch {
      sessionStorage.removeItem(SESSION_STORAGE_KEY)
    } finally {
      setIsStateRestored(true)
    }
  }, [])

  useEffect(() => {
    if (!isStateRestored) return

    const stored: StoredControls = {
      mediaFilter: activeMediaFilter,
      saleFilter: activeSaleFilter,
      sort: activeSort,
      search: searchQuery,
      visibleLimit,
      density,
    }

    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stored))
  }, [
    activeMediaFilter,
    activeSaleFilter,
    density,
    activeSort,
    isStateRestored,
    searchQuery,
    visibleLimit,
  ])

  const hasActiveControls =
    activeMediaFilter !== "all" ||
    activeSaleFilter !== "all" ||
    activeSort !== "collection" ||
    searchQuery !== "" ||
    density !== "comfortable"

  const activeLabels = [
    searchQuery.trim()
      ? `Search: “${searchQuery.trim()}”`
      : null,
    activeMediaFilter !== "all"
      ? `Media: ${
          mediaFilterOptions.find(
            ({ value }) => value === activeMediaFilter
          )?.label ?? activeMediaFilter
        }`
      : null,
    activeSaleFilter !== "all"
      ? `Sale: ${
          saleFilterOptions.find(
            ({ value }) => value === activeSaleFilter
          )?.label ?? activeSaleFilter
        }`
      : null,
    activeSort !== "collection"
      ? `Sort: ${sortLabels[activeSort]}`
      : null,
    density !== "comfortable" ? "View: Compact" : null,
  ].filter((label): label is string => Boolean(label))

  const resetControls = () => {
    setActiveMediaFilter("all")
    setActiveSaleFilter("all")
    setActiveSort("collection")
    setSearchQuery("")
    setVisibleLimit(PAGE_SIZE)
    setDensity("comfortable")
  }

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

  const effectiveGridStyle: CSSProperties = {
    ...gridStyle,
    gridTemplateColumns:
      density === "compact"
        ? "repeat(auto-fit, minmax(210px, 1fr))"
        : gridStyle.gridTemplateColumns,
    gap: density === "compact" ? "16px" : gridStyle.gap,
  }

  const displayedCards = sortedCards.slice(0, visibleLimit)
  const remainingCards = Math.max(
    sortedCards.length - displayedCards.length,
    0
  )

  return (
    <>
      <div style={styles.filterBar}>
        <input
          type="search"
          aria-label="Search NFT collection"
          placeholder="Search by title or creator"
          value={searchQuery}
          style={styles.search}
          onChange={(event) => {
            setSearchQuery(event.target.value)
            setVisibleLimit(PAGE_SIZE)
          }}
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
                onClick={() => {
                  setActiveMediaFilter(option.value)
                  setVisibleLimit(PAGE_SIZE)
                }}
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
                onClick={() => {
                  setActiveSaleFilter(option.value)
                  setVisibleLimit(PAGE_SIZE)
                }}
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
            onChange={(event) => {
              setActiveSort(event.target.value as SortType)
              setVisibleLimit(PAGE_SIZE)
            }}
          >
            <option value="collection">Collection order</option>
            <option value="title">Title A–Z</option>
            <option value="price-low">Price low–high</option>
            <option value="price-high">Price high–low</option>
          </select>
        </label>

        <div
          style={styles.controls}
          aria-label="Choose collection density"
        >
          <span style={styles.label}>View</span>
          {(["comfortable", "compact"] as const).map((option) => {
            const isActive = density === option

            return (
              <button
                key={option}
                type="button"
                aria-pressed={isActive}
                style={{
                  ...styles.button,
                  ...(isActive ? styles.activeButton : {}),
                }}
                onClick={() => setDensity(option)}
              >
                {option === "comfortable" ? "Comfortable" : "Compact"}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          disabled={!hasActiveControls}
          style={{
            ...styles.button,
            ...(!hasActiveControls
              ? { cursor: "default", opacity: 0.45 }
              : {}),
          }}
          onClick={resetControls}
        >
          Reset controls
        </button>
      </div>

      {activeLabels.length > 0 ? (
        <div
          style={styles.activeLabels}
          aria-label="Active collection controls"
        >
          <span style={styles.label}>Active</span>
          {activeLabels.map((label) => (
            <span key={label} style={styles.activeLabel}>
              {label}
            </span>
          ))}
        </div>
      ) : null}

      <p style={styles.resultCount} aria-live="polite">
        {displayedCards.length} of {cards.length}{" "}
        {cards.length === 1 ? "NFT" : "NFTs"} shown
      </p>

      {sortedCards.length > 0 ? (
        <>
          <div style={effectiveGridStyle}>
            {displayedCards.map(({ card }) => card)}
          </div>

          {remainingCards > 0 ? (
            <div style={styles.loadMore}>
              <button
                type="button"
                style={styles.button}
                onClick={() =>
                  setVisibleLimit((current) => current + PAGE_SIZE)
                }
              >
                Load more ({remainingCards})
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <div style={styles.empty}>No NFTs match these filters.</div>
      )}
    </>
  )
}
