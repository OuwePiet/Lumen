"use client"

import { useEffect } from "react"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"

type Copy = Record<string, string>

const dutch: Copy = {
  "How it works": "Hoe het werkt",
  "Live conversation, kept simple.": "Live gesprekken, eenvoudig gehouden.",
  "VIA LIVE is built around three clear destinations: join a live community room, return to published Replays, or read how participation works.": "VIA LIVE draait om drie duidelijke bestemmingen: neem deel aan een live communityruimte, bekijk gepubliceerde Replays terug of lees hoe deelname werkt.",
  "Live speaker, microphone, recording and publishing controls remain hidden until they are backed by a real authorised service. VIA does not present planned controls as active.": "Bediening voor spreken, microfoon, opname en publiceren blijft verborgen totdat die door een echte geautoriseerde dienst wordt ondersteund. VIA toont geplande bediening niet alsof die al actief is.",
  "Community Room": "Communityruimte",
  "Audio comes first; camera is optional. Listening, speaking, recording and publishing remain separate actions so none of them happen silently.": "Audio staat voorop; camera is optioneel. Luisteren, spreken, opnemen en publiceren blijven afzonderlijke acties zodat niets ongemerkt gebeurt.",
  "Room controls are intentionally not exposed until microphone, speaker moderation and recording are backed by a real authorised service.": "Ruimtebediening wordt bewust nog niet getoond totdat microfoon, sprekersmoderatie en opname door een echte geautoriseerde dienst worden ondersteund.",
  "Listen later": "Later luisteren",
  "No Replay is published yet. A recording will only appear here after an authorised host deliberately publishes it.": "Er is nog geen Replay gepubliceerd. Een opname verschijnt hier pas nadat een geautoriseerde host die bewust heeft gepubliceerd.",
  "Status & diagnostics": "Status & diagnose",
  "MEDIA HEALTH": "MEDIASTATUS",
  "Connection status": "Verbindingsstatus",
  "Checking…": "Controleren…",
  "Check now": "Nu controleren",
  "VIA application": "VIA-applicatie",
  "DeSo node/API": "DeSo-node/API",
  "Media upload": "Media-upload",
  "Media retrieval": "Media ophalen",
  "UNKNOWN": "ONBEKEND",
  "FAILED": "MISLUKT",
  "Checked": "Gecontroleerd",
  "not yet": "nog niet",
  "UNKNOWN means VIA does not yet have enough verified evidence to identify that service as the cause.": "ONBEKEND betekent dat VIA nog niet genoeg geverifieerde informatie heeft om die dienst als oorzaak aan te wijzen."
}

const french: Copy = {
  "How it works": "Comment ça marche",
  "Live conversation, kept simple.": "Conversation en direct, simplement.",
  "Community Room": "Salle communautaire",
  "Listen later": "Écouter plus tard",
  "Status & diagnostics": "État et diagnostics",
  "Connection status": "État de la connexion",
  "Checking…": "Vérification…",
  "Check now": "Vérifier maintenant",
  "VIA application": "Application VIA",
  "Media upload": "Envoi média",
  "Media retrieval": "Récupération média",
  "UNKNOWN": "INCONNU",
  "FAILED": "ÉCHEC",
  "Checked": "Vérifié",
  "not yet": "pas encore"
}

const spanish: Copy = {
  "How it works": "Cómo funciona",
  "Live conversation, kept simple.": "Conversación en directo, de forma sencilla.",
  "Community Room": "Sala de comunidad",
  "Listen later": "Escuchar después",
  "Status & diagnostics": "Estado y diagnóstico",
  "Connection status": "Estado de conexión",
  "Checking…": "Comprobando…",
  "Check now": "Comprobar ahora",
  "VIA application": "Aplicación VIA",
  "Media upload": "Carga de medios",
  "Media retrieval": "Recuperación de medios",
  "UNKNOWN": "DESCONOCIDO",
  "FAILED": "FALLÓ",
  "Checked": "Comprobado",
  "not yet": "todavía no"
}

const chinese: Copy = {
  "How it works": "使用说明",
  "Live conversation, kept simple.": "让直播交流保持简单。",
  "Community Room": "社区直播间",
  "Listen later": "稍后收听",
  "Status & diagnostics": "状态与诊断",
  "Connection status": "连接状态",
  "Checking…": "正在检查…",
  "Check now": "立即检查",
  "VIA application": "VIA 应用",
  "Media upload": "媒体上传",
  "Media retrieval": "媒体获取",
  "UNKNOWN": "未知",
  "FAILED": "失败",
  "Checked": "已检查",
  "not yet": "尚未"
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
},
  // Hindi currently falls back to English here until this surface receives its full Hindi copy.
  Hindi: {}

function translateText(value: string, language: ViaLanguage) {
  const canonical = reverse.get(value) ?? value
  return dictionaries[language][canonical] ?? canonical
}

function apply(root: HTMLElement, language: ViaLanguage) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()
  while (node) {
    const raw = node.nodeValue ?? ""
    const trimmed = raw.trim()
    if (trimmed) {
      let next = translateText(trimmed, language)
      if (language === "Dutch" && trimmed.startsWith("Checked ")) {
        const canonical = reverse.get(trimmed) ?? trimmed
        if (canonical.startsWith("Checked ")) next = `Gecontroleerd ${canonical.slice(8)}`
      }
      if (next !== trimmed) node.nodeValue = raw.replace(trimmed, next)
    }
    node = walker.nextNode()
  }
}

export default function LiveLocalizer() {
  useEffect(() => {
    const root = document.getElementById("via-live-page")
    if (!root) return
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
