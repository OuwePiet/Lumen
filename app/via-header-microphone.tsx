"use client"

import { useEffect, useRef, useState } from "react"
import { Mic, MicOff } from "lucide-react"
import { usePathname } from "next/navigation"
import { readViaLocalSettings } from "./via-local-settings"

// @OuwePiet2026 provenance; not a cryptographic signature.
type Recognition = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: { results: { 0?: { 0?: { transcript?: string } } } }) => void) | null
  onerror: ((event: { error?: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}
type RecognitionFactory = new () => Recognition

export default function ViaHeaderMicrophone({ onTranscript, onFallback }: { onTranscript: (text: string) => void; onFallback: () => void }) {
  const [available, setAvailable] = useState(false)
  const [listening, setListening] = useState(false)
  const [status, setStatus] = useState("")
  const instance = useRef<Recognition | null>(null)
  const pathname = usePathname()
  useEffect(() => { instance.current?.stop(); instance.current = null; setListening(false) }, [pathname])
  useEffect(() => {
    const w = window as Window & { SpeechRecognition?: RecognitionFactory; webkitSpeechRecognition?: RecognitionFactory }
    setAvailable(Boolean(window.isSecureContext && (w.SpeechRecognition || w.webkitSpeechRecognition)))
    return () => { instance.current?.stop(); instance.current = null }
  }, [])
  const toggle = () => {
    if (listening) { instance.current?.stop(); setListening(false); return }
    const w = window as Window & { SpeechRecognition?: RecognitionFactory; webkitSpeechRecognition?: RecognitionFactory }
    const Factory = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!window.isSecureContext || !Factory) { setStatus("Spraakherkenning niet beschikbaar; gebruik het zoekveld."); onFallback(); return }
    const next = new Factory()
    const viaLanguage = readViaLocalSettings().interfaceLanguage
    next.lang = ({ Dutch: "nl-NL", English: "en-US", French: "fr-FR", Spanish: "es-ES", Chinese: "zh-CN", Hindi: "hi-IN" } as const)[viaLanguage] ?? "en-US"
    next.continuous = false
    next.interimResults = false
    next.onresult = event => {
      const transcript = event.results[0]?.[0]?.transcript?.trim()
      if (transcript) { onTranscript(transcript); setStatus("Tekst herkend; controleer de zoekopdracht.") }
    }
    next.onerror = event => { setListening(false); setStatus(event.error === "not-allowed" ? "Microfoontoegang geweigerd; gebruik het zoekveld." : "Spraakherkenning niet beschikbaar; gebruik het zoekveld."); onFallback() }
    next.onend = () => { setListening(false); instance.current = null }
    instance.current = next
    try { next.start(); setListening(true); setStatus("Microfoon luistert.") } catch { setListening(false); instance.current = null; setStatus("Microfoon kon niet starten; gebruik het zoekveld."); onFallback() }
  }
  return <>
    <button className="via-header-microphone" type="button" onClick={available ? toggle : onFallback} aria-pressed={listening}
      aria-label={listening ? "Stop microfoon" : available ? "Zoeken met microfoon" : "Open zoekveld (spraak niet beschikbaar)"} title={available ? (listening ? "Stop microfoon" : "Zoeken met microfoon") : "Open zoekveld: microfoon niet beschikbaar"}
      style={{ minWidth: 44, minHeight: 44, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #486b56", borderRadius: 10, color: listening ? "#ffd78b" : "#cfe8d7", background: "#0b2015", flexShrink: 0 }}>
      {listening ? <MicOff size={18} aria-hidden="true" /> : <Mic size={18} aria-hidden="true" />}
    </button>
    <span className="sr-only" role="status" aria-live="polite">{available ? status : "Microfoon niet beschikbaar op dit apparaat; gebruik het zoekveld."}</span>
  </>
}
