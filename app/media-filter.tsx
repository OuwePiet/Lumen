"use client"

import { Children, useState, type CSSProperties, type ReactNode } from "react"

export type MediaFilterType =
  | "image"
  | "video"
  | "audio"
  | "unavailable"

export type SaleFilterType = "for-sale" | "not-for-sale"

type MediaFilterProps = {
  mediaTypes: MediaFilterType[]
  saleStatuses: SaleFilterType[]
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
  gridStyle,
  children,
}: MediaFilterProps) {
  const [activeMediaFilter, setActiveMediaFilter] =
    useState<"all" | MediaFilterType>("all")
  const [activeSaleFilter, setActiveSaleFilter] =
    useState<"all" | SaleFilterType>("all")
  const cards = Children.toArray(children)
  const visibleCards = cards.filter(
    (_, index) =>
      (activeMediaFilter === "all" ||
        mediaTypes[index] === activeMediaFilter) &&
      (activeSaleFilter === "all" ||
        saleStatuses[index] === activeSaleFilter)
  )

  return (
    <>
      <div style={styles.filterBar}>
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
      </div>

      {visibleCards.length > 0 ? (
        <div style={gridStyle}>{visibleCards}</div>
      ) : (
        <div style={styles.empty}>No NFTs match these filters.</div>
      )}
    </>
  )
}
