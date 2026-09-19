"use client"

import { useEffect } from "react"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"

const en = {
  "NFT mint preflight": "NFT mint preflight",
  "Set terms. Check live cost. Approve later.": "Set terms. Check live cost. Approve later.",
  "VIA uses DeSo's native create-nft constructor. This visible step only prepares an unsigned transaction to read the current fee/spend context; it cannot sign, broadcast, charge or mint.": "VIA uses DeSo's native create-nft constructor. This visible step only prepares an unsigned transaction to read the current fee/spend context; it cannot sign, broadcast, charge or mint.",
  "No blockchain write": "No blockchain write",
  "Log in with DeSo Identity first. VIA will use only the active public key for this preflight.": "Log in with DeSo Identity first. VIA will use only the active public key for this preflight.",
  "Active DeSo Identity:": "Active DeSo Identity:",
  "NFT post hash": "NFT post hash",
  "64-character DeSo post hash": "64-character DeSo post hash",
  "Copies": "Copies",
  "Creator royalty": "Creator royalty",
  "100 basis points = 1%. Creator + coin royalty may not exceed 100%.": "100 basis points = 1%. Creator + coin royalty may not exceed 100%.",
  "Coin royalty": "Coin royalty",
  "Optional creator-coin royalty, entered in basis points.": "Optional creator-coin royalty, entered in basis points.",
  "Offer for sale": "Offer for sale",
  "Buy Now": "Buy Now",
  "Has unlockable": "Has unlockable",
  "Minimum bid": "Minimum bid",
  "DeSo nanos; 1 DESO = 1,000,000,000 nanos. No fiat conversion is assumed here.": "DeSo nanos; 1 DESO = 1,000,000,000 nanos. No fiat conversion is assumed here.",
  "Buy Now price": "Buy Now price",
  "DeSo nanos; VIA does not treat this as an EUR/USD checkout price.": "DeSo nanos; VIA does not treat this as an EUR/USD checkout price.",
  "Log in with DeSo Identity to request a mint quote.": "Log in with DeSo Identity to request a mint quote.",
  "Enter a valid 64-character DeSo NFT post hash.": "Enter a valid 64-character DeSo NFT post hash.",
  "Copies must be a whole number from 1 to 10,000.": "Copies must be a whole number from 1 to 10,000.",
  "Prices and royalties must be non-negative whole numbers.": "Prices and royalties must be non-negative whole numbers.",
  "Creator and coin royalties together cannot exceed 100%.": "Creator and coin royalties together cannot exceed 100%.",
  "Buy Now requires a sale price above zero and cannot be combined with unlockable content in this flow.": "Buy Now requires a sale price above zero and cannot be combined with unlockable content in this flow.",
  "Checking current DeSo cost…": "Checking current DeSo cost…",
  "Check current mint cost": "Check current mint cost",
  "Retrying…": "Retrying…",
  "Retry current quote": "Retry current quote",
  "Enter mint terms to request a fresh DeSo constructor quote.": "Enter mint terms to request a fresh DeSo constructor quote.",
  "Terms changed. Refresh the DeSo quote before approval.": "Terms changed. Refresh the DeSo quote before approval.",
  "Requesting current DeSo mint fee and spend context…": "Requesting current DeSo mint fee and spend context…",
  "Fresh unsigned DeSo mint quote loaded. Nothing has been signed or submitted.": "Fresh unsigned DeSo mint quote loaded. Nothing has been signed or submitted.",
  "Preflight stopped: quote account did not match the active DeSo Identity.": "Preflight stopped: quote account did not match the active DeSo Identity.",
  "Preflight stopped: current DeSo quote could not be loaded.": "Preflight stopped: current DeSo quote could not be loaded.",
  "Quote safety checks passed: supported contract, trusted DeSo constructor source, active Identity matched, quote owner matched, device clock acceptable and quote still fresh. This is preflight readiness only; no mint has been signed or submitted.": "Quote safety checks passed: supported contract, trusted DeSo constructor source, active Identity matched, quote owner matched, device clock acceptable and quote still fresh. This is preflight readiness only; no mint has been signed or submitted.",
  "Preflight status": "Preflight status",
  "Fresh · account matched": "Fresh · account matched",
  "Mint terms confirmed by DeSo preflight": "Mint terms confirmed by DeSo preflight",
  "Sale": "Sale",
  "Auction / bids": "Auction / bids",
  "Not for sale": "Not for sale",
  "Unlockable": "Unlockable",
  "Yes": "Yes",
  "No": "No",
  "Not applicable": "Not applicable",
  "Post hash": "Post hash",
  "Network fee": "Network fee",
  "Spend amount": "Spend amount",
  "VIA service fee": "VIA service fee",
  "Visible cost boundary": "Visible cost boundary",
  "Network fee + constructor spend + VIA service fee. Storage/provider costs are not included unless separately resolved.": "Network fee + constructor spend + VIA service fee. Storage/provider costs are not included unless separately resolved.",
  "Quote valid until": "Quote valid until",
  "Quote created": "Quote created",
  "Server TTL": "Server TTL",
  "Server clock": "Server clock",
  "Device clock difference": "Device clock difference",
  "Quote source": "Quote source",
  "Quote contract": "Quote contract",
  "Quote reference": "Quote reference",
  "Unavailable": "Unavailable",
  "supported": "supported",
  "unsupported": "unsupported",
  "This mint quote uses an unsupported VIA quote contract and cannot become approval-ready.": "This mint quote uses an unsupported VIA quote contract and cannot become approval-ready.",
  "Your device clock differs from VIA server time by more than one minute. Correct the device clock, then request a fresh quote.": "Your device clock differs from VIA server time by more than one minute. Correct the device clock, then request a fresh quote.",
  "The active DeSo Identity changed after this quote was created. This quote is no longer valid for approval.": "The active DeSo Identity changed after this quote was created. This quote is no longer valid for approval.",
  "This mint quote has expired. Refresh the current DeSo cost before approval.": "This mint quote has expired. Refresh the current DeSo cost before approval.",
  "Refreshing…": "Refreshing…",
  "Request fresh quote": "Request fresh quote",
  "Quote active account": "Quote active account",
  "Refresh quote": "Refresh quote",
  "Any changed mint term invalidates the displayed quote. Before approval, VIA refreshes the exact mint transaction and requires DeSo Identity confirmation. Payment/provider checkout remain separate from this native mint flow; NFT transfer is handled by the released owner controls on NFT detail.": "Any changed mint term invalidates the displayed quote. Before approval, VIA refreshes the exact mint transaction and requires DeSo Identity confirmation. Payment/provider checkout remain separate from this native mint flow; NFT transfer is handled by the released owner controls on NFT detail.",
  "Clear quote": "Clear quote",
  "Preparing mint…": "Preparing mint…",
  "Review in DeSo…": "Review in DeSo…",
  "Submitting…": "Submitting…",
  "Review & mint in DeSo": "Review & mint in DeSo",
  "DeSo Identity changed. The previous mint approval was closed; request a fresh quote and approval.": "DeSo Identity changed. The previous mint approval was closed; request a fresh quote and approval.",
  "Submitting approved mint to DeSo…": "Submitting approved mint to DeSo…",
  "NFT mint submitted to DeSo.": "NFT mint submitted to DeSo.",
  "The approved NFT mint could not be submitted. VIA changed nothing.": "The approved NFT mint could not be submitted. VIA changed nothing.",
  "Mint terms changed. The previous DeSo approval was closed; request a fresh quote and approval.": "Mint terms changed. The previous DeSo approval was closed; request a fresh quote and approval.",
  "Refreshing exact DeSo mint transaction for approval…": "Refreshing exact DeSo mint transaction for approval…",
  "DeSo approval was closed. Nothing was minted.": "DeSo approval was closed. Nothing was minted.",
  "Review the freshly prepared NFT mint in DeSo Identity. VIA submits only after your approval.": "Review the freshly prepared NFT mint in DeSo Identity. VIA submits only after your approval.",
  "Approval window was blocked. Nothing was minted.": "Approval window was blocked. Nothing was minted.",
  "The NFT mint could not be prepared. Nothing was minted.": "The NFT mint could not be prepared. Nothing was minted.",
  "Mint quote cleared. Enter or confirm terms, then request a fresh DeSo quote.": "Mint quote cleared. Enter or confirm terms, then request a fresh DeSo quote."
} as const

