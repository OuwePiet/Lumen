"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { restoreIdentitySession, VIA_IDENTITY_EVENT, type ViaIdentitySession } from "../deso-identity-session"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"
import ViaIdentityStatusMarks from "../via-identity-status"

type PublicProfile = {
  publicKey: string
  username: string
  description: string
  profilePic: string | null
  isVerified: boolean
  creatorBasisPoints: number | null
  coinPriceDeSoNanos: number | null
  numberOfHolders: number | null
  coinsInCirculationNanos: number | null
  followersCount: number | null
  followingCount: number | null
  lastPublicActivityAt: string | null
  isInactive: boolean
}

type ProfileResponse = { ok?: boolean; profile?: PublicProfile }
type WalletResponse = { ok?: boolean; wallet?: { balanceDeSo?: number } }

type Copy = {
  kicker: string
  heading: string
  intro: string
  myNfts: string
  back: string
  noAccount: string
  noAccountText: string
  loading: string
  unavailable: string
  verified: string
  yourDeso: string
  walletUnavailable: string
  coinPrice: string
  followers: string
  following: string
  coinHolders: string
  coinsCirculation: string
  noBio: string
  publicKey: string
  active: string
  inactive90: string
  lastActivity: string
}

const copy: Record<ViaLanguage, Copy> = {
  Dutch: {
    kicker: "VIA · PROFIEL",
    heading: "Mijn profiel",
    intro: "Je ingelogde openbare DeSo-identiteit, weergegeven zonder extra walletbevoegdheid te vragen.",
    myNfts: "Mijn NFT's",
    back: "Terug naar Mijn VIA",
    noAccount: "Geen DeSo-account gekoppeld",
    noAccountText: "Gebruik de accountknop in de VIA-header om in te loggen met DeSo Identity.",
    loading: "Je DeSo-profiel laden…",
    unavailable: "Je DeSo-profiel kan momenteel niet worden geladen.",
    verified: "✓ DeSo geverifieerd",
    yourDeso: "Jouw DESO",
    walletUnavailable: "Je DESO-saldo is tijdelijk niet beschikbaar",
    coinPrice: "Coin-prijs",
    followers: "Volgers",
    following: "Volgend",
    coinHolders: "Coin-houders",
    coinsCirculation: "Coins in omloop",
    noBio: "Geen openbare bio op dit DeSo-profiel.",
    publicKey: "Public key", active: "Actief", inactive90: "90+ dagen inactief", lastActivity: "Laatste openbare activiteit",
  },
  English: {
    kicker: "VIA · PROFILE",
    heading: "My Profile",
    intro: "Your signed-in public DeSo identity, shown without requesting extra wallet authority.",
    myNfts: "My NFTs",
    back: "Back to My VIA",
    noAccount: "No DeSo account connected",
    noAccountText: "Use the account button in the VIA header to log in with DeSo Identity.",
    loading: "Loading your DeSo profile…",
    unavailable: "Your DeSo profile could not be loaded right now.",
    verified: "✓ DeSo verified",
    yourDeso: "Your DESO",
    walletUnavailable: "Your DESO balance is temporarily unavailable",
    coinPrice: "Coin price",
    followers: "Followers",
    following: "Following",
    coinHolders: "Coin holders",
    coinsCirculation: "Coins in circulation",
    noBio: "No public bio on this DeSo profile.",
    publicKey: "Public key", active: "Active", inactive90: "Inactive 90+ days", lastActivity: "Last public activity",
  },
  French: {
    kicker: "VIA · PROFIL",
    heading: "Mon profil",
    intro: "Votre identité DeSo publique connectée, affichée sans demander d'autorisation wallet supplémentaire.",
    myNfts: "Mes NFT",
    back: "Retour à Mon VIA",
    noAccount: "Aucun compte DeSo connecté",
    noAccountText: "Utilisez le bouton de compte dans l'en-tête VIA pour vous connecter avec DeSo Identity.",
    loading: "Chargement de votre profil DeSo…",
    unavailable: "Votre profil DeSo ne peut pas être chargé pour le moment.",
    verified: "✓ Vérifié par DeSo",
    yourDeso: "Votre DESO",
    walletUnavailable: "Votre solde DESO est temporairement indisponible",
    coinPrice: "Prix du coin",
    followers: "Abonnés",
    following: "Abonnements",
    coinHolders: "Détenteurs du coin",
    coinsCirculation: "Coins en circulation",
    noBio: "Aucune bio publique sur ce profil DeSo.",
    publicKey: "Clé publique", active: "Actif", inactive90: "Inactif depuis 90+ jours", lastActivity: "Dernière activité publique",
  },
  Spanish: {
    kicker: "VIA · PERFIL",
    heading: "Mi perfil",
    intro: "Tu identidad pública de DeSo conectada, mostrada sin solicitar autoridad adicional sobre la wallet.",
    myNfts: "Mis NFT",
    back: "Volver a Mi VIA",
    noAccount: "No hay una cuenta DeSo conectada",
    noAccountText: "Usa el botón de cuenta de la cabecera de VIA para iniciar sesión con DeSo Identity.",
    loading: "Cargando tu perfil DeSo…",
    unavailable: "Tu perfil DeSo no puede cargarse en este momento.",
    verified: "✓ Verificado por DeSo",
    yourDeso: "Tu DESO",
    walletUnavailable: "Tu saldo DESO no está disponible temporalmente",
    coinPrice: "Precio del coin",
    followers: "Seguidores",
    following: "Siguiendo",
    coinHolders: "Titulares del coin",
    coinsCirculation: "Coins en circulación",
    noBio: "Este perfil DeSo no tiene biografía pública.",
    publicKey: "Clave pública", active: "Activo", inactive90: "Inactivo 90+ días", lastActivity: "Última actividad pública",
  },
  Chinese: {
    kicker: "VIA · 个人资料",
    heading: "我的资料",
    intro: "显示你当前登录的公开 DeSo 身份，无需请求额外的钱包权限。",
    myNfts: "我的 NFT",
    back: "返回我的 VIA",
    noAccount: "未连接 DeSo 账户",
    noAccountText: "使用 VIA 顶部的账户按钮通过 DeSo Identity 登录。",
    loading: "正在加载你的 DeSo 个人资料…",
    unavailable: "当前无法加载你的 DeSo 个人资料。",
    verified: "✓ DeSo 已验证",
    yourDeso: "你的 DESO",
    walletUnavailable: "你的 DESO 余额暂时不可用",
    coinPrice: "Coin 价格",
    followers: "关注者",
    following: "正在关注",
    coinHolders: "Coin 持有者",
    coinsCirculation: "流通中的 Coins",
    noBio: "此 DeSo 个人资料没有公开简介。",
    publicKey: "公钥", active: "活跃", inactive90: "90+ 天未活跃", lastActivity: "最近公开活动",
  },
  Hindi: {
    kicker: "VIA · PROFILE",
    heading: "My Profile",
    intro: "Your signed-in public DeSo identity, shown without requesting extra wallet authority.",
    myNfts: "My NFTs",
    back: "Back to My VIA",
    noAccount: "No DeSo account connected",
    noAccountText: "Use the account button in the VIA header to log in with DeSo Identity.",
    loading: "Loading your DeSo profile…",
    unavailable: "Your DeSo profile could not be loaded right now.",
    verified: "✓ DeSo verified",
    yourDeso: "Your DESO",
    walletUnavailable: "Your DESO balance is temporarily unavailable",
    coinPrice: "Coin price",
    followers: "Followers",
    following: "Following",
    coinHolders: "Coin holders",
    coinsCirculation: "Coins in circulation",
    noBio: "No public bio on this DeSo profile.",
    publicKey: "Public key", active: "Active", inactive90: "Inactive 90+ days", lastActivity: "Last public activity",
  },
}

