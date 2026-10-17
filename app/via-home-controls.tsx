"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { CircleHelp, Music2, RadioTower, UsersRound } from "lucide-react"
import {
  VIA_IDENTITY_EVENT,
  clearIdentitySession,
  listIdentitySessions,
  restoreIdentitySession,
  type ViaIdentitySession,
} from "./deso-identity-session"
import { viaModernIdentity } from "./deso-identity-modern"
import ViaIdentityStatusMarks from "./via-identity-status"
import SponsorPlatform from "./sponsor-platform"
import ViaWorldClock from "./via-world-clock"
import {
  readViaLocalSettings,
  saveViaLocalSettings,
  VIA_LANGUAGES,
  VIA_SETTINGS_EVENT,
  type ViaLanguage,
} from "./via-local-settings"

type PublicProfile = { publicKey?: string; username?: string; profilePic?: string | null; isVerified?: boolean; isInactive?: boolean; viaRecognized?: boolean }
type ProfileResponse = { ok?: boolean; profile?: PublicProfile }

// Homepage groups stay compact so account controls remain visible on tablet heights.
const standardNav = [
  ["home", "/"],
  ["social", "/social"],
  ["notifications", "/notifications"],
  ["messages", "/messages"],
  ["discover", "/discover"],
  ["bookmarks", "/saved"],
  ["profile", "/profile"],
  ["wallet", "/wallet"],
] as const

const viaExtraNav = [
  ["nfts", "/collection"],
  ["live", "/live"],
  ["communities", "/communities"],
  ["games", "/quest"],
  ["world", "/world"],
  ["myVia", "/my-via"],
  ["advertising", "/advertising"],
  ["music", "/music"],
] as const

const languageCodes: Record<ViaLanguage | "Hindi", string> = {
  Dutch: "NL", English: "EN", French: "FR", Spanish: "ES", Chinese: "中文", Hindi: "हिं",
}

const languageFlags: Record<ViaLanguage | "Hindi", string> = {
  Dutch: "🇳🇱", English: "🇬🇧", French: "🇫🇷", Spanish: "🇪🇸", Chinese: "🇨🇳", Hindi: "🇮🇳",
}

const languageFlagCountry: Record<ViaLanguage, string> = { Dutch: "nl", English: "gb", French: "fr", Spanish: "es", Chinese: "cn", Hindi: "in" }

function LanguageFlag({ language }: { language: ViaLanguage }) {
  return <img src={`https://flagcdn.com/w40/${languageFlagCountry[language]}.png`} alt="" aria-hidden="true" width={22} height={15} style={{ width: 22, height: 15, objectFit: "cover", borderRadius: 2, flexShrink: 0 }} />
}

type HomeText = {
  standard: string
  viaExtra: string
  account: string
  home: string
  social: string
  discover: string
  nfts: string
  live: string
  communities: string
  games: string
  world: string
  calendar: string
  profile: string
  myVia: string
  bookmarks: string
  messages: string
  more: string
  search: string
  publicEntrance: string
  wallet: string
  notifications: string
  login: string
  connecting: string
  logout: string
  blocked: string
  connected: string
  switchAccount: string
  addAccount: string
  inactive90: string
  advertising: string
  ideas: string
  storage: string
  music: string
}

const accountMenuCopy: Record<ViaLanguage, { active: string; signedOut: string; empty: string }> = {
  Dutch: { active: "Actieve account", signedOut: "Niet ingelogd", empty: "Andere accounts verschijnen hier nadat je ze bij VIA hebt aangemeld." },
  English: { active: "Active account", signedOut: "Not logged in", empty: "Other accounts appear here after you sign them in to VIA." },
  French: { active: "Compte actif", signedOut: "Non connecté", empty: "Les autres comptes apparaissent ici après leur connexion à VIA." },
  Spanish: { active: "Cuenta activa", signedOut: "Sin sesión", empty: "Las otras cuentas aparecen aquí después de iniciar sesión en VIA." },
  Chinese: { active: "当前账户", signedOut: "未登录", empty: "其他账户登录 VIA 后将显示在此处。" },
  Hindi: { active: "सक्रिय खाता", signedOut: "लॉग इन नहीं हैं", empty: "VIA में लॉग इन करने के बाद अन्य खाते यहाँ दिखाई देंगे।" },
}

