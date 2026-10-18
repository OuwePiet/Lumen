"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"

type HubCopy = {
  kicker: string
  title: string
  discover: string
  marketplace: string
  mint: string
  myNfts: string
  navLabel: string
  signInForMyNfts: string
}

const COPY: Partial<Record<ViaLanguage | "Hindi", HubCopy>> = {
  Dutch: { kicker: "NF.VIA", title: "NFT-collectie", discover: "Ontdekken", marketplace: "Marktplaats", mint: "Mint", myNfts: "Mijn NFT's", navLabel: "NF.VIA hoofdingangen", signInForMyNfts: "Log in met DeSo om je eigen NFT-collectie te openen. Openbare creatorcollecties blijven hieronder beschikbaar." },
  English: { kicker: "NF.VIA", title: "NFT collection", discover: "Discover", marketplace: "Marketplace", mint: "Mint", myNfts: "My NFTs", navLabel: "NF.VIA main sections", signInForMyNfts: "Sign in with DeSo to open your NFT collection. Public creator collections remain available below." },
  French: { kicker: "NF.VIA", title: "Collection NFT", discover: "Découvrir", marketplace: "Marché", mint: "Minter", myNfts: "Mes NFT", navLabel: "Sections principales NF.VIA", signInForMyNfts: "Connectez-vous avec DeSo pour ouvrir votre collection NFT. Les collections publiques restent disponibles ci-dessous." },
  Spanish: { kicker: "NF.VIA", title: "Colección NFT", discover: "Descubrir", marketplace: "Mercado", mint: "Mintear", myNfts: "Mis NFT", navLabel: "Secciones principales NF.VIA", signInForMyNfts: "Inicia sesión con DeSo para abrir tu colección NFT. Las colecciones públicas siguen disponibles abajo." },
  Chinese: { kicker: "NF.VIA", title: "NFT 收藏", discover: "发现", marketplace: "市场", mint: "铸造", myNfts: "我的 NFT", navLabel: "NF.VIA 主入口", signInForMyNfts: "使用 DeSo 登录以打开你的 NFT 收藏。下方仍可浏览公开创作者收藏。" },
  Hindi: { kicker: "NF.VIA", title: "NFT संग्रह", discover: "खोजें", marketplace: "बाज़ार", mint: "Mint", myNfts: "मेरे NFT", navLabel: "NF.VIA मुख्य सेक्शन", signInForMyNfts: "अपना NFT संग्रह खोलने के लिए DeSo से लॉग इन करें। सार्वजनिक creator संग्रह नीचे उपलब्ध रहेंगे।" },
}

const hubLink = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 44,
  boxSizing: "border-box",
  textAlign: "center",
  padding: "8px 12px",
  border: "1px solid rgba(143,212,169,.28)",
  borderRadius: 11,
  color: "#b9e8c9",
  background: "rgba(4,12,7,.72)",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 700,
  fontFamily: "inherit",
  cursor: "pointer",
} as const

export default function CollectionHub() {
  const [language, setLanguage] = useState<ViaLanguage>("English")

  useEffect(() => {
    const sync = () => setLanguage(readViaLocalSettings().interfaceLanguage)
    sync()
    window.addEventListener(VIA_SETTINGS_EVENT, sync)
    return () => window.removeEventListener(VIA_SETTINGS_EVENT, sync)
  }, [])

  const t = COPY[language] ?? COPY.English!

  return (
    <section style={{ maxWidth: 1480, margin: "0 auto", padding: "12px 12px 4px" }} aria-label={t.navLabel}>
      <div style={{ border: "1px solid rgba(143,212,169,.24)", borderRadius: 16, background: "rgba(5,16,10,.74)", backdropFilter: "blur(5px)", padding: 12 }}>
        <p style={{ margin: 0, color: "#8fd4a9", fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase" }}>{t.kicker}</p>
        <h1 style={{ margin: "5px 0 12px", color: "#f1f6f3", fontSize: "clamp(22px,3vw,28px)", lineHeight: 1.08 }}>{t.title}</h1>
        <nav className="via-collection-hub-nav" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 6 }} aria-label={t.navLabel}>
          <a href="/collection#account-lookup-heading" style={hubLink}>{t.discover}</a>
          <Link href="/market" style={hubLink}>{t.marketplace}</Link>
          <Link href="/studio#mint-nft" style={hubLink}>{t.mint}</Link>
          <Link href="/collection/mine" style={hubLink}>{t.myNfts}</Link>
        </nav>
        <nav aria-label="NFT workspace" className="mt-2 flex flex-wrap gap-2 text-xs">
          <Link href="/collections" style={hubLink}>Collections / series</Link>
          <Link href="/giveaway" style={hubLink}>Claim / Giveaway</Link>
          <Link href="/nft-info" style={hubLink}>Uitleg, eigendom & kosten</Link>
        </nav>
        <style>{`
          @media (max-width: 980px) {
            .via-collection-hub-nav { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          }
          @media (max-width: 720px) {
            .via-collection-hub-nav { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          }
        `}</style>
      </div>
    </section>
  )
}
