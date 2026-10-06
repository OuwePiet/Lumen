"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { viaModernIdentity, type ViaModernIdentityUser } from "./deso-identity-modern"

type ParticipationGateProps = {
  title?: string
  text?: string
  compact?: boolean
}

function shortPublicKey(publicKey: string) {
  if (publicKey.length <= 18) return publicKey
  return `${publicKey.slice(0, 9)}…${publicKey.slice(-7)}`
}

export default function ParticipationGate({
  title = "DeSo login required to participate",
  text = "You can keep looking around without logging in. Posting and other public participation open through DeSo Identity.",
  compact = false,
}: ParticipationGateProps) {
  const [session, setSession] = useState<ViaModernIdentityUser | null>(null)
  const [status, setStatus] = useState<"idle" | "waiting" | "blocked">("idle")

  useEffect(() => {
    void viaModernIdentity.currentUser().then(setSession)
  }, [])

  async function openDeSoIdentity() {
    setStatus("waiting")
    try {
      const nextSession = await viaModernIdentity.login()
      setSession(nextSession)
      setStatus("idle")
    } catch {
      setStatus("blocked")
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
      <p style={{ margin: 0, color: "#9adbb2", fontWeight: 700 }}>
        {session ? "DeSo participation connected" : title}
      </p>
      <p style={{ margin: "7px 0 0", color: "#aebbb4", lineHeight: 1.55, fontSize: 13 }}>
        {session
          ? `VIA received a successful DeSo Identity login for ${shortPublicKey(session.publicKey)}. Released Social write controls can use this participation state; each write still follows its own guarded approval path.`
          : text}
      </p>
      <div style={{ marginTop: 12, display: "flex", gap: 9, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => void openDeSoIdentity()}
          style={{ border: "1px solid rgba(143,212,169,.42)", borderRadius: 10, padding: "8px 12px", color: "#9adbb2", background: "transparent", fontWeight: 650, fontSize: 13, cursor: "pointer" }}
        >
          {session ? "Change DeSo account" : "Continue through DeSo"}
        </button>
        <Link href="/discover" style={{ border: "1px solid rgba(113,130,120,.42)", borderRadius: 10, padding: "8px 12px", color: "#c2cbc6", textDecoration: "none", fontWeight: 650, fontSize: 13 }}>
          Keep exploring
        </Link>
      </div>
      {status === "waiting" ? <p style={{ margin: "10px 0 0", color: "#9adbb2", fontSize: 12 }}>Waiting for DeSo Identity…</p> : null}
      {status === "blocked" ? <p role="status" style={{ margin: "10px 0 0", color: "#d7b98e", fontSize: 12 }}>DeSo Identity could not complete the login. Try again.</p> : null}
      <p style={{ margin: "10px 0 0", color: "#7f8c85", fontSize: 11, lineHeight: 1.45 }}>
        VIA accepts the login only from the DeSo Identity origin and only when Identity returns credentials for the selected account. A login is an access step, not a VIA trust badge. Financial and NFT transactions still need their own approval/signing flow.
      </p>
    </aside>
  )
}
