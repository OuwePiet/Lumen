"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import {
  DESO_LOGIN_URL,
  VIA_IDENTITY_EVENT,
  clearIdentitySession,
  listIdentitySessions,
  persistIdentityLogin,
  restoreIdentitySession,
  switchIdentitySession,
  type ViaIdentitySession,
} from "./deso-identity-session"
import ViaIdentityStatusMarks from "./via-identity-status"
import SponsorPlatform from "./sponsor-platform"
import {
  readViaLocalSettings,
  saveViaLocalSettings,
  VIA_LANGUAGES,
  VIA_SETTINGS_EVENT,
  type ViaLanguage,
} from "./via-local-settings"

type PublicProfile = { username?: string; profilePic?: string | null; isVerified?: boolean; isInactive?: boolean }
type ProfileResponse = { ok?: boolean; profile?: PublicProfile }

// Homepage groups stay compact so account controls remain visible on tablet heights.
const standardNav = [
  ["home", "/"],
  ["notifications", "/notifications"],
  ["messages", "/messages"],
  ["discover", "/discover"],
  ["bookmarks", "/saved"],
  ["profile", "/profile"],
  ["wallet", "/wallet"],
  ["more", "/more"],
] as const

const viaExtraNav = [
  ["social", "/social"],
  ["nfts", "/collection"],
  ["live", "/live"],
  ["communities", "/communities"],
  ["games", "/quest"],
  ["world", "/world"],
  ["myVia", "/my-via"],
  ["advertising", "/advertising"],
] as const

const languageCodes: Record<ViaLanguage | "Hindi", string> = {
  Dutch: "NL", English: "EN", French: "FR", Spanish: "ES", Chinese: "中文", Hindi: "हिं",
}

const languageFlags: Record<ViaLanguage | "Hindi", string> = {
  Dutch: "🇳🇱", English: "🇬🇧", French: "🇫🇷", Spanish: "🇪🇸", Chinese: "🇨🇳", Hindi: "🇮🇳",
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
}

