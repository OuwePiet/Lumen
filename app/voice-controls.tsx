"use client"

import { useEffect, useRef, useState } from "react"

type SpeechResultEvent = {
  results: {
    0?: {
      0?: {
        transcript?: string
      }
    }
  }
}

type SpeechRecognitionLike = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onend: (() => void) | null
  onerror: (() => void) | null
  onresult: ((event: SpeechResultEvent) => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

type VoiceLanguage = "en-US" | "nl-NL" | "fr-FR" | "es-ES" | "zh-CN"

const voiceLanguages: Array<{ label: string; value: VoiceLanguage }> = [
  { label: "English", value: "en-US" },
  { label: "Nederlands", value: "nl-NL" },
  { label: "Français", value: "fr-FR" },
  { label: "Español", value: "es-ES" },
  { label: "中文", value: "zh-CN" },
]

const confirmationMessages: Record<
  VoiceLanguage,
  { confirmed: string; retry: string }
> = {
  "en-US": {
    confirmed: "Command confirmed.",
    retry: "I did not understand. Please try again.",
  },
  "nl-NL": {
    confirmed: "Opdracht bevestigd.",
    retry: "Niet begrepen. Probeer het opnieuw.",
  },
  "fr-FR": {
    confirmed: "Commande confirmée.",
    retry: "Je n’ai pas compris. Veuillez réessayer.",
  },
  "es-ES": {
    confirmed: "Comando confirmado.",
    retry: "No lo entendí. Inténtalo de nuevo.",
  },
  "zh-CN": {
    confirmed: "指令已确认。",
    retry: "没有听懂，请再试一次。",
  },
}


const helpExamples: Record<VoiceLanguage, string[]> = {
  "en-US": [
    "Show images",
    "For sale",
    "Compact view",
    "Search followed by a title or creator",
    "Reset controls",
  ],
  "nl-NL": [
    "Afbeeldingen tonen",
    "Te koop",
    "Compacte weergave",
    "Zoeken gevolgd door een titel of maker",
    "Bediening resetten",
  ],
  "fr-FR": [
    "Afficher les images",
    "À vendre",
    "Vue compacte",
    "Rechercher suivi d’un titre ou créateur",
    "Réinitialiser les commandes",
  ],
  "es-ES": [
    "Mostrar imágenes",
    "En venta",
    "Vista compacta",
    "Buscar seguido de un título o creador",
    "Restablecer controles",
  ],
  "zh-CN": [
    "显示图片",
    "出售中",
    "紧凑视图",
    "搜索，后接标题或创作者",
    "重置控件",
  ],
}

type VoiceControlsProps = {
  onCommand: (command: string) => boolean
}

const styles = {
  panel: {
    display: "flex",
    flexWrap: "wrap" as const,
    alignItems: "center",
    gap: "10px",
  },
  label: {
    color: "#a9b8af",
    fontSize: "13px",
    fontWeight: 700,
    marginRight: "4px",
  },
  button: {
    appearance: "none" as const,
    color: "#a9b8af",
    background: "#0c120f",
    border: "1px solid #254233",
    borderRadius: "999px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 700,
    padding: "8px 12px",
  },
  enabled: {
    color: "#050807",
    background: "#5cff9d",
    borderColor: "#5cff9d",
  },
  select: {
    color: "#f4f7f5",
    background: "#0c120f",
    border: "1px solid #254233",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 700,
    padding: "8px 32px 8px 10px",
  },
  help: {
    width: "100%",
    color: "#a9b8af",
    background: "#09100c",
    border: "1px solid #254233",
    borderRadius: "12px",
    padding: "10px 12px",
  },
  helpSummary: {
    color: "#b9ffd4",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 800,
  },
  helpList: {
    margin: "10px 0 0",
    paddingLeft: "22px",
    fontSize: "12px",
    lineHeight: 1.7,
  },
  status: {
    color: "#84958b",
    fontSize: "12px",
    fontWeight: 700,
  },
}

export default function VoiceControls({ onCommand }: VoiceControlsProps) {
  const [enabled, setEnabled] = useState(false)
  const [listening, setListening] = useState(false)
  const [status, setStatus] = useState("Off")
  const [language, setLanguage] = useState<VoiceLanguage>("en-US")
  const [readAloud, setReadAloud] = useState(false)
  const [supported, setSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  useEffect(() => {
    setSupported(
      Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition)
    )
  }, [])

  const stopListening = () => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setListening(false)
  }

  const toggleEnabled = () => {
    if (enabled) {
      stopListening()
      window.speechSynthesis?.cancel()
      setEnabled(false)
      setReadAloud(false)
      setStatus("Off")
      return
    }

    setEnabled(true)
    setStatus("Ready")
  }

  const confirmCommand = (message: string) => {
    setStatus(message)

    if (!readAloud || !("speechSynthesis" in window)) return

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(message)
    utterance.lang = language
    window.speechSynthesis.speak(utterance)
  }

  const listen = () => {
    const Recognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition

    if (!enabled || !Recognition || listening) return

    const recognition = new Recognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = language
    recognitionRef.current = recognition
    setListening(true)
    setStatus("Listening…")

    recognition.onresult = (event) => {
      const command = event.results[0]?.[0]?.transcript?.trim() ?? ""
      const applied = command ? onCommand(command) : false
      const messages = confirmationMessages[language]
      confirmCommand(applied ? messages.confirmed : messages.retry)
    }

    recognition.onerror = () => {
      setStatus("Voice control unavailable")
    }

    recognition.onend = () => {
      recognitionRef.current = null
      setListening(false)
    }

    recognition.start()
  }

  return (
    <div style={styles.panel} aria-label="Optional voice controls">
      <span style={styles.label}>Voice</span>
      <button
        type="button"
        aria-pressed={enabled}
        style={{
          ...styles.button,
          ...(enabled ? styles.enabled : {}),
        }}
        onClick={toggleEnabled}
      >
        {enabled ? "Voice on" : "Voice off"}
      </button>

      {enabled ? (
        <label style={styles.panel}>
          <span style={styles.label}>Language</span>
          <select
            aria-label="Voice language"
            value={language}
            style={styles.select}
            onChange={(event) =>
              setLanguage(event.target.value as VoiceLanguage)
            }
          >
            {voiceLanguages.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {enabled ? (
        <details style={styles.help}>
          <summary style={styles.helpSummary}>Voice help</summary>
          <ul style={styles.helpList}>
            {helpExamples[language].map((example) => (
              <li key={example}>{example}</li>
            ))}
          </ul>
        </details>
      ) : null}

      {enabled ? (
        <details style={styles.help}>
          <summary style={styles.helpSummary}>Supported devices</summary>
          <ul style={styles.helpList}>
            <li>Chrome and Edge on desktop, laptop and Android</li>
            <li>Safari on Mac, iPhone and iPad</li>
            <li>Firefox may not provide speech recognition</li>
            <li>Microphone permission is required only when listening starts</li>
            <li>Buttons, touch and keyboard always remain available</li>
          </ul>
        </details>
      ) : null}

      {enabled ? (
        <button
          type="button"
          aria-pressed={readAloud}
          style={{
            ...styles.button,
            ...(readAloud ? styles.enabled : {}),
          }}
          onClick={() => setReadAloud((current) => !current)}
        >
          {readAloud ? "Read aloud on" : "Read aloud off"}
        </button>
      ) : null}

      {enabled ? (
        <button
          type="button"
          disabled={!supported || listening}
          style={{
            ...styles.button,
            ...(!supported || listening
              ? { cursor: "default", opacity: 0.45 }
              : {}),
          }}
          onClick={listen}
        >
          {listening ? "Listening…" : "Start listening"}
        </button>
      ) : null}

      <span style={styles.status} aria-live="polite">
        {supported ? status : "Not supported on this device"}
      </span>
    </div>
  )
}