type Phrase = keyof typeof en

type Dictionary = Record<Phrase, string>

const nl: Dictionary = {
  ...en,
  "NFT mint preflight": "NFT-mintcontrole",
  "Set terms. Check live cost. Approve later.": "Stel voorwaarden in. Controleer live kosten. Keur daarna goed.",
  "VIA uses DeSo's native create-nft constructor. This visible step only prepares an unsigned transaction to read the current fee/spend context; it cannot sign, broadcast, charge or mint.": "VIA gebruikt DeSo's native create-nft-constructor. Deze zichtbare stap maakt alleen een ongetekende transactie om de actuele fee- en kostencontext te lezen; hij kan niet ondertekenen, uitzenden, afschrijven of minten.",
  "No blockchain write": "Geen blockchain-schrijfactie",
  "Log in with DeSo Identity first. VIA will use only the active public key for this preflight.": "Log eerst in met DeSo Identity. VIA gebruikt voor deze controle alleen de actieve openbare sleutel.",
  "Active DeSo Identity:": "Actieve DeSo Identity:",
  "NFT post hash": "NFT-posthash",
  "64-character DeSo post hash": "DeSo-posthash van 64 tekens",
  "Copies": "Exemplaren",
  "Creator royalty": "Creator-royalty",
  "100 basis points = 1%. Creator + coin royalty may not exceed 100%.": "100 basispunten = 1%. Creator- en coin-royalty mogen samen niet boven 100% uitkomen.",
  "Coin royalty": "Coin-royalty",
  "Optional creator-coin royalty, entered in basis points.": "Optionele creator-coin-royalty, ingevoerd in basispunten.",
  "Offer for sale": "Te koop aanbieden",
  "Buy Now": "Nu kopen",
  "Has unlockable": "Heeft unlockable",
  "Minimum bid": "Minimumbod",
  "DeSo nanos; 1 DESO = 1,000,000,000 nanos. No fiat conversion is assumed here.": "DeSo-nanos; 1 DESO = 1.000.000.000 nanos. Hier wordt geen fiat-omrekening verondersteld.",
  "Buy Now price": "Nu-kopenprijs",
  "DeSo nanos; VIA does not treat this as an EUR/USD checkout price.": "DeSo-nanos; VIA behandelt dit niet als een EUR/USD-afrekenprijs.",
  "Log in with DeSo Identity to request a mint quote.": "Log in met DeSo Identity om een mintofferte op te vragen.",
  "Enter a valid 64-character DeSo NFT post hash.": "Voer een geldige DeSo NFT-posthash van 64 tekens in.",
  "Copies must be a whole number from 1 to 10,000.": "Het aantal exemplaren moet een geheel getal van 1 tot 10.000 zijn.",
  "Prices and royalties must be non-negative whole numbers.": "Prijzen en royalties moeten niet-negatieve gehele getallen zijn.",
  "Creator and coin royalties together cannot exceed 100%.": "Creator- en coin-royalties mogen samen niet hoger zijn dan 100%.",
  "Buy Now requires a sale price above zero and cannot be combined with unlockable content in this flow.": "Nu kopen vereist een verkoopprijs boven nul en kan in deze flow niet met unlockable content worden gecombineerd.",
  "Checking current DeSo cost…": "Actuele DeSo-kosten controleren…",
  "Check current mint cost": "Actuele mintkosten controleren",
  "Retrying…": "Opnieuw proberen…",
  "Retry current quote": "Actuele offerte opnieuw proberen",
  "Enter mint terms to request a fresh DeSo constructor quote.": "Voer mintvoorwaarden in om een nieuwe DeSo-constructorofferte op te vragen.",
  "Terms changed. Refresh the DeSo quote before approval.": "Voorwaarden gewijzigd. Vernieuw de DeSo-offerte vóór goedkeuring.",
  "Requesting current DeSo mint fee and spend context…": "Actuele DeSo-mintfee en kostencontext opvragen…",
  "Fresh unsigned DeSo mint quote loaded. Nothing has been signed or submitted.": "Nieuwe ongetekende DeSo-mintofferte geladen. Er is niets ondertekend of verzonden.",
  "Preflight stopped: quote account did not match the active DeSo Identity.": "Controle gestopt: het offerte-account kwam niet overeen met de actieve DeSo Identity.",
  "Preflight stopped: current DeSo quote could not be loaded.": "Controle gestopt: de actuele DeSo-offerte kon niet worden geladen.",
  "Quote safety checks passed: supported contract, trusted DeSo constructor source, active Identity matched, quote owner matched, device clock acceptable and quote still fresh. This is preflight readiness only; no mint has been signed or submitted.": "Veiligheidscontroles geslaagd: ondersteund contract, vertrouwde DeSo-constructorbron, actieve Identity en offerte-eigenaar komen overeen, apparaatklok is acceptabel en de offerte is nog geldig. Dit is alleen gereedheid voor controle; er is niets ondertekend of verzonden.",
  "Preflight status": "Controlestatus",
  "Fresh · account matched": "Actueel · account komt overeen",
  "Mint terms confirmed by DeSo preflight": "Mintvoorwaarden bevestigd door DeSo-controle",
  "Sale": "Verkoop",
  "Auction / bids": "Veiling / biedingen",
  "Not for sale": "Niet te koop",
  "Unlockable": "Unlockable",
  "Yes": "Ja",
  "No": "Nee",
  "Not applicable": "Niet van toepassing",
  "Post hash": "Posthash",
  "Network fee": "Netwerkfee",
  "Spend amount": "Te besteden bedrag",
  "VIA service fee": "VIA-servicefee",
  "Visible cost boundary": "Zichtbare kostengrens",
  "Network fee + constructor spend + VIA service fee. Storage/provider costs are not included unless separately resolved.": "Netwerkfee + constructor-uitgave + VIA-servicefee. Opslag-/providerkosten zijn niet inbegrepen tenzij die apart zijn vastgesteld.",
  "Quote valid until": "Offerte geldig tot",
  "Quote created": "Offerte aangemaakt",
  "Server TTL": "Server-TTL",
  "Server clock": "Serverklok",
  "Device clock difference": "Verschil apparaatklok",
  "Quote source": "Offertebron",
  "Quote contract": "Offertecontract",
  "Quote reference": "Offertreferentie",
  "Unavailable": "Niet beschikbaar",
  "supported": "ondersteund",
  "unsupported": "niet ondersteund",
  "This mint quote uses an unsupported VIA quote contract and cannot become approval-ready.": "Deze mintofferte gebruikt een niet-ondersteund VIA-offertecontract en kan niet gereed worden voor goedkeuring.",
  "Your device clock differs from VIA server time by more than one minute. Correct the device clock, then request a fresh quote.": "De klok van je apparaat wijkt meer dan één minuut af van de VIA-servertijd. Corrigeer de klok en vraag daarna een nieuwe offerte aan.",
  "The active DeSo Identity changed after this quote was created. This quote is no longer valid for approval.": "De actieve DeSo Identity is gewijzigd nadat deze offerte is gemaakt. Deze offerte is niet meer geldig voor goedkeuring.",
  "This mint quote has expired. Refresh the current DeSo cost before approval.": "Deze mintofferte is verlopen. Vernieuw de actuele DeSo-kosten vóór goedkeuring.",
  "Refreshing…": "Vernieuwen…",
  "Request fresh quote": "Nieuwe offerte aanvragen",
  "Quote active account": "Offerte voor actief account",
  "Refresh quote": "Offerte vernieuwen",
  "Any changed mint term invalidates the displayed quote. Before approval, VIA refreshes the exact mint transaction and requires DeSo Identity confirmation. Payment/provider checkout remain separate from this native mint flow; NFT transfer is handled by the released owner controls on NFT detail.": "Elke wijziging in de mintvoorwaarden maakt de getoonde offerte ongeldig. Voor goedkeuring vernieuwt VIA de exacte minttransactie en is bevestiging via DeSo Identity vereist. Betaling/provider-checkout blijft gescheiden van deze native mintflow; NFT-overdracht wordt afgehandeld via de vrijgegeven eigenaarsfuncties op NFT-detail.",
  "Clear quote": "Offerte wissen",
  "Preparing mint…": "Mint voorbereiden…",
  "Review in DeSo…": "Controleren in DeSo…",
  "Submitting…": "Verzenden…",
  "Review & mint in DeSo": "Controleren & minten in DeSo",
  "DeSo Identity changed. The previous mint approval was closed; request a fresh quote and approval.": "DeSo Identity is gewijzigd. De vorige mintgoedkeuring is gesloten; vraag een nieuwe offerte en goedkeuring aan.",
  "Submitting approved mint to DeSo…": "Goedgekeurde mint naar DeSo verzenden…",
  "NFT mint submitted to DeSo.": "NFT-mint naar DeSo verzonden.",
  "The approved NFT mint could not be submitted. VIA changed nothing.": "De goedgekeurde NFT-mint kon niet worden verzonden. VIA heeft niets gewijzigd.",
  "Mint terms changed. The previous DeSo approval was closed; request a fresh quote and approval.": "Mintvoorwaarden gewijzigd. De vorige DeSo-goedkeuring is gesloten; vraag een nieuwe offerte en goedkeuring aan.",
  "Refreshing exact DeSo mint transaction for approval…": "Exacte DeSo-minttransactie vernieuwen voor goedkeuring…",
  "DeSo approval was closed. Nothing was minted.": "DeSo-goedkeuring is gesloten. Er is niets gemint.",
  "Review the freshly prepared NFT mint in DeSo Identity. VIA submits only after your approval.": "Controleer de nieuw voorbereide NFT-mint in DeSo Identity. VIA verzendt pas na jouw goedkeuring.",
  "Approval window was blocked. Nothing was minted.": "Het goedkeuringsvenster is geblokkeerd. Er is niets gemint.",
  "The NFT mint could not be prepared. Nothing was minted.": "De NFT-mint kon niet worden voorbereid. Er is niets gemint.",
  "Mint quote cleared. Enter or confirm terms, then request a fresh DeSo quote.": "Mintofferte gewist. Voer de voorwaarden in of bevestig ze en vraag daarna een nieuwe DeSo-offerte aan."
}

