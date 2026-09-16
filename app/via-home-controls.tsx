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
import {
  readViaLocalSettings,
  saveViaLocalSettings,
  VIA_LANGUAGES,
  VIA_SETTINGS_EVENT,
  type ViaLanguage,
} from "./via-local-settings"

const nav = [
  ["social", "/social"],
  ["discover", "/discover"],
  ["market", "/market"],
  ["studio", "/studio"],
  ["live", "/live"],
  ["communities", "/communities"],
  ["games", "/quest"],
  ["profile", "/profile"],
  ["myVia", "/my-via"],
] as const

const languageCodes: Record<ViaLanguage, string> = {
  Dutch: "NL",
  English: "EN",
  French: "FR",
  Spanish: "ES",
  Chinese: "中文",
}

type HomeText = {
  social: string
  discover: string
  market: string
  studio: string
  live: string
  communities: string
  games: string
  profile: string
  myVia: string
  search: string
  publicEntrance: string
  wallet: string
  notifications: string
  visitors: string
  exploreNfts: string
  joinCommunity: string
  createPost: string
  goLive: string
  login: string
  connecting: string
  logout: string
  blocked: string
}

const copy: Record<ViaLanguage, HomeText> = {
  Dutch: {
    social: "Sociaal", discover: "Ontdekken", market: "Markt", studio: "Studio", live: "Live",
    communities: "Community's", games: "Spellen", profile: "Mijn profiel", myVia: "Mijn VIA",
    search: "Zoek leden", publicEntrance: "Publieke ingang", wallet: "Wallet", notifications: "Meldingen", visitors: "Bezoekers",
    exploreNfts: "Ontdek NFT's", joinCommunity: "Naar de community", createPost: "Maak een post", goLive: "Ga live",
    login: "DeSo Login", connecting: "Verbinden…", logout: "Uitloggen", blocked: "Safari heeft het DeSo Identity-venster geblokkeerd.",
  },
  English: {
    social: "Social", discover: "Discover", market: "Market", studio: "Studio", live: "Live",
    communities: "Communities", games: "Games", profile: "My Profile", myVia: "My VIA",
    search: "Search members", publicEntrance: "Public Entrance", wallet: "Wallet", notifications: "Notifications", visitors: "Visitors",
    exploreNfts: "Explore NFTs", joinCommunity: "Join the Community", createPost: "Create a Post", goLive: "Go Live",
    login: "DeSo Login", connecting: "Connecting…", logout: "Logout", blocked: "Safari blocked the DeSo Identity window.",
  },
  French: {
    social: "Social", discover: "Découvrir", market: "Marché", studio: "Studio", live: "Live",
    communities: "Communautés", games: "Jeux", profile: "Mon profil", myVia: "Mon VIA",
    search: "Rechercher des membres", publicEntrance: "Entrée publique", wallet: "Wallet", notifications: "Notifications", visitors: "Visiteurs",
    exploreNfts: "Découvrir les NFT", joinCommunity: "Rejoindre la communauté", createPost: "Créer un post", goLive: "Passer en direct",
    login: "Connexion DeSo", connecting: "Connexion…", logout: "Déconnexion", blocked: "Safari a bloqué la fenêtre DeSo Identity.",
  },
  Spanish: {
    social: "Social", discover: "Descubrir", market: "Mercado", studio: "Studio", live: "Live",
    communities: "Comunidades", games: "Juegos", profile: "Mi perfil", myVia: "Mi VIA",
    search: "Buscar miembros", publicEntrance: "Entrada pública", wallet: "Wallet", notifications: "Notificaciones", visitors: "Visitantes",
    exploreNfts: "Explorar NFT", joinCommunity: "Unirse a la comunidad", createPost: "Crear una publicación", goLive: "Emitir en directo",
    login: "Acceso DeSo", connecting: "Conectando…", logout: "Cerrar sesión", blocked: "Safari bloqueó la ventana de DeSo Identity.",
  },
  Chinese: {
    social: "社交", discover: "发现", market: "市场", studio: "工作室", live: "直播",
    communities: "社区", games: "游戏", profile: "我的资料", myVia: "我的 VIA",
    search: "搜索成员", publicEntrance: "公开入口", wallet: "钱包", notifications: "通知", visitors: "访客",
    exploreNfts: "探索 NFT", joinCommunity: "加入社区", createPost: "发布内容", goLive: "开始直播",
    login: "DeSo 登录", connecting: "连接中…", logout: "退出", blocked: "Safari 阻止了 DeSo Identity 窗口。",
  },
}

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
  const [language, setLanguage] = useState<ViaLanguage>("English")

  useEffect(() => {
    setSession(restoreIdentitySession())
    const syncLanguage = () => setLanguage(readViaLocalSettings().interfaceLanguage)
    syncLanguage()

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
    window.addEventListener(VIA_SETTINGS_EVENT, syncLanguage)
    return () => {
      window.removeEventListener("message", handleIdentityMessage)
      window.removeEventListener(VIA_SETTINGS_EVENT, syncLanguage)
    }
  }, [])

  function changeLanguage(next: ViaLanguage) {
    saveViaLocalSettings({ interfaceLanguage: next })
    setLanguage(next)
  }

  // Keep this aligned with DeSo's documented window-context login flow.
  function openDeSoIdentity() {
    const h = 1000
    const w = 800
    const y = window.outerHeight / 2 + window.screenY - h / 2
    const x = window.outerWidth / 2 + window.screenX - w / 2
    const identityWindow = window.open(
      DESO_LOGIN_URL,
      undefined,
      `toolbar=no, width=${w}, height=${h}, top=${y}, left=${x}`,
    )

    if (!identityWindow) {
      setStatus("blocked")
      return
    }

    identityWindowRef.current = identityWindow
    setStatus("waiting")
  }

  function logout() {
    clearIdentitySession()
    setSession(null)
    setStatus("idle")
  }

  const t = copy[language]

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
        {nav.map(([key, href]) => (
          <Link
            key={href}
            href={href}
            style={{
              ...linkStyle,
              ...(key === "profile" ? {
                borderColor: "rgba(143,212,169,.5)",
                background: "rgba(20,55,35,.5)",
                color: "#9adbb2",
                boxShadow: "inset 0 0 0 1px rgba(143,212,169,.08)",
              } : {}),
            }}
          >
            {t[key]}
          </Link>
        ))}
      </nav>

      <div aria-label="VIA utility controls" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
        <Link href="/discover" style={linkStyle}>{t.search}</Link>
        <Link href="/" style={linkStyle}>{t.publicEntrance}</Link>
        <select
          value={language}
          onChange={(event) => changeLanguage(event.target.value as ViaLanguage)}
          aria-label="VIA language"
          style={{ ...linkStyle, width: "100%", appearance: "none", cursor: "pointer", textAlign: "center" }}
        >
          {VIA_LANGUAGES.map((item) => <option key={item} value={item}>{languageCodes[item]}</option>)}
        </select>
        <Link href="/wallet" style={linkStyle}>{t.wallet}</Link>
        <Link href="/notifications" style={linkStyle}>{t.notifications}</Link>
        {!session ? (
          <button type="button" onClick={openDeSoIdentity} style={{ ...linkStyle, cursor: "pointer" }}>
            {status === "waiting" ? t.connecting : t.login}
          </button>
        ) : (
          <button type="button" onClick={logout} style={{ ...linkStyle, cursor: "pointer" }}>{t.logout}</button>
        )}
        <span style={{ ...linkStyle, gridColumn: "1 / -1", color: "#aebbb4" }}>{t.visitors}</span>
      </div>

      <div style={{ height: "1px", background: "rgba(143,212,169,.12)", margin: "2px 4px" }} />

      <nav aria-label="VIA direct actions" style={{ display: "grid", gap: "7px" }}>
        <Link href="/collection" style={{ ...linkStyle, minHeight: "40px", fontSize: "12px" }}>{t.exploreNfts}</Link>
        <Link href="/communities" style={{ ...linkStyle, minHeight: "40px", fontSize: "12px" }}>{t.joinCommunity}</Link>
        <Link href="/social" style={{ ...linkStyle, minHeight: "40px", fontSize: "12px" }}>{t.createPost}</Link>
        <Link href="/live" style={{ ...linkStyle, minHeight: "40px", fontSize: "12px" }}>{t.goLive}</Link>
      </nav>

      {status === "blocked" ? (
        <span style={{ color: "#c6a97b", fontSize: "10px", lineHeight: 1.4 }}>{t.blocked}</span>
      ) : null}
    </aside>
  )
}
