"use client"
import { useEffect, useState } from "react"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "./via-local-settings"
const LABEL: Record<ViaLanguage, string> = { Dutch: "Post via VIA", English: "Post via VIA", French: "Publié via VIA", Spanish: "Publicado vía VIA", Chinese: "通过 VIA 发布", Hindi: "VIA से पोस्ट किया गया" }
const REPLY: Record<ViaLanguage, string> = { Dutch: "Reactie via VIA", English: "Reply via VIA", French: "Réponse via VIA", Spanish: "Respuesta vía VIA", Chinese: "通过 VIA 回复", Hindi: "VIA से उत्तर" }
export default function PostSource({ extra, reply = false }: { extra?: Record<string, string>; reply?: boolean }) {
  const [language, setLanguage] = useState<ViaLanguage>("English")
  useEffect(() => { const sync = () => setLanguage(readViaLocalSettings().interfaceLanguage); sync(); window.addEventListener(VIA_SETTINGS_EVENT, sync); return () => window.removeEventListener(VIA_SETTINGS_EVENT, sync) }, [])
  if (extra?.ViaClient !== "viadeso.online") return null
  return <span data-via-native-i18n className="inline-flex items-center gap-1 text-[11px] text-zinc-400"><img src="/via-leaf.svg" alt="" aria-hidden="true" width={19} height={18} className="inline-block shrink-0 object-contain" />{reply ? REPLY[language] : LABEL[language]}</span>
}
