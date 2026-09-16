"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
  DESO_LOGIN_URL,
  clearIdentitySession,
  persistIdentityLogin,
  restoreIdentitySession,
  type ViaIdentitySession,
} from "./deso-identity-session"

const nav = [
  ["Home", "/"],
  ["Social", "/social"],
  ["Discover", "/discover"],
  ["Market", "/market"],
  ["Studio", "/studio"],
  ["Live", "/live"],
  ["Communities", "/communities"],
  ["Games", "/quest"],
  ["My Profile", "/profile"],
  ["My VIA", "/my-via"],
] as const

const utilities = [
  ["Search members", "/discover"],
  ["Public Entrance", "/discover"],
  ["EN", "/settings"],
  ["Buy $DESO", "/wallet"],
  ["Notifications", "/notifications"],
] as const

const actions = [
  ["Explore NFTs", "/collection"],
  ["Join the Community", "/communities"],
  ["Create a Post", "/social"],
  ["Go Live", "/live"],
] as const

const linkStyle = {
  minHeight: "34px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid rgba(143,212,169,.18)",
  borderRadius: "999px",
  padding: "7px 12px",
  background: "rgba(3,10,6,.58)",
  color: "#cbd6d0",
  textDecoration: "none",
  fontSize: "11px",
  fontWeight: 650,
  backdropFilter: "blur(8px)",
} as const

export default function ViaHomeControls() {
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

  function logout() {
    clearIdentitySession()
    setSession(null)
    setStatus("idle")
  }

  return (
    <aside
      aria-label="VIA homepage controls"
      style={{
        position: "absolute",
        zIndex: 4,
        left: "16px",
        top: "16px",
        bottom: "74px",
        width: "250px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        overflowY: "auto",
        paddingRight: "4px",
      }}
    >
      <Link
        href="/"
        aria-label="VIA home"
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", textDecoration: "none" }}
      >
        <img
          src="/via-logo-original.jpg?v=2"
          alt="VIA"
          style={{ width: "100%", maxHeight: "118px", objectFit: "contain", display: "block", borderRadius: "14px" }}
        />
        <span
          style={{
            color: "#8fd4a9",
            fontSize: "11px",
            fontWeight: 650,
            letterSpacing: ".12em",
            lineHeight: 1.2,
          }}
        >
          viadeso.online
        </span>
      </Link>

      <nav aria-label="VIA main navigation" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
        {nav.map(([label, href]) => (
          <Link key={href} href={href} style={linkStyle}>{label}</Link>
        ))}
      </nav>

      <div aria-label="VIA utility controls" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
        {utilities.map(([label, href]) => (
          <Link key={label} href={href} style={linkStyle}>{label}</Link>
        ))}
        {!session ? (
          <button type="button" onClick={openDeSoIdentity} style={{ ...linkStyle, cursor: "pointer" }}>
            {status === "waiting" ? "Connecting…" : "DeSo Login"}
          </button>
        ) : (
          <button type="button" onClick={logout} style={{ ...linkStyle, cursor: "pointer" }}>Logout</button>
        )}
        <span style={{ ...linkStyle, gridColumn: "1 / -1", color: "#7f8d85" }}>Visitors</span>
      </div>

      <div style={{ height: "1px", background: "rgba(143,212,169,.12)", margin: "2px 4px" }} />

      <nav aria-label="VIA direct actions" style={{ display: "grid", gap: "7px" }}>
        {actions.map(([label, href]) => (
          <Link
            key={label}
            href={href}
            style={{ ...linkStyle, minHeight: "40px", color: "#e7eee9", fontSize: "12px", borderColor: "rgba(143,212,169,.28)" }}
          >
            {label}
          </Link>
        ))}
      </nav>

      {status === "blocked" ? (
        <span style={{ color: "#c6a97b", fontSize: "10px", lineHeight: 1.4 }}>Allow pop-ups to log in.</span>
      ) : null}
    </aside>
  )
}