const simpleOverrides: Record<Exclude<ViaLanguage, "Dutch" | "English">, Partial<Dictionary>> = {
  French: {
    "NFT mint preflight": "Contrôle avant mint NFT", "Set terms. Check live cost. Approve later.": "Définissez les conditions. Vérifiez le coût en direct. Approuvez ensuite.", "No blockchain write": "Aucune écriture blockchain", "Copies": "Exemplaires", "Creator royalty": "Royalty créateur", "Coin royalty": "Royalty coin", "Offer for sale": "Mettre en vente", "Buy Now": "Acheter maintenant", "Has unlockable": "Contenu déverrouillable", "Minimum bid": "Enchère minimale", "Buy Now price": "Prix d'achat immédiat", "Checking current DeSo cost…": "Vérification du coût DeSo…", "Check current mint cost": "Vérifier le coût du mint", "Preflight status": "État du contrôle", "Fresh · account matched": "Récent · compte correspondant", "Sale": "Vente", "Not for sale": "Pas à vendre", "Yes": "Oui", "No": "Non", "Network fee": "Frais réseau", "Spend amount": "Montant dépensé", "VIA service fee": "Frais de service VIA", "Quote valid until": "Devis valable jusqu'à", "Quote created": "Devis créé", "Server clock": "Horloge serveur", "Device clock difference": "Écart de l'horloge de l'appareil", "Quote source": "Source du devis", "Quote contract": "Contrat du devis", "Quote reference": "Référence du devis", "Unavailable": "Indisponible", "Request fresh quote": "Demander un nouveau devis", "Refresh quote": "Actualiser le devis", "Clear quote": "Effacer le devis", "Preparing mint…": "Préparation du mint…", "Review in DeSo…": "Vérifier dans DeSo…", "Submitting…": "Envoi…", "Review & mint in DeSo": "Vérifier et minter dans DeSo"
  },
  Spanish: {
    "NFT mint preflight": "Comprobación previa del mint NFT", "Set terms. Check live cost. Approve later.": "Define las condiciones. Comprueba el coste en vivo. Aprueba después.", "No blockchain write": "Sin escritura en blockchain", "Copies": "Copias", "Creator royalty": "Royalty del creador", "Coin royalty": "Royalty de coin", "Offer for sale": "Ofrecer en venta", "Buy Now": "Comprar ahora", "Has unlockable": "Tiene desbloqueable", "Minimum bid": "Puja mínima", "Buy Now price": "Precio de compra inmediata", "Checking current DeSo cost…": "Comprobando coste DeSo…", "Check current mint cost": "Comprobar coste actual del mint", "Preflight status": "Estado de comprobación", "Fresh · account matched": "Actual · cuenta coincidente", "Sale": "Venta", "Not for sale": "No está en venta", "Yes": "Sí", "No": "No", "Network fee": "Comisión de red", "Spend amount": "Importe de gasto", "VIA service fee": "Comisión de servicio VIA", "Quote valid until": "Cotización válida hasta", "Quote created": "Cotización creada", "Server clock": "Reloj del servidor", "Device clock difference": "Diferencia del reloj del dispositivo", "Quote source": "Fuente de cotización", "Quote contract": "Contrato de cotización", "Quote reference": "Referencia de cotización", "Unavailable": "No disponible", "Request fresh quote": "Solicitar nueva cotización", "Refresh quote": "Actualizar cotización", "Clear quote": "Borrar cotización", "Preparing mint…": "Preparando mint…", "Review in DeSo…": "Revisar en DeSo…", "Submitting…": "Enviando…", "Review & mint in DeSo": "Revisar y mintear en DeSo"
  },
  Chinese: {
    "NFT mint preflight": "NFT 铸造预检", "Set terms. Check live cost. Approve later.": "设置条款。检查实时费用。随后批准。", "No blockchain write": "不写入区块链", "Copies": "份数", "Creator royalty": "创作者版税", "Coin royalty": "Coin 版税", "Offer for sale": "出售", "Buy Now": "立即购买", "Has unlockable": "含可解锁内容", "Minimum bid": "最低出价", "Buy Now price": "立即购买价格", "Checking current DeSo cost…": "正在检查 DeSo 当前费用…", "Check current mint cost": "检查当前铸造费用", "Preflight status": "预检状态", "Fresh · account matched": "最新 · 账户匹配", "Sale": "出售", "Not for sale": "不出售", "Yes": "是", "No": "否", "Network fee": "网络费用", "Spend amount": "支出金额", "VIA service fee": "VIA 服务费", "Quote valid until": "报价有效期至", "Quote created": "报价创建时间", "Server clock": "服务器时间", "Device clock difference": "设备时间差", "Quote source": "报价来源", "Quote contract": "报价合约", "Quote reference": "报价参考", "Unavailable": "不可用", "Request fresh quote": "请求新报价", "Refresh quote": "刷新报价", "Clear quote": "清除报价", "Preparing mint…": "正在准备铸造…", "Review in DeSo…": "在 DeSo 中检查…", "Submitting…": "正在提交…", "Review & mint in DeSo": "在 DeSo 中检查并铸造"
  },
  Hindi: {}
}

