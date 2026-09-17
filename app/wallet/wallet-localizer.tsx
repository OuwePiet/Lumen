"use client"

import { useEffect } from "react"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"

type Copy = Record<string, string>

const dutch: Copy = {
  "Your DeSo wallet": "Je DeSo-wallet",
  "Read-only wallet information for the DeSo account currently connected to VIA.": "Alleen-lezen walletinformatie voor het DeSo-account dat momenteel met VIA is verbonden.",
  "Back to My VIA": "Terug naar Mijn VIA",
  "No DeSo account connected": "Geen DeSo-account verbonden",
  "Use the VIA account button above to log in with DeSo Identity.": "Gebruik de VIA-accountknop hierboven om in te loggen met DeSo Identity.",
  "Loading wallet…": "Wallet laden…",
  "Wallet balance is temporarily unavailable.": "Walletsaldo is tijdelijk niet beschikbaar.",
  "Showing the last available wallet data.": "De laatst beschikbare walletgegevens worden getoond.",
  "Available balance": "Beschikbaar saldo",
  "Balances are read directly from DeSo. VIA does not hold these funds or coins.": "Saldi worden rechtstreeks uit DeSo gelezen. VIA bewaart deze tegoeden of coins niet.",
  "Creator coins · Bought": "Creator coins · Gekocht",
  "Creator coins · Received": "Creator coins · Ontvangen",
  "No creator coins in this category.": "Geen creator coins in deze categorie.",
  "Public key": "Publieke sleutel",
  "Copied": "Gekopieerd",
  "Copy public key": "Kopieer publieke sleutel",
  "Wallet boundary": "Walletgrens",
  "This page is deliberately read-only. Send, buy, swap and withdrawal actions are not exposed here until each transaction flow is separately verified with DeSo Identity approval.": "Deze pagina is bewust alleen-lezen. Verzenden, kopen, swappen en opnemen worden hier pas beschikbaar nadat iedere transactiestroom afzonderlijk is geverifieerd met goedkeuring via DeSo Identity."
}

const french: Copy = {
  "Your DeSo wallet": "Votre portefeuille DeSo",
  "Read-only wallet information for the DeSo account currently connected to VIA.": "Informations en lecture seule pour le compte DeSo actuellement connecté à VIA.",
  "Back to My VIA": "Retour à Mon VIA",
  "No DeSo account connected": "Aucun compte DeSo connecté",
  "Loading wallet…": "Chargement du portefeuille…",
  "Available balance": "Solde disponible",
  "Public key": "Clé publique",
  "Copied": "Copié",
  "Copy public key": "Copier la clé publique",
  "Wallet boundary": "Limites du portefeuille"
}

const spanish: Copy = {
  "Your DeSo wallet": "Tu billetera DeSo",
  "Read-only wallet information for the DeSo account currently connected to VIA.": "Información de solo lectura de la cuenta DeSo conectada actualmente a VIA.",
  "Back to My VIA": "Volver a Mi VIA",
  "No DeSo account connected": "No hay ninguna cuenta DeSo conectada",
  "Loading wallet…": "Cargando billetera…",
  "Available balance": "Saldo disponible",
  "Public key": "Clave pública",
  "Copied": "Copiado",
  "Copy public key": "Copiar clave pública",
  "Wallet boundary": "Límite de la billetera"
}

const chinese: Copy = {
  "Your DeSo wallet": "你的 DeSo 钱包",
  "Read-only wallet information for the DeSo account currently connected to VIA.": "当前连接到 VIA 的 DeSo 账户只读钱包信息。",
  "Back to My VIA": "返回我的 VIA",
  "No DeSo account connected": "未连接 DeSo 账户",
  "Loading wallet…": "正在加载钱包…",
  "Available balance": "可用余额",
  "Public key": "公钥",
  "Copied": "已复制",
  "Copy public key": "复制公钥",
  "Wallet boundary": "钱包边界"
}

const dictionaries: Record<ViaLanguage, Copy> = {
  English: {},
  Dutch: dutch,
  French: french,
  Spanish: spanish,
  Chinese: chinese,
}

const reverse = new Map<string, string>()
for (const dictionary of Object.values(dictionaries)) {
  for (const [english, localized] of Object.entries(dictionary)) reverse.set(localized, english)
}

function dynamicTranslation(value: string, language: ViaLanguage) {
  if (language === "English") return value
  const lastUpdated = value.match(/^Last updated (.+)$/)
  if (lastUpdated) {
    const prefix: Record<Exclude<ViaLanguage, "English">, string> = {
      Dutch: "Laatst bijgewerkt",
      French: "Dernière mise à jour",
      Spanish: "Última actualización",
      Chinese: "上次更新",
    }
    return `${prefix[language]} ${lastUpdated[1]}`
  }
  const creatorCoins = value.match(/^(\d+) creator coins$/)
  if (creatorCoins) {
    const label: Record<Exclude<ViaLanguage, "English">, string> = {
      Dutch: "creator coins",
      French: "creator coins",
      Spanish: "creator coins",
      Chinese: "创作者币",
    }
    return `${creatorCoins[1]} ${label[language]}`
  }
  const bought = value.match(/^(\d+) bought$/)
  if (bought) {
    const label: Record<Exclude<ViaLanguage, "English">, string> = { Dutch: "gekocht", French: "achetés", Spanish: "comprados", Chinese: "已购买" }
    return `${bought[1]} ${label[language]}`
  }
  const received = value.match(/^(\d+) received$/)
  if (received) {
    const label: Record<Exclude<ViaLanguage, "English">, string> = { Dutch: "ontvangen", French: "reçus", Spanish: "recibidos", Chinese: "已收到" }
    return `${received[1]} ${label[language]}`
  }
  const coins = value.match(/^(.+) coins$/)
  if (coins && language === "Chinese") return `${coins[1]} 枚币`
  return value
}

function translateText(value: string, language: ViaLanguage) {
  const canonical = reverse.get(value) ?? value
  const direct = dictionaries[language][canonical]
  return direct ?? dynamicTranslation(canonical, language)
}

function apply(root: HTMLElement, language: ViaLanguage) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()
  while (node) {
    const raw = node.nodeValue ?? ""
    const trimmed = raw.trim()
    if (trimmed) {
      const next = translateText(trimmed, language)
      if (next !== trimmed) node.nodeValue = raw.replace(trimmed, next)
    }
    node = walker.nextNode()
  }
}

export default function WalletLocalizer() {
  useEffect(() => {
    if (window.location.pathname !== "/wallet") return
    const root = document.querySelector("main")
    if (!(root instanceof HTMLElement)) return
    let observer: MutationObserver | null = null
    const refresh = () => {
      observer?.disconnect()
      apply(root, readViaLocalSettings().interfaceLanguage)
      observer?.observe(root, { subtree: true, childList: true, characterData: true })
    }
    observer = new MutationObserver(refresh)
    refresh()
    window.addEventListener(VIA_SETTINGS_EVENT, refresh)
    return () => {
      observer?.disconnect()
      window.removeEventListener(VIA_SETTINGS_EVENT, refresh)
    }
  }, [])
  return null
}
