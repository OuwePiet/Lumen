"use client"

import Link from "next/link"

const DESO_IDENTITY_ORIGIN = "https://identity.deso.org"
const DESO_LOGIN_URL = `${DESO_IDENTITY_ORIGIN}/log-in?accessLevelRequest=2`

type ParticipationGateProps = {
  title?: string
  text?: string
  compact?: boolean
}

export default function ParticipationGate({
  title = "DeSo login required to participate",
  text = "You can keep looking around without logging in. Posting and other public participation open through DeSo Identity.",
  compact = false,
}: ParticipationGateProps) {
  function openDeSoIdentity() {
    const width = Math.min(800, window.screen.availWidth)
    const height = Math.min(900, window.screen.availHeight)
    const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2)
    const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2)

    const identityWindow = window.open(
      DESO_LOGIN_URL,
      "via-deso-identity",
      `popup=yes,width=${Math.round(width)},height=${Math.round(height)},left=${Math.round(left)},top=${Math.round(top)}`,
    )

    if (!identityWindow) {
      window.location.assign(DESO_LOGIN_URL)
    }
  }

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
        <button
          type="button"
          onClick={openDeSoIdentity}
          style={{ border: "1px solid rgba(143,212,169,.42)", borderRadius: 10, padding: "8px 12px", color: "#9adbb2", background: "transparent", fontWeight: 650, fontSize: 13, cursor: "pointer" }}
        >
          Continue through DeSo
        </button>
        <Link href="/discover" style={{ border: "1px solid rgba(113,130,120,.42)", borderRadius: 10, padding: "8px 12px", color: "#c2cbc6", textDecoration: "none", fontWeight: 650, fontSize: 13 }}>
          Keep exploring
        </Link>
      </div>
      <p style={{ margin: "10px 0 0", color: "#7f8c85", fontSize: 11, lineHeight: 1.45 }}>
        VIA opens the official DeSo Identity flow with approval required for transactions. Login is an access step, not a VIA trust badge. VIA never asks you to type a seed phrase here.
      </p>
    </aside>
  )
}