const dictionaries: Record<ViaLanguage, Dictionary> = {
  English: en,
  Dutch: nl,
  French: { ...en, ...simpleOverrides.French },
  Spanish: { ...en, ...simpleOverrides.Spanish },
  Chinese: { ...en, ...simpleOverrides.Chinese },
  Hindi: en,
}

const reverse = new Map<string, Phrase>()
for (const phrase of Object.keys(en) as Phrase[]) {
  reverse.set(phrase, phrase)
  for (const dictionary of Object.values(dictionaries)) reverse.set(dictionary[phrase], phrase)
}

function translated(value: string, language: ViaLanguage) {
  const canonical = reverse.get(value) ?? value as Phrase
  return dictionaries[language][canonical] ?? value
}

function translateDynamic(value: string, language: ViaLanguage) {
  const direct = translated(value, language)
  if (direct !== value) return direct
  const prefixes: Array<[string, string]> = language === "Dutch" ? [
    ["Preflight stopped: ", "Controle gestopt: "],
    ["Blocked · ", "Geblokkeerd · "],
  ] : []
  for (const [from, to] of prefixes) if (value.startsWith(from)) return to + value.slice(from.length)
  return value
}

function applyLanguage(root: HTMLElement, language: ViaLanguage) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()
  while (node) {
    const raw = node.nodeValue ?? ""
    const trimmed = raw.trim()
    if (trimmed) {
      const next = translateDynamic(trimmed, language)
      if (next !== trimmed) node.nodeValue = raw.replace(trimmed, next)
    }
    node = walker.nextNode()
  }
  root.querySelectorAll<HTMLInputElement>("input[placeholder]").forEach((input) => {
    const current = input.getAttribute("placeholder") ?? ""
    const next = translateDynamic(current, language)
    if (next !== current) input.setAttribute("placeholder", next)
  })
}

export default function MintPreflightLocalizer() {
  useEffect(() => {
    const root = document.getElementById("mint-nft")
    if (!root) return
    let observer: MutationObserver | null = null
    const refresh = () => {
      observer?.disconnect()
      applyLanguage(root, readViaLocalSettings().interfaceLanguage)
      observer?.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["placeholder"] })
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