const copy: Record<ViaLanguage | "Hindi", HomeText> = {
  Dutch: {
    standard: "Maak uw keuze", viaExtra: "", account: "Taal", home: "Home",
    social: "Sociaal", discover: "Ontdekken", nfts: "NFT's", live: "Live",
    communities: "Community's", games: "Spellen", world: "Wereld", profile: "Mijn profiel", myVia: "Mijn VIA",
    bookmarks: "Bookmarks", messages: "Berichten", more: "Meer",
    search: "Zoek leden", publicEntrance: "Publieke ingang", wallet: "Mijn Wallet", notifications: "Meldingen",
    login: "DeSo Login", connecting: "Verbinden…", logout: "Uitloggen", blocked: "Safari heeft het DeSo Identity-venster geblokkeerd.",
    connected: "Verbonden", switchAccount: "Wissel account", addAccount: "DeSo-account toevoegen", inactive90: "90+ dagen inactief", advertising: "Reclame",
  },
  English: {
    standard: "Make your choice", viaExtra: "", account: "Language", home: "Home",
    social: "Social", discover: "Discover", nfts: "NFTs", live: "Live",
    communities: "Communities", games: "Games", world: "World", profile: "My Profile", myVia: "My VIA",
    bookmarks: "Bookmarks", messages: "Messages", more: "More",
    search: "Search members", publicEntrance: "Public Entrance", wallet: "My Wallet", notifications: "Notifications",
    login: "DeSo Login", connecting: "Connecting…", logout: "Logout", blocked: "Safari blocked the DeSo Identity window.",
    connected: "Connected", switchAccount: "Switch account", addAccount: "Add DeSo account", inactive90: "Inactive 90+ days", advertising: "Advertising",
  },
  French: {
    standard: "Faites votre choix", viaExtra: "", account: "Langue", home: "Accueil",
    social: "Social", discover: "Découvrir", nfts: "NFT", live: "Live",
    communities: "Communautés", games: "Jeux", world: "Monde", profile: "Mon profil", myVia: "Mon VIA",
    bookmarks: "Favoris", messages: "Messages", more: "Plus",
    search: "Rechercher des membres", publicEntrance: "Entrée publique", wallet: "Mon Wallet", notifications: "Notifications",
    login: "Connexion DeSo", connecting: "Connexion…", logout: "Déconnexion", blocked: "Safari a bloqué la fenêtre DeSo Identity.",
    connected: "Connecté", switchAccount: "Changer de compte", addAccount: "Ajouter un compte DeSo", inactive90: "Inactif depuis 90+ jours", advertising: "Publicité",
  },
  Spanish: {
    standard: "Haga su elección", viaExtra: "", account: "Idioma", home: "Inicio",
    social: "Social", discover: "Descubrir", nfts: "NFT", live: "Live",
    communities: "Comunidades", games: "Juegos", world: "Mundo", profile: "Mi perfil", myVia: "Mi VIA",
    bookmarks: "Guardados", messages: "Mensajes", more: "Más",
    search: "Buscar miembros", publicEntrance: "Entrada pública", wallet: "Mi Wallet", notifications: "Notificaciones",
    login: "Acceso DeSo", connecting: "Conectando…", logout: "Cerrar sesión", blocked: "Safari bloqueó la ventana de DeSo Identity.",
    connected: "Conectado", switchAccount: "Cambiar cuenta", addAccount: "Añadir cuenta DeSo", inactive90: "Inactivo 90+ días", advertising: "Publicidad",
  },
  Chinese: {
    standard: "请选择", viaExtra: "", account: "语言", home: "首页",
    social: "社交", discover: "发现", nfts: "NFT", live: "直播",
    communities: "社区", games: "游戏", world: "世界", profile: "我的资料", myVia: "我的 VIA",
    bookmarks: "书签", messages: "消息", more: "更多",
    search: "搜索成员", publicEntrance: "公开入口", wallet: "我的钱包", notifications: "通知",
    login: "DeSo 登录", connecting: "连接中…", logout: "退出", blocked: "Safari 阻止了 DeSo Identity 窗口。",
    connected: "已连接", switchAccount: "切换账户", addAccount: "添加 DeSo 账户", inactive90: "90+ 天未活跃", advertising: "广告",
  },
  Hindi: {
    standard: "अपना विकल्प चुनें", viaExtra: "", account: "भाषा", home: "होम",
    social: "सोशल", discover: "खोजें", nfts: "NFT", live: "लाइव", communities: "समुदाय", games: "गेम्स", world: "दुनिया",
    profile: "मेरी प्रोफ़ाइल", myVia: "मेरा VIA", bookmarks: "बुकमार्क", messages: "संदेश", more: "और",
    search: "सदस्य खोजें", publicEntrance: "सार्वजनिक प्रवेश", wallet: "मेरा वॉलेट", notifications: "सूचनाएँ",
    login: "DeSo लॉगिन", connecting: "कनेक्ट हो रहा है…", logout: "लॉग आउट", blocked: "Safari ने DeSo Identity विंडो को ब्लॉक कर दिया।",
    connected: "कनेक्टेड", switchAccount: "खाता बदलें", addAccount: "DeSo खाता जोड़ें", inactive90: "90+ दिनों से निष्क्रिय", advertising: "विज्ञापन",
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
  const identityWindowRef = useRef<Window | null>(null)
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const [knownAccounts, setKnownAccounts] = useState<ViaIdentitySession[]>([])
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [profiles, setProfiles] = useState<Record<string, PublicProfile>>({})
  const [accountsOpen, setAccountsOpen] = useState(false)
  const [status, setStatus] = useState<"idle" | "waiting" | "blocked">("idle")
  const [language, setLanguage] = useState<ViaLanguage>("English")

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

    function handleIdentityMessage(event: MessageEvent) {
      const identityWindow = identityWindowRef.current
      if (identityWindow && event.source !== identityWindow) return
      const nextSession = persistIdentityLogin(event)
      if (!nextSession) return
      setSession(nextSession)
      refreshAccounts()
      setAccountsOpen(false)
      setStatus("idle")
      identityWindowRef.current?.close()
      identityWindowRef.current = null
    }

    window.addEventListener("message", handleIdentityMessage)
    window.addEventListener(VIA_SETTINGS_EVENT, syncLanguage)
    window.addEventListener(VIA_IDENTITY_EVENT, syncIdentity)
    return () => {
      window.removeEventListener("message", handleIdentityMessage)
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
      .then((data) => setProfile(data?.ok && data.profile ? data.profile : null))
      .catch(() => setProfile(null))
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

  function openDeSoIdentity() {
    const h = 1000
    const w = 800
    const y = window.outerHeight / 2 + window.screenY - h / 2
    const x = window.outerWidth / 2 + window.screenX - w / 2
    const identityWindow = window.open(DESO_LOGIN_URL, undefined, `toolbar=no, width=${w}, height=${h}, top=${y}, left=${x}`)
    if (!identityWindow) {
      setStatus("blocked")
      return
    }
    identityWindowRef.current = identityWindow
    setStatus("waiting")
  }

  function chooseAccount(publicKey: string) {
    const nextSession = switchIdentitySession(publicKey)
    if (!nextSession) return
    setSession(nextSession)
    setProfile(profiles[publicKey] ?? null)
    setAccountsOpen(false)
    router.refresh()
  }

  function logout() {
    clearIdentitySession()
    setSession(null)
    setProfile(null)
    setAccountsOpen(false)
    setStatus("idle")
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
      <Link href="/" aria-label="VIA home" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", textDecoration: "none" }}>
        <img src="/via-logo-original.jpg?v=2" alt="VIA" className="via-home-controls-logo" style={{ width: "100%", maxHeight: "108px", objectFit: "contain", display: "block", borderRadius: "14px" }} />
        <span style={{ color: "#8fd4a9", fontSize: "10px", fontWeight: 650, letterSpacing: ".14em", lineHeight: 1.2 }}>viadeso.online</span>
      </Link>

      <section style={{ display: "grid", gap: "6px" }}>
        <span style={sectionLabel}>{t.standard}</span>
        <nav aria-label="VIA standard navigation" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" }}>
          {standardNav.map(([key, href]) => href ? (
            <Link key={key} href={href} style={{ ...buttonStyle, width: "100%", justifyContent: "center", paddingInline: "9px", borderColor: "rgba(143,212,169,.30)", background: "linear-gradient(180deg, rgba(13,31,21,.78), rgba(5,15,9,.78))", color: "#dce8e1" }}>{t[key]}</Link>
          ) : (
            <span key={key} aria-disabled="true" title="Wordt op de eigen Berichten-pagina aangesloten" style={{ ...disabledButtonStyle, width: "100%", justifyContent: "center", paddingInline: "9px" }}>{t[key]}</span>
          ))}
          <SponsorPlatform compact showIcon={false} />
          <label style={{ ...buttonStyle, minHeight: "34px", padding: "5px 8px", gap: "5px", cursor: "pointer", width: "100%", justifyContent: "center" }}>
            <span aria-hidden="true" style={{ fontSize: "14px", lineHeight: 1 }}>{languageFlags[language]}</span>
            <select value={language} onChange={(event) => changeLanguage(event.target.value as ViaLanguage)} aria-label="VIA language" style={{ border: 0, padding: 0, width: "auto", minWidth: "38px", background: "transparent", color: "inherit", font: "inherit", fontWeight: 700, appearance: "none", cursor: "pointer", textAlign: "center" }}>
              {VIA_LANGUAGES.map((item) => <option key={item} value={item}>{languageCodes[item]}</option>)}
            </select>
          </label>
        </nav>
      </section>

      <section style={{ display: "grid", gap: "6px" }}>
        {t.viaExtra ? <span style={sectionLabel}>{t.viaExtra}</span> : null}
        <nav aria-label="VIA extra navigation" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" }}>
          {viaExtraNav.map(([key, href]) => (
            <Link key={href} href={href} style={{ ...buttonStyle, width: "100%", justifyContent: "center", paddingInline: "9px" }}>{t[key]}</Link>
          ))}
        </nav>
      </section>

      <section style={{ display: "grid", gap: "6px" }}>
        <span style={sectionLabel}>{t.account}</span>
        {!session ? <div aria-label="VIA utility controls"><button type="button" onClick={enterPublicMode} style={{ ...buttonStyle, width: "100%", cursor: "pointer" }}>{t.publicEntrance}</button></div> : null}

        {session ? (
          <div style={{ display: "grid", gap: "6px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "54px minmax(0,1fr)", gap: "7px", alignItems: "stretch" }}>
              <Link
                href="/profile"
                aria-label={t.profile}
                title={t.profile}
                style={{
                  ...buttonStyle,
                  minHeight: "54px",
                  padding: "5px",
                  borderRadius: "16px",
                  position: "relative",
                  overflow: "visible",
                  borderColor: profile?.isInactive ? "rgba(137,145,141,.42)" : "rgba(143,212,169,.38)",
                  background: profile?.isInactive
                    ? "linear-gradient(145deg, rgba(65,72,68,.42), rgba(5,17,10,.86))"
                    : "linear-gradient(145deg, rgba(29,64,45,.68), rgba(5,17,10,.86))",
                  boxShadow: profile?.isInactive
                    ? "inset 0 1px 0 rgba(255,255,255,.05)"
                    : "0 0 18px rgba(143,212,169,.10), inset 0 1px 0 rgba(255,255,255,.07)",
                }}
              >
                {avatar ? <img src={avatar} alt="" referrerPolicy="no-referrer" style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover", display: "block", border: "1px solid rgba(143,212,169,.32)", boxShadow: "0 0 10px rgba(143,212,169,.10)" }} /> : <span aria-hidden="true" style={{ width: "42px", height: "42px", borderRadius: "50%", display: "grid", placeItems: "center", background: "#173326", color: "#9adbb2", fontSize: "15px", fontWeight: 850, border: "1px solid rgba(143,212,169,.30)" }}>{profile?.username?.slice(0, 1).toUpperCase() ?? "V"}</span>}
              </Link>
              <button
                type="button"
                onClick={() => { refreshAccounts(); setAccountsOpen((open) => !open) }}
                aria-expanded={accountsOpen}
                style={{ ...buttonStyle, width: "100%", minHeight: "54px", justifyContent: "flex-start", gap: "8px", cursor: "pointer", paddingInline: "10px", borderRadius: "16px", background: "linear-gradient(145deg, rgba(18,42,29,.58), rgba(3,12,7,.82))", boxShadow: "inset 0 1px 0 rgba(255,255,255,.04)" }}
              >
                <span style={{ minWidth: 0, flex: 1, display: "grid", textAlign: "left", gap: "2px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                    <strong style={{ color: "#e5eee8", fontSize: "11px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{accountName}</strong>
                    <ViaIdentityStatusMarks verified={Boolean(profile?.isVerified)} inactive={Boolean(profile?.isInactive)} compact language={language} />
                  </span>
                  <span style={{ color: profile?.isInactive ? "#818985" : "#74877b", fontSize: "8px", letterSpacing: ".08em", textTransform: "uppercase" }}>{profile?.isInactive ? t.inactive90 : t.connected}</span>
                </span>
                <span aria-hidden="true" style={{ color: "#7fa88e" }}>{accountsOpen ? "▴" : "▾"}</span>
              </button>
            </div>

            {accountsOpen ? (
              <div style={{ display: "grid", gap: "5px", padding: "7px", border: "1px solid rgba(143,212,169,.16)", borderRadius: "13px", background: "rgba(2,8,5,.88)" }}>
                {otherAccounts.length ? <span style={{ ...sectionLabel, padding: "2px 4px" }}>{t.switchAccount}</span> : null}
                {otherAccounts.map((account) => {
                  const itemProfile = profiles[account.publicKey]
                  const itemAvatar = safeProfileImage(itemProfile?.profilePic)
                  const itemName = itemProfile?.username ? `@${itemProfile.username}` : shortPublicKey(account.publicKey)
                  return (
                    <button key={account.publicKey} type="button" onClick={() => chooseAccount(account.publicKey)} style={{ ...buttonStyle, width: "100%", minHeight: "42px", justifyContent: "flex-start", gap: "8px", cursor: "pointer", paddingInline: "8px" }}>
                      {itemAvatar ? <img src={itemAvatar} alt="" referrerPolicy="no-referrer" style={{ width: "27px", height: "27px", borderRadius: "50%", objectFit: "cover" }} /> : <span aria-hidden="true" style={{ width: "27px", height: "27px", borderRadius: "50%", display: "grid", placeItems: "center", background: "#142b20", color: "#91caa6", fontSize: "9px", fontWeight: 800 }}>{itemProfile?.username?.slice(0, 1).toUpperCase() ?? "D"}</span>}
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{itemName}</span>
                    </button>
                  )
                })}
                <button type="button" onClick={openDeSoIdentity} style={{ ...buttonStyle, width: "100%", cursor: "pointer", color: "#aee2bf" }}>{status === "waiting" ? t.connecting : `＋ ${t.addAccount}`}</button>
                <button type="button" onClick={logout} style={{ ...buttonStyle, width: "100%", cursor: "pointer", color: "#a7b2ab", background: "rgba(8,10,9,.7)" }}>{t.logout}</button>
              </div>
            ) : null}
          </div>
        ) : (
          <button type="button" onClick={openDeSoIdentity} style={{ ...buttonStyle, width: "100%", minHeight: "42px", cursor: "pointer", borderColor: "rgba(143,212,169,.34)", color: "#b5e8c7" }}>
            {status === "waiting" ? t.connecting : t.login}
          </button>
        )}
      </section>

      {status === "blocked" ? <span style={{ color: "#c6a97b", fontSize: "9px", lineHeight: 1.45 }}>{t.blocked}</span> : null}
      <style>{`
        @media (max-width: 900px) {
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
            background: rgba(2,8,5,.34);
            backdrop-filter: blur(3px);
          }
          .via-home-controls-logo {
            width: 154px !important;
            max-height: 70px !important;
            margin: 0 auto !important;
          }
        }
      `}</style>
    </aside>
  )
}