const quietAction = "inline-flex min-h-10 items-center rounded-[10px] border border-zinc-700/80 bg-transparent px-3 py-2 text-sm text-zinc-300 transition-colors hover:border-[#8fd4a9]/50 hover:text-[#9adbb2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/15"
const metricLink = "rounded-[12px] border border-zinc-800/80 bg-black/25 p-3 transition-colors hover:border-[#8fd4a9]/45 hover:bg-[#0d1712] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/15"

function safeImage(value: string | null) {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === "https:" ? url.toString() : null
  } catch {
    return null
  }
}

function formatDeSoNanos(value: number | null) {
  if (value === null) return "—"
  const deso = value / 1_000_000_000
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(deso)} DESO`
}

function formatDeSo(value: number | null) {
  if (value === null) return "—"
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(value)} DESO`
}

function formatBasisPoints(value: number | null) {
  if (value === null) return "—"
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value / 100)}%`
}

function formatCompact(value: number | null) {
  if (value === null) return "—"
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(value)
}

function formatCoins(value: number | null) {
  if (value === null) return "—"
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(value / 1_000_000_000)
}

export default function ProfilePage() {
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileUnavailable, setProfileUnavailable] = useState(false)
  const [balanceDeSo, setBalanceDeSo] = useState<number | null>(null)
  const [walletUnavailable, setWalletUnavailable] = useState(false)
  const [language, setLanguage] = useState<ViaLanguage>("English")
  const t = copy[language]

  useEffect(() => {
    const refreshLanguage = () => setLanguage(readViaLocalSettings().interfaceLanguage)
    refreshLanguage()
    window.addEventListener(VIA_SETTINGS_EVENT, refreshLanguage)
    return () => window.removeEventListener(VIA_SETTINGS_EVENT, refreshLanguage)
  }, [])

  useEffect(() => {
    const restore = () => setSession(restoreIdentitySession())
    restore()
    window.addEventListener(VIA_IDENTITY_EVENT, restore)
    return () => window.removeEventListener(VIA_IDENTITY_EVENT, restore)
  }, [])

  useEffect(() => {
    if (!session?.publicKey) {
      setProfile(null)
      setLoading(false)
      setProfileUnavailable(false)
      return
    }

    const controller = new AbortController()
    setLoading(true)
    setProfileUnavailable(false)
    void fetch(`/api/via/profile?identity=${encodeURIComponent(session.publicKey)}`, {
      cache: "no-store",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        const data = response.ok ? (await response.json()) as ProfileResponse : null
        if (!response.ok || !data?.ok || !data.profile) throw new Error("PROFILE_UNAVAILABLE")
        return data.profile
      })
      .then(setProfile)
      .catch((reason) => {
        if (!(reason instanceof DOMException && reason.name === "AbortError")) {
          setProfile(null)
          setProfileUnavailable(true)
        }
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [session?.publicKey])

  useEffect(() => {
    if (!session?.publicKey) {
      setBalanceDeSo(null)
      setWalletUnavailable(false)
      return
    }

    const controller = new AbortController()
    setWalletUnavailable(false)
    void fetch(`/api/via/wallet?publicKey=${encodeURIComponent(session.publicKey)}`, {
      cache: "no-store",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        const data = response.ok ? (await response.json()) as WalletResponse : null
        const balance = data?.wallet?.balanceDeSo
        if (!response.ok || !data?.ok || typeof balance !== "number" || !Number.isFinite(balance)) throw new Error("WALLET_UNAVAILABLE")
        return balance
      })
      .then((balance) => {
        setBalanceDeSo(balance)
        setWalletUnavailable(false)
      })
      .catch((reason) => {
        if (!(reason instanceof DOMException && reason.name === "AbortError")) {
          setBalanceDeSo(null)
          setWalletUnavailable(true)
        }
      })

    return () => controller.abort()
  }, [session?.publicKey])

  const image = safeImage(profile?.profilePic ?? null)

  return (
    <main className="min-h-screen bg-[#050807] px-5 py-8 text-zinc-100 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8fd4a9]">{t.kicker}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-[2.25rem]">{t.heading}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">{t.intro}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {session?.publicKey ? (
              <Link href={`/collection?account=${encodeURIComponent(session.publicKey)}`} className={quietAction}>{t.myNfts}</Link>
            ) : null}
            <Link href="/my-via" className={quietAction}>{t.back}</Link>
          </div>
        </header>

        {!session ? (
          <section className="rounded-[14px] border border-zinc-800/80 bg-zinc-950/50 p-6">
            <h2 className="text-xl font-medium">{t.noAccount}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{t.noAccountText}</p>
          </section>
        ) : loading ? (
          <section className="rounded-[14px] border border-zinc-800/80 bg-zinc-950/50 p-6 text-sm text-zinc-400">{t.loading}</section>
        ) : profileUnavailable ? (
          <section className="rounded-[14px] border border-zinc-800/80 bg-zinc-950/50 p-6 text-sm text-zinc-400" role="status">{t.unavailable}</section>
        ) : profile ? (
          <section
            className="relative overflow-hidden rounded-[28px] border border-[#8fd4a9]/25 p-6 shadow-[0_24px_80px_rgba(0,0,0,.45)] sm:p-8"
            style={{
              background: profile.isInactive
                ? "linear-gradient(145deg, rgba(48,55,51,.82), rgba(5,10,7,.96) 62%)"
                : "linear-gradient(145deg, rgba(36,75,53,.72), rgba(5,14,9,.94) 58%, rgba(12,29,20,.88))",
              boxShadow: profile.isInactive
                ? "0 24px 80px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.06)"
                : "0 24px 80px rgba(0,0,0,.45), 0 0 44px rgba(143,212,169,.08), inset 0 1px 0 rgba(255,255,255,.08)",
              backdropFilter: "blur(18px)",
            }}
          >
            <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[#8fd4a9]/10 blur-3xl" aria-hidden="true" />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="relative shrink-0 self-start">
                {image ? (
                  <img src={image} alt="" className="h-28 w-28 rounded-full border border-[#8fd4a9]/35 object-cover shadow-[0_0_28px_rgba(143,212,169,.12)] sm:h-32 sm:w-32" referrerPolicy="no-referrer" />
                ) : (
                  <div className="grid h-28 w-28 place-items-center rounded-full border border-[#8fd4a9]/30 bg-[#112019] text-3xl font-semibold text-[#9adbb2] sm:h-32 sm:w-32" aria-hidden="true">{profile.username.slice(0, 1).toUpperCase() || "V"}</div>
                )}
                <span className="absolute -bottom-2 -right-2 rounded-full bg-[#06100a]/95 p-1.5 shadow-lg">
                  <ViaIdentityStatusMarks verified={profile.isVerified} inactive={profile.isInactive} compact={false} showLeaf={false} language={language} />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-semibold tracking-tight text-zinc-50">@{profile.username}</h2>
                  <ViaIdentityStatusMarks verified={profile.isVerified} inactive={profile.isInactive} compact={false} language={language} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className={profile.isInactive ? "rounded-full border border-zinc-500/35 bg-zinc-500/10 px-3 py-1 text-xs font-semibold text-zinc-400" : "rounded-full border border-[#8fd4a9]/30 bg-[#8fd4a9]/10 px-3 py-1 text-xs font-semibold text-[#a9dfbc]"}>
                    {profile.isInactive ? t.inactive90 : t.active}
                  </span>
                  {profile.isVerified ? <span className="text-xs text-sky-300/90">{t.verified}</span> : null}
                  {profile.lastPublicActivityAt ? (
                    <span className="text-xs text-zinc-500">{t.lastActivity}: {new Date(profile.lastPublicActivityAt).toLocaleDateString()}</span>
                  ) : null}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <Link href="/wallet" className={metricLink} title={walletUnavailable ? t.walletUnavailable : t.yourDeso}>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">{t.yourDeso}</p>
                    <p className="mt-1 text-sm font-medium text-zinc-100">{walletUnavailable ? "—" : formatDeSo(balanceDeSo)}</p>
                  </Link>
                  <div className="rounded-[12px] border border-zinc-800/80 bg-black/25 p-3">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">{t.coinPrice}</p>
                    <p className="mt-1 text-sm font-medium text-zinc-100">{formatDeSoNanos(profile.coinPriceDeSoNanos)}</p>
                  </div>
                  <Link href={`/profile/connections?mode=followers&identity=${encodeURIComponent(profile.publicKey)}`} className={metricLink}>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">{t.followers}</p>
                    <p className="mt-1 text-sm font-medium text-zinc-100">{formatCompact(profile.followersCount)}</p>
                  </Link>
                  <Link href={`/profile/connections?mode=following&identity=${encodeURIComponent(profile.publicKey)}`} className={metricLink}>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">{t.following}</p>
                    <p className="mt-1 text-sm font-medium text-zinc-100">{formatCompact(profile.followingCount)}</p>
                  </Link>
                  <div className="rounded-[12px] border border-zinc-800/80 bg-black/25 p-3">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">FR</p>
                    <p className="mt-1 text-sm font-medium text-zinc-100">{formatBasisPoints(profile.creatorBasisPoints)}</p>
                  </div>
                  <div className="rounded-[12px] border border-zinc-800/80 bg-black/25 p-3">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">{t.coinHolders}</p>
                    <p className="mt-1 text-sm font-medium text-zinc-100">{formatCompact(profile.numberOfHolders)}</p>
                  </div>
                  <div className="rounded-[12px] border border-zinc-800/80 bg-black/25 p-3">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">{t.coinsCirculation}</p>
                    <p className="mt-1 text-sm font-medium text-zinc-100">{formatCoins(profile.coinsInCirculationNanos)}</p>
                  </div>
                </div>

                <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{profile.description || t.noBio}</p>
                <div className="mt-5 rounded-[12px] border border-zinc-800/80 bg-black/25 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">{t.publicKey}</p>
                  <p className="mt-2 break-all font-mono text-xs leading-5 text-zinc-400">{profile.publicKey}</p>
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  )
}
