"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { RadioTower, UsersRound } from "lucide-react"
import {
  DESO_LOGIN_URL,
  clearIdentitySession,
  listIdentitySessions,
  persistIdentityLogin,
  restoreIdentitySession,
  switchIdentitySession,
  type ViaIdentitySession,
} from "./deso-identity-session"
import ViaIdentityStatusMarks from "./via-identity-status"
import {
  readViaLocalSettings,
  saveViaLocalSettings,
  VIA_LANGUAGES,
  VIA_SETTINGS_EVENT,
  type ViaLanguage,
} from "./via-local-settings"

type PublicProfile = { username?: string; profilePic?: string | null; isVerified?: boolean; isInactive?: boolean; viaRecognized?: boolean }
type ProfileResponse = { ok?: boolean; profile?: PublicProfile }

const nav = [
  ["home", "/"],
  ["feed", "/social"],
  ["discover", "/discover"],
  ["nfts", "/collection"],
  ["live", "/live"],
  ["games", "/quest"],
  ["communities", "/communities"],
  ["world", "/world"],
  ["myVia", "/my-via"],
] as const

type HeaderCopy = {
  home: string; feed: string; discover: string; nfts: string; live: string; games: string; communities: string; world: string; myVia: string;
  search: string; publicEntrance: string; login: string; wallet: string; notifications: string; connected: string;
  profile: string; saved: string; drafts: string; settings: string; switchAccount: string; desoAccount: string; addAccount: string; logout: string;
}

const headerCopy: Record<ViaLanguage | "Hindi", HeaderCopy> = {
  Dutch: {
    home: "Home", feed: "Sociaal", discover: "Ontdekken", nfts: "NFT's", live: "Live", games: "Spellen", communities: "Community's", world: "Wereld", myVia: "Mijn VIA",
    search: "Zoek leden", publicEntrance: "Publieke ingang", login: "DeSo Login", wallet: "Mijn Wallet", notifications: "Meldingen", connected: "DeSo verbonden",
    profile: "Mijn profiel", saved: "Bookmarks", drafts: "Concepten", settings: "Instellingen", switchAccount: "Wissel account", desoAccount: "DeSo-account", addAccount: "DeSo-account toevoegen", logout: "Uitloggen uit VIA",
  },
  English: {
    home: "Home", feed: "Social", discover: "Discover", nfts: "NFTs", live: "Live", games: "Games", communities: "Communities", world: "World", myVia: "My VIA",
    search: "Search members", publicEntrance: "Public Entrance", login: "DeSo Login", wallet: "My Wallet", notifications: "Notifications", connected: "DeSo connected",
    profile: "My Profile", saved: "Bookmarks", drafts: "Drafts", settings: "Settings", switchAccount: "Switch account", desoAccount: "DeSo account", addAccount: "Add DeSo account", logout: "Logout from VIA",
  },
  French: {
    home: "Accueil", feed: "Social", discover: "Découvrir", nfts: "NFT", live: "Live", games: "Jeux", communities: "Communautés", world: "Monde", myVia: "Mon VIA",
    search: "Rechercher des membres", publicEntrance: "Entrée publique", login: "Connexion DeSo", wallet: "Mon Wallet", notifications: "Notifications", connected: "DeSo connecté",
    profile: "Mon profil", saved: "Favoris", drafts: "Brouillons", settings: "Paramètres", switchAccount: "Changer de compte", desoAccount: "Compte DeSo", addAccount: "Ajouter un compte DeSo", logout: "Se déconnecter de VIA",
  },
  Spanish: {
    home: "Inicio", feed: "Social", discover: "Descubrir", nfts: "NFT", live: "Live", games: "Juegos", communities: "Comunidades", world: "Mundo", myVia: "Mi VIA",
    search: "Buscar miembros", publicEntrance: "Entrada pública", login: "Acceso DeSo", wallet: "Mi Wallet", notifications: "Notificaciones", connected: "DeSo conectado",
    profile: "Mi perfil", saved: "Guardados", drafts: "Borradores", settings: "Ajustes", switchAccount: "Cambiar cuenta", desoAccount: "Cuenta DeSo", addAccount: "Añadir cuenta DeSo", logout: "Cerrar sesión en VIA",
  },
  Chinese: {
    home: "首页", feed: "社交", discover: "发现", nfts: "NFT", live: "直播", games: "游戏", communities: "社区", world: "世界", myVia: "我的 VIA",
    search: "搜索成员", publicEntrance: "公开入口", login: "DeSo 登录", wallet: "我的钱包", notifications: "通知", connected: "DeSo 已连接",
    profile: "我的资料", saved: "书签", drafts: "草稿", settings: "设置", switchAccount: "切换账户", desoAccount: "DeSo 账户", addAccount: "添加 DeSo 账户", logout: "退出 VIA",
  },
  Hindi: {
    home: "होम", feed: "सोशल", discover: "खोजें", nfts: "NFT", live: "लाइव", games: "गेम्स", communities: "समुदाय", world: "दुनिया", myVia: "मेरा VIA",
    search: "सदस्य खोजें", publicEntrance: "सार्वजनिक प्रवेश", login: "DeSo लॉगिन", wallet: "मेरा वॉलेट", notifications: "सूचनाएँ", connected: "DeSo जुड़ा है",
    profile: "मेरी प्रोफ़ाइल", saved: "बुकमार्क", drafts: "ड्राफ्ट", settings: "सेटिंग्स", switchAccount: "खाता बदलें", desoAccount: "DeSo खाता", addAccount: "DeSo खाता जोड़ें", logout: "VIA से लॉग आउट",
  },
}

