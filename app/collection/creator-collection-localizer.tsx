"use client"

import { useEffect } from "react"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"

type Copy = {
  exact: Record<string, string>
  patterns: Array<[RegExp, (...parts: string[]) => string]>
}

const COPY: Record<ViaLanguage, Copy> = {
  English: { exact: {}, patterns: [] },
  Dutch: {
    exact: {
      "VIA · NFT hub": "VIA · NFT-groep",
      "Everything NFT in one place": "Alles rond NFT's op één plek",
      "Browse collections, create and mint, buy or sell, manage bids and follow transfers without separate homepage groups.": "Bekijk collecties, maak en mint, koop of verkoop, beheer biedingen en volg transfers zonder aparte hoofdgroepen op de homepage.",
      "Collection": "Collectie",
      "Create & Mint": "Maken & minten",
      "Market": "Markt",
      "Received Bids": "Ontvangen biedingen",
      "My Bids": "Mijn biedingen",
      "Find NFT creator": "Zoek NFT-maker",
      "NFT collection": "NFT-collectie",
      "Explore public DeSo NFTs through VIA. Collection data is loaded read-only from the DeSo network.": "Ontdek openbare DeSo-NFTs via VIA. Collectiegegevens worden alleen-lezen geladen vanaf het DeSo-netwerk.",
      "Collection controls": "Collectiebediening",
      "Filter collection… title, creator or your own word": "Filter collectie… titel, maker of je eigen zoekwoord",
      "Sort": "Sorteren",
      "View": "Weergave",
      "Comfortable": "Comfortabel",
      "Compact": "Compact",
      "Price low–high": "Prijs laag–hoog",
      "Price high–low": "Prijs hoog–laag",
      "Reset controls": "Bediening resetten",
      "Active": "Actief",
      "Voice settings": "Spraakinstellingen",
      "Speech processing": "Spraakverwerking",
      "Voice": "Spraak",
      "Voice off": "Spraak uit",
      "Voice on": "Spraak aan",
      "Reset voice settings": "Spraakinstellingen resetten",
      "Not supported on this device": "Niet ondersteund op dit apparaat",
      "Search a public DeSo account and open its NFT collection.": "Zoek een openbaar DeSo-account en open de NFT-collectie.",
      "DeSo username": "DeSo-gebruikersnaam",
      "Checking…": "Controleren…",
      "Find creator": "Zoek maker",
      "Checking DeSo…": "DeSo controleren…",
      "Matching DeSo accounts": "Overeenkomende DeSo-accounts",
      "View public NFTs": "Bekijk openbare NFT's",
      "Try loading public NFTs again": "Probeer openbare NFT's opnieuw te laden",
      "Loading public NFTs…": "Openbare NFT's laden…",
      "Search by NFT title or creator": "Zoek op NFT-titel of maker",
      "Collection order": "Collectievolgorde",
      "Title A–Z": "Titel A–Z",
      "Most copies owned": "Meeste exemplaren in bezit",
      "Fewest copies owned": "Minste exemplaren in bezit",
      "Lowest price": "Laagste prijs",
      "Highest price": "Hoogste prijs",
      "Sale": "Verkoop",
      "All": "Alles",
      "For sale": "Te koop",
      "Not for sale": "Niet te koop",
      "Media": "Media",
      "Image": "Afbeelding",
      "Video": "Video",
      "Audio": "Audio",
      "Unavailable": "Niet beschikbaar",
      "Reset filters": "Filters wissen",
      "Link copied": "Link gekopieerd",
      "Copy collection link": "Kopieer collectielink",
      "Refreshing from DeSo…": "Vernieuwen vanaf DeSo…",
      "Refresh from DeSo": "Vernieuw vanaf DeSo",
      "Showing cached NFTs · refreshing from DeSo…": "Opgeslagen NFT's worden getoond · vernieuwen vanaf DeSo…",
      "Loading public NFTs from DeSo…": "Openbare NFT's laden vanaf DeSo…",
      "DeSo refresh status unavailable.": "DeSo-vernieuwingsstatus niet beschikbaar.",
    },
    patterns: [
      [/^Updated (.+)$/u, (time) => `Bijgewerkt ${time}`],
      [/^No public NFTs found for @(.+)\.$/u, (name) => `Geen openbare NFT's gevonden voor @${name}.`],
      [/^(\d+) of (\d+) public NFTs match\.$/u, (a, b) => `${a} van ${b} openbare NFT's komen overeen.`],
      [/^@(.+) owns (\d+) NFT (copy|copies) across (\d+) different NFT(s?)\.$/u, (name, copies, _unit, count) => `@${name} bezit ${copies} NFT-exemplaren verdeeld over ${count} verschillende NFT's.`],
      [/^@(.+) owns (\d+) of (\d+) (copy|copies)$/u, (name, owned, total) => `@${name} bezit ${owned} van ${total} exemplaren`],
      [/^(\d+) for sale$/u, (count) => `${count} te koop`],
      [/^(\d+) for sale · From (.+) DESO$/u, (count, price) => `${count} te koop · Vanaf ${price} DESO`],
      [/^Show next (\d+)$/u, (count) => `Toon volgende ${count}`],
      [/^The public NFTs could not be retrieved from DeSo right now\.$/u, () => "De openbare NFT's kunnen nu niet van DeSo worden opgehaald."],
      [/^Enter a DeSo username\.$/u, () => "Voer een DeSo-gebruikersnaam in."],
      [/^DeSo account not found\.$/u, () => "DeSo-account niet gevonden."],
      [/^The DeSo account could not be checked right now\.$/u, () => "Het DeSo-account kan nu niet worden gecontroleerd."],
    ],
  },
  French: {
    exact: {
      "VIA · NFT hub": "VIA · groupe NFT",
      "Everything NFT in one place": "Tout ce qui concerne les NFT au même endroit",
      "Browse collections, create and mint, buy or sell, manage bids and follow transfers without separate homepage groups.": "Parcourez les collections, créez et mintez, achetez ou vendez, gérez les offres et suivez les transferts sans groupes séparés sur la page d’accueil.",
      "Collection": "Collection",
      "Create & Mint": "Créer & minter",
      "Market": "Marché",
      "Received Bids": "Offres reçues",
      "My Bids": "Mes offres",
      "Find NFT creator": "Rechercher un créateur NFT",
      "NFT collection": "Collection NFT",
      "Explore public DeSo NFTs through VIA. Collection data is loaded read-only from the DeSo network.": "Explorez les NFT DeSo publics via VIA. Les données de collection sont chargées en lecture seule depuis le réseau DeSo.",
      "Collection controls": "Commandes de collection",
      "Filter collection… title, creator or your own word": "Filtrer la collection… titre, créateur ou votre propre mot",
      "Sort": "Trier",
      "View": "Affichage",
      "Comfortable": "Confortable",
      "Compact": "Compact",
      "Price low–high": "Prix croissant",
      "Price high–low": "Prix décroissant",
      "Reset controls": "Réinitialiser les commandes",
      "Active": "Actif",
      "Voice settings": "Paramètres vocaux",
      "Speech processing": "Traitement de la parole",
      "Voice": "Voix",
      "Voice off": "Voix désactivée",
      "Voice on": "Voix activée",
      "Reset voice settings": "Réinitialiser les paramètres vocaux",
      "Not supported on this device": "Non pris en charge sur cet appareil",
      "Search a public DeSo account and open its NFT collection.": "Recherchez un compte DeSo public et ouvrez sa collection NFT.",
      "DeSo username": "Nom d’utilisateur DeSo",
      "Checking…": "Vérification…",
      "Find creator": "Rechercher",
      "Checking DeSo…": "Vérification de DeSo…",
      "Matching DeSo accounts": "Comptes DeSo correspondants",
      "View public NFTs": "Voir les NFT publics",
      "Try loading public NFTs again": "Réessayer de charger les NFT publics",
      "Loading public NFTs…": "Chargement des NFT publics…",
      "Search by NFT title or creator": "Rechercher par titre NFT ou créateur",
      "Collection order": "Ordre de la collection",
      "Title A–Z": "Titre A–Z",
      "Most copies owned": "Plus d’exemplaires possédés",
      "Fewest copies owned": "Moins d’exemplaires possédés",
      "Lowest price": "Prix le plus bas",
      "Highest price": "Prix le plus élevé",
      "Sale": "Vente",
      "All": "Tout",
      "For sale": "À vendre",
      "Not for sale": "Pas à vendre",
      "Media": "Média",
      "Image": "Image",
      "Video": "Vidéo",
      "Audio": "Audio",
      "Unavailable": "Indisponible",
      "Reset filters": "Réinitialiser les filtres",
      "Link copied": "Lien copié",
      "Copy collection link": "Copier le lien de la collection",
      "Refreshing from DeSo…": "Actualisation depuis DeSo…",
      "Refresh from DeSo": "Actualiser depuis DeSo",
      "Showing cached NFTs · refreshing from DeSo…": "NFT en cache affichés · actualisation depuis DeSo…",
      "Loading public NFTs from DeSo…": "Chargement des NFT publics depuis DeSo…",
      "DeSo refresh status unavailable.": "État d’actualisation DeSo indisponible.",
    },
    patterns: [
      [/^Updated (.+)$/u, (time) => `Mis à jour ${time}`],
      [/^No public NFTs found for @(.+)\.$/u, (name) => `Aucun NFT public trouvé pour @${name}.`],
      [/^(\d+) of (\d+) public NFTs match\.$/u, (a, b) => `${a} sur ${b} NFT publics correspondent.`],
      [/^@(.+) owns (\d+) NFT (copy|copies) across (\d+) different NFT(s?)\.$/u, (name, copies, _unit, count) => `@${name} possède ${copies} exemplaires NFT répartis sur ${count} NFT différents.`],
      [/^@(.+) owns (\d+) of (\d+) (copy|copies)$/u, (name, owned, total) => `@${name} possède ${owned} sur ${total} exemplaires`],
      [/^(\d+) for sale$/u, (count) => `${count} à vendre`],
      [/^(\d+) for sale · From (.+) DESO$/u, (count, price) => `${count} à vendre · À partir de ${price} DESO`],
      [/^Show next (\d+)$/u, (count) => `Afficher les ${count} suivants`],
    ],
  },
  Spanish: {
    exact: {
      "VIA · NFT hub": "VIA · grupo NFT",
      "Everything NFT in one place": "Todo sobre NFT en un solo lugar",
      "Browse collections, create and mint, buy or sell, manage bids and follow transfers without separate homepage groups.": "Explora colecciones, crea y acuña, compra o vende, gestiona ofertas y sigue transferencias sin grupos separados en la página de inicio.",
      "Collection": "Colección",
      "Create & Mint": "Crear y acuñar",
      "Market": "Mercado",
      "Received Bids": "Ofertas recibidas",
      "My Bids": "Mis ofertas",
      "Find NFT creator": "Buscar creador NFT",
      "NFT collection": "Colección NFT",
      "Explore public DeSo NFTs through VIA. Collection data is loaded read-only from the DeSo network.": "Explora NFT públicos de DeSo mediante VIA. Los datos de la colección se cargan en modo de solo lectura desde la red DeSo.",
      "Collection controls": "Controles de colección",
      "Filter collection… title, creator or your own word": "Filtrar colección… título, creador o tu propia palabra",
      "Sort": "Ordenar",
      "View": "Vista",
      "Comfortable": "Cómoda",
      "Compact": "Compacta",
      "Price low–high": "Precio de menor a mayor",
      "Price high–low": "Precio de mayor a menor",
      "Reset controls": "Restablecer controles",
      "Active": "Activo",
      "Voice settings": "Ajustes de voz",
      "Speech processing": "Procesamiento de voz",
      "Voice": "Voz",
      "Voice off": "Voz desactivada",
      "Voice on": "Voz activada",
      "Reset voice settings": "Restablecer ajustes de voz",
      "Not supported on this device": "No compatible con este dispositivo",
      "Search a public DeSo account and open its NFT collection.": "Busca una cuenta pública de DeSo y abre su colección NFT.",
      "DeSo username": "Usuario de DeSo",
      "Checking…": "Comprobando…",
      "Find creator": "Buscar creador",
      "Checking DeSo…": "Comprobando DeSo…",
      "Matching DeSo accounts": "Cuentas DeSo coincidentes",
      "View public NFTs": "Ver NFT públicos",
      "Try loading public NFTs again": "Intentar cargar de nuevo los NFT públicos",
      "Loading public NFTs…": "Cargando NFT públicos…",
      "Search by NFT title or creator": "Buscar por título NFT o creador",
      "Collection order": "Orden de colección",
      "Title A–Z": "Título A–Z",
      "Most copies owned": "Más copias en propiedad",
      "Fewest copies owned": "Menos copias en propiedad",
      "Lowest price": "Precio más bajo",
      "Highest price": "Precio más alto",
      "Sale": "Venta",
      "All": "Todo",
      "For sale": "En venta",
      "Not for sale": "No está en venta",
      "Media": "Medios",
      "Image": "Imagen",
      "Video": "Vídeo",
      "Audio": "Audio",
      "Unavailable": "No disponible",
      "Reset filters": "Restablecer filtros",
      "Link copied": "Enlace copiado",
      "Copy collection link": "Copiar enlace de colección",
      "Refreshing from DeSo…": "Actualizando desde DeSo…",
      "Refresh from DeSo": "Actualizar desde DeSo",
      "Showing cached NFTs · refreshing from DeSo…": "Mostrando NFT en caché · actualizando desde DeSo…",
      "Loading public NFTs from DeSo…": "Cargando NFT públicos desde DeSo…",
      "DeSo refresh status unavailable.": "Estado de actualización de DeSo no disponible.",
    },
    patterns: [
      [/^Updated (.+)$/u, (time) => `Actualizado ${time}`],
      [/^No public NFTs found for @(.+)\.$/u, (name) => `No se encontraron NFT públicos para @${name}.`],
      [/^(\d+) of (\d+) public NFTs match\.$/u, (a, b) => `${a} de ${b} NFT públicos coinciden.`],
      [/^@(.+) owns (\d+) NFT (copy|copies) across (\d+) different NFT(s?)\.$/u, (name, copies, _unit, count) => `@${name} posee ${copies} copias NFT repartidas entre ${count} NFT diferentes.`],
      [/^@(.+) owns (\d+) of (\d+) (copy|copies)$/u, (name, owned, total) => `@${name} posee ${owned} de ${total} copias`],
      [/^(\d+) for sale$/u, (count) => `${count} en venta`],
      [/^(\d+) for sale · From (.+) DESO$/u, (count, price) => `${count} en venta · Desde ${price} DESO`],
      [/^Show next (\d+)$/u, (count) => `Mostrar los siguientes ${count}`],
    ],
  },
  Chinese: {
    exact: {
      "VIA · NFT hub": "VIA · NFT 分组",
      "Everything NFT in one place": "所有 NFT 功能集中在一处",
      "Browse collections, create and mint, buy or sell, manage bids and follow transfers without separate homepage groups.": "浏览收藏、创建和铸造、买卖、管理出价并跟踪转移，不再把这些功能拆成独立的主页分组。",
      "Collection": "收藏",
      "Create & Mint": "创建与铸造",
      "Market": "市场",
      "Received Bids": "收到的出价",
      "My Bids": "我的出价",
      "Find NFT creator": "查找 NFT 创作者",
      "NFT collection": "NFT 收藏",
      "Explore public DeSo NFTs through VIA. Collection data is loaded read-only from the DeSo network.": "通过 VIA 浏览公开的 DeSo NFT。收藏数据以只读方式从 DeSo 网络加载。",
      "Collection controls": "收藏控制",
      "Filter collection… title, creator or your own word": "筛选收藏… 标题、创作者或自定义关键词",
      "Sort": "排序",
      "View": "视图",
      "Comfortable": "舒适",
      "Compact": "紧凑",
      "Price low–high": "价格从低到高",
      "Price high–low": "价格从高到低",
      "Reset controls": "重置控制",
      "Active": "已启用",
      "Voice settings": "语音设置",
      "Speech processing": "语音处理",
      "Voice": "语音",
      "Voice off": "语音关闭",
      "Voice on": "语音开启",
      "Reset voice settings": "重置语音设置",
      "Not supported on this device": "此设备不支持",
      "Search a public DeSo account and open its NFT collection.": "搜索公开的 DeSo 账户并打开其 NFT 收藏。",
      "DeSo username": "DeSo 用户名",
      "Checking…": "正在检查…",
      "Find creator": "查找创作者",
      "Checking DeSo…": "正在检查 DeSo…",
      "Matching DeSo accounts": "匹配的 DeSo 账户",
      "View public NFTs": "查看公开 NFT",
      "Try loading public NFTs again": "重新加载公开 NFT",
      "Loading public NFTs…": "正在加载公开 NFT…",
      "Search by NFT title or creator": "按 NFT 标题或创作者搜索",
      "Collection order": "收藏顺序",
      "Title A–Z": "标题 A–Z",
      "Most copies owned": "持有副本最多",
      "Fewest copies owned": "持有副本最少",
      "Lowest price": "最低价格",
      "Highest price": "最高价格",
      "Sale": "销售",
      "All": "全部",
      "For sale": "出售中",
      "Not for sale": "未出售",
      "Media": "媒体",
      "Image": "图片",
      "Video": "视频",
      "Audio": "音频",
      "Unavailable": "不可用",
      "Reset filters": "重置筛选",
      "Link copied": "链接已复制",
      "Copy collection link": "复制收藏链接",
      "Refreshing from DeSo…": "正在从 DeSo 刷新…",
      "Refresh from DeSo": "从 DeSo 刷新",
      "Showing cached NFTs · refreshing from DeSo…": "显示缓存 NFT · 正在从 DeSo 刷新…",
      "Loading public NFTs from DeSo…": "正在从 DeSo 加载公开 NFT…",
      "DeSo refresh status unavailable.": "DeSo 刷新状态不可用。",
    },
    patterns: [
      [/^Updated (.+)$/u, (time) => `更新时间 ${time}`],
      [/^No public NFTs found for @(.+)\.$/u, (name) => `未找到 @${name} 的公开 NFT。`],
      [/^(\d+) of (\d+) public NFTs match\.$/u, (a, b) => `${b} 个公开 NFT 中有 ${a} 个匹配。`],
      [/^@(.+) owns (\d+) NFT (copy|copies) across (\d+) different NFT(s?)\.$/u, (name, copies, _unit, count) => `@${name} 持有 ${copies} 个 NFT 副本，分布于 ${count} 个不同 NFT。`],
      [/^@(.+) owns (\d+) of (\d+) (copy|copies)$/u, (name, owned, total) => `@${name} 持有 ${owned}/${total} 个副本`],
      [/^(\d+) for sale$/u, (count) => `${count} 个出售中`],
      [/^(\d+) for sale · From (.+) DESO$/u, (count, price) => `${count} 个出售中 · ${price} DESO 起`],
      [/^Show next (\d+)$/u, (count) => `显示接下来的 ${count} 个`],
    ],
  },
  // Hindi currently falls back to English here until this surface receives its full Hindi copy.
  Hindi: { exact: {}, patterns: [] },
}

