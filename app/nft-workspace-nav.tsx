"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "./via-local-settings"
import styles from "./nft-workspace-nav.module.css"

const LABELS: Record<ViaLanguage, readonly string[]> = {
  Dutch: ["Ontdekken", "Marktplaats", "Mint", "Mijn NFT's", "Collecties", "Claim / Giveaway", "Uitleg & kosten"],
  English: ["Discover", "Marketplace", "Mint", "My NFTs", "Collections", "Claim / Giveaway", "Guide & costs"],
  French: ["Découvrir", "Marché", "Minter", "Mes NFT", "Collections", "Claim / Giveaway", "Guide & frais"],
  Spanish: ["Descubrir", "Mercado", "Crear NFT", "Mis NFT", "Colecciones", "Claim / Giveaway", "Guía y costes"],
  Chinese: ["发现", "市场", "铸造", "我的 NFT", "合集", "领取 / 赠送", "指南与费用"],
  Hindi: ["खोजें", "बाज़ार", "मिंट", "मेरे NFT", "संग्रह", "दावा / उपहार", "गाइड और लागत"],
}
const LINKS = ["/collection", "/market", "/studio", "/collection/mine", "/collections", "/giveaway", "/nft-info"]
export function isNFTWorkspace(path: string) {
  return LINKS.some(root => path === root || path.startsWith(root + "/")) || path.startsWith("/nft/")
}
export default function NFTWorkspaceNav() {
  const pathname = usePathname()
  const [language, setLanguage] = useState<ViaLanguage>("English")
  useEffect(() => {
    const sync = () => setLanguage(readViaLocalSettings().interfaceLanguage)
    sync()
    window.addEventListener(VIA_SETTINGS_EVENT, sync)
    return () => window.removeEventListener(VIA_SETTINGS_EVENT, sync)
  }, [])
  if (!isNFTWorkspace(pathname)) return null
  const labels = LABELS[language]
  return <nav className={styles.workspace} aria-label="NFT workspace" data-via-nft-workspace>
    <div className={styles.links}>
      {LINKS.map((href, index) => {
        const active = href === "/collection" ? pathname === href : pathname === href || pathname.startsWith(href + "/")
        return <Link key={href} href={href === "/studio" ? href + "#mint-nft" : href === "/collection" ? href + "#account-lookup-heading" : href} className={styles.link} aria-current={active ? "page" : undefined}>{labels[index]}</Link>
      })}
    </div>
    <style>{`
      body:has([data-via-nft-workspace]) .via-site-header-shell { grid-template-rows: 44px 52px !important; }
      body:has([data-via-nft-workspace]) .via-site-header-tools { flex-wrap: nowrap !important; min-width: 0; }
      body:has([data-via-nft-workspace]) .via-site-header-tools > a,
      body:has([data-via-nft-workspace]) .via-site-header-tools > button,
      body:has([data-via-nft-workspace]) .via-site-header-search,
      body:has([data-via-nft-workspace]) .via-site-header-language,
      body:has([data-via-nft-workspace]) .via-site-header-account-button { height: 44px !important; min-height: 44px !important; font-weight: 500 !important; }
      body:has([data-via-nft-workspace]) .via-site-header-link { font-weight: 500 !important; }
      body:has([data-via-nft-workspace]) .via-global-guides { min-height: 48px; align-items: center; }
      body:has([data-via-nft-workspace]) #account-lookup-heading { scroll-margin-top: 210px; }
      @media (min-width: 721px) and (max-width: 1100px) {
        body:has([data-via-nft-workspace]) .via-site-header-search-label { display: none; }
        body:has([data-via-nft-workspace]) .via-site-header-search { width: 44px !important; min-width: 44px !important; padding: 0 !important; }
        body:has([data-via-nft-workspace]) .via-site-header-account-label { max-width: 100px; }
      }
      @media (max-width: 720px) {
        body:has([data-via-nft-workspace]) .via-site-header-shell { grid-template-rows: 48px 48px !important; }
      }
    `}</style>
  </nav>
}