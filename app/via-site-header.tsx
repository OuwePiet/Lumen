"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import {
  DESO_LOGIN_URL,
  clearIdentitySession,
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
  accountWrap: { position: "relative" as const, flex: "0 0 auto", display: "grid", justifyItems: "end" as const, gap: "2px" },
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
  menu: {
    position: "absolute" as const,
    right: 0,
    top: "48px",
    width: "210px",
    padding: "8px",
    border: "1px solid rgba(143,212,169,.18)",
    borderRadius: "14px",
    background: "rgba(5,10,7,.98)",
    boxShadow: "0 18px 44px rgba(0,0,0,.38)",
  },
  menuLabel: {
    padding: "7px 9px 9px",
    color: "#78867e",
    fontSize: "10px",
    letterSpacing: ".08em",
    textTransform: "uppercase" as const,
  },
  menuLink: {
    display: "block",
    minHeight: "38px",
    padding: "9px 10px",
    borderRadius: "9px",
    color: "#d3ddd7",
    textDecoration: "none",
    fontSize: "12px",
    lineHeight: "20px",
  },
  menuButton: {
    width: "100%",
    minHeight: "38px",
    padding: "9px 10px",
    border: 0,
    borderRadius: "9px",
    color: "#b7c3bc",
    background: "transparent",
    cursor: "pointer",
    textAlign: "left" as const,
    fontSize: "12px",
  },
  divider: { height: "1px", margin: "6px 4px", background: "rgba(143,212,169,.10)" },
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
  const accountWrapRef = useRef<HTMLDivElement | null>(null)
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [status, setStatus] = useState<"idle" | "waiting" | "blocked">("idle")
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setSession(restoreIdentitySession())

    function handleIdentityMessage(event: MessageEvent) {
      const identityWindow = identityWindowRef.current
      if (identityWindow && event.source !== identityWindow) return
      const nextSession = persistIdentityLogin(event)
      if (!nextSession) return
      setSession(nextSession)
      setMenuOpen(false)
      setStatus("idle")
      identityWindowRef.current?.close()
      identityWindowRef.current = null
    }

    window.addEventListener("message", handleIdentityMessage)
    return () => window.removeEventListener("message", handleIdentityMessage)
  }, [])

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!accountWrapRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false)
    }
    document.addEventListener("mousedown", closeOnOutsideClick)
    document.addEventListener("keydown", closeOnEscape)
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick)
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [])

  useEffect(() => setMenuOpen(false), [pathname])

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
    setMenuOpen(false)
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

  function handleAccountButton() {
    if (!session) {
      openDeSoIdentity()
      return
    }
    setMenuOpen((open) => !open)
  }

  function logout() {
    clearIdentitySession()
    setSession(null)
    setProfile(null)
    setMenuOpen(false)
    setStatus("idle")
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

        <div ref={accountWrapRef} style={styles.accountWrap}>
          <button
            type="button"
            style={styles.accountButton}
            onClick={handleAccountButton}
            aria-label={session ? "Open VIA account menu" : "Login with DeSo"}
            aria-expanded={session ? menuOpen : undefined}
            aria-haspopup={session ? "menu" : undefined}
          >
            {avatar ? <img src={avatar} alt="" style={styles.avatar} referrerPolicy="no-referrer" /> : <span style={styles.avatarFallback} aria-hidden="true">{profile?.username?.slice(0, 1).toUpperCase() ?? "V"}</span>}
            <span>{status === "waiting" ? "Connecting…" : accountLabel}</span>
          </button>
          {status === "blocked" ? <span style={styles.status} role="status">Allow pop-ups to log in.</span> : null}

          {session && menuOpen ? (
            <div style={styles.menu} role="menu" aria-label="VIA account menu">
              <div style={styles.menuLabel}>{profile?.username ? `@${profile.username}` : "DeSo account"}</div>
              <Link href="/my-via" style={styles.menuLink} role="menuitem">My VIA</Link>
              <Link href="/profile" style={styles.menuLink} role="menuitem">Profile</Link>
              <Link href="/wallet" style={styles.menuLink} role="menuitem">Wallet</Link>
              <Link href="/saved" style={styles.menuLink} role="menuitem">Saved</Link>
              <Link href="/studio#drafts" style={styles.menuLink} role="menuitem">Drafts</Link>
              <Link href="/settings" style={styles.menuLink} role="menuitem">Settings</Link>
              <div style={styles.divider} />
              <button type="button" style={styles.menuButton} onClick={openDeSoIdentity} role="menuitem">Switch / add account</button>
              <button type="button" style={styles.menuButton} onClick={logout} role="menuitem">Logout from VIA</button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
