"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { BookOpen, Music2, RadioTower, UsersRound } from "lucide-react"
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

type PublicProfile = { username?: string; profilePic?: string | null; isVerified?: boolean; isInactive?: boolean; viaRecognized?: boolean }
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
  ["ideas", "/ideas"],
  ["storage", "/storage"],
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
  ideas: string
  storage: string
}

const copy: Record<ViaLanguage | "Hindi", HomeText> = {
  Dutch: {
    standard: "Maak uw keuze", viaExtra: "", account: "Taal", home: "Home",
    social: "Sociaal", discover: "Ontdekken", nfts: "NFT's", live: "Live",
    communities: "Community's", games: "Spellen", world: "Wereld", profile: "Mijn profiel", myVia: "Mijn VIA",
    bookmarks: "Bookmarks", messages: "Berichten", more: "Meer",
    search: "Zoek leden", publicEntrance: "Publieke ingang", wallet: "Mijn Wallet", notifications: "Meldingen",
    login: "DeSo Login", connecting: "Verbinden…", logout: "Uitloggen", blocked: "Safari heeft het DeSo Identity-venster geblokkeerd.",
    connected: "Verbonden", switchAccount: "Wissel account", addAccount: "DeSo-account toevoegen", inactive90: "90+ dagen inactief", advertising: "Reclame", ideas: "Ideeënbus", storage: "Externe opslag",
  },
  English: {
    standard: "Make your choice", viaExtra: "", account: "Language", home: "Home",
    social: "Social", discover: "Discover", nfts: "NFTs", live: "Live",
    communities: "Communities", games: "Games", world: "World", profile: "My Profile", myVia: "My VIA",
    bookmarks: "Bookmarks", messages: "Messages", more: "More",
    search: "Search members", publicEntrance: "Public Entrance", wallet: "My Wallet", notifications: "Notifications",
    login: "DeSo Login", connecting: "Connecting…", logout: "Logout", blocked: "Safari blocked the DeSo Identity window.",
    connected: "Connected", switchAccount: "Switch account", addAccount: "Add DeSo account", inactive90: "Inactive 90+ days", advertising: "Advertising", ideas: "Ideas Box", storage: "External storage",
  },
  French: {
    standard: "Faites votre choix", viaExtra: "", account: "Langue", home: "Accueil",
    social: "Social", discover: "Découvrir", nfts: "NFT", live: "Live",
    communities: "Communautés", games: "Jeux", world: "Monde", profile: "Mon profil", myVia: "Mon VIA",
    bookmarks: "Favoris", messages: "Messages", more: "Plus",
    search: "Rechercher des membres", publicEntrance: "Entrée publique", wallet: "Mon Wallet", notifications: "Notifications",
    login: "Connexion DeSo", connecting: "Connexion…", logout: "Déconnexion", blocked: "Safari a bloqué la fenêtre DeSo Identity.",
    connected: "Connecté", switchAccount: "Changer de compte", addAccount: "Ajouter un compte DeSo", inactive90: "Inactif depuis 90+ jours", advertising: "Publicité", ideas: "Boîte à idées", storage: "Stockage externe",
  },
  Spanish: {
    standard: "Haga su elección", viaExtra: "", account: "Idioma", home: "Inicio",
    social: "Social", discover: "Descubrir", nfts: "NFT", live: "Live",
    communities: "Comunidades", games: "Juegos", world: "Mundo", profile: "Mi perfil", myVia: "Mi VIA",
    bookmarks: "Guardados", messages: "Mensajes", more: "Más",
    search: "Buscar miembros", publicEntrance: "Entrada pública", wallet: "Mi Wallet", notifications: "Notificaciones",
    login: "Acceso DeSo", connecting: "Conectando…", logout: "Cerrar sesión", blocked: "Safari bloqueó la ventana de DeSo Identity.",
    connected: "Conectado", switchAccount: "Cambiar cuenta", addAccount: "Añadir cuenta DeSo", inactive90: "Inactivo 90+ días", advertising: "Publicidad", ideas: "Buzón de ideas", storage: "Almacenamiento externo",
  },
  Chinese: {
    standard: "请选择", viaExtra: "", account: "语言", home: "首页",
    social: "社交", discover: "发现", nfts: "NFT", live: "直播",
    communities: "社区", games: "游戏", world: "世界", profile: "我的资料", myVia: "我的 VIA",
    bookmarks: "书签", messages: "消息", more: "更多",
    search: "搜索成员", publicEntrance: "公开入口", wallet: "我的钱包", notifications: "通知",
    login: "DeSo 登录", connecting: "连接中…", logout: "退出", blocked: "Safari 阻止了 DeSo Identity 窗口。",
    connected: "已连接", switchAccount: "切换账户", addAccount: "添加 DeSo 账户", inactive90: "90+ 天未活跃", advertising: "广告", ideas: "意见箱", storage: "外部存储",
  },
  Hindi: {
    standard: "अपना विकल्प चुनें", viaExtra: "", account: "भाषा", home: "होम",
    social: "सोशल", discover: "खोजें", nfts: "NFT", live: "लाइव", communities: "समुदाय", games: "गेम्स", world: "दुनिया",
    profile: "मेरी प्रोफ़ाइल", myVia: "मेरा VIA", bookmarks: "बुकमार्क", messages: "संदेश", more: "और",
    search: "सदस्य खोजें", publicEntrance: "सार्वजनिक प्रवेश", wallet: "मेरा वॉलेट", notifications: "सूचनाएँ",
    login: "DeSo लॉगिन", connecting: "कनेक्ट हो रहा है…", logout: "लॉग आउट", blocked: "Safari ने DeSo Identity विंडो को ब्लॉक कर दिया।",
    connected: "कनेक्टेड", switchAccount: "खाता बदलें", addAccount: "DeSo खाता जोड़ें", inactive90: "90+ दिनों से निष्क्रिय", advertising: "विज्ञापन", ideas: "विचार बॉक्स", storage: "बाहरी स्टोरेज",
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
  const [languageOpen, setLanguageOpen] = useState(false)

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
      <Link prefetch={false} href="/" aria-label="VIA home" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", textDecoration: "none" }}>
        <img src="/via-logo-original.jpg?v=2" alt="VIA" className="via-home-controls-logo" style={{ width: "100%", maxHeight: "108px", objectFit: "contain", display: "block", borderRadius: "14px" }} />
        <span style={{ color: "#8fd4a9", fontSize: "10px", fontWeight: 650, letterSpacing: ".14em", lineHeight: 1.2 }}>viadeso.online</span>
      </Link>

      <nav className="via-home-iphone-utility-row" aria-label="VIA iPhone quick controls">
        <Link prefetch={false} href="/help" aria-label="Handboek VIA" title="Handboek VIA"><BookOpen aria-hidden="true" /></Link>\n        <Link prefetch={false} href="/music" aria-label="VIA Muziek" title="VIA Muziek"><Music2 aria-hidden="true" /></Link>
        <Link prefetch={false} href="/radio" aria-label="World Radio" title="World Radio"><RadioTower aria-hidden="true" /></Link>
        <Link prefetch={false} href="/profile" aria-label={t.switchAccount} title={t.switchAccount} className="via-home-iphone-utility-account">
          {avatar ? <img src={avatar} alt="" referrerPolicy="no-referrer" /> : <UsersRound aria-hidden="true" />}
        </Link>
        <Link prefetch={false} href="/my-via" aria-label="VIA Future" title="VIA Future" className="via-home-iphone-utility-future">
          <span>VIA</span><span>Future</span>
        </Link>
      </nav>

      <section style={{ display: "grid", gap: "6px" }}>
        <span className="via-home-standard-label" style={sectionLabel}>{t.standard}</span>
        <nav aria-label="VIA standard navigation" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" }}>
          {standardNav.map(([key, href]) => href ? (
            <Link prefetch={href === "/notifications"} key={key} href={href} style={{ ...buttonStyle, width: "100%", justifyContent: "center", paddingInline: "9px", borderColor: "rgba(143,212,169,.30)", background: "linear-gradient(180deg, rgba(13,31,21,.78), rgba(5,15,9,.78))", color: "#dce8e1" }}>{t[key]}</Link>
          ) : (
            <span key={key} aria-disabled="true" title="Wordt op de eigen Berichten-pagina aangesloten" style={{ ...disabledButtonStyle, width: "100%", justifyContent: "center", paddingInline: "9px" }}>{t[key]}</span>
          ))}
          <SponsorPlatform compact showIcon={false} />
          <div className="via-home-language-control">
            <button type="button" onClick={() => setLanguageOpen((open) => !open)} aria-label="VIA language" aria-expanded={languageOpen} style={{ ...buttonStyle, minHeight: "34px", padding: "5px 8px", gap: "5px", cursor: "pointer", width: "100%", justifyContent: "center" }}>
              <span aria-hidden="true" style={{ fontSize: "14px", lineHeight: 1 }}>{languageFlags[language]}</span>
              <span>{languageCodes[language]}</span>
            </button>
            {languageOpen ? <div className="via-home-language-menu" role="menu" aria-label="VIA language">
              {VIA_LANGUAGES.map((item) => <button key={item} type="button" role="menuitemradio" aria-checked={item === language} onClick={() => { changeLanguage(item); setLanguageOpen(false) }} className={item === language ? "is-active" : ""}>
                <span aria-hidden="true">{languageFlags[item]}</span><span>{languageCodes[item]}</span>
              </button>)}
            </div> : null}
          </div>
        </nav>
      </section>

      <section style={{ display: "grid", gap: "6px" }}>
        {t.viaExtra ? <span style={sectionLabel}>{t.viaExtra}</span> : null}
        <nav aria-label="VIA extra navigation" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" }}>
          {viaExtraNav.map(([key, href]) => (
            <Link prefetch={false} key={href} href={href} style={{ ...buttonStyle, width: "100%", justifyContent: "center", paddingInline: "9px" }}>{t[key]}</Link>
          ))}
        </nav>
      </section>

      <section className="via-home-language-section" style={{ display: "grid", gap: "6px" }}>
        <span className="via-home-language-label" style={sectionLabel}>{t.account}</span>
        {!session ? <div aria-label="VIA utility controls"><button type="button" onClick={enterPublicMode} style={{ ...buttonStyle, width: "100%", cursor: "pointer" }}>{t.publicEntrance}</button></div> : null}

        {session ? null : (
          <button type="button" onClick={openDeSoIdentity} style={{ ...buttonStyle, width: "100%", minHeight: "42px", cursor: "pointer", borderColor: "rgba(143,212,169,.34)", color: "#b5e8c7" }}>
            {status === "waiting" ? t.connecting : t.login}
          </button>
        )}
      </section>

      {status === "blocked" ? <span style={{ color: "#c6a97b", fontSize: "9px", lineHeight: 1.45 }}>{t.blocked}</span> : null}
      <style>{`
        .via-home-language-control { position: relative; width: 100%; }
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
        .via-home-iphone-identity { display: none; }
        @media (max-width: 600px) {
          .via-home-language-section { display: none !important; }
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
          .via-home-iphone-utility-row > a {
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
          .via-home-iphone-utility-account img {
            width: 34px;
            height: 34px;
            border-radius: 50%;
            object-fit: cover;
          }
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
