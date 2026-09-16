"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import {
  DESO_LOGIN_URL,
  clearIdentitySession,
  listIdentitySessions,
  persistIdentityLogin,
  restoreIdentitySession,
  switchIdentitySession,
  type ViaIdentitySession,
} from "./deso-identity-session"
import {
  readViaLocalSettings,
  saveViaLocalSettings,
  VIA_LANGUAGES,
  type ViaLanguage,
} from "./via-local-settings"

type PublicProfile = { username?: string; profilePic?: string | null }
type ProfileResponse = { ok?: boolean; profile?: PublicProfile }

const nav = [
  ["Home", "/"],
  ["Social", "/social"],
  ["Discover", "/discover"],
  ["Market", "/market"],
  ["Studio", "/studio"],
  ["Live", "/live"],
  ["Games", "/quest"],
  ["Communities", "/communities"],
  ["My VIA", "/my-via"],
] as const

const languageCodes: Record<ViaLanguage, string> = {
  Dutch: "NL",
  English: "EN",
  French: "FR",
  Spanish: "ES",
  Chinese: "中文",
}

const pill = {
  minHeight: "38px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "7px",
  border: "1px solid rgba(143,212,169,.22)",
  borderRadius: "999px",
  padding: "7px 14px",
  color: "#cfd9d3",
  background: "rgba(5,11,8,.76)",
  textDecoration: "none",
  fontSize: "12px",
  fontWeight: 600,
  whiteSpace: "nowrap" as const,
}

