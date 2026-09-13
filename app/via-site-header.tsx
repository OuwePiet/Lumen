"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import {
  DESO_LOGIN_URL,
  persistIdentityLogin,
  restoreIdentitySession,
  type ViaIdentitySession,
} from "./deso-identity-session"

type PublicProfile = {
  username?: string
  profilePic?: string | null
}

type ProfileResponse = {
  ok?: boolean
  profile?: PublicProfile
}

const nav = [
  ["Home", "/"],
  ["Social", "/social"],
  ["Discover", "/discover"],
  ["NFTs", "/collection"],
  ["Market", "/market"],
  ["Studio", "/studio"],
  ["Live", "/live"],
  ["Communities", "/communities"],
  ["My VIA", "/my-via"],
] as const

const styles = {
  header: {
    position: "sticky" as const,
    top: 0,
    zIndex: 80,
    borderBottom: "1px solid rgba(143,212,169,.12)",
    background: "rgba(3,7,5,.92)",
    backdropFilter: "blur(18px)",
  },
  inner: {
    width: "min(1480px, calc(100% - 32px))",
    margin: "0 auto",
    minHeight: "68px",
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },
  brand: {
    flex: "0 0 auto",
    display: "flex",
    alignItems: "center",
    gap: "9px",
    color: "inherit",
    textDecoration: "none",
  },
  logo: { width: "78px", height: "34px", objectFit: "contain" as const },
  domain: { color: "#77847c", fontSize: "10px", letterSpacing: ".04em", whiteSpace: "nowrap" as const },
  nav: {
    flex: "1 1 auto",
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "2px",
    overflowX: "auto" as const,
    scrollbarWidth: "none" as const,
  },
  link: {
    position: "relative" as const,
    flex: "0 0 auto",
    padding: "24px 10px 21px",
    color: "#aeb9b2",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: 650,
    whiteSpace: "nowrap" as const,
  },
  activeLink: { color: "#eaf2ed" },
  activeLine: {
    position: "absolute" as const,
    left: "10px",
    right: "10px",
    bottom: "14px",
    height: "1px",
    background: "#8fd4a9",
  },
  accountWrap: { flex: "0 0 auto", display: "grid", justifyItems: "end" as const, gap: "2px" },
  accountButton: {
    minHeight: "38px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    border: "1px solid rgba(143,212,169,.28)",
    borderRadius: "999px",
    padding: "5px 10px 5px 6px",
    color: "#dce6e0",
    background: "rgba(7,16,11,.76)",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 700,
  },
  avatar: { width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" as const },
  avatarFallback: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "#183326",
    color: "#9adbb2",
    fontSize: "11px",
    fontWeight: 900,
  },
  status: { color: "#c6a97b", fontSize: "9px" },
}

function safeProfileImage(value?: string | null) {
  if (!value) return undefined
  try {
    const parsed = new URL(value)
    return parsed.protocol === "https:" ? parsed.toString() : undefined
  } catch {
    return undefined
  }
}

export default function ViaSiteHeader() {
  const pathname = usePathname()
  const identityWindowRef = useRef<Window | null>(null)
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const [profile, setProfile] = useState<PublicProfile | null>(null)
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

  useEffect(() => {
    if (!session?.publicKey) {
      setProfile(null)
      return
    }
    const controller = new AbortController()
    void fetch(`/api/via/profile?identity=${encodeURIComponent(session.publicKey)}`, {
      cache: "no-store",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        if (!response.ok) return null
        const data = (await response.json()) as ProfileResponse
        return data.ok && data.profile ? data.profile : null
      })
      .then((nextProfile) => setProfile(nextProfile))
      .catch((error) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setProfile(null)
      })
    return () => controller.abort()
  }, [session?.publicKey])

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

  const avatar = safeProfileImage(profile?.profilePic)
  const accountLabel = profile?.username ? `@${profile.username}` : session ? "DeSo connected" : "Login"

  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        <Link href="/" style={styles.brand} aria-label="VIA home">
          <img src="/via-logo.svg" alt="VIA" style={styles.logo} />
          <span style={styles.domain}>viadeso.online</span>
        </Link>

        <nav style={styles.nav} aria-label="VIA main navigation">
          {nav.map(([label, href]) => {
            const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)
            return (
              <Link key={href} href={href} style={{ ...styles.link, ...(active ? styles.activeLink : {}) }}>
                {label}
                {active ? <span style={styles.activeLine} aria-hidden="true" /> : null}
              </Link>
            )
          })}
        </nav>

        <div style={styles.accountWrap}>
          <button type="button" style={styles.accountButton} onClick={openDeSoIdentity} aria-label={session ? "Change DeSo account" : "Login with DeSo"}>
            {avatar ? <img src={avatar} alt="" style={styles.avatar} referrerPolicy="no-referrer" /> : <span style={styles.avatarFallback} aria-hidden="true">{profile?.username?.slice(0, 1).toUpperCase() ?? "V"}</span>}
            <span>{status === "waiting" ? "Connecting…" : accountLabel}</span>
          </button>
          {status === "blocked" ? <span style={styles.status} role="status">Allow pop-ups to log in.</span> : null}
        </div>
      </div>
    </header>
  )
}
