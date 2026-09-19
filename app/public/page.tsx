"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { clearIdentitySession } from "../deso-identity-session"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"

type Copy = {
  kicker: string
  title: string
  intro: string
  note: string
  limited: string
  social: string
  discover: string
  nfts: string
  market: string
  infoTitle: string
  payments: string
  transparency: string
  storage: string
  home: string
}

const copy: Record<ViaLanguage, Copy> = {
  Dutch: {
    kicker: "VIA · PUBLIEKE INGANG",
    title: "Kijken zonder DeSo-login",
    intro: "Deze ingang is bedoeld voor bezoekers. Je kunt publieke VIA- en DeSo-inhoud bekijken zonder blockchain-acties uit te voeren.",
    note: "Plaatsen, volgen, liken, diamonds, bieden, kopen en andere acties blijven uitgeschakeld totdat je bewust met DeSo Identity inlogt.",
    limited: "Publieke modus actief · DeSo-functies zijn beperkt",
    social: "Bekijk publieke posts",
    discover: "Ontdek creators",
    nfts: "Bekijk NFT's",
    market: "Bekijk markt",
    infoTitle: "Duidelijkheid voor bezoekers",
    payments: "Betaalinformatie",
    transparency: "Kosten & transparantie",
    storage: "Externe opslag",
    home: "Terug naar homepage",
  },
  English: {
    kicker: "VIA · PUBLIC ENTRANCE",
    title: "Browse without a DeSo login",
    intro: "This entrance is for visitors. You can browse public VIA and DeSo content without performing blockchain actions.",
    note: "Posting, following, liking, diamonds, bidding, buying and other actions stay unavailable until you deliberately sign in with DeSo Identity.",
    limited: "Public mode active · DeSo functions are limited",
    social: "View public posts",
    discover: "Discover creators",
    nfts: "Browse NFTs",
    market: "Browse market",
    infoTitle: "Visitor information",
    payments: "Payment information",
    transparency: "Costs & transparency",
    storage: "External storage",
    home: "Back to homepage",
  },
  French: {
    kicker: "VIA · ENTRÉE PUBLIQUE",
    title: "Consulter sans connexion DeSo",
    intro: "Cette entrée est destinée aux visiteurs. Vous pouvez consulter le contenu public VIA et DeSo sans effectuer d'actions blockchain.",
    note: "Publier, suivre, aimer, envoyer des diamonds, enchérir, acheter et les autres actions restent indisponibles jusqu'à une connexion volontaire via DeSo Identity.",
    limited: "Mode public actif · les fonctions DeSo sont limitées",
    social: "Voir les posts publics",
    discover: "Découvrir des créateurs",
    nfts: "Voir les NFT",
    market: "Voir le marché",
    infoTitle: "Informations visiteurs",
    payments: "Informations de paiement",
    transparency: "Coûts & transparence",
    storage: "Stockage externe",
    home: "Retour à l'accueil",
  },
  Spanish: {
    kicker: "VIA · ENTRADA PÚBLICA",
    title: "Explorar sin iniciar sesión en DeSo",
    intro: "Esta entrada es para visitantes. Puedes consultar contenido público de VIA y DeSo sin realizar acciones blockchain.",
    note: "Publicar, seguir, dar me gusta, enviar diamonds, pujar, comprar y otras acciones permanecen desactivadas hasta iniciar sesión conscientemente con DeSo Identity.",
    limited: "Modo público activo · las funciones de DeSo están limitadas",
    social: "Ver publicaciones públicas",
    discover: "Descubrir creadores",
    nfts: "Ver NFT",
    market: "Ver mercado",
    infoTitle: "Información para visitantes",
    payments: "Información de pagos",
    transparency: "Costes y transparencia",
    storage: "Almacenamiento externo",
    home: "Volver al inicio",
  },
  Chinese: {
    kicker: "VIA · 公开入口",
    title: "无需 DeSo 登录即可浏览",
    intro: "此入口面向访客。你可以查看 VIA 和 DeSo 的公开内容，而无需执行区块链操作。",
    note: "发布、关注、点赞、Diamonds、出价、购买等操作在你主动使用 DeSo Identity 登录前保持不可用。",
    limited: "公开模式已启用 · DeSo 功能受限",
    social: "查看公开帖子",
    discover: "发现创作者",
    nfts: "浏览 NFT",
    market: "浏览市场",
    infoTitle: "访客信息",
    payments: "支付信息",
    transparency: "费用与透明度",
    storage: "外部存储",
    home: "返回主页",
  },
  Hindi: {
    kicker: "VIA · PUBLIC ENTRANCE",
    title: "Browse without a DeSo login",
    intro: "This entrance is for visitors. You can browse public VIA and DeSo content without performing blockchain actions.",
    note: "Posting, following, liking, diamonds, bidding, buying and other actions stay unavailable until you deliberately sign in with DeSo Identity.",
    limited: "Public mode active · DeSo functions are limited",
    social: "View public posts",
    discover: "Discover creators",
    nfts: "Browse NFTs",
    market: "Browse market",
    infoTitle: "Visitor information",
    payments: "Payment information",
    transparency: "Costs & transparency",
    storage: "External storage",
    home: "Back to homepage",
  },
}

const card = "rounded-[16px] border border-zinc-800/80 bg-zinc-950/55 p-5 text-zinc-200 transition hover:border-[#8fd4a9]/45 hover:text-[#b9ffd4]"

export default function PublicEntrancePage() {
  const [language, setLanguage] = useState<ViaLanguage>("English")

  useEffect(() => {
    clearIdentitySession()
    const refresh = () => setLanguage(readViaLocalSettings().interfaceLanguage)
    refresh()
    window.addEventListener(VIA_SETTINGS_EVENT, refresh)
    return () => window.removeEventListener(VIA_SETTINGS_EVENT, refresh)
  }, [])

  const t = copy[language]

  return (
    <main className="min-h-screen bg-[#050807] px-5 py-8 text-zinc-100 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <header className="border-b border-zinc-900 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8fd4a9]">{t.kicker}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{t.title}</h1>
          <div className="mt-4 inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-200">{t.limited}</div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">{t.intro}</p>
          <p className="mt-2 max-w-3xl text-xs leading-5 text-zinc-500">{t.note}</p>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2" aria-label="Public VIA destinations">
          <Link href="/social" className={card}>{t.social}</Link>
          <Link href="/discover/voices" className={card}>{t.discover}</Link>
          <Link href="/collection" className={card}>{t.nfts}</Link>
          <Link href="/market" className={card}>{t.market}</Link>
        </section>

        <section className="mt-7" aria-label="VIA visitor information">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#8fd4a9]">{t.infoTitle}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link href="/payment-info" className={card}>{t.payments}</Link>
            <Link href="/transparency" className={card}>{t.transparency}</Link>
            <Link href="/storage" className={card}>{t.storage}</Link>
          </div>
        </section>

        <Link href="/" className="mt-6 inline-flex rounded-full border border-[#285f40] px-4 py-2 text-sm font-medium text-[#9adbb2] hover:border-[#8fd4a9]/70">{t.home}</Link>
      </div>
    </main>
  )
}