const styles = {
  header: { position: "sticky" as const, top: 0, zIndex: 80, background: "rgba(2,7,4,.95)", backdropFilter: "blur(18px)", borderBottom: "1px solid rgba(143,212,169,.13)" },
  shell: { width: "min(1480px, calc(100% - 32px))", margin: "0 auto", display: "grid", gridTemplateColumns: "260px minmax(0,1fr)", gridTemplateRows: "72px 58px", columnGap: "18px", alignItems: "stretch" },
  brand: { gridColumn: "1", gridRow: "1 / span 2", display: "flex", alignItems: "center", justifyContent: "center", color: "inherit", textDecoration: "none", overflow: "hidden" },
  logo: { width: "250px", height: "130px", objectFit: "contain" as const, display: "block" },
  topRow: { gridColumn: "2", gridRow: "1", minWidth: 0, display: "flex", alignItems: "center" },
  toolsRow: { gridColumn: "2", gridRow: "2", minWidth: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: "9px", overflowX: "auto" as const, padding: "9px 0", scrollbarWidth: "none" as const, borderTop: "1px solid rgba(143,212,169,.08)" },
  nav: { flex: "1 1 auto", minWidth: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: "2px", overflowX: "auto" as const, scrollbarWidth: "none" as const },
  link: { position: "relative" as const, flex: "0 0 auto", padding: "25px 10px 22px", color: "#aeb9b2", textDecoration: "none", fontSize: "12px", fontWeight: 650, whiteSpace: "nowrap" as const },
  activeLink: { color: "#eef5f0" },
  activeLine: { position: "absolute" as const, left: "10px", right: "10px", bottom: "14px", height: "1px", background: "#8fd4a9" },
  search: { ...pill, minWidth: "205px", justifyContent: "flex-start" },
  language: { ...pill, appearance: "none" as const, cursor: "pointer", paddingRight: "14px", outline: "none" },
  login: { ...pill, cursor: "pointer" },
  visitor: { ...pill, color: "#98a69e" },
  accountWrap: { position: "relative" as const, flex: "0 0 auto", display: "grid", justifyItems: "end" as const, gap: "2px" },
  accountButton: { ...pill, cursor: "pointer", padding: "5px 12px 5px 6px", color: "#e3ebe6" },
  avatar: { width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" as const },
  avatarFallback: { width: "28px", height: "28px", borderRadius: "50%", display: "grid", placeItems: "center", background: "#183326", color: "#9adbb2", fontSize: "11px", fontWeight: 900 },
  menu: { position: "absolute" as const, right: 0, top: "48px", width: "240px", padding: "8px", border: "1px solid rgba(143,212,169,.18)", borderRadius: "14px", background: "rgba(5,10,7,.99)", boxShadow: "0 18px 44px rgba(0,0,0,.38)" },
  menuLabel: { padding: "7px 9px 9px", color: "#78867e", fontSize: "10px", letterSpacing: ".08em", textTransform: "uppercase" as const },
  menuLink: { display: "block", minHeight: "38px", padding: "9px 10px", borderRadius: "9px", color: "#d3ddd7", textDecoration: "none", fontSize: "12px", lineHeight: "20px" },
  menuButton: { width: "100%", minHeight: "38px", padding: "9px 10px", border: 0, borderRadius: "9px", color: "#b7c3bc", background: "transparent", cursor: "pointer", textAlign: "left" as const, fontSize: "12px" },
  accountChoice: { width: "100%", minHeight: "36px", padding: "8px 10px", border: 0, borderRadius: "9px", color: "#aeb9b2", background: "transparent", cursor: "pointer", textAlign: "left" as const, fontSize: "11px", fontFamily: "monospace" },
  divider: { height: "1px", margin: "6px 4px", background: "rgba(143,212,169,.10)" },
}

function safeProfileImage(value?: string | null) {
  if (!value) return undefined
  try {
    const parsed = new URL(value)
    return parsed.protocol === "https:" ? parsed.toString() : undefined
  } catch { return undefined }
}

function shortPublicKey(publicKey: string) {
  return `${publicKey.slice(0, 9)}…${publicKey.slice(-6)}`
}

export default function ViaSiteHeader() {
  const pathname = usePathname()
  const accountWrapRef = useRef<HTMLDivElement | null>(null)
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const [knownAccounts, setKnownAccounts] = useState<ViaIdentitySession[]>([])
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [language, setLanguage] = useState<ViaLanguage>("Dutch")

  function refreshKnownAccounts() {
    setKnownAccounts(listIdentitySessions())
  }

  useEffect(() => {
    setSession(restoreIdentitySession())
    refreshKnownAccounts()
    setLanguage(readViaLocalSettings().interfaceLanguage)
    function handleIdentityMessage(event: MessageEvent) {
      const nextSession = persistIdentityLogin(event)
      if (!nextSession) return
      setSession(nextSession)
      refreshKnownAccounts()
      setMenuOpen(false)
    }
    window.addEventListener("message", handleIdentityMessage)
    return () => window.removeEventListener("message", handleIdentityMessage)
  }, [])

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!accountWrapRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    function closeOnEscape(event: KeyboardEvent) { if (event.key === "Escape") setMenuOpen(false) }
    document.addEventListener("mousedown", closeOnOutsideClick)
    document.addEventListener("keydown", closeOnEscape)
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick)
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [])

  useEffect(() => setMenuOpen(false), [pathname])

  useEffect(() => {
    if (!session?.publicKey) { setProfile(null); return }
    const controller = new AbortController()
    void fetch(`/api/via/profile?identity=${encodeURIComponent(session.publicKey)}`, { cache: "no-store", signal: controller.signal, headers: { Accept: "application/json" } })
      .then(async (response) => response.ok ? (await response.json()) as ProfileResponse : null)
      .then((data) => setProfile(data?.ok && data.profile ? data.profile : null))
      .catch((error) => { if (!(error instanceof DOMException && error.name === "AbortError")) setProfile(null) })
    return () => controller.abort()
  }, [session?.publicKey])

  function changeLanguage(next: ViaLanguage) {
    saveViaLocalSettings({ interfaceLanguage: next })
    setLanguage(next)
  }

  function chooseAccount(publicKey: string) {
    const nextSession = switchIdentitySession(publicKey)
    if (!nextSession) return
    setSession(nextSession)
    setProfile(null)
    setMenuOpen(false)
  }

  function logout() {
    clearIdentitySession()
    setSession(null)
    setProfile(null)
    setMenuOpen(false)
  }

  const avatar = safeProfileImage(profile?.profilePic)
  const accountLabel = profile?.username ? `@${profile.username}` : "DeSo connected"
  const otherAccounts = knownAccounts.filter((account) => account.publicKey !== session?.publicKey)

  return (
    <header style={styles.header}>
      <div style={styles.shell}>
        <Link href="/" style={styles.brand} aria-label="VIA home">
          <img src="/via-logo-original.jpg?v=1" alt="VIA" style={styles.logo} />
        </Link>

        <div style={styles.topRow}>
          <nav style={styles.nav} aria-label="VIA main navigation">
            {nav.map(([label, href]) => {
              const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)
              return <Link key={href} href={href} style={{ ...styles.link, ...(active ? styles.activeLink : {}) }}>{label}{active ? <span style={styles.activeLine} aria-hidden="true" /> : null}</Link>
            })}
          </nav>
        </div>

        <div style={styles.toolsRow} aria-label="VIA utility controls">
          <Link href="/discover" style={styles.search}>⌕&nbsp;&nbsp; Search members</Link>
          <label className="sr-only" htmlFor="via-header-language">VIA language</label>
          <select id="via-header-language" value={language} onChange={(event) => changeLanguage(event.target.value as ViaLanguage)} style={styles.language} aria-label="VIA language">
            {VIA_LANGUAGES.map((item) => <option key={item} value={item}>{languageCodes[item]}</option>)}
          </select>
          <Link href="/discover" style={pill}>Public Entrance</Link>
          {!session ? <a href={DESO_LOGIN_URL} target="via-deso-identity" style={styles.login}>DeSo Login</a> : null}
          <Link href="/wallet" style={pill}>Buy $DESO</Link>
          <span style={styles.visitor}>Visitors</span>
          <Link href="/notifications" style={pill}>Notifications</Link>

          {session ? (
            <div ref={accountWrapRef} style={styles.accountWrap}>
              <button type="button" style={styles.accountButton} onClick={() => { refreshKnownAccounts(); setMenuOpen((open) => !open) }} aria-label="Open VIA account menu" aria-expanded={menuOpen} aria-haspopup="menu">
                {avatar ? <img src={avatar} alt="" style={styles.avatar} referrerPolicy="no-referrer" /> : <span style={styles.avatarFallback} aria-hidden="true">{profile?.username?.slice(0, 1).toUpperCase() ?? "V"}</span>}
                <span>{accountLabel}</span><span aria-hidden="true">▾</span>
              </button>
              {menuOpen ? (
                <div style={styles.menu} role="menu" aria-label="VIA account menu">
                  <div style={styles.menuLabel}>{profile?.username ? `@${profile.username}` : shortPublicKey(session.publicKey)}</div>
                  <Link href="/my-via" style={styles.menuLink} role="menuitem">My VIA</Link>
                  <Link href="/profile" style={styles.menuLink} role="menuitem">Profile</Link>
                  <Link href="/wallet" style={styles.menuLink} role="menuitem">Wallet</Link>
                  <Link href="/saved" style={styles.menuLink} role="menuitem">Saved</Link>
                  <Link href="/studio#drafts" style={styles.menuLink} role="menuitem">Drafts</Link>
                  <Link href="/settings" style={styles.menuLink} role="menuitem">Settings</Link>
                  {otherAccounts.length ? <>
                    <div style={styles.divider} />
                    <div style={styles.menuLabel}>Switch account</div>
                    {otherAccounts.map((account) => <button key={account.publicKey} type="button" style={styles.accountChoice} onClick={() => chooseAccount(account.publicKey)} role="menuitem">{shortPublicKey(account.publicKey)}</button>)}
                  </> : null}
                  <div style={styles.divider} />
                  <a href={DESO_LOGIN_URL} target="via-deso-identity" style={styles.menuLink} role="menuitem">Add DeSo account</a>
                  <button type="button" style={styles.menuButton} onClick={logout} role="menuitem">Logout from VIA</button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