const copy: Record<ViaLanguage | "Hindi", HomeText> = {
  Dutch: {
    standard: "", viaExtra: "", account: "Taal", home: "Home",
    social: "Postkantoor", discover: "Ontdekken", nfts: "NFT's", live: "Live",
    communities: "Community's", games: "Spellen", world: "Wereld", calendar: "Wereldkalender", profile: "Mijn profiel", myVia: "Mijn VIA",
    bookmarks: "Bookmarks", messages: "Berichten", more: "Meer",
    search: "Zoek leden", publicEntrance: "Publieke ingang", wallet: "Mijn Wallet", notifications: "Meldingen",
    login: "DeSo Login", connecting: "Verbinden…", logout: "Uitloggen", blocked: "DeSo Identity kon niet worden geopend. Probeer opnieuw.",
    connected: "Verbonden", switchAccount: "Wissel account", addAccount: "DeSo-account toevoegen", inactive90: "90+ dagen inactief", advertising: "Reclame", ideas: "Ideeënbus", storage: "Externe opslag", music: "VIA Muziek",
  },
  English: {
    standard: "", viaExtra: "", account: "Language", home: "Home",
    social: "Post Office", discover: "Discover", nfts: "NFTs", live: "Live",
    communities: "Communities", games: "Games", world: "World", calendar: "World Calendar", profile: "My Profile", myVia: "My VIA",
    bookmarks: "Bookmarks", messages: "Messages", more: "More",
    search: "Search members", publicEntrance: "Public Entrance", wallet: "My Wallet", notifications: "Notifications",
    login: "DeSo Login", connecting: "Connecting…", logout: "Logout", blocked: "DeSo Identity could not open. Please try again.",
    connected: "Connected", switchAccount: "Switch account", addAccount: "Add DeSo account", inactive90: "Inactive 90+ days", advertising: "Advertising", ideas: "Ideas Box", storage: "External storage", music: "VIA Music",
  },
  French: {
    standard: "", viaExtra: "", account: "Langue", home: "Accueil",
    social: "Bureau de poste", discover: "Découvrir", nfts: "NFT", live: "Live",
    communities: "Communautés", games: "Jeux", world: "Monde", calendar: "Calendrier mondial", profile: "Mon profil", myVia: "Mon VIA",
    bookmarks: "Favoris", messages: "Messages", more: "Plus",
    search: "Rechercher des membres", publicEntrance: "Entrée publique", wallet: "Mon Wallet", notifications: "Notifications",
    login: "Connexion DeSo", connecting: "Connexion…", logout: "Déconnexion", blocked: "Safari a bloqué la fenêtre DeSo Identity.",
    connected: "Connecté", switchAccount: "Changer de compte", addAccount: "Ajouter un compte DeSo", inactive90: "Inactif depuis 90+ jours", advertising: "Publicité", ideas: "Boîte à idées", storage: "Stockage externe", music: "VIA Musique",
  },
  Spanish: {
    standard: "", viaExtra: "", account: "Idioma", home: "Inicio",
    social: "Oficina de correos", discover: "Descubrir", nfts: "NFT", live: "Live",
    communities: "Comunidades", games: "Juegos", world: "Mundo", calendar: "Calendario mundial", profile: "Mi perfil", myVia: "Mi VIA",
    bookmarks: "Guardados", messages: "Mensajes", more: "Más",
    search: "Buscar miembros", publicEntrance: "Entrada pública", wallet: "Mi Wallet", notifications: "Notificaciones",
    login: "Acceso DeSo", connecting: "Conectando…", logout: "Cerrar sesión", blocked: "Safari bloqueó la ventana de DeSo Identity.",
    connected: "Conectado", switchAccount: "Cambiar cuenta", addAccount: "Añadir cuenta DeSo", inactive90: "Inactivo 90+ días", advertising: "Publicidad", ideas: "Buzón de ideas", storage: "Almacenamiento externo", music: "VIA Música",
  },
  Chinese: {
    standard: "", viaExtra: "", account: "语言", home: "首页",
    social: "邮局", discover: "发现", nfts: "NFT", live: "直播",
    communities: "社区", games: "游戏", world: "世界", calendar: "世界日历", profile: "我的资料", myVia: "我的 VIA",
    bookmarks: "书签", messages: "消息", more: "更多",
    search: "搜索成员", publicEntrance: "公开入口", wallet: "我的钱包", notifications: "通知",
    login: "DeSo 登录", connecting: "连接中…", logout: "退出", blocked: "Safari 阻止了 DeSo Identity 窗口。",
    connected: "已连接", switchAccount: "切换账户", addAccount: "添加 DeSo 账户", inactive90: "90+ 天未活跃", advertising: "广告", ideas: "意见箱", storage: "外部存储", music: "VIA 音乐",
  },
  Hindi: {
    standard: "", viaExtra: "", account: "भाषा", home: "होम",
    social: "डाकघर", discover: "खोजें", nfts: "NFT", live: "लाइव", communities: "समुदाय", games: "गेम्स", world: "दुनिया", calendar: "विश्व कैलेंडर",
    profile: "मेरी प्रोफ़ाइल", myVia: "मेरा VIA", bookmarks: "बुकमार्क", messages: "संदेश", more: "और",
    search: "सदस्य खोजें", publicEntrance: "सार्वजनिक प्रवेश", wallet: "मेरा वॉलेट", notifications: "सूचनाएँ",
    login: "DeSo लॉगिन", connecting: "कनेक्ट हो रहा है…", logout: "लॉग आउट", blocked: "Safari ने DeSo Identity विंडो को ब्लॉक कर दिया।",
    connected: "कनेक्टेड", switchAccount: "खाता बदलें", addAccount: "DeSo खाता जोड़ें", inactive90: "90+ दिनों से निष्क्रिय", advertising: "विज्ञापन", ideas: "विचार बॉक्स", storage: "बाहरी स्टोरेज", music: "VIA संगीत",
  },
}

