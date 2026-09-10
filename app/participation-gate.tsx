import Link from "next/link"

type ParticipationGateProps = {
  title?: string
  text?: string
  compact?: boolean
}

export default function ParticipationGate({
  title = "DeSo login required to participate",
  text = "You can keep looking around without logging in. Posting and other public participation open through the controlled DeSo route.",
  compact = false,
}: ParticipationGateProps) {
  return (
    <aside
      aria-label="VIA participation boundary"
      style={{
        marginTop: compact ? 12 : 20,
        border: "1px solid rgba(143,212,169,.32)",
        borderRadius: 14,
        background: "rgba(9,14,11,.76)",
        padding: compact ? 12 : 16,
      }}
    >
      <p style={{ margin: 0, color: "#9adbb2", fontWeight: 700 }}>{title}</p>
      <p style={{ margin: "7px 0 0", color: "#aebbb4", lineHeight: 1.55, fontSize: 13 }}>{text}</p>
      <div style={{ marginTop: 12, display: "flex", gap: 9, flexWrap: "wrap" }}>
        <Link href="/social" style={{ border: "1px solid rgba(143,212,169,.42)", borderRadius: 10, padding: "8px 12px", color: "#9adbb2", textDecoration: "none", fontWeight: 650, fontSize: 13 }}>
          Open DeSo participation
        </Link>
        <Link href="/discover" style={{ border: "1px solid rgba(113,130,120,.42)", borderRadius: 10, padding: "8px 12px", color: "#c2cbc6", textDecoration: "none", fontWeight: 650, fontSize: 13 }}>
          Keep exploring
        </Link>
      </div>
    </aside>
  )
}
