"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
  DESO_LOGIN_URL,
  persistIdentityLogin,
  restoreIdentitySession,
  type ViaIdentitySession,
} from "./deso-identity-session"

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
  const identityWindowRef = useRef<Window | null>(null)
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const [status, setStatus] = useState<"idle" | "waiting" | "blocked">("idle")

  useEffect(() => {
    setSession(restoreIdentitySession())

    function handleIdentityMessage(event: MessageEvent) {
      const identityWindow = identityWindowRef.current
      if (identityWindow && event.source !== identityWindow) return

      const nextSession = persistIdentityLogin(event)
      if (!nextSession) return

      setSession(nextSession)
      setStatus("idle")
      identityWindowRef.current?.close()
      identityWindowRef.current = null
    }

    window.addEventListener("message", handleIdentityMessage)
    return () => window.removeEventListener("message", handleIdentityMessage)
  }, [])

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
      setStatus("blocked")
      return
    }

    identityWindowRef.current = identityWindow
    setStatus("waiting")
    identityWindow.focus()
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
          ? `VIA received a successful DeSo Identity login for ${shortPublicKey(session.publicKey)}. Social write controls can use this participation state as they are implemented.`
          : text}
      </p>
      <div style={{ marginTop: 12, display: "flex", gap: 9, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={openDeSoIdentity}
          style={{ border: "1px solid rgba(143,212,169,.42)", borderRadius: 10, padding: "8px 12px", color: "#9adbb2", background: "transparent", fontWeight: 650, fontSize: 13, cursor: "pointer" }}
        >
          {session ? "Change DeSo account" : "Continue through DeSo"}
        </button>
        <Link href="/discover" style={{ border: "1px solid rgba(113,130,120,.42)", borderRadius: 10, padding: "8px 12px", color: "#c2cbc6", textDecoration: "none", fontWeight: 650, fontSize: 13 }}>
          Keep exploring
        </Link>
      </div>
      {status === "waiting" ? <p style={{ margin: "10px 0 0", color: "#9adbb2", fontSize: 12 }}>Waiting for DeSo Identity…</p> : null}
      {status === "blocked" ? <p role="status" style={{ margin: "10px 0 0", color: "#d7b98e", fontSize: 12 }}>The DeSo login window was blocked. Allow pop-ups for VIA and try again.</p> : null}
      <p style={{ margin: "10px 0 0", color: "#7f8c85", fontSize: 11, lineHeight: 1.45 }}>
        VIA accepts the login only from the DeSo Identity origin and only when Identity returns credentials for the selected account. A login is an access step, not a VIA trust badge. Financial and NFT transactions still need their own approval/signing flow.
      </p>
    </aside>
  )
}
