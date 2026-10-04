"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Copy, MoreVertical, UserRoundPen, WalletCards } from "lucide-react"
import { restoreIdentitySession, VIA_IDENTITY_EVENT, type ViaIdentitySession } from "../deso-identity-session"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"
import ViaIdentityStatusMarks from "../via-identity-status"
import PostComposer from "../social/post-composer"
import LikeButton from "../social/like-button"
import RepostButton from "../social/repost-button"
import LocalSaveButton from "../social/local-save-button"
import XShareButton from "../x-share-button"

type PublicProfile = {
  publicKey: string
  username: string
  description: string
  profilePic: string | null
  coverPhoto: string | null
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
type ReplyComment = { postHash: string; username?: string; publicKey?: string; body: string; likeCount: number; repostCount: number; quoteRepostCount: number; diamondCount: number; comments?: ReplyComment[] }
type OwnPost = { postHash: string; body: string; imageUrls: string[]; videoUrls: string[]; timestampNanos: number; likeCount: number; diamondCount: number; commentCount: number; repostCount: number; quoteRepostCount: number }
type OwnPostsResponse = { ok?: boolean; posts?: OwnPost[] }

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
  countryVoluntary: string
}

const copy: Record<ViaLanguage | "Hindi", Copy> = {
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
    publicKey: "Public key", active: "Actief", inactive90: "90+ dagen inactief", lastActivity: "Laatste openbare activiteit", countryVoluntary: "Land: vrijwillig",
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
    publicKey: "Public key", active: "Active", inactive90: "Inactive 90+ days", lastActivity: "Last public activity", countryVoluntary: "Country: voluntary",
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
    publicKey: "Clé publique", active: "Actif", inactive90: "Inactif depuis 90+ jours", lastActivity: "Dernière activité publique", countryVoluntary: "Pays : facultatif",
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
    publicKey: "Clave pública", active: "Activo", inactive90: "Inactivo 90+ días", lastActivity: "Última actividad pública", countryVoluntary: "País: voluntario",
  },
  Hindi: {
    kicker: "VIA · प्रोफ़ाइल", heading: "मेरी प्रोफ़ाइल", intro: "आपकी लॉग-इन सार्वजनिक DeSo पहचान, बिना अतिरिक्त वॉलेट अनुमति माँगे दिखाई जाती है।",
    myNfts: "मेरे NFT", back: "मेरे VIA पर वापस जाएँ", noAccount: "कोई DeSo खाता जुड़ा नहीं है", noAccountText: "DeSo Identity से लॉग इन करने के लिए VIA हेडर में खाता बटन का उपयोग करें।",
    loading: "आपकी DeSo प्रोफ़ाइल लोड हो रही है…", unavailable: "आपकी DeSo प्रोफ़ाइल अभी लोड नहीं हो सकी।", verified: "✓ DeSo सत्यापित", yourDeso: "आपका DESO",
    walletUnavailable: "आपका DESO बैलेंस अस्थायी रूप से उपलब्ध नहीं है", coinPrice: "Coin मूल्य", followers: "फ़ॉलोअर्स", following: "फ़ॉलोइंग", coinHolders: "Coin धारक",
    coinsCirculation: "प्रचलन में Coins", noBio: "इस DeSo प्रोफ़ाइल पर कोई सार्वजनिक परिचय नहीं है।", publicKey: "सार्वजनिक कुंजी", active: "सक्रिय",
    inactive90: "90+ दिनों से निष्क्रिय", lastActivity: "अंतिम सार्वजनिक गतिविधि", countryVoluntary: "देश: स्वैच्छिक",
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
    publicKey: "公钥", active: "活跃", inactive90: "90+ 天未活跃", lastActivity: "最近公开活动", countryVoluntary: "国家/地区：自愿",
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
  const [ownPosts, setOwnPosts] = useState<OwnPost[]>([])
  const [replyingToOwnPost, setReplyingToOwnPost] = useState<string | null>(null)
  const [replyParent, setReplyParent] = useState<{ hash: string; name: string } | null>(null)
  const [replyComments, setReplyComments] = useState<ReplyComment[]>([])
  const [replyCommentsBusy, setReplyCommentsBusy] = useState(false)
  const [replyCommentsError, setReplyCommentsError] = useState(false)
  const [commentsRefresh, setCommentsRefresh] = useState(0)
  useEffect(() => {
    if (!replyingToOwnPost) { setReplyComments([]); setReplyParent(null); return }
    const controller = new AbortController()
    setReplyCommentsBusy(true)
    setReplyCommentsError(false)
    fetch(`/api/via/post?hash=${encodeURIComponent(replyingToOwnPost)}&comments=1`, { cache: "no-store", signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error("DESO_COMMENTS_UNAVAILABLE"); return response.json() })
      .then((data: { comments?: ReplyComment[] } | null) => { if (!controller.signal.aborted) setReplyComments(Array.isArray(data?.comments) ? data.comments : []) })
      .catch(() => { if (!controller.signal.aborted) setReplyCommentsError(true) })
      .finally(() => { if (!controller.signal.aborted) setReplyCommentsBusy(false) })
    return () => controller.abort()
  }, [replyingToOwnPost, commentsRefresh])
  const [ownPostsLoading, setOwnPostsLoading] = useState(false)
  const [ownPostsError, setOwnPostsError] = useState(false)
  const [postsRefresh, setPostsRefresh] = useState(0)
  const [contentTab, setContentTab] = useState<"posts" | "gallery">("posts")
  const [loading, setLoading] = useState(true)
  const [profileUnavailable, setProfileUnavailable] = useState(false)
  const [language, setLanguage] = useState<ViaLanguage>("English")
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)
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
      setOwnPosts([])
      setOwnPostsError(false)
      setOwnPostsLoading(false)
      return
    }
    const controller = new AbortController()
    // Preserve the open reply dialog while refreshing posts from DeSo.
    setOwnPostsError(false)
    setOwnPostsLoading(true)
    void fetch(`/api/via/posts?identity=${encodeURIComponent(session.publicKey)}&limit=50`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("POST_READ_UNAVAILABLE")
        const data = await response.json() as OwnPostsResponse
        if (!data.ok || !Array.isArray(data.posts)) throw new Error("POST_READ_UNAVAILABLE")
        if (!controller.signal.aborted) setOwnPosts(data.posts)
      })
      .catch(() => { if (!controller.signal.aborted) setOwnPostsError(true) })
      .finally(() => { if (!controller.signal.aborted) setOwnPostsLoading(false) })
    return () => controller.abort()
  }, [session?.publicKey, postsRefresh])

  useEffect(() => {
    const onPublished = () => setPostsRefresh((current) => current + 1)
    window.addEventListener("via:social:post-published", onPublished)
    return () => window.removeEventListener("via:social:post-published", onPublished)
  }, [])

  const image = safeImage(profile?.profilePic ?? null)
  const coverPhoto = safeImage(profile?.coverPhoto ?? null)

  async function copyPublicKey() {
    if (!profile?.publicKey) return
    try {
      await navigator.clipboard.writeText(profile.publicKey)
      setCopiedKey(true)
      window.setTimeout(() => setCopiedKey(false), 1600)
    } catch { setCopiedKey(false) }
  }

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
              <>
                <Link href={`/collection?account=${encodeURIComponent(session.publicKey)}`} className={quietAction}>{t.myNfts}</Link>
              </>
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
            className="relative overflow-hidden rounded-[28px] border border-[#8fd4a9]/25 p-3 sm:p-8 shadow-[0_24px_80px_rgba(0,0,0,.45)]"
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
            {coverPhoto ? (
              <div className="-mx-6 -mt-6 mb-6 overflow-hidden sm:-mx-8 sm:-mt-8">
                <img src={coverPhoto} alt="" className="block h-auto w-full object-contain [@media(orientation:landscape)_and_(pointer:coarse)_and_(min-width:768px)_and_(max-width:1400px)]:max-h-[420px]" loading="lazy" referrerPolicy="no-referrer" />
              </div>
            ) : null}
            <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[#8fd4a9]/10 blur-3xl" aria-hidden="true" />
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
              <div className="relative shrink-0 self-start">
                {image ? (
                  <img src={image} alt="" className="h-16 w-16 rounded-full border border-[#8fd4a9]/35 object-cover shadow-[0_0_28px_rgba(143,212,169,.12)] sm:h-32 sm:w-32" referrerPolicy="no-referrer" />
                ) : (
                  <div className="grid h-16 w-16 place-items-center rounded-full border border-[#8fd4a9]/30 bg-[#112019] text-3xl font-semibold text-[#9adbb2] sm:h-32 sm:w-32" aria-hidden="true">{profile.username.slice(0, 1).toUpperCase() || "V"}</div>
                )}
                <span className="absolute -bottom-2 -right-2 rounded-full bg-[#06100a]/95 p-1.5 shadow-lg">
                  <ViaIdentityStatusMarks verified={profile.isVerified} inactive={profile.isInactive} compact={false} showLeaf={false} language={language} />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">@{profile.username}</h2>
                  <ViaIdentityStatusMarks verified={profile.isVerified} inactive={profile.isInactive} compact={false} language={language} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 sm:mt-3">
                  <div className="via-profile-own-actions" aria-label="Profile actions">
                    <Link href="/profile/edit" className="via-profile-action-button" aria-label="Edit profile" title="Edit profile"><UserRoundPen className="h-4 w-4" aria-hidden="true" /></Link>
                    <Link href="/wallet" className="via-profile-action-button" aria-label="Open My Wallet" title="My Wallet"><WalletCards className="h-4 w-4" aria-hidden="true" /></Link>
                    <div className="via-profile-action-menu-wrap"><button type="button" className="via-profile-action-button" aria-label="More profile actions" title="More" aria-expanded={profileMenuOpen} onClick={() => setProfileMenuOpen((open) => !open)}><MoreVertical className="h-4 w-4" aria-hidden="true" /></button>{profileMenuOpen ? <div className="via-profile-action-menu"><button type="button" onClick={copyPublicKey}><Copy className="h-4 w-4" aria-hidden="true" />{copiedKey ? "Public key copied" : "Copy public key"}</button></div> : null}</div>
                  </div>
                  <span className={profile.isInactive ? "rounded-full border border-zinc-500/35 bg-zinc-500/10 px-3 py-1 text-xs font-semibold text-zinc-400" : "rounded-full border border-[#8fd4a9]/30 bg-[#8fd4a9]/10 px-3 py-1 text-xs font-semibold text-[#a9dfbc]"}>
                    {profile.isInactive ? t.inactive90 : t.active}
                  </span>
                  {profile.isVerified ? <span className="text-xs text-sky-300/90">{t.verified}</span> : null}
                  {profile.lastPublicActivityAt ? (
                    <span className="text-xs text-zinc-500">{t.lastActivity}: {new Date(profile.lastPublicActivityAt).toLocaleDateString()}</span>
                  ) : null}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-5">
                  <Link href={`/profile/connections?mode=followers&identity=${encodeURIComponent(profile.publicKey)}`} className={metricLink}>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">{t.followers}</p>
                    <p className="mt-1 text-sm font-medium text-zinc-100">{formatCompact(profile.followersCount)}</p>
                  </Link>
                  <Link href={`/profile/connections?mode=following&identity=${encodeURIComponent(profile.publicKey)}`} className={metricLink}>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">{t.following}</p>
                    <p className="mt-1 text-sm font-medium text-zinc-100">{formatCompact(profile.followingCount)}</p>
                  </Link>
                </div>

                <div className="mt-2 flex w-fit max-w-full flex-wrap items-center gap-2 rounded-full border border-zinc-700/80 bg-black/25 px-3 py-1.5 text-xs text-zinc-400 sm:mt-4" title="Voluntary country registration can be added later">
                  <span aria-hidden="true">📍</span>
                  <span>{t.countryVoluntary}</span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-5 text-zinc-300 sm:mt-5 sm:leading-6">{profile.description || t.noBio}</p>
                <div className="mt-3 rounded-[12px] border border-zinc-800/80 bg-black/25 p-3 sm:mt-5 sm:p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">{t.publicKey}</p>
                  <p className="mt-2 break-all font-mono text-xs leading-5 text-zinc-400">{profile.publicKey}</p>
                </div>
              </div>
            </div>
          </section>
        ) : null}
        {session && profile ? <section className="mt-5 rounded-[14px] border border-zinc-800/80 bg-zinc-950/50 p-4 sm:p-5" aria-label="Write a post"><PostComposer /></section> : null}
        {session && profile ? <section className="mt-5" aria-label="Your DeSo posts and gallery">
          <div className="mb-4 flex gap-2" role="tablist" aria-label="Profile content">{(["posts", "gallery"] as const).map((tab) => <button key={tab} type="button" role="tab" aria-selected={contentTab === tab} onClick={() => setContentTab(tab)} className={`rounded-xl border px-4 py-2 text-sm ${contentTab === tab ? "border-[#8fd4a9] bg-[#10271a] text-[#9adbb2]" : "border-zinc-800 text-zinc-400"}`}>{tab === "posts" ? "Posts" : "Gallery"}</button>)}</div>
          <nav aria-label="Profile sections" className="mb-4 flex flex-wrap gap-2 text-sm"><Link href="/profile/coin" className="rounded-xl border border-zinc-800 px-3 py-2 text-zinc-200">Creator Coin</Link><Link href="/wallet" className="rounded-xl border border-zinc-800 px-3 py-2 text-zinc-200">Diamonds</Link><Link href="/collection" className="rounded-xl border border-zinc-800 px-3 py-2 text-zinc-200">NFTs</Link></nav>
          {contentTab === "posts" ? <>
          <div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">My Posts</h2><button type="button" onClick={() => setPostsRefresh((current) => current + 1)} className="text-xs text-[#9adbb2]">Refresh</button></div>
          {ownPostsLoading ? <p className="text-sm text-zinc-400">Loading DeSo posts…</p> : ownPostsError ? <p className="text-sm text-zinc-400" role="status">DeSo posts are temporarily unavailable.</p> : ownPosts.length === 0 ? <p className="text-sm text-zinc-400">No posts returned for the active DeSo account.</p> : <div className="space-y-3">{ownPosts.map((post) => <article key={post.postHash} className="rounded-[14px] border border-zinc-800/80 bg-zinc-950/50 p-4">
            <p className="whitespace-pre-wrap text-sm text-zinc-200">{post.body}</p>
            {post.imageUrls?.length ? <div className="mt-3 grid gap-2 sm:grid-cols-2">{post.imageUrls.slice(0, 4).map((url) => <img key={url} src={url} alt="" loading="lazy" referrerPolicy="no-referrer" className="max-h-96 w-full rounded-lg object-cover" />)}</div> : null}
            {post.videoUrls?.length ? <div className="mt-3 space-y-2">{post.videoUrls.slice(0, 2).map((url) => <video key={url} src={url} controls playsInline preload="none" className="max-h-96 w-full" />)}</div> : null}
            <div className="mt-3 flex flex-wrap items-center gap-2" aria-label="DeSo post actions">
              <button type="button" onClick={() => setReplyingToOwnPost(replyingToOwnPost === post.postHash ? null : post.postHash)} className="rounded-full border border-zinc-800 px-3 py-2 text-xs">Reply · {post.commentCount}</button>
              <RepostButton postHash={post.postHash} initialCount={post.repostCount + post.quoteRepostCount} variant="icon" />
              <LikeButton postHash={post.postHash} initialCount={post.likeCount} variant="icon" />
              <span className="rounded-full border border-zinc-800 px-3 py-2 text-xs text-zinc-400" title="DeSo does not allow sending Diamonds to yourself">Diamonds · {post.diamondCount}</span>
              <XShareButton href={`/social?post=${encodeURIComponent(post.postHash)}`} text={post.body.slice(0, 180)} label="Share on X" />
              <LocalSaveButton postHash={post.postHash} body={post.body} publicKey={session.publicKey} timestampNanos={post.timestampNanos} />
              <Link href={`/social?post=${encodeURIComponent(post.postHash)}`} className="rounded-full border border-zinc-800 px-3 py-2 text-xs">Open post</Link>
            </div>
            {replyingToOwnPost === post.postHash ? (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-2 sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setReplyingToOwnPost(null) }}>
                <section role="dialog" aria-modal="true" aria-label="Reply to DeSo post" className="relative flex max-h-[94dvh] w-full max-w-2xl flex-col overflow-y-auto rounded-xl border border-zinc-700 bg-[#080b09] p-4 shadow-2xl sm:p-6">
                  <button type="button" onClick={() => setReplyingToOwnPost(null)} aria-label="Close reply" className="absolute right-3 top-3 rounded-full border border-zinc-700 px-3 py-1 text-xl text-zinc-200">×</button>
                  <div className="border-b border-zinc-800 pb-4 pr-12">
                    <p className="text-sm font-semibold text-zinc-100">Your DeSo post</p>
                    {post.body ? <p className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap break-words text-sm text-zinc-300">{post.body}</p> : null}
                    {post.imageUrls[0] ? <img src={post.imageUrls[0]} alt="Original post attachment" className="mt-2 max-h-36 rounded-lg object-contain" /> : null}
                  </div>
                  <div className="mt-3 max-h-40 space-y-2 overflow-y-auto" aria-label="DeSo reactions">
                    {replyCommentsBusy ? <p className="text-xs text-zinc-400">Loading DeSo replies…</p> : null}
                        {replyCommentsError ? <div role="alert" className="flex flex-wrap items-center gap-2 text-xs text-amber-300"><span>DeSo replies could not be loaded.</span><button type="button" onClick={() => setCommentsRefresh((value) => value + 1)} className="rounded-lg border border-amber-500/40 px-2 py-1">Retry</button></div> : null}
                    {!replyCommentsBusy && !replyCommentsError && replyComments.length === 0 ? <p className="text-xs text-zinc-500">No replies returned by DeSo yet.</p> : null}
                    {!replyCommentsBusy ? <button type="button" onClick={() => setCommentsRefresh((value) => value + 1)} className="rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-300">Refresh replies</button> : null}
                    {replyComments.map((comment) => <div key={comment.postHash} className="rounded-lg border border-zinc-800 p-2 text-sm"><p className="text-xs text-zinc-400">{comment.username ? `@${comment.username}` : comment.publicKey ? `${comment.publicKey.slice(0, 10)}…` : "DeSo member"}</p><p className="whitespace-pre-wrap break-words">{comment.body}</p><button type="button" className="mt-1 text-xs text-[#9adbb2]" onClick={() => setReplyParent({ hash: comment.postHash, name: comment.username ? `@${comment.username}` : "DeSo member" })}>Reply</button><div className="mt-2 flex flex-wrap gap-2"><LikeButton postHash={comment.postHash} initialCount={comment.likeCount} variant="icon" /><RepostButton postHash={comment.postHash} initialCount={comment.repostCount + comment.quoteRepostCount} variant="icon" /><span className="text-xs text-zinc-400">Diamonds · {comment.diamondCount}</span></div>{comment.comments?.map((child) => <div key={child.postHash} className="ml-4 mt-2 border-l border-zinc-700 pl-3"><p className="text-xs text-zinc-400">{child.username ? `@${child.username}` : child.publicKey ? `${child.publicKey.slice(0, 10)}…` : "DeSo member"}</p><p className="whitespace-pre-wrap break-words">{child.body}</p><button type="button" className="mt-1 text-xs text-[#9adbb2]" onClick={() => setReplyParent({ hash: child.postHash, name: child.username ? `@${child.username}` : "DeSo member" })}>Reply</button><div className="mt-2 flex flex-wrap gap-2"><LikeButton postHash={child.postHash} initialCount={child.likeCount} variant="icon" /><RepostButton postHash={child.postHash} initialCount={child.repostCount + child.quoteRepostCount} variant="icon" /><span className="text-xs text-zinc-400">Diamonds · {child.diamondCount}</span></div></div>)}</div>)}
                  </div>
                  <p className="mt-4 text-sm text-zinc-400">Replying to {replyParent?.name ?? "your post"}</p>
                  <PostComposer key={replyParent?.hash ?? post.postHash} parentStakeID={replyParent?.hash ?? post.postHash} compact onCancel={() => { setReplyParent(null); setReplyingToOwnPost(null) }} onDone={() => { setReplyParent(null); setCommentsRefresh((value) => value + 1); setPostsRefresh((value) => value + 1) }} />
                </section>
              </div>
            ) : null}
          </article>)}</div>}
          </> : ownPostsLoading ? <p className="text-sm text-zinc-400">Loading gallery…</p> : ownPostsError ? <p role="status" className="text-sm text-zinc-400">Gallery temporarily unavailable.</p> : <div role="tabpanel" className="grid grid-cols-2 gap-2 sm:grid-cols-3">{ownPosts.flatMap((post) => post.imageUrls.map((url, index) => ({ url, hash: post.postHash, index }))).map((item) => <Link key={`${item.hash}-${item.index}`} href={`/social?post=${encodeURIComponent(item.hash)}`} className="overflow-hidden rounded-xl border border-zinc-800" aria-label="Open image post"><img src={item.url} alt="" loading="lazy" referrerPolicy="no-referrer" className="aspect-square w-full object-cover" /></Link>)}{!ownPosts.some((post) => post.imageUrls.length > 0) ? <p className="col-span-full text-sm text-zinc-400">No images in the loaded posts.</p> : null}</div>}
        </section> : null}
      </div>
      <style>{`\n        .via-profile-own-actions { display:flex; align-items:center; gap:7px; margin-left:auto; }\n        .via-profile-action-button { width:36px; height:36px; display:inline-grid; place-items:center; border:1px solid rgba(143,212,169,.28); border-radius:50%; background:rgba(5,11,8,.58); color:#9adbb2; text-decoration:none; }\n        .via-profile-action-menu-wrap { position:relative; }\n        .via-profile-action-menu { position:absolute; right:0; top:42px; z-index:30; min-width:170px; padding:6px; border:1px solid rgba(143,212,169,.22); border-radius:12px; background:rgba(5,10,7,.98); box-shadow:0 16px 36px rgba(0,0,0,.42); }\n        .via-profile-action-menu button { width:100%; display:flex; align-items:center; gap:8px; border:0; border-radius:8px; padding:9px 10px; background:transparent; color:#d3ddd7; font-size:12px; text-align:left; }\n        @media (max-width:720px) { .via-profile-own-actions { width:auto; justify-content:flex-start; margin:0; } .via-profile-action-button { width:34px; height:34px; } }\n      `}</style>
    </main>
  )
}