const textSource = new WeakMap<Text, string>()
const attributeSource = new WeakMap<Element, Map<string, string>>()

function translate(source: string, copy: Copy) {
  const exact = copy.exact[source]
  if (exact !== undefined) return exact
  for (const [pattern, replacement] of copy.patterns) {
    const match = source.match(pattern)
    if (match) return replacement(...match.slice(1))
  }
  return source
}

function translateRoot(root: HTMLElement, language: ViaLanguage) {
  const copy = COPY[language]
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()
  while (node) {
    const textNode = node as Text
    const current = textNode.nodeValue ?? ""
    const trimmed = current.trim()
    if (trimmed) {
      const source = textSource.get(textNode) ?? trimmed
      if (!textSource.has(textNode)) textSource.set(textNode, source)
      const next = language === "English" ? source : translate(source, copy)
      if (trimmed !== next) {
        const leading = current.slice(0, current.length - current.trimStart().length)
        const trailing = current.slice(current.trimEnd().length)
        textNode.nodeValue = `${leading}${next}${trailing}`
      }
    }
    node = walker.nextNode()
  }

  for (const element of Array.from(root.querySelectorAll<HTMLElement>("[placeholder], [aria-label], [title]"))) {
    for (const attribute of ["placeholder", "aria-label", "title"] as const) {
      const current = element.getAttribute(attribute)
      if (!current) continue
      let originals = attributeSource.get(element)
      if (!originals) {
        originals = new Map<string, string>()
        attributeSource.set(element, originals)
      }
      const source = originals.get(attribute) ?? current
      if (!originals.has(attribute)) originals.set(attribute, source)
      const next = language === "English" ? source : translate(source, copy)
      if (next !== current) element.setAttribute(attribute, next)
    }
  }
}

export default function CreatorCollectionLocalizer() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-via-collection-page]")
    if (!root) return

    let queued = false
    const apply = () => {
      queued = false
      translateRoot(root, readViaLocalSettings().interfaceLanguage)
    }
    const schedule = () => {
      if (queued) return
      queued = true
      window.requestAnimationFrame(apply)
    }

    apply()
    const observer = new MutationObserver(schedule)
    observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["placeholder", "aria-label", "title"] })
    window.addEventListener(VIA_SETTINGS_EVENT, schedule)
    window.addEventListener("storage", schedule)
    return () => {
      observer.disconnect()
      window.removeEventListener(VIA_SETTINGS_EVENT, schedule)
      window.removeEventListener("storage", schedule)
    }
  }, [])

  return null
}
