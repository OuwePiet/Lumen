"use client"

import { usePathname } from "next/navigation"
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

export default function CollectionHub() {
  const pathname = usePathname()
  const [language, setLanguage] = useState<ViaLanguage>("English")
  useEffect(() => {
    const sync = () => setLanguage(readViaLocalSettings().interfaceLanguage)
    sync()
    window.addEventListener(VIA_SETTINGS_EVENT, sync)
    return () => window.removeEventListener(VIA_SETTINGS_EVENT, sync)
  }, [])
  const t = COPY[language] ?? COPY.English!
  if (pathname !== "/collection") return null
  return <header data-via-collection-heading className="mx-auto max-w-[1480px] px-3 py-5">
    <p className="text-xs font-medium tracking-[0.14em] text-[#8fd4a9]">NF.VIA</p>
    <h1 className="mt-2 text-[28px] font-medium leading-tight text-zinc-100">{t.title}</h1>
  </header>
}
