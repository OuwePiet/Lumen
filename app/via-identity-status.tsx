import type { CSSProperties } from "react"

type Props = {
  verified?: boolean
  inactive?: boolean
  compact?: boolean
  showLeaf?: boolean
  className?: string
}

const wrap: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  flex: "0 0 auto",
}

function CheckMark({ inactive, compact }: { inactive: boolean; compact: boolean }) {
  const size = compact ? 17 : 21
  const background = inactive
    ? "linear-gradient(145deg, #8a918d, #545c58)"
    : "linear-gradient(145deg, #51b8ff, #2386e8)"
  const shadow = inactive
    ? "0 0 0 1px rgba(210,220,214,.16), inset 0 1px 0 rgba(255,255,255,.16)"
    : "0 0 14px rgba(55,157,255,.30), 0 0 0 1px rgba(167,220,255,.24), inset 0 1px 0 rgba(255,255,255,.28)"

  return (
    <span
      title={inactive ? "90+ days without public DeSo activity" : "DeSo verified"}
      aria-label={inactive ? "Inactive for at least 90 days" : "DeSo verified"}
      style={{
        width: size,
        height: size,
        display: "inline-grid",
        placeItems: "center",
        borderRadius: "50%",
        background,
        boxShadow: shadow,
      }}
    >
      <svg width={compact ? 10 : 12} height={compact ? 10 : 12} viewBox="0 0 16 16" aria-hidden="true">
        <path d="M3.2 8.3 6.4 11.2 12.8 4.8" fill="none" stroke={inactive ? "#202824" : "#fff"} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

function ViaLeaf({ compact }: { compact: boolean }) {
  const size = compact ? 18 : 22
  return (
    <span
      title="VIA"
      aria-label="VIA"
      style={{
        width: size,
        height: size,
        display: "inline-grid",
        placeItems: "center",
        borderRadius: "50%",
        border: "1px solid rgba(143,212,169,.38)",
        background: "radial-gradient(circle at 35% 30%, rgba(143,212,169,.24), rgba(9,24,15,.82) 65%)",
        boxShadow: "0 0 12px rgba(143,212,169,.12), inset 0 1px 0 rgba(255,255,255,.06)",
      }}
    >
      <svg width={compact ? 12 : 15} height={compact ? 12 : 15} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19.7 3.7C12.8 4.4 7.6 7 5.1 11.2c-1.8 3-1.3 6.5.7 8.8 1.1-4.2 4-7.7 8.6-10.2-3.2 2.8-5.4 6-6.3 9.7 3.2.4 6.5-1 8.5-3.6 2.5-3.3 2.5-7.6 3.1-12.2Z" fill="#9FE3B8" />
      </svg>
    </span>
  )
}

export default function ViaIdentityStatusMarks({
  verified = false,
  inactive = false,
  compact = true,
  showLeaf = true,
  className,
}: Props) {
  return (
    <span className={className} style={wrap}>
      {inactive ? <CheckMark inactive compact={compact} /> : verified ? <CheckMark inactive={false} compact={compact} /> : null}
      {showLeaf ? <ViaLeaf compact={compact} /> : null}
    </span>
  )
}
