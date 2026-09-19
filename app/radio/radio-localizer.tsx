"use client"

import { useEffect } from "react"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"

type Copy = Record<string, string>

const dutch: Copy = {
  "Back to VIA": "Terug naar VIA",
  "World Radio": "Wereldradio",
  "Listen around the world.": "Luister de wereld rond.",
  "Discover public internet radio by country or genre. Station metadata comes from the Radio Browser directory; when you press Play, audio is requested directly from the station and is not hosted or proxied by VIA.": "Ontdek openbare internetradio per land of genre. Zendergegevens komen uit de Radio Browser-directory; wanneer je op Afspelen drukt, wordt de audio rechtstreeks bij de zender opgevraagd en niet door VIA gehost of doorgestuurd.",
  "World Radio is separate from VIA LIVE. Radio is for station listening; VIA LIVE is for community conversations and later replays. Availability and rights remain the responsibility of each station or stream provider.": "Wereldradio staat los van VIA LIVE. Radio is bedoeld om naar zenders te luisteren; VIA LIVE is voor communitygesprekken en latere replays. Beschikbaarheid en rechten blijven de verantwoordelijkheid van iedere zender of streamprovider.",
  "Country": "Land",
  "Country, e.g. Netherlands": "Land, bijv. Nederland",
  "Genre or tag": "Genre of tag",
  "Genre/tag, e.g. jazz": "Genre/tag, bijv. jazz",
  "Searching…": "Zoeken…",
  "Find stations": "Zenders zoeken",
  "Show search": "Zoekresultaten tonen",
  "World Radio could not load stations right now.": "Wereldradio kan de zenders nu niet laden.",
  "Streams come directly from the station. VIA does not host or proxy the audio. Choose Play here, then use the global World Radio control to turn the station on or off while navigating VIA.": "Streams komen rechtstreeks van de zender. VIA host of proxy't de audio niet. Kies hier Afspelen en gebruik daarna de globale Wereldradio-bediening om de zender tijdens het navigeren door VIA aan of uit te zetten.",
  "No saved favorite stations yet.": "Nog geen favoriete zenders opgeslagen.",
  "Unknown country": "Onbekend land",
  "Play": "Afspelen",
  "★ Favorite": "★ Favoriet",
  "☆ Favorite": "☆ Favoriet",
  "Station site": "Zenderwebsite"
}

const french: Copy = {
  "Back to VIA": "Retour à VIA",
  "World Radio": "Radio mondiale",
  "Listen around the world.": "Écoutez le monde entier.",
  "Country": "Pays",
  "Genre or tag": "Genre ou tag",
  "Searching…": "Recherche…",
  "Find stations": "Trouver des stations",
  "Show search": "Afficher la recherche",
  "No saved favorite stations yet.": "Aucune station favorite enregistrée pour le moment.",
  "Unknown country": "Pays inconnu",
  "Play": "Écouter",
  "★ Favorite": "★ Favori",
  "☆ Favorite": "☆ Favori",
  "Station site": "Site de la station"
}

const spanish: Copy = {
  "Back to VIA": "Volver a VIA",
  "World Radio": "Radio mundial",
  "Listen around the world.": "Escucha alrededor del mundo.",
  "Country": "País",
  "Genre or tag": "Género o etiqueta",
  "Searching…": "Buscando…",
  "Find stations": "Buscar emisoras",
  "Show search": "Mostrar búsqueda",
  "No saved favorite stations yet.": "Aún no hay emisoras favoritas guardadas.",
  "Unknown country": "País desconocido",
  "Play": "Reproducir",
  "★ Favorite": "★ Favorita",
  "☆ Favorite": "☆ Favorita",
  "Station site": "Sitio de la emisora"
}

const chinese: Copy = {
  "Back to VIA": "返回 VIA",
  "World Radio": "世界电台",
  "Listen around the world.": "聆听世界各地。",
  "Country": "国家",
  "Genre or tag": "类型或标签",
  "Searching…": "正在搜索…",
  "Find stations": "查找电台",
  "Show search": "显示搜索结果",
  "No saved favorite stations yet.": "尚未保存收藏电台。",
  "Unknown country": "未知国家",
  "Play": "播放",
  "★ Favorite": "★ 收藏",
  "☆ Favorite": "☆ 收藏",
  "Station site": "电台网站"
}

const dictionaries: Record<ViaLanguage, Copy> = {
  English: {},
  Dutch: dutch,
  French: french,
  Spanish: spanish,
  Chinese: chinese,
  Hindi: {},
}

const reverse = new Map<string, string>()
for (const dictionary of Object.values(dictionaries)) {
  for (const [english, localized] of Object.entries(dictionary)) reverse.set(localized, english)
}

function translateText(value: string, language: ViaLanguage) {
  const canonical = reverse.get(value) ?? value
  const direct = dictionaries[language][canonical]
  if (direct) return direct
  const favorites = canonical.match(/^Favorites \((\d+)\)$/)
  if (favorites && language !== "English") {
    const label: Record<Exclude<ViaLanguage, "English">, string> = {
      Dutch: "Favorieten",
      French: "Favoris",
      Spanish: "Favoritas",
      Chinese: "收藏",
      Hindi: "Favorites",
    }
    return `${label[language]} (${favorites[1]})`
  }
  return canonical
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

  for (const input of Array.from(root.querySelectorAll("input"))) {
    const placeholder = input.getAttribute("placeholder")
    if (placeholder) input.setAttribute("placeholder", translateText(placeholder, language))
    const ariaLabel = input.getAttribute("aria-label")
    if (ariaLabel) input.setAttribute("aria-label", translateText(ariaLabel, language))
  }
}

export default function RadioLocalizer() {
  useEffect(() => {
    if (window.location.pathname !== "/radio") return
    const root = document.querySelector("main")
    if (!(root instanceof HTMLElement)) return
    let observer: MutationObserver | null = null
    const refresh = () => {
      observer?.disconnect()
      apply(root, readViaLocalSettings().interfaceLanguage)
      observer?.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["placeholder", "aria-label"] })
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