const buttonStyle = {
  minHeight: "39px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid rgba(143,212,169,.18)",
  borderRadius: "12px",
  padding: "8px 10px",
  background: "linear-gradient(180deg, rgba(8,20,13,.82), rgba(3,10,6,.72))",
  color: "#d2dcd6",
  textDecoration: "none",
  fontSize: "11px",
  fontWeight: 680,
  backdropFilter: "blur(9px)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,.018)",
} as const


const disabledButtonStyle = {
  ...buttonStyle,
  color: "#66716b",
  borderColor: "rgba(118,128,122,.16)",
  background: "linear-gradient(180deg, rgba(20,24,22,.62), rgba(9,12,10,.62))",
  cursor: "default",
  opacity: .72,
} as const

const sectionLabel = {
  color: "#6f8f7c",
  fontSize: "8px",
  fontWeight: 800,
  letterSpacing: ".16em",
  textTransform: "uppercase" as const,
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

function shortPublicKey(publicKey: string) {
  return `${publicKey.slice(0, 8)}…${publicKey.slice(-5)}`
}

export default function ViaHomeControls() {
  const router = useRouter()
  const loginLock = useRef(false)
  const accountMenuRef = useRef<HTMLDivElement | null>(null)
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const [knownAccounts, setKnownAccounts] = useState<ViaIdentitySession[]>([])
  const [loadedProfile, setProfile] = useState<PublicProfile | null>(null)
  const profile = loadedProfile?.publicKey === session?.publicKey ? loadedProfile : null
  const [profiles, setProfiles] = useState<Record<string, PublicProfile>>({})
  const [accountsOpen, setAccountsOpen] = useState(false)
  const [status, setStatus] = useState<"idle" | "waiting" | "blocked">("idle")
  const [language, setLanguage] = useState<ViaLanguage>("English")
  const [languageOpen, setLanguageOpen] = useState(false)
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false)
  const [hasNewIdeas, setHasNewIdeas] = useState(false)

  useEffect(() => {
    if (!session?.publicKey) {
      setHasUnreadNotifications(false)
      return
    }
    const publicKey = session.publicKey
    const controller = new AbortController()
    const loadUnread = async () => {
      try {
        const response = await fetch("/api/via/social/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "unread", publicKey }),
          cache: "no-store",
          signal: controller.signal,
        })
        if (!response.ok) { setHasUnreadNotifications(false); return }
        const data = await response.json() as { ok?: boolean; unreadCount?: number }
        if (!controller.signal.aborted) {
          const count = data.ok === true && typeof data.unreadCount === "number" && Number.isSafeInteger(data.unreadCount) && data.unreadCount >= 0 ? data.unreadCount : 0
          let acknowledgedCount = -1
          try {
            const stored = window.sessionStorage.getItem(`via:notifications:home-ack:${publicKey}`)
            if (stored !== null && stored.trim() !== "" && Number.isSafeInteger(Number(stored)) && Number(stored) >= 0) acknowledgedCount = Number(stored)
          } catch { /* storage unavailable */ }
          setHasUnreadNotifications(count > 0 && (acknowledgedCount < 0 || count > acknowledgedCount))
        }
      } catch {
        if (!controller.signal.aborted) setHasUnreadNotifications(false)
      }
    }
    void loadUnread()
    window.addEventListener("focus", loadUnread)
    return () => {
      controller.abort()
      window.removeEventListener("focus", loadUnread)
    }
  }, [session?.publicKey])



  useEffect(() => {
    // Only the verified owner can retrieve private ideas. Never expose them to visitors.
    if (!session?.publicKey || profile?.username?.toLowerCase() !== "ouwepiet") {
      setHasNewIdeas(false)
      return
    }
    const publicKey = session.publicKey
    let active = true
    const checkIdeas = async () => {
      try {
        const { viaModernIdentity } = await import("./deso-identity-modern")
        const current = await viaModernIdentity.currentUser()
        if (!current || current.publicKey !== publicKey) return
        const jwt = await viaModernIdentity.jwt()
        const response = await fetch("/api/via/ideas", {
          cache: "no-store",
          headers: { Authorization: `Bearer ${jwt}`, "x-via-owner-public-key": publicKey },
        })
        if (!response.ok) return
        const data = await response.json() as { ok?: boolean; items?: Array<{ createdAt?: string }> }
        if (!active || data.ok !== true || !Array.isArray(data.items)) return
        const newest = data.items.map((item) => item.createdAt || "").sort().at(-1) || ""
        const seenResponse = await fetch("/api/via/ideas/seen", {
          cache: "no-store",
          headers: { Authorization: `Bearer ${jwt}`, "x-via-owner-public-key": publicKey },
        })
        if (!seenResponse.ok) return
        const seenData = await seenResponse.json() as { ok?: boolean; seenAt?: string }
        if (seenData.ok !== true || !active) return
        const acknowledged = seenData.seenAt || ""
        setHasNewIdeas(Boolean(newest && newest > acknowledged))
      } catch { /* owner-only indicator is optional when identity/storage is unavailable */ }
    }
    void checkIdeas()
    const onVisibility = () => { if (document.visibilityState === "visible") void checkIdeas() }
    window.addEventListener("focus", checkIdeas)
    window.addEventListener("pageshow", checkIdeas)
    document.addEventListener("visibilitychange", onVisibility)
    const interval = window.setInterval(checkIdeas, 60_000)
    return () => {
      active = false
      window.removeEventListener("focus", checkIdeas)
      window.removeEventListener("pageshow", checkIdeas)
      document.removeEventListener("visibilitychange", onVisibility)
      window.clearInterval(interval)
    }
  }, [session?.publicKey, profile?.username])

  useEffect(() => {
    if (!accountsOpen) return
    const closeOutside = (event: PointerEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) setAccountsOpen(false)
    }
    const closeEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      setAccountsOpen(false)
      accountMenuRef.current?.querySelector<HTMLButtonElement>("button")?.focus()
    }
    document.addEventListener("pointerdown", closeOutside)
    document.addEventListener("keydown", closeEscape)
    return () => {
      document.removeEventListener("pointerdown", closeOutside)
      document.removeEventListener("keydown", closeEscape)
    }
  }, [accountsOpen])

  function refreshAccounts() {
    setKnownAccounts(listIdentitySessions())
  }

  useEffect(() => {
    setSession(restoreIdentitySession())
    refreshAccounts()
    const syncLanguage = () => setLanguage(readViaLocalSettings().interfaceLanguage)
    const syncIdentity = () => {
      setSession(restoreIdentitySession())
      refreshAccounts()
    }
    syncLanguage()

    const unsubscribeIdentity = viaModernIdentity.subscribe(() => syncIdentity())

    window.addEventListener(VIA_SETTINGS_EVENT, syncLanguage)
    window.addEventListener(VIA_IDENTITY_EVENT, syncIdentity)
    return () => {
      unsubscribeIdentity()
      window.removeEventListener(VIA_SETTINGS_EVENT, syncLanguage)
      window.removeEventListener(VIA_IDENTITY_EVENT, syncIdentity)
    }
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
      .then(async (response) => response.ok ? (await response.json()) as ProfileResponse : null)
      .then((data) => { if (!controller.signal.aborted) setProfile(data?.ok && data.profile ? { ...data.profile, publicKey: session.publicKey } : null) })
      .catch(() => { if (!controller.signal.aborted) setProfile(null) })
    return () => controller.abort()
  }, [session?.publicKey])

  useEffect(() => {
    if (!knownAccounts.length) {
      setProfiles({})
      return
    }
    const controller = new AbortController()
    void Promise.all(knownAccounts.map(async (account) => {
      try {
        const response = await fetch(`/api/via/profile?identity=${encodeURIComponent(account.publicKey)}`, {
          cache: "no-store",
          signal: controller.signal,
          headers: { Accept: "application/json" },
        })
        const data = response.ok ? (await response.json()) as ProfileResponse : null
        return [account.publicKey, data?.ok && data.profile ? { ...data.profile, publicKey: account.publicKey } : {}] as const
      } catch {
        return [account.publicKey, {}] as const
      }
    })).then((entries) => {
      if (!controller.signal.aborted) setProfiles(Object.fromEntries(entries))
    })
    return () => controller.abort()
  }, [knownAccounts])

  function changeLanguage(next: ViaLanguage) {
    saveViaLocalSettings({ interfaceLanguage: next, defaultLanguage: next })
    setLanguage(next)
    setLanguageOpen(false)
  }

  async function openDeSoIdentity() {
    if (loginLock.current) return
    loginLock.current = true
    setStatus("waiting")
    try { await viaModernIdentity.login(); setStatus("idle") }
    catch { setStatus("blocked") }
    finally { loginLock.current = false }
  }

  async function chooseAccount(publicKey: string) {
    try {
      await viaModernIdentity.setActiveUser(publicKey)
      setSession(restoreIdentitySession())
      setProfile(profiles[publicKey] ?? null)
      setAccountsOpen(false)
      router.refresh()
    } catch { setStatus("blocked") }
  }

  function logout() {
    clearIdentitySession()
    setSession(null)
    setProfile(null)
    setAccountsOpen(false)
    setStatus("idle")
    router.push("/")
    router.refresh()
  }

  function enterPublicMode() {
    clearIdentitySession()
    setSession(null)
    setProfile(null)
    setAccountsOpen(false)
    setStatus("idle")
    router.push("/public")
  }

  const t = copy[language]
  const menuText = accountMenuCopy[language]
  const avatar = safeProfileImage(profile?.profilePic)
  const accountName = profile?.username ? `@${profile.username}` : session ? shortPublicKey(session.publicKey) : "DeSo"
  const otherAccounts = knownAccounts.filter((account) => account.publicKey !== session?.publicKey)

  return (
    <aside
      aria-label="VIA homepage controls"
      className="via-home-controls"
      style={{
        position: "absolute",
        zIndex: 4,
        left: "16px",
        top: "16px",
        bottom: "74px",
        width: "252px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        overflowY: "auto",
        paddingRight: "4px",
      }}
    >
      <Link prefetch={false} href="/" aria-label="VIA home" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", textDecoration: "none" }}>
        <img src="/via-logo-original.jpg?v=2" alt="VIA" className="via-home-controls-logo" style={{ width: "100%", maxHeight: "108px", objectFit: "contain", display: "block", borderRadius: "14px" }} />
        <span style={{ color: "#8fd4a9", fontSize: "10px", fontWeight: 650, letterSpacing: ".14em", lineHeight: 1.2 }}>viadeso.online</span>
      </Link>

      <nav className="via-home-iphone-utility-row" aria-label="VIA iPhone quick controls">
        <Link prefetch={false} href="/help" aria-label="Handboek VIA" title="Handboek VIA"><CircleHelp aria-hidden="true" /></Link>
        <Link prefetch={false} href="/music" aria-label="VIA Muziek" title="VIA Muziek"><Music2 aria-hidden="true" /></Link>
        <Link prefetch={false} href="/radio" aria-label="World Radio" title="World Radio"><RadioTower aria-hidden="true" /></Link>
        <div className="via-home-iphone-account-wrap">
          <span className="via-home-iphone-utility-account" aria-label={session ? accountName : t.login}>
            {avatar ? <img src={avatar} alt="" referrerPolicy="no-referrer" /> : <UsersRound aria-hidden="true" />}
          </span>
          {hasNewIdeas ? <Link prefetch={false} href="/owner#centrale-ideeenbus" aria-label="Nieuw idee: open Ideeënbus" title="Open nieuwe ideeën" className="via-home-idea-shortcut">💡</Link> : null}
        </div>
        <Link prefetch={false} href="/my-via" aria-label="VIA Future" title="VIA Future" className="via-home-iphone-utility-future">
          <span>VIA</span><span>Future</span>
        </Link>
      </nav>

      <div className="via-home-iphone-clock-inline"><ViaWorldClock iphoneInline /></div>

      <section style={{ display: "grid", gap: "6px" }}>
        {t.standard ? <span className="via-home-standard-label" style={sectionLabel}>{t.standard}</span> : null}
        <nav aria-label="VIA standard navigation" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "7px" }}>
          {standardNav.map(([key, href]) => key === "home" ? (
            <div ref={accountMenuRef} key={key} className="via-home-grid-account-wrap" style={{ position: "relative", width: "100%" }}>
              <button type="button" onClick={() => { refreshAccounts(); setAccountsOpen((open) => !open) }} aria-label={session ? t.switchAccount : t.login} title={session ? t.switchAccount : t.login} aria-expanded={accountsOpen} aria-haspopup="menu" style={{ ...buttonStyle, width: "100%", minHeight: "48px", justifyContent: "center", paddingInline: "9px", cursor: "pointer", gap: "7px" }}>
                {session && avatar ? <img src={avatar} alt="" referrerPolicy="no-referrer" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} /> : session ? <UsersRound aria-hidden="true" size={18} /> : <img src="/via-logo-original.jpg?v=2" alt="" aria-hidden="true" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "contain", flexShrink: 0 }} />}
                <span>{session ? accountName : t.login}</span>
              </button>
              {hasNewIdeas ? <Link prefetch={false} href="/owner#centrale-ideeenbus" aria-label="Nieuw idee: open Ideeënbus" title="Open nieuwe ideeën" style={{ position: "absolute", right: 3, top: "50%", transform: "translateY(-50%)", zIndex: 2, fontSize: 18, textDecoration: "none", lineHeight: 1 }}>💡</Link> : null}
              {accountsOpen ? (
                <div className="via-home-account-menu via-home-grid-account-menu" role="menu" aria-label={t.switchAccount}>
                  <div className="via-home-account-current">
                    <span>{session ? menuText.active : menuText.signedOut}</span>
                    {session ? <strong>{accountName}</strong> : null}
                  </div>
                  <div className="via-home-account-menu-heading">{t.switchAccount}</div>
                  {!otherAccounts.length ? <p className="via-home-account-empty">{menuText.empty}</p> : null}
                  {otherAccounts.map((account) => {
                    const accountProfile = profiles[account.publicKey]
                    const accountAvatar = safeProfileImage(accountProfile?.profilePic)
                    return <button key={account.publicKey} type="button" onClick={() => chooseAccount(account.publicKey)} role="menuitem">
                      {accountAvatar ? <img src={accountAvatar} alt="" referrerPolicy="no-referrer" /> : <UsersRound aria-hidden="true" />}
                      <span>{accountProfile?.username ? `@${accountProfile.username}` : shortPublicKey(account.publicKey)}</span>
                    </button>
                  })}
                  <button type="button" onClick={() => { setAccountsOpen(false); openDeSoIdentity() }} role="menuitem">{t.addAccount}</button>
                  <button type="button" onClick={logout} role="menuitem" className="via-home-account-logout">{t.logout}</button>

                </div>
              ) : null}
            </div>
          ) : href ? (
            <Link prefetch={href === "/notifications"} key={key} href={href} style={{ ...buttonStyle, width: "100%", justifyContent: "center", paddingInline: "9px" }}>{key === "social" ? <span aria-hidden="true" style={{ color: "#3f7654", marginRight: "5px", fontSize: "13px" }}>✎</span> : null}{t[key]}{key === "notifications" && hasUnreadNotifications ? <span aria-label="Ongelezen meldingen" title="Ongelezen meldingen" style={{ display: "inline-block", width: "8px", height: "8px", flexShrink: 0, marginLeft: "6px", borderRadius: "50%", background: "#39d98a", boxShadow: "0 0 0 2px rgba(57,217,138,.16)" }} /> : null}</Link>
          ) : (
            <span key={key} aria-disabled="true" title="Wordt op de eigen Berichten-pagina aangesloten" style={{ ...disabledButtonStyle, width: "100%", justifyContent: "center", paddingInline: "9px" }}>{t[key]}</span>
          ))}
          <SponsorPlatform compact showIcon={false} />
          <div className="via-home-language-control">
            <button type="button" onClick={() => setLanguageOpen((open) => !open)} aria-label="VIA language" aria-expanded={languageOpen} style={{ ...buttonStyle, minHeight: "34px", padding: "5px 8px", gap: "5px", cursor: "pointer", width: "100%", justifyContent: "center" }}>
              <LanguageFlag language={language} />
              <span>{languageCodes[language]}</span>
            </button>
            {languageOpen ? <div className="via-home-language-menu" role="menu" aria-label="VIA language">
              {VIA_LANGUAGES.map((item) => <button key={item} type="button" role="menuitemradio" aria-checked={item === language} onClick={() => changeLanguage(item)} className={item === language ? "is-active" : ""}>
                <LanguageFlag language={item} /><span>{languageCodes[item]}</span>
              </button>)}
            </div> : null}
          </div>
        </nav>
      </section>

      <section style={{ display: "grid", gap: "6px" }}>
        {t.viaExtra ? <span style={sectionLabel}>{t.viaExtra}</span> : null}
        <nav aria-label="VIA extra navigation" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "7px" }}>
          {viaExtraNav.map(([key, href]) => (
            <Link prefetch={false} key={href} href={href} className={key === "music" ? "via-home-music-grid-button" : undefined} style={{ ...buttonStyle, width: "100%", justifyContent: "center", paddingInline: "9px" }}>{t[key]}</Link>
          ))}
        </nav>
        <nav className="via-home-handbook-row" aria-label="VIA handboek en kalender" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "7px" }}>
          <Link prefetch={false} href="/help" style={{ ...buttonStyle, width: "100%", justifyContent: "center", paddingInline: "9px" }}>Handboek VIA</Link>
          <Link prefetch={false} href="/wereldkalender" style={{ ...buttonStyle, width: "100%", justifyContent: "center", paddingInline: "9px" }}>{t.calendar}</Link>
        </nav>
        <nav aria-label="VIA toekomstige pagina's" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "7px" }}>
          {[
            ["Wereldkrant", "World Newspaper", "Journal mondial", "Periódico mundial", "世界报纸"],
            ["LuisterHoek", "Listening Corner", "Coin écoute", "Rincón de escucha", "聆听角"],
            ["VIA Auto", "VIA Auto", "VIA Auto", "VIA Auto", "VIA 汽车"],
            ["VIA Archief", "VIA Archive", "Archives VIA", "Archivo VIA", "VIA 档案"],
          ].map((labels, index) => {
            const languageIndex = ({ Dutch: 0, English: 1, French: 2, Spanish: 3, Chinese: 4 } as Record<ViaLanguage, number>)[language]
            return <span key={index} aria-disabled="true" title="Binnenkort" style={{ ...disabledButtonStyle, width: "100%", minWidth: 0, boxSizing: "border-box", flexDirection: "column", justifyContent: "center", padding: "5px 4px", gap: 1, overflow: "hidden", textAlign: "center", lineHeight: 1.2 }}>
              <span style={{ display: "block", maxWidth: "100%", fontSize: 10, overflowWrap: "anywhere" }}>{labels[languageIndex]}</span><span style={{ display: "block", fontSize: 8, opacity: .85 }}>Binnenkort</span>
            </span>
          })}
        </nav>
      </section>


      {status === "waiting" ? <span role="status" style={{ fontSize: "11px" }}>{t.connecting}</span> : null}
      {status === "blocked" ? <span style={{ color: "#c6a97b", fontSize: "9px", lineHeight: 1.45 }}>{t.blocked}</span> : null}
      <style>{`
        .via-home-language-control { position: relative; width: 100%; }
         .via-home-grid-account-wrap:has(.via-home-grid-account-menu) { z-index: 200; }
        .via-home-grid-account-menu { position: absolute !important; left: 0; right: auto; top: calc(100% + 6px); width: min(218px, calc(100vw - 28px)) !important; max-height: 60vh; overflow-y: auto; box-sizing: border-box; padding: 5px !important; border-radius: 12px !important; background: rgba(10,22,15,.96) !important; backdrop-filter: blur(12px) !important; border: 1px solid rgba(143,212,169,.32) !important; box-shadow: 0 18px 44px rgba(0,0,0,.42) !important; }
        .via-home-account-current { display: grid; gap: 3px; padding: 7px; border-bottom: 1px solid rgba(143,212,169,.18); overflow-wrap: anywhere; }
        .via-home-account-current > span { color: #95a99b; font-size: 10px; }
        .via-home-account-current > strong { color: #b8edca; font-size: 12px; }
        .via-home-account-menu-heading { color: #8fd4a9; font-size: 10px; padding: 7px 7px 3px; }
        .via-home-account-empty { margin: 0; padding: 4px 7px 8px; color: #a7b4ac; font-size: 11px; line-height: 1.45; }
        .via-home-grid-account-menu > button { display: flex; align-items: center; gap: 7px; width: 100%; text-align: left; background: transparent; color: #d7e9dd; border: 0; cursor: pointer; }
        .via-home-grid-account-menu > .via-home-account-logout { color: #edc4b6; }
        .via-home-account-menu > button img, .via-home-account-menu > button svg { width: 23px; height: 23px; border-radius: 50%; object-fit: cover; flex: 0 0 auto; }
        .via-home-account-menu > button span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .via-home-grid-account-menu > a, .via-home-grid-account-menu > button { min-height: 32px !important; padding: 5px 7px !important; border-bottom: 1px solid rgba(143,212,169,.10) !important; }
        .via-home-grid-account-menu > :last-child { border-bottom: 0 !important; }
        .via-home-language-menu { position: absolute; right: 0; top: calc(100% + 6px); z-index: 90; min-width: 112px; padding: 6px; border: 1px solid rgba(143,212,169,.22); border-radius: 12px; background: rgba(5,10,7,.98); box-shadow: 0 16px 36px rgba(0,0,0,.42); }
        .via-home-language-menu button { width: 100%; min-height: 34px; display: flex; align-items: center; justify-content: flex-start; gap: 8px; border: 0; border-radius: 8px; padding: 7px 9px; background: transparent; color: #d3ddd7; font: inherit; font-size: 12px; cursor: pointer; }
        .via-home-language-menu button.is-active { background: rgba(143,212,169,.12); color: #eef5f0; }

        @media (max-width: 1366px) {
          .via-home-controls {
            position: relative !important;
            left: auto !important;
            top: auto !important;
            bottom: auto !important;
            width: auto !important;
            margin: 10px 10px 0 !important;
            padding: 10px 10px 14px !important;
            overflow: visible !important;
            border: 1px solid rgba(143,212,169,.16);
            border-radius: 18px;
            background: transparent;
            backdrop-filter: none;
          }
          .via-home-controls nav a,
          .via-home-controls nav button,
          .via-home-controls nav label {
            background: rgba(8,20,13,.18) !important;
            backdrop-filter: none !important;
          }
          .via-home-controls nav > button {
            border-color: rgba(143,212,169,.30) !important;
            color: #dce8e1 !important;
          }
          .via-home-controls-logo {
            width: 154px !important;
            max-height: 70px !important;
            margin: 0 auto !important;
          }
        }
        .via-home-iphone-utility-row { display: none; }
        .via-home-iphone-clock-inline { display: none; }
        .via-home-iphone-identity { display: none; }
        @media (max-width: 600px) {
          .via-home-music-grid-button, .via-home-handbook-row { display: none !important; }
          .via-home-language-section { display: none !important; }
          .via-home-iphone-clock-inline {
            display: block !important;
            overflow: hidden;
            height: 30px;
            margin-top: -8px;
            margin-bottom: -8px;
          }
          .via-home-standard-label { display: none !important; }
          .via-home-iphone-utility-row {
            display: grid;
            grid-template-columns: repeat(5, 44px);
            width: 252px;
            max-width: 100%;
            justify-content: center;
            gap: 8px;
            margin: 0 auto 2px;
          }
          .via-home-iphone-utility-row > a,\n          .via-home-iphone-utility-account {
            width: 44px !important;
            height: 44px !important;
            min-height: 44px !important;
            padding: 0 !important;
            display: grid !important;
            place-items: center !important;
            border: 1px solid rgba(143,212,169,.24) !important;
            border-radius: 50% !important;
            background: rgba(5,11,8,.62) !important;
            color: #b8ddc5 !important;
            text-decoration: none !important;
          }
          .via-home-iphone-utility-row svg {
            width: 18px;
            height: 18px;
          }
          .via-home-iphone-account-wrap { position: relative; width: 44px; height: 44px; }
          .via-home-iphone-utility-account { cursor: pointer; }
          .via-home-iphone-utility-account img {
            width: 34px;
            height: 34px;
            border-radius: 50%;
            object-fit: cover;
          }
          .via-home-account-menu { position: absolute; left: 0; right: auto; top: calc(100% + 8px); z-index: 120; width: min(240px, calc(100vw - 28px)); max-height: 70vh; overflow-y: auto; padding: 9px; border: 1px solid rgba(143,212,169,.22); border-radius: 14px; background: rgba(10,22,15,.96); backdrop-filter: blur(12px); box-shadow: 0 18px 44px rgba(0,0,0,.42); }
          .via-home-account-menu-heading { color: #8fd4a9; font-size: 10px; font-weight: 700; padding: 10px 9px 5px; border-top: 1px solid rgba(143,212,169,.18); margin-top: 5px; }
          .via-home-account-menu > a, .via-home-account-menu > button { width: 100%; min-height: 32px; display: flex; align-items: center; gap: 6px; padding: 5px 7px; border: 0; border-radius: 9px; background: transparent; color: #d3ddd7; text-decoration: none; font: inherit; font-size: 11px; text-align: left; cursor: pointer; box-sizing: border-box; white-space: nowrap; overflow: hidden; }
          .via-home-account-menu > button img, .via-home-account-menu > button svg { width: 26px; height: 26px; border-radius: 50%; object-fit: cover; flex: 0 0 auto; }
          .via-home-account-menu > a:hover, .via-home-account-menu > button:hover { background: rgba(143,212,169,.10); }
          .via-home-iphone-utility-future {
            font-size: 7px !important;
            font-weight: 800 !important;
            line-height: 8px !important;
            align-content: center !important;
          }
          .via-home-iphone-utility-future span {
            display: block;
            text-align: center;
          }
          .via-home-iphone-identity {
            display: grid;
            grid-template-columns: 48px minmax(0,1fr) 48px;
            align-items: center;
            gap: 8px;
            min-height: 52px;
          }
          .via-home-iphone-deso {
            position: relative;
            width: 48px;
            height: 44px;
            display: grid;
            place-items: center;
            text-decoration: none;
            overflow: visible;
          }
          .via-home-iphone-deso > img,
          .via-home-iphone-avatar-fallback {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            object-fit: cover;
            display: grid;
            place-items: center;
          }
          .via-home-iphone-avatar-fallback {
            background: #183326;
            color: #9adbb2;
            font-size: 15px;
            font-weight: 900;
            border: 1px solid rgba(143,212,169,.30);
          }
          .via-home-iphone-deso-status {
            position: absolute;
            right: -7px;
            bottom: -7px;
            z-index: 2;
          }
          .via-home-iphone-account-link {
            min-width: 0;
            display: grid;
            gap: 2px;
            text-decoration: none;
            text-align: left;
          }
          .via-home-iphone-account-link strong {
            color: #e5eee8;
            font-size: 11px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .via-home-iphone-account-link span {
            color: #74877b;
            font-size: 8px;
            letter-spacing: .08em;
            text-transform: uppercase;
          }
          .via-home-iphone-via-future {
            width: 48px;
            height: 44px;
            display: grid;
            place-content: center;
            justify-items: center;
            border: 1px solid rgba(143,212,169,.22);
            border-radius: 50%;
            background: rgba(5,11,8,.76);
            color: #b8ddc5;
            font-size: 7px;
            font-weight: 800;
            line-height: 8px;
            letter-spacing: .02em;
            position: relative;
          }
          .via-home-iphone-future-leaf {
            display: none;
          }
        }
      `}</style>
    </aside>
  )
}
