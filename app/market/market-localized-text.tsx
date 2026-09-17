"use client"

import { useEffect, useState } from "react"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"

type Copy = {
  marketplace: string
  heading: string
  intro: string
  collection: string
  receivedBids: string
  myBids: string
  listings: string
  transfers: string
  chooseAccount: string
  readOnly: string
  placeholder: string
  openMarket: string
  loadError: string
  listedEdition: string
  listedEditions: string
  noForSale: string
  edition: string
  buyNow: string
  minBid: string
  pendingEdition: string
  pendingEditions: string
  noTransfers: string
  pendingOnDeSo: string
}

const copy: Record<ViaLanguage, Copy> = {
  Dutch: {
    marketplace: "VIA Marketplace",
    heading: "Markt",
    intro: "Biedingen, actieve aanbiedingen en lopende overdrachten voor één DeSo-account. Transactieacties blijven op de NFT-detailpagina, waar VIA de volledige bevestigingsstroom bewaakt.",
    collection: "Collectie",
    receivedBids: "Ontvangen biedingen",
    myBids: "Mijn biedingen",
    listings: "Aanbiedingen",
    transfers: "Overdrachten",
    chooseAccount: "Kies een DeSo-account",
    readOnly: "Dit is een alleen-lezen marktopzoeking. VIA ondertekent of besteedt niets via dit formulier.",
    placeholder: "DeSo public key (BC1…)",
    openMarket: "Open markt",
    loadError: "VIA kan de marketplace-status voor dit DeSo-account momenteel niet laden.",
    listedEdition: "aangeboden exemplaar",
    listedEditions: "aangeboden exemplaren",
    noForSale: "Er staan momenteel geen NFT-exemplaren te koop.",
    edition: "Exemplaar",
    buyNow: "Nu kopen",
    minBid: "Minimumbod",
    pendingEdition: "lopend exemplaar",
    pendingEditions: "lopende exemplaren",
    noTransfers: "Geen lopende NFT-overdrachten gevonden voor dit account.",
    pendingOnDeSo: "in afwachting op DeSo",
  },
  English: {
    marketplace: "VIA Marketplace",
    heading: "Market",
    intro: "Bids, active listings and pending transfers for one DeSo account. Transaction actions stay on the NFT detail page where VIA keeps the full confirmation flow.",
    collection: "Collection",
    receivedBids: "Received Bids",
    myBids: "My Bids",
    listings: "Listings",
    transfers: "Transfers",
    chooseAccount: "Choose a DeSo account",
    readOnly: "This is a read-only market lookup. VIA does not sign or spend from this form.",
    placeholder: "DeSo public key (BC1…)",
    openMarket: "Open market",
    loadError: "VIA could not load the marketplace state for this DeSo account right now.",
    listedEdition: "listed edition",
    listedEditions: "listed editions",
    noForSale: "No NFT editions currently for sale.",
    edition: "Edition",
    buyNow: "Buy now",
    minBid: "Min bid",
    pendingEdition: "pending edition",
    pendingEditions: "pending editions",
    noTransfers: "No pending NFT transfers found for this account.",
    pendingOnDeSo: "pending on DeSo",
  },
  French: {
    marketplace: "VIA Marketplace",
    heading: "Marché",
    intro: "Enchères, offres actives et transferts en attente pour un compte DeSo. Les actions de transaction restent sur la page de détail du NFT, où VIA conserve le flux complet de confirmation.",
    collection: "Collection",
    receivedBids: "Enchères reçues",
    myBids: "Mes enchères",
    listings: "Offres",
    transfers: "Transferts",
    chooseAccount: "Choisir un compte DeSo",
    readOnly: "Il s’agit d’une consultation du marché en lecture seule. VIA ne signe ni ne dépense depuis ce formulaire.",
    placeholder: "Clé publique DeSo (BC1…)",
    openMarket: "Ouvrir le marché",
    loadError: "VIA ne peut pas charger l’état du marché pour ce compte DeSo pour le moment.",
    listedEdition: "édition proposée",
    listedEditions: "éditions proposées",
    noForSale: "Aucune édition NFT n’est actuellement en vente.",
    edition: "Édition",
    buyNow: "Acheter maintenant",
    minBid: "Enchère min.",
    pendingEdition: "édition en attente",
    pendingEditions: "éditions en attente",
    noTransfers: "Aucun transfert NFT en attente trouvé pour ce compte.",
    pendingOnDeSo: "en attente sur DeSo",
  },
  Spanish: {
    marketplace: "VIA Marketplace",
    heading: "Mercado",
    intro: "Pujas, anuncios activos y transferencias pendientes para una cuenta DeSo. Las acciones de transacción permanecen en la página de detalle del NFT, donde VIA mantiene el flujo completo de confirmación.",
    collection: "Colección",
    receivedBids: "Pujas recibidas",
    myBids: "Mis pujas",
    listings: "Anuncios",
    transfers: "Transferencias",
    chooseAccount: "Elige una cuenta DeSo",
    readOnly: "Esta es una consulta de mercado de solo lectura. VIA no firma ni gasta desde este formulario.",
    placeholder: "Clave pública DeSo (BC1…)",
    openMarket: "Abrir mercado",
    loadError: "VIA no puede cargar ahora el estado del mercado para esta cuenta DeSo.",
    listedEdition: "edición anunciada",
    listedEditions: "ediciones anunciadas",
    noForSale: "No hay ediciones NFT actualmente a la venta.",
    edition: "Edición",
    buyNow: "Comprar ahora",
    minBid: "Puja mínima",
    pendingEdition: "edición pendiente",
    pendingEditions: "ediciones pendientes",
    noTransfers: "No se encontraron transferencias NFT pendientes para esta cuenta.",
    pendingOnDeSo: "pendiente en DeSo",
  },
  Chinese: {
    marketplace: "VIA Marketplace",
    heading: "市场",
    intro: "查看一个 DeSo 账户的出价、在售项目和待处理转账。交易操作保留在 NFT 详情页，由 VIA 提供完整确认流程。",
    collection: "收藏",
    receivedBids: "收到的出价",
    myBids: "我的出价",
    listings: "在售项目",
    transfers: "转账",
    chooseAccount: "选择 DeSo 账户",
    readOnly: "这是只读市场查询。VIA 不会通过此表单签名或支出。",
    placeholder: "DeSo 公钥 (BC1…)",
    openMarket: "打开市场",
    loadError: "VIA 目前无法加载此 DeSo 账户的市场状态。",
    listedEdition: "个在售版本",
    listedEditions: "个在售版本",
    noForSale: "目前没有 NFT 版本在售。",
    edition: "版本",
    buyNow: "立即购买",
    minBid: "最低出价",
    pendingEdition: "个待处理版本",
    pendingEditions: "个待处理版本",
    noTransfers: "未找到此账户的待处理 NFT 转账。",
    pendingOnDeSo: "DeSo 上待处理",
  },
}

type Props = {
  kind: keyof Copy | "listedCount" | "pendingCount"
  count?: number
}

export default function MarketLocalizedText({ kind, count = 0 }: Props) {
  const [language, setLanguage] = useState<ViaLanguage>("English")

  useEffect(() => {
    const refresh = () => setLanguage(readViaLocalSettings().interfaceLanguage)
    refresh()
    window.addEventListener(VIA_SETTINGS_EVENT, refresh)
    return () => window.removeEventListener(VIA_SETTINGS_EVENT, refresh)
  }, [])

  const t = copy[language]
  if (kind === "listedCount") return <>{count} {count === 1 ? t.listedEdition : t.listedEditions}</>
  if (kind === "pendingCount") return <>{count} {count === 1 ? t.pendingEdition : t.pendingEditions}</>
  return <>{t[kind]}</>
}