const languageCodes: Record<ViaLanguage | "Hindi", string> = {
  Dutch: "NL", English: "EN", French: "FR", Spanish: "ES", Chinese: "中文", Hindi: "हिं",
}
const languageFlags: Record<ViaLanguage | "Hindi", string> = {
  Dutch: "🇳🇱", English: "🇬🇧", French: "🇫🇷", Spanish: "🇪🇸", Chinese: "🇨🇳", Hindi: "🇮🇳",
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
  toolsRow: { gridColumn: "2", gridRow: "2", minWidth: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: "9px", overflow: "visible", padding: "9px 0", borderTop: "1px solid rgba(143,212,169,.08)" },
  nav: { flex: "1 1 auto", minWidth: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: "2px", overflowX: "auto" as const, scrollbarWidth: "none" as const },
  link: { position: "relative" as const, flex: "0 0 auto", padding: "25px 10px 22px", color: "#aeb9b2", textDecoration: "none", fontSize: "12px", fontWeight: 650, whiteSpace: "nowrap" as const },
  activeLink: { color: "#eef5f0" },
  activeLine: { position: "absolute" as const, left: "10px", right: "10px", bottom: "14px", height: "1px", background: "#8fd4a9" },
  search: { ...pill, minWidth: "205px", justifyContent: "flex-start" },
  language: { ...pill, appearance: "none" as const, cursor: "pointer", paddingRight: "14px", outline: "none" },
  login: { ...pill, cursor: "pointer" },
  accountWrap: { position: "relative" as const, zIndex: 120, flex: "0 0 auto", display: "grid", justifyItems: "end" as const, gap: "2px" },
  accountButton: { ...pill, cursor: "pointer", padding: "5px 12px 5px 6px", color: "#e3ebe6" },
  avatar: { width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" as const },
  avatarFallback: { width: "28px", height: "28px", borderRadius: "50%", display: "grid", placeItems: "center", background: "#183326", color: "#9adbb2", fontSize: "11px", fontWeight: 900 },
  menu: { position: "absolute" as const, right: 0, top: "48px", zIndex: 200, width: "270px", maxHeight: "min(70vh, 520px)", overflowY: "auto" as const, padding: "8px", border: "1px solid rgba(143,212,169,.18)", borderRadius: "14px", background: "rgba(5,10,7,.99)", boxShadow: "0 18px 44px rgba(0,0,0,.38)" },
  menuLabel: { padding: "7px 9px 9px", color: "#78867e", fontSize: "10px", letterSpacing: ".08em", textTransform: "uppercase" as const },
  menuLink: { display: "block", minHeight: "38px", padding: "9px 10px", borderRadius: "9px", color: "#d3ddd7", textDecoration: "none", fontSize: "12px", lineHeight: "20px" },
  menuButton: { width: "100%", minHeight: "38px", padding: "9px 10px", border: 0, borderRadius: "9px", color: "#b7c3bc", background: "transparent", cursor: "pointer", textAlign: "left" as const, fontSize: "12px" },
  accountChoice: { width: "100%", minHeight: "44px", padding: "7px 9px", border: 0, borderRadius: "9px", color: "#d3ddd7", background: "transparent", cursor: "pointer", textAlign: "left" as const, display: "flex", alignItems: "center", gap: "9px" },
  accountChoiceText: { minWidth: 0, display: "grid", gap: "1px" },
  accountChoiceName: { fontSize: "12px", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const },
  accountChoiceKey: { color: "#78867e", fontSize: "9px", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const },
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
  const router = useRouter()
  const accountWrapRef = useRef<HTMLDivElement | null>(null)
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const [knownAccounts, setKnownAccounts] = useState<ViaIdentitySession[]>([])
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [profiles, setProfiles] = useState<Record<string, PublicProfile>>({})
  const [menuOpen, setMenuOpen] = useState(false)
  const [language, setLanguage] = useState<ViaLanguage>("Dutch")
  const [languageOpen, setLanguageOpen] = useState(false)
  const [notificationStatusOpen, setNotificationStatusOpen] = useState(false)

  function refreshKnownAccounts() {
    setKnownAccounts(listIdentitySessions())
  }

  useEffect(() => {
    const syncSettings = () => setLanguage(readViaLocalSettings().interfaceLanguage)
    setSession(restoreIdentitySession())
    refreshKnownAccounts()
    syncSettings()
    function handleIdentityMessage(event: MessageEvent) {
      const nextSession = persistIdentityLogin(event)
      if (!nextSession) return
      setSession(nextSession)
      refreshKnownAccounts()
      setMenuOpen(false)
    }
    window.addEventListener("message", handleIdentityMessage)
    window.addEventListener(VIA_SETTINGS_EVENT, syncSettings)
    return () => {
      window.removeEventListener("message", handleIdentityMessage)
      window.removeEventListener(VIA_SETTINGS_EVENT, syncSettings)
    }
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

  useEffect(() => { setMenuOpen(false); setNotificationStatusOpen(false) }, [pathname])

  useEffect(() => {
    if (!session?.publicKey) { setProfile(null); return }
    const controller = new AbortController()
    void fetch(`/api/via/profile?identity=${encodeURIComponent(session.publicKey)}`, { cache: "no-store", signal: controller.signal, headers: { Accept: "application/json" } })
      .then(async (response) => response.ok ? (await response.json()) as ProfileResponse : null)
      .then((data) => setProfile(data?.ok && data.profile ? data.profile : null))
      .catch((error) => { if (!(error instanceof DOMException && error.name === "AbortError")) setProfile(null) })
    return () => controller.abort()
  }, [session?.publicKey])

  useEffect(() => {
    if (!knownAccounts.length) { setProfiles({}); return }
    const controller = new AbortController()
    void Promise.all(knownAccounts.map(async (account) => {
      try {
        const response = await fetch(`/api/via/profile?identity=${encodeURIComponent(account.publicKey)}`, { cache: "no-store", signal: controller.signal, headers: { Accept: "application/json" } })
        const data = response.ok ? (await response.json()) as ProfileResponse : null
        return [account.publicKey, data?.ok && data.profile ? data.profile : {}] as const
      } catch {
        return [account.publicKey, {}] as const
      }
    })).then((entries) => {
      if (!controller.signal.aborted) setProfiles(Object.fromEntries(entries))
    })
    return () => controller.abort()
  }, [knownAccounts])

  function changeLanguage(next: ViaLanguage) {
    saveViaLocalSettings({ interfaceLanguage: next })
    setLanguage(next)
  }

  function chooseAccount(publicKey: string) {
    const nextSession = switchIdentitySession(publicKey)
    if (!nextSession) return
    setSession(nextSession)
    setProfile(profiles[publicKey] ?? null)
    setMenuOpen(false)
    router.refresh()
  }

  function enterPublicMode() {
    clearIdentitySession()
    setSession(null)
    setProfile(null)
    setMenuOpen(false)
    router.push("/public")
  }

  function logout() {
    clearIdentitySession()
    setSession(null)
    setProfile(null)
    setMenuOpen(false)
  }

  const t = headerCopy[language]
  const avatar = safeProfileImage(profile?.profilePic)
  const accountLabel = profile?.username ? `@${profile.username}` : t.connected
  const otherAccounts = knownAccounts.filter((account) => account.publicKey !== session?.publicKey)

  return (
    <header style={styles.header} className="via-site-header">
      <div style={styles.shell} className="via-site-header-shell">
        <Link href="/" style={styles.brand} className="via-site-header-brand" aria-label="VIA home">
          <img src="/via-logo-original.jpg?v=1" alt="VIA" style={styles.logo} className="via-site-header-logo" />
        </Link>

        <div style={styles.topRow} className="via-site-header-top">
          <nav style={styles.nav} className={`via-site-header-nav ${pathname === "/notifications" || pathname === "/radio" ? "via-site-header-nav-compact-mobile" : ""}`} aria-label="VIA main navigation">
            {nav.map(([key, href]) => {
              const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)
              return <Link key={href} href={href} className="via-site-header-link" style={{ ...styles.link, ...(active ? styles.activeLink : {}) }}>{t[key]}{active ? <span style={styles.activeLine} aria-hidden="true" /> : null}</Link>
            })}
          </nav>
        </div>

        <div style={styles.toolsRow} className={`via-site-header-tools ${pathname === "/notifications" || pathname === "/radio" ? "via-site-header-tools-notifications" : ""}`} aria-label="VIA utility controls">
          <div className="via-notifications-top-control"><Link href="/discover/voices" style={styles.search} className={`via-site-header-search ${pathname === "/notifications" || pathname === "/radio" ? "via-site-header-search-notifications" : ""}`} aria-label={t.search} title={t.search}><span className="via-notifications-members-icon" aria-hidden="true"><UsersRound className="h-4 w-4" /></span><span className="via-site-header-search-label">&nbsp;&nbsp; {t.search}</span></Link>{pathname === "/notifications" || pathname === "/radio" ? <span className="via-notifications-top-label">Members</span> : null}</div>
          <div className="via-site-header-language-wrap">
            <button type="button" onClick={() => setLanguageOpen((open) => !open)} style={styles.language} className={`via-site-header-language ${pathname === "/notifications" || pathname === "/radio" ? "via-site-header-language-notifications" : ""}`} aria-label="VIA language" aria-expanded={languageOpen}>
              <span className="via-site-header-language-flag" aria-hidden="true">{languageFlags[language]}</span><span className="via-site-header-language-code">{languageCodes[language]}</span>
            </button>
            {languageOpen ? <div className="via-site-header-language-menu" role="menu" aria-label="VIA language">
              {VIA_LANGUAGES.map((item) => <button key={item} type="button" role="menuitemradio" aria-checked={item === language} onClick={() => { changeLanguage(item); setLanguageOpen(false) }} className={item === language ? "is-active" : ""} data-via-language={item}>
                <span aria-hidden="true">{languageFlags[item]}</span><span>{languageCodes[item]}</span>
              </button>)}
            </div> : null}
          </div>
          {pathname === "/notifications" || pathname === "/radio" ? <div className="via-notifications-top-control"><Link href="/radio" className="via-notifications-radio-top" aria-label="World Radio" title="World Radio"><RadioTower className="h-4 w-4" aria-hidden="true" /></Link><span className="via-notifications-top-label">Radio</span></div> : null}
          {!session ? <button type="button" onClick={enterPublicMode} style={{ ...pill, cursor: "pointer" }}>{t.publicEntrance}</button> : null}
          {!session ? <a href={DESO_LOGIN_URL} target="via-deso-identity" style={styles.login}>{t.login}</a> : null}
          <Link href="/wallet" style={pill} className={`via-site-header-utility ${pathname === "/notifications" ? "via-site-header-wallet-notifications" : ""}`}>{t.wallet}</Link>
          {pathname !== "/notifications" ? <Link href="/notifications" style={pill} className="via-site-header-utility">{t.notifications}</Link> : null}

          {session ? (
            <>
              {pathname === "/notifications" || pathname === "/radio" ? <span className="via-notifications-future-mark">VIA Future</span> : null}
              <Link
                href="/profile"
                aria-label={t.profile}
                title={t.profile}
                className={`via-profile-shortcut ${pathname === "/notifications" || pathname === "/radio" ? "via-profile-shortcut-notifications" : ""}`}
                style={{
                  ...pill,
                  width: "48px",
                  minWidth: "48px",
                  height: "44px",
                  padding: "4px",
                  borderRadius: "14px",
                  flex: "0 0 auto",
                  position: "relative",
                  overflow: "visible",
                  borderColor: "transparent",
                  background: "transparent",
                  boxShadow: "none",
                }}
              >
                {avatar ? (
                  <img src={avatar} alt="" referrerPolicy="no-referrer" style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", border: 0, boxShadow: "none" }} />
                ) : (
                  <span aria-hidden="true" style={{ width: "36px", height: "36px", display: "grid", placeItems: "center", borderRadius: "50%", background: "#183326", color: "#9adbb2", fontSize: "15px", fontWeight: 900, border: "1px solid rgba(143,212,169,.30)" }}>
                    {profile?.username?.slice(0, 1).toUpperCase() ?? "V"}
                  </span>
                )}
                <span className="via-profile-shortcut-status" style={{ position: "absolute", right: "-7px", bottom: "-7px", zIndex: 2 }}>
                  <ViaIdentityStatusMarks verified={Boolean(profile?.isVerified)} inactive={Boolean(profile?.isInactive)} viaRecognized={Boolean(profile?.viaRecognized)} compact language={language} />
                </span>
                {pathname === "/notifications" || pathname === "/radio" ? (
                  <>
                    <span
                      className="via-notifications-status-caret"
                      role="button"
                      tabIndex={0}
                      aria-expanded={notificationStatusOpen}
                      aria-label="Open DeSo and VIA status information"
                      onClick={(event) => { event.preventDefault(); event.stopPropagation(); setNotificationStatusOpen((open) => !open) }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault()
                          event.stopPropagation()
                          setNotificationStatusOpen((open) => !open)
                        }
                      }}
                    >▾</span>
                    {notificationStatusOpen ? (
                      <span className="via-notifications-status-info" role="status" onClick={(event) => { event.preventDefault(); event.stopPropagation() }}>
                        <strong>{language === "Dutch" ? "DeSo Verified" : language === "French" ? "Vérifié par DeSo" : language === "Spanish" ? "Verificado por DeSo" : language === "Chinese" ? "DeSo 已验证" : "DeSo Verified"}</strong>
                        <span>{language === "Dutch" ? "Originele DeSo-verificatie. VIA kan deze status niet toekennen, wijzigen of verwijderen." : language === "French" ? "Vérification DeSo d'origine. VIA ne peut ni attribuer, ni modifier, ni supprimer ce statut." : language === "Spanish" ? "Verificación original de DeSo. VIA no puede conceder, cambiar ni eliminar este estado." : language === "Chinese" ? "这是 DeSo 原始验证状态。VIA 不能授予、更改或移除此状态。" : "Original DeSo verification. VIA cannot grant, change or remove this status."}</span>
                        <strong>{language === "Dutch" ? "VIA-erkenning" : language === "French" ? "Reconnaissance VIA" : language === "Spanish" ? "Reconocimiento VIA" : language === "Chinese" ? "VIA 认可" : "VIA Recognition"}</strong>
                        <span>{language === "Dutch" ? "Het VIA-blaadje wordt verdiend door aantoonbare positieve betrokkenheid bij VIA volgens vaste VIA-criteria. De erkenning is niet te koop en wordt pas bij de echte livegang geactiveerd." : language === "French" ? "La feuille VIA s'obtient par une participation positive et vérifiable à VIA selon des critères VIA fixes. Cette reconnaissance ne peut pas être achetée et ne sera activée qu'au lancement public réel." : language === "Spanish" ? "La hoja VIA se obtiene mediante una participación positiva y verificable en VIA según criterios fijos de VIA. Este reconocimiento no se puede comprar y solo se activará en el lanzamiento público real." : language === "Chinese" ? "VIA 叶标需按照固定的 VIA 标准，通过可验证的积极参与获得。该认可不可购买，并且只会在正式公开上线时启用。" : "The VIA leaf is earned through verifiable positive participation in VIA under fixed VIA criteria. This recognition cannot be bought and will only be enabled at the real public launch."}</span>
                      </span>
                    ) : null}
                  </>
                ) : null}
              </Link>
              <div ref={accountWrapRef} style={styles.accountWrap} className="via-site-header-account-wrap">
              <button type="button" style={styles.accountButton} className="via-site-header-account-button" onClick={() => { refreshKnownAccounts(); setMenuOpen((open) => !open) }} aria-label="Open VIA account menu" aria-expanded={menuOpen} aria-haspopup="menu">
                <span className="via-site-header-account-menu-icon" aria-hidden="true">⋯</span>
                <span className="via-site-header-account-label">{accountLabel}</span>
                <span className="via-site-header-account-label"><ViaIdentityStatusMarks verified={Boolean(profile?.isVerified)} inactive={Boolean(profile?.isInactive)} compact language={language} /></span>
                <span className="via-site-header-account-caret" aria-hidden="true">▾</span>
              </button>
              {menuOpen ? (
                <div style={styles.menu} className="via-site-header-account-menu" role="menu" aria-label="VIA account menu">
                  <div style={styles.menuLabel}>{profile?.username ? `@${profile.username}` : shortPublicKey(session.publicKey)}</div>
                  <Link href="/my-via" style={styles.menuLink} role="menuitem">{t.myVia}</Link>
                  <Link href="/profile" style={styles.menuLink} role="menuitem">{t.profile}</Link>
                  <Link href="/wallet" style={styles.menuLink} role="menuitem">{t.wallet}</Link>
                  <Link href="/saved" style={styles.menuLink} role="menuitem">{t.saved}</Link>
                  <Link href="/studio#drafts" style={styles.menuLink} role="menuitem">{t.drafts}</Link>
                  <Link href="/settings" style={styles.menuLink} role="menuitem">{t.settings}</Link>
                  {otherAccounts.length ? <>
                    <div style={styles.divider} />
                    <div style={styles.menuLabel}>{t.switchAccount}</div>
                    {otherAccounts.map((account) => {
                      const accountProfile = profiles[account.publicKey]
                      const accountAvatar = safeProfileImage(accountProfile?.profilePic)
                      const accountName = accountProfile?.username ? `@${accountProfile.username}` : "DeSo account"
                      return (
                        <button key={account.publicKey} type="button" style={styles.accountChoice} onClick={() => chooseAccount(account.publicKey)} role="menuitem">
                          {accountAvatar ? <img src={accountAvatar} alt="" style={styles.avatar} referrerPolicy="no-referrer" /> : <span style={styles.avatarFallback} aria-hidden="true">{accountProfile?.username?.slice(0, 1).toUpperCase() ?? "V"}</span>}
                          <span style={styles.accountChoiceText}>
                            <span style={styles.accountChoiceName}>{accountName}</span>
                            <span style={styles.accountChoiceKey}>{shortPublicKey(account.publicKey)}</span>
                          </span>
                        </button>
                      )
                    })}
                  </> : null}
                  <div style={styles.divider} />
                  <a href={DESO_LOGIN_URL} target="via-deso-identity" style={styles.menuLink} role="menuitem">{t.addAccount}</a>
                  <button type="button" style={styles.menuButton} onClick={logout} role="menuitem">{t.logout}</button>
                </div>
              ) : null}
              </div>
            </>
          ) : null}
        </div>
      </div>
      <style>{`
        .via-site-header-language-wrap { position: relative; flex: 0 0 auto; }\n        .via-notifications-top-control { display: contents; }\n        .via-notifications-top-label { display: none; }
        .via-site-header-language { gap: 6px !important; min-width: 68px; }
        .via-site-header-language-menu { position: absolute; top: 44px; left: 0; z-index: 220; width: 118px; max-height: min(330px, calc(100vh - 90px)); overflow-y: auto; padding: 5px; border: 1px solid rgba(143,212,169,.22); border-radius: 12px; background: rgba(5,10,7,.99); box-shadow: 0 14px 34px rgba(0,0,0,.42); }
        .via-site-header-language-menu button { width: 100%; display: flex; align-items: center; gap: 8px; padding: 7px 9px; border: 0; border-radius: 8px; background: transparent; color: #cfd9d3; font-size: 12px; cursor: pointer; text-align: left; }
        .via-site-header-language-menu button:hover, .via-site-header-language-menu button:focus-visible, .via-site-header-language-menu button.is-active { background: rgba(40,95,64,.58); color: white; outline: none; }
        @media (max-width: 720px) {
          .via-site-header-shell { width: 100% !important; padding: 0 12px 0 6px !important; box-sizing: border-box !important; grid-template-columns: 72px minmax(0, 1fr) !important; grid-template-rows: 58px 50px !important; column-gap: 6px !important; }\n          .via-site-header-shell:has(.via-site-header-tools-notifications) { grid-template-rows: 52px !important; }
          .via-site-header-brand { grid-column: 1 !important; grid-row: 1 !important; justify-content: flex-start !important; overflow: visible !important; }
          .via-site-header-logo { width: 68px !important; height: 52px !important; margin-left: -3px !important; }
          .via-site-header-top { grid-column: 2 !important; grid-row: 1 !important; padding-right: 46px !important; }
          .via-site-header-nav { justify-content: flex-start !important; overflow-x: auto !important; scrollbar-width: none !important; }\n          .via-site-header-nav-compact-mobile { display: none !important; }
          .via-site-header-nav::-webkit-scrollbar, .via-site-header-tools::-webkit-scrollbar { display: none; }
          .via-site-header-link { padding: 18px 8px 15px !important; font-size: 11px !important; }
          .via-site-header-tools { grid-column: 1 / span 2 !important; grid-row: 2 !important; justify-content: flex-start !important; overflow-x: auto !important; overflow-y: hidden !important; gap: 6px !important; padding: 6px 8px !important; }
          .via-site-header-tools-notifications { position: absolute !important; top: 4px !important; height: 44px !important; grid-column: auto !important; grid-row: auto !important; display: grid !important; align-items: start !important; justify-items: center !important; padding: 0 !important; overflow: visible !important; }
          .via-site-header-tools-notifications .via-notifications-top-control, .via-site-header-tools-notifications .via-site-header-language-wrap { display: flex !important; min-width: 0 !important; flex-direction: column !important; align-items: center !important; gap: 1px !important; }
          .via-site-header-tools-notifications .via-notifications-top-label { display: block !important; color: #8b9890 !important; font-size: 8px !important; line-height: 10px !important; white-space: nowrap !important; }
          .via-site-header-language-notifications { padding: 0 !important; justify-content: center !important; flex-direction: column !important; gap: 0 !important; }
          .via-site-header-language-notifications .via-site-header-language-flag { display: block !important; margin: 0 !important; font-size: 13px !important; line-height: 14px !important; text-align: center !important; }
          .via-site-header-language-notifications .via-site-header-language-code { display: block !important; margin: 0 !important; font-size: 8px !important; line-height: 9px !important; text-align: center !important; }
          .via-site-header-search-notifications { padding: 0 !important; justify-content: center !important; }
          .via-site-header-search-notifications .via-site-header-search-label { display: none !important; }
          .via-notifications-radio-top { display: inline-grid !important; place-items: center !important; border: 1px solid rgba(143,212,169,.22) !important; background: rgba(5,11,8,.76) !important; color: #b8ddc5 !important; text-decoration: none !important; font-size: 16px !important; line-height: 1 !important; }
          .via-site-header-wallet-notifications { display: none !important; }
          .via-site-header-nav-compact-mobile { display: none !important; }
          .via-site-header-account-menu { top: 44px !important; right: 0 !important; width: min(280px, calc(100vw - 20px)) !important; }
          /* Notifications iPhone: one layout process only. Keep every top-row control in DOM order. */
          .via-site-header-tools-notifications > .via-profile-shortcut-notifications {
            grid-column: 4 !important;
            justify-self: center !important;
            transform: translateX(-2px) !important;
          }
          .via-site-header-tools-notifications > .via-site-header-account-wrap {
            grid-column: 5 !important;
            justify-self: end !important;
          }
          .via-site-header-tools-notifications .via-profile-shortcut-notifications {
            position: relative !important;
            right: auto !important;
            top: 0 !important;
            flex: 0 0 34px !important;
            width: 34px !important;
            min-width: 34px !important;
            height: 34px !important;
            padding: 2px !important;
            border-radius: 50% !important;
          }
          .via-site-header-tools-notifications .via-site-header-account-wrap {
            position: relative !important;
            right: auto !important;
            top: 0 !important;
            flex: 0 0 34px !important;
            width: 34px !important;
            height: 34px !important;
          }
          .via-site-header-tools-notifications .via-site-header-account-button {
            min-width: 34px !important;
            width: 34px !important;
            height: 34px !important;
            padding: 3px !important;
          }
          .via-site-header-tools-notifications .via-profile-shortcut-status {
            right: -10px !important;
            bottom: -7px !important;
          }
          .via-site-header-tools-notifications .via-notifications-future-mark {
            position: absolute !important;
            left: 29px !important;
            top: 0 !important;
            display: grid !important;
            place-items: center !important;
            width: 57px !important;
            height: 34px !important;
            box-sizing: border-box !important;
            border: 1px solid rgba(143,212,169,.52) !important;
            border-left: 0 !important;
            border-radius: 0 17px 17px 0 !important;
            color: #b8ddc5 !important;
            font-size: 7px !important;
            font-weight: 700 !important;
            line-height: 8px !important;
            text-align: center !important;
            white-space: normal !important;
            pointer-events: none !important;
          }
          /* Final Notifications iPhone geometry: override older mobile rules with one fixed circle system. */
          .via-site-header-tools-notifications {
            left: 78px !important;
            right: 10px !important;
            grid-template-columns: repeat(6, 34px) !important;
            column-gap: 2px !important;
          }
          .via-site-header-tools-notifications > .via-notifications-top-control,
          .via-site-header-tools-notifications > .via-site-header-language-wrap {
            width: 34px !important;
            min-width: 34px !important;
            justify-self: center !important;
          }
          .via-site-header-tools-notifications .via-site-header-search-notifications,
          .via-site-header-tools-notifications .via-site-header-language-notifications,
          .via-site-header-tools-notifications .via-notifications-radio-top {
            flex: 0 0 34px !important;
            width: 34px !important;
            min-width: 34px !important;
            max-width: 34px !important;
            height: 34px !important;
            min-height: 34px !important;
            max-height: 34px !important;
            aspect-ratio: 1 / 1 !important;
            border-radius: 50% !important;
            box-sizing: border-box !important;
          }
          .via-site-header-tools-notifications > .via-notifications-future-mark { grid-column: 4 !important; justify-self: center !important; }
          .via-site-header-tools-notifications > .via-profile-shortcut-notifications {
            grid-column: 5 !important;
            transform: translateX(0) !important;
            justify-self: end !important;
            margin-right: 0 !important;
            padding: 0 !important;
            border: 0 !important;
            background: transparent !important;
            box-shadow: none !important;
          }
          .via-site-header-tools-notifications .via-profile-shortcut-notifications > img {
            width: 34px !important;
            height: 34px !important;
            border-radius: 50% !important;
            object-fit: cover !important;
            border: 1px solid rgba(143,212,169,.52) !important;
            box-shadow: none !important;
          }
          .via-site-header-tools-notifications .via-notifications-future-mark {
            position: relative !important;
            left: auto !important;
            top: 0 !important;
            display: grid !important;
            place-items: center !important;
            width: 34px !important;
            min-width: 34px !important;
            max-width: 34px !important;
            height: 34px !important;
            min-height: 34px !important;
            max-height: 34px !important;
            padding: 0 !important;
            border: 1px solid rgba(143,212,169,.52) !important;
            border-radius: 50% !important;
            background: rgba(5,11,8,.76) !important;
            white-space: normal !important;
            color: #b8ddc5 !important;
            font-size: 6px !important;
            font-weight: 700 !important;
            line-height: 7px !important;
            text-align: center !important;
          }
          .via-site-header-tools-notifications .via-site-header-account-button {
            overflow: hidden !important;
          }
          .via-site-header-tools-notifications .via-site-header-account-label,
          .via-site-header-tools-notifications .via-site-header-account-caret {
            display: none !important;
          }
          .via-site-header-tools-notifications .via-site-header-account-menu-icon {
            display: block !important;
            font-size: 18px !important;
            line-height: 1 !important;
          }
          .via-site-header-tools-notifications > .via-site-header-account-wrap {
            grid-column: 6 !important;
            position: relative !important;
            right: auto !important;
            top: 0 !important;
            flex: 0 0 34px !important;
            width: 34px !important;
            min-width: 34px !important;
            max-width: 34px !important;
            height: 34px !important;
            min-height: 34px !important;
            max-height: 34px !important;
            justify-self: end !important;
          }
          .via-site-header-tools-notifications .via-site-header-account-button {
            flex: 0 0 34px !important;
            width: 34px !important;
            min-width: 34px !important;
            max-width: 34px !important;
            height: 34px !important;
            min-height: 34px !important;
            max-height: 34px !important;
            aspect-ratio: 1 / 1 !important;
            border-radius: 50% !important;
            box-sizing: border-box !important;
          }
          .via-site-header-tools-notifications .via-notifications-status-caret {
            position: absolute !important;
            right: -20px !important;
            top: 11px !important;
            display: inline-block !important;
            color: #39d79a !important;
            font-size: 12px !important;
            line-height: 1 !important;
            pointer-events: none !important;
          }
        }
        @media (min-width: 721px) {
          .via-site-header-account-menu-icon { display: none !important; }
          .via-profile-shortcut-status { display: none !important; }\n          .via-profile-shortcut-notifications { top: 3px !important; width: 52px !important; min-width: 52px !important; height: 52px !important; padding: 5px !important; border-radius: 14px !important; }\n          .via-profile-shortcut-notifications > img, .via-profile-shortcut-notifications > span[aria-hidden="true"] { width: 40px !important; height: 40px !important; }
        }
      `}</style>
    </header>
  )
}
