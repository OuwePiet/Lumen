"use client"

import { Children, useState, type CSSProperties, type ReactNode } from "react"

export type MediaFilterType =
  | "image"
  | "video"
  | "audio"
  | "unavailable"

type MediaFilterProps = {
  mediaTypes: MediaFilterType[]
  gridStyle: CSSProperties
  children: ReactNode
}

const filterOptions: Array<{
  label: string
  value: "all" | MediaFilterType
}> = [
  { label: "All", value: "all" },
  { label: "Image", value: "image" },
  { label: "Video", value: "video" },
  { label: "Audio", value: "audio" },
  { label: "Unavailable", value: "unavailable" },
]

const styles = {
  controls: {
    display: "flex",
    flexWrap: "wrap" as const,
    alignItems: "center",
    gap: "10px",
    margin: "0 0 24px",
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
  gridStyle,
  children,
}: MediaFilterProps) {
  const [activeFilter, setActiveFilter] =
    useState<"all" | MediaFilterType>("all")
  const cards = Children.toArray(children)
  const visibleCards = cards.filter(
    (_, index) =>
      activeFilter === "all" || mediaTypes[index] === activeFilter
  )

  return (
    <>
      <div style={styles.controls} aria-label="Filter collection by media">
        <span style={styles.label}>Media</span>
        {filterOptions.map((option) => {
          const isActive = activeFilter === option.value

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              style={{
                ...styles.button,
                ...(isActive ? styles.activeButton : {}),
              }}
              onClick={() => setActiveFilter(option.value)}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      {visibleCards.length > 0 ? (
        <div style={gridStyle}>{visibleCards}</div>
      ) : (
        <div style={styles.empty}>No NFTs match this media filter.</div>
      )}
    </>
  )
}
