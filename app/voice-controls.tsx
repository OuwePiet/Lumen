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
      setEnabled(false)
      setStatus("Off")
      return
    }

    setEnabled(true)
    setStatus("Ready")
  }

  const listen = () => {
    const Recognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition

    if (!enabled || !Recognition || listening) return

    const recognition = new Recognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognitionRef.current = recognition
    setListening(true)
    setStatus("Listening…")

    recognition.onresult = (event) => {
      const command = event.results[0]?.[0]?.transcript?.trim() ?? ""
      const applied = command ? onCommand(command) : false
      setStatus(applied ? "Command applied" : "Command not recognized")
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
