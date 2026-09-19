"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"

type HubCopy = {
  kicker: string
  title: string
  intro: string
  collection: string
  createMint: string
  market: string
  receivedBids: string
  myBids: string
  transfers: string
  navLabel: string
}

const COPY: Record<ViaLanguage, HubCopy> = {
  Dutch: {
    kicker: "VIA · NFT hub",
    title: "Alles voor NFT's op één plek",
    intro: "Bekijk collecties, maak en mint, koop of verkoop, beheer biedingen en volg transfers zonder losse hoofdgroepen op de homepage.",
    collection: "Collectie",
    createMint: "Maken & minten",
    market: "Markt",
    receivedBids: "Ontvangen biedingen",
    myBids: "Mijn biedingen",
    transfers: "Transfers",
    navLabel: "NFT-secties",
  },
  English: {
    kicker: "VIA · NFT hub",
    title: "Everything NFT in one place",
    intro: "Browse collections, create and mint, buy or sell, manage bids and follow transfers without separate homepage groups.",
    collection: "Collection",
    createMint: "Create & Mint",
    market: "Market",
    receivedBids: "Received Bids",
    myBids: "My Bids",
    transfers: "Transfers",
    navLabel: "NFT sections",
  },
  French: {
    kicker: "VIA · Hub NFT",
    title: "Tous les NFT au même endroit",
    intro: "Parcourez les collections, créez et mintez, achetez ou vendez, gérez les offres et suivez les transferts sans groupes séparés sur la page d’accueil.",
    collection: "Collection",
    createMint: "Créer & minter",
    market: "Marché",
    receivedBids: "Offres reçues",
    myBids: "Mes offres",
    transfers: "Transferts",
    navLabel: "Sections NFT",
  },
  Spanish: {
    kicker: "VIA · Hub NFT",
    title: "Todo sobre NFT en un solo lugar",
    intro: "Explora colecciones, crea y mintea, compra o vende, gestiona ofertas y sigue transferencias sin grupos separados en la página de inicio.",
    collection: "Colección",
    createMint: "Crear y mintear",
    market: "Mercado",
    receivedBids: "Ofertas recibidas",
    myBids: "Mis ofertas",
    transfers: "Transferencias",
    navLabel: "Secciones NFT",
  },
  Chinese: {
    kicker: "VIA · NFT 中心",
    title: "NFT 功能集中在一个地方",
    intro: "浏览收藏、创建和铸造、买卖、管理出价并跟踪转移，无需在首页设置分散的独立分组。",
    collection: "收藏",
    createMint: "创建与铸造",
    market: "市场",
    receivedBids: "收到的出价",
    myBids: "我的出价",
    transfers: "转移",
    navLabel: "NFT 分区",
  },
}

const hubLink = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: 38,
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

  const t = COPY[language]

  return (
    <section style={{ maxWidth: 1480, margin: "0 auto", padding: "22px 20px 4px" }} aria-label={t.navLabel}>
      <div style={{ border: "1px solid rgba(143,212,169,.24)", borderRadius: 16, background: "rgba(5,16,10,.74)", backdropFilter: "blur(5px)", padding: 16 }}>
        <p style={{ margin: 0, color: "#8fd4a9", fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase" }}>{t.kicker}</p>
        <h1 style={{ margin: "7px 0 5px", color: "#f1f6f3", fontSize: "clamp(24px,4vw,34px)", lineHeight: 1.08 }}>{t.title}</h1>
        <p style={{ margin: "0 0 14px", color: "#b3beb8", fontSize: 14, lineHeight: 1.55 }}>{t.intro}</p>
        <nav style={{ display: "flex", flexWrap: "wrap", gap: 8 }} aria-label={t.navLabel}>
          <a href="#collection-controls" style={hubLink}>{t.collection}</a>
          <Link href="/studio#mint-nft" style={hubLink}>{t.createMint}</Link>
          <Link href="/market" style={hubLink}>{t.market}</Link>
          <Link href="/market/received-bids" style={hubLink}>{t.receivedBids}</Link>
          <Link href="/market/my-bids" style={hubLink}>{t.myBids}</Link>
          <Link href="/market#transfers" style={hubLink}>{t.transfers}</Link>
        </nav>
      </div>
    </section>
  )
}
