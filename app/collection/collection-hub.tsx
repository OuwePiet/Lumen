"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"

type HubCopy = {
  kicker: string
  title: string
  mint: string
  myNfts: string
  creatorsMarket: string
  navLabel: string
}

const COPY: Partial<Record<ViaLanguage | "Hindi", HubCopy>> = {
  Dutch: { kicker: "NF.VIA", title: "NFT-collectie", mint: "Mint", myNfts: "Mijn NFT's", creatorsMarket: "Creators & Markt", navLabel: "NF.VIA hoofdingangen" },
  English: { kicker: "NF.VIA", title: "NFT collection", mint: "Mint", myNfts: "My NFTs", creatorsMarket: "Creators & Market", navLabel: "NF.VIA main sections" },
  French: { kicker: "NF.VIA", title: "Collection NFT", mint: "Minter", myNfts: "Mes NFT", creatorsMarket: "Créateurs & Marché", navLabel: "Sections principales NF.VIA" },
  Spanish: { kicker: "NF.VIA", title: "Colección NFT", mint: "Mintear", myNfts: "Mis NFT", creatorsMarket: "Creadores & Mercado", navLabel: "Secciones principales NF.VIA" },
  Chinese: { kicker: "NF.VIA", title: "NFT 收藏", mint: "铸造", myNfts: "我的 NFT", creatorsMarket: "创作者与市场", navLabel: "NF.VIA 主入口" },
  Hindi: { kicker: "NF.VIA", title: "NFT संग्रह", mint: "Mint", myNfts: "मेरे NFT", creatorsMarket: "Creators & Market", navLabel: "NF.VIA मुख्य सेक्शन" },
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
    <section style={{ maxWidth: 1480, margin: "0 auto", padding: "22px 20px 4px" }} aria-label={t.navLabel}>
      <div style={{ border: "1px solid rgba(143,212,169,.24)", borderRadius: 16, background: "rgba(5,16,10,.74)", backdropFilter: "blur(5px)", padding: 16 }}>
        <p style={{ margin: 0, color: "#8fd4a9", fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase" }}>{t.kicker}</p>
        <h1 style={{ margin: "7px 0 18px", color: "#f1f6f3", fontSize: "clamp(24px,4vw,34px)", lineHeight: 1.08 }}>{t.title}</h1>
        <nav className="via-collection-hub-nav" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }} aria-label={t.navLabel}>
          <Link href="/studio#mint-nft" style={hubLink}>{t.mint}</Link>
          <a href="#collection-controls" style={hubLink}>{t.myNfts}</a>
          <Link href="/market" style={hubLink}>{t.creatorsMarket}</Link>
        </nav>
        <style>{`
          @media (max-width: 720px) {
            .via-collection-hub-nav { grid-template-columns: minmax(0, 1fr) !important; }
          }
        `}</style>
      </div>
    </section>
  )
}
