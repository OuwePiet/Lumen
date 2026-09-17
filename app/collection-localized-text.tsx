"use client"

import { useEffect, useState } from "react"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "./via-local-settings"

type Copy = {
  myVia: string
  communities: string
  discover: string
  news: string
  heading: string
  intro: string
  onChain: string
  creator: string
  copy: string
  copies: string
  forSale: string
  notForSale: string
  buyNow: string
  minBid: string
  displayed: string
  unavailable: string
  detected: string
}

const copy: Record<ViaLanguage, Copy> = {
  Dutch: {
    myVia: "Mijn VIA",
    communities: "Communities",
    discover: "Ontdekken",
    news: "Nieuws",
    heading: "NFT-collectie",
    intro: "Ontdek openbare DeSo-NFT's via VIA. Collectiegegevens worden alleen-lezen geladen vanaf het DeSo-netwerk.",
    onChain: "On-chain NFT",
    creator: "DeSo-creator",
    copy: "exemplaar",
    copies: "exemplaren",
    forSale: "te koop",
    notForSale: "niet te koop",
    buyNow: "Nu kopen",
    minBid: "Minimumbod",
    displayed: "NFT's weergegeven",
    unavailable: "Collectie niet beschikbaar",
    detected: "NFT's gevonden",
  },
  English: {
    myVia: "My VIA",
    communities: "Communities",
    discover: "Discover",
    news: "News",
    heading: "NFT collection",
    intro: "Explore public DeSo NFTs through VIA. Collection data is loaded read-only from the DeSo network.",
    onChain: "On-chain NFT",
    creator: "DeSo creator",
    copy: "copy",
    copies: "copies",
    forSale: "for sale",
    notForSale: "not for sale",
    buyNow: "Buy now",
    minBid: "Min bid",
    displayed: "NFTs displayed",
    unavailable: "Collection unavailable",
    detected: "NFTs detected",
  },
  French: {
    myVia: "Mon VIA",
    communities: "Communautés",
    discover: "Découvrir",
    news: "Actualités",
    heading: "Collection NFT",
    intro: "Explorez les NFT DeSo publics via VIA. Les données de collection sont chargées en lecture seule depuis le réseau DeSo.",
    onChain: "NFT on-chain",
    creator: "Créateur DeSo",
    copy: "exemplaire",
    copies: "exemplaires",
    forSale: "à vendre",
    notForSale: "pas à vendre",
    buyNow: "Acheter maintenant",
    minBid: "Enchère min.",
    displayed: "NFT affichés",
    unavailable: "Collection indisponible",
    detected: "NFT détectés",
  },
  Spanish: {
    myVia: "Mi VIA",
    communities: "Comunidades",
    discover: "Descubrir",
    news: "Noticias",
    heading: "Colección NFT",
    intro: "Explora NFT públicos de DeSo mediante VIA. Los datos de la colección se cargan en modo de solo lectura desde la red DeSo.",
    onChain: "NFT on-chain",
    creator: "Creador DeSo",
    copy: "copia",
    copies: "copias",
    forSale: "en venta",
    notForSale: "no está en venta",
    buyNow: "Comprar ahora",
    minBid: "Puja mínima",
    displayed: "NFT mostrados",
    unavailable: "Colección no disponible",
    detected: "NFT detectados",
  },
  Chinese: {
    myVia: "我的 VIA",
    communities: "社区",
    discover: "发现",
    news: "新闻",
    heading: "NFT 收藏",
    intro: "通过 VIA 浏览公开的 DeSo NFT。收藏数据以只读方式从 DeSo 网络加载。",
    onChain: "链上 NFT",
    creator: "DeSo 创作者",
    copy: "份",
    copies: "份",
    forSale: "出售中",
    notForSale: "未出售",
    buyNow: "立即购买",
    minBid: "最低出价",
    displayed: "个 NFT 已显示",
    unavailable: "收藏不可用",
    detected: "个 NFT 已找到",
  },
}

function formatDeSo(nanos: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 9 }).format(nanos / 1_000_000_000)
}

type Props = {
  kind: "myVia" | "communities" | "discover" | "news" | "heading" | "intro" | "onChain" | "creator" | "cardFacts" | "ownerStatus"
  copies?: number
  forSaleCount?: number
  buyNowPrice?: number
  minBidAmount?: number
  username?: string
  displayedCount?: number
  detectedCount?: number
  selectedAccount?: string
}

export default function CollectionLocalizedText(props: Props) {
  const [language, setLanguage] = useState<ViaLanguage>("English")

  useEffect(() => {
    const refresh = () => setLanguage(readViaLocalSettings().interfaceLanguage)
    refresh()
    window.addEventListener(VIA_SETTINGS_EVENT, refresh)
    return () => window.removeEventListener(VIA_SETTINGS_EVENT, refresh)
  }, [])

  const t = copy[language]
  if (props.kind in t) return <>{t[props.kind as keyof Copy]}</>

  if (props.kind === "cardFacts") {
    const copies = props.copies ?? 0
    const forSale = props.forSaleCount ?? 0
    let price = t.notForSale
    if (forSale > 0 && typeof props.buyNowPrice === "number") price = `${t.buyNow}: ${formatDeSo(props.buyNowPrice)} DESO`
    else if (forSale > 0 && typeof props.minBidAmount === "number") price = `${t.minBid}: ${formatDeSo(props.minBidAmount)} DESO`
    else if (forSale > 0) price = t.forSale
    return <>{copies} {copies === 1 ? t.copy : t.copies} · {forSale} {t.forSale} · {price}</>
  }

  if (props.username) {
    const detected = typeof props.detectedCount === "number" && props.detectedCount > (props.displayedCount ?? 0)
      ? ` · ${props.detectedCount} ${t.detected}`
      : ""
    return <>@{props.username} · {props.displayedCount ?? 0} {t.displayed}{detected}</>
  }

  return <>{t.unavailable}: @{props.selectedAccount}</>
}
