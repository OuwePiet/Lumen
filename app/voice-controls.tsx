"use client"

import { useEffect, useRef, useState } from "react"

type SpeechResultEvent = {
  results: {
    0?: {
      0?: {
        transcript?: string
        confidence?: number
      }
    }
  }
}

type SpeechErrorEvent = {
  error?: string
}

type SpeechRecognitionLike = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onend: (() => void) | null
  onerror: ((event: SpeechErrorEvent) => void) | null
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
type SpeechRate = 0.8 | 1 | 1.2

const speechRates: Array<{ label: string; value: SpeechRate }> = [
  { label: "Slow", value: 0.8 },
  { label: "Normal", value: 1 },
  { label: "Fast", value: 1.2 },
]

const SITE_VOICE_LANGUAGE: VoiceLanguage = "en-US"

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


const testExamples: Record<VoiceLanguage, string> = {
  "en-US": "Show images",
  "nl-NL": "Afbeeldingen tonen",
  "fr-FR": "Afficher les images",
  "es-ES": "Mostrar imágenes",
  "zh-CN": "显示图片",
}

const backgroundNoiseMessages: Record<VoiceLanguage, string> = {
  "en-US": "Speech was not clear enough. Reduce background noise and try again.",
  "nl-NL": "De spraak was niet duidelijk genoeg. Verminder achtergrondgeluid en probeer opnieuw.",
  "fr-FR": "La parole n’était pas assez claire. Réduisez le bruit de fond et réessayez.",
  "es-ES": "La voz no fue suficientemente clara. Reduce el ruido de fondo e inténtalo de nuevo.",
  "zh-CN": "语音不够清晰。请减少背景噪音后重试。",
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
  canUndo: boolean
  onUndo: () => void
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
  settings: {
    width: "100%",
    color: "#a9b8af",
    background: "#07100b",
    border: "1px solid #285f40",
    borderRadius: "14px",
    padding: "12px",
  },
  settingsSummary: {
    color: "#b9ffd4",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 800,
  },
  settingsContent: {
    display: "flex",
    flexWrap: "wrap" as const,
    alignItems: "center",
    gap: "10px",
    marginTop: "12px",
  },
  processing: {
    width: "100%",
    color: "#b9ffd4",
    background: "#0b1b12",
    border: "1px solid #285f40",
    borderRadius: "10px",
    fontSize: "12px",
    lineHeight: 1.6,
    padding: "10px 12px",
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

export default function VoiceControls({
  onCommand,
  canUndo,
  onUndo,
}: VoiceControlsProps) {
  const [enabled, setEnabled] = useState(false)
  const [listening, setListening] = useState(false)
  const [status, setStatus] = useState("Microphone off")
  const [language, setLanguage] = useState<VoiceLanguage>("en-US")
  const [readAloud, setReadAloud] = useState(false)
  const [speechRate, setSpeechRate] = useState<SpeechRate>(1)
  const [availableVoices, setAvailableVoices] =
    useState<SpeechSynthesisVoice[]>([])
  const [selectedVoiceURI, setSelectedVoiceURI] = useState("")
  const [supported, setSupported] = useState(false)
  const [speechOutputSupported, setSpeechOutputSupported] = useState(false)
  const [secureContext, setSecureContext] = useState(false)
  const [compatibilityChecked, setCompatibilityChecked] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)
  const [privacyConfirmationRequired, setPrivacyConfirmationRequired] =
    useState(true)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const listeningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setSupported(
      Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition)
    )
    setSpeechOutputSupported("speechSynthesis" in window)
    setSecureContext(window.isSecureContext)

    return () => {
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current)
      }
      recognitionRef.current?.stop()
    }
  }, [])

  useEffect(() => {
    if (!("speechSynthesis" in window)) return

    const loadVoices = () => {
      setAvailableVoices(window.speechSynthesis.getVoices())
    }

    loadVoices()
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices)

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices)
    }
  }, [])

  const languagePrefix = language.slice(0, 2).toLocaleLowerCase()
  const matchingVoices = availableVoices.filter((voice) =>
    voice.lang.toLocaleLowerCase().startsWith(languagePrefix)
  )

  useEffect(() => {
    if (
      selectedVoiceURI &&
      !matchingVoices.some((voice) => voice.voiceURI === selectedVoiceURI)
    ) {
      setSelectedVoiceURI("")
    }
  }, [language, availableVoices, selectedVoiceURI])

  const clearListeningTimeout = () => {
    if (listeningTimeoutRef.current) {
      clearTimeout(listeningTimeoutRef.current)
      listeningTimeoutRef.current = null
    }
  }

  const stopListening = () => {
    clearListeningTimeout()
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
      setTestResult(null)
      setStatus("Microphone off")
      return
    }

    if (privacyConfirmationRequired) {
      const accepted = window.confirm(
        "Speech recognition may use your browser’s speech service. Lumen does not store audio or transcripts and uses no external speech server of its own. Continue?"
      )

      if (!accepted) {
        setStatus("Microphone off")
        return
      }

      setPrivacyConfirmationRequired(false)
    }

    setEnabled(true)
    setStatus("Microphone off")
  }

  const confirmCommand = (message: string) => {
    setStatus(message)

    if (!readAloud || !("speechSynthesis" in window)) return

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(message)
    utterance.lang = language
    utterance.rate = speechRate
    utterance.voice =
      matchingVoices.find((voice) => voice.voiceURI === selectedVoiceURI) ??
      null
    window.speechSynthesis.speak(utterance)
  }

  const startListening = (testOnly: boolean) => {
    const Recognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition

    if (!enabled || !Recognition || listening) return

    const recognition = new Recognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = language
    recognitionRef.current = recognition
    setListening(true)
    setStatus("Listening")

    recognition.onresult = (event) => {
      const result = event.results[0]?.[0]
      const command = result?.transcript?.trim() ?? ""
      const confidence = result?.confidence
      const messages = confirmationMessages[language]

      if (testOnly) {
        setTestResult(command)
        setStatus(command ? `Recognized: “${command}”` : messages.retry)
        return
      }

      setStatus("Processing command")
      if (
        typeof confidence === "number" &&
        confidence > 0 &&
        confidence < 0.55
      ) {
        setStatus(backgroundNoiseMessages[language])
        return
      }

      const applied = command ? onCommand(command) : false
      confirmCommand(applied ? messages.confirmed : messages.retry)
    }

    recognition.onerror = (event) => {
      clearListeningTimeout()
      setStatus(
        event.error === "no-speech"
          ? backgroundNoiseMessages[language]
          : "Voice unavailable"
      )
    }

    recognition.onend = () => {
      clearListeningTimeout()
      recognitionRef.current = null
      setListening(false)
    }

    recognition.start()
    listeningTimeoutRef.current = setTimeout(() => {
      recognition.stop()
      setStatus("Microphone off")
    }, 15_000)
  }

  const listen = () => startListening(false)

  const testMicrophone = () => {
    setTestResult(null)
    startListening(true)
  }

  const cancelTest = () => {
    stopListening()
    setTestResult(null)
    setStatus("Microphone off")
  }

  const undoLastVoiceCommand = () => {
    onUndo()
    setStatus("Last voice command undone")
  }

  const resetVoiceSettings = () => {
    const confirmed = window.confirm(
      "Reset all voice settings? Collection filters and NFT data will not change."
    )

    if (!confirmed) return

    stopListening()
    window.speechSynthesis?.cancel()
    setEnabled(false)
    setLanguage(SITE_VOICE_LANGUAGE)
    setReadAloud(false)
    setSpeechRate(1)
    setSelectedVoiceURI("")
    setTestResult(null)
    setPrivacyConfirmationRequired(true)
    setCompatibilityChecked(false)
    setStatus("Voice settings reset")
  }

  const runCompatibilityCheck = () => {
    setCompatibilityChecked(true)
  }

  const compatibilityReady =
    supported && speechOutputSupported && secureContext

  return (
    <details
      open
      style={styles.settings}
      aria-label="Voice settings"
    >
      <summary style={styles.settingsSummary}>Voice settings</summary>
      <div style={styles.settingsContent}>
      <div style={styles.processing} role="note">
        <strong>Speech processing</strong><br />
        Recognition may use your browser’s speech service. Lumen does not
        store audio or transcripts and uses no external speech server of its
        own. Voice remains off until you choose to activate it.
      </div>
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
          <summary style={styles.helpSummary}>Compatibility check</summary>
          <div style={{ marginTop: "10px" }}>
            <button
              type="button"
              style={styles.button}
              onClick={runCompatibilityCheck}
            >
              Check compatibility
            </button>
          </div>
          {compatibilityChecked ? (
            <>
              <ul style={styles.helpList}>
                <li>
                  Speech recognition: {supported ? "Available" : "Unavailable"}
                </li>
                <li>
                  Spoken confirmations:{" "}
                  {speechOutputSupported ? "Available" : "Unavailable"}
                </li>
                <li>
                  Secure connection: {secureContext ? "Yes" : "No"}
                </li>
                <li>
                  Voice variants for {language}: {matchingVoices.length}
                </li>
                <li>
                  Microphone permission: requested only when listening starts
                </li>
              </ul>
              <p style={{ margin: "8px 0 0", fontSize: "12px" }}>
                {compatibilityReady
                  ? "Voice controls are ready on this browser."
                  : "Voice controls are limited. Buttons, touch and keyboard remain available."}
              </p>
            </>
          ) : (
            <p style={{ margin: "8px 0 0", fontSize: "12px" }}>
              This check does not request microphone permission.
            </p>
          )
        </details>
      ) : null}

      {enabled ? (
        <details style={styles.help}>
          <summary style={styles.helpSummary}>Background noise</summary>
          <ul style={styles.helpList}>
            <li>Your browser handles microphone noise reduction</li>
            <li>Speak close to the microphone and pause background audio</li>
            <li>Lumen does not guess or apply an unclear command</li>
            <li>Unclear speech can always be tried again</li>
          </ul>
        </details>
      ) : null}

      {enabled ? (
        <details style={styles.help}>
          <summary style={styles.helpSummary}>Privacy</summary>
          <ul style={styles.helpList}>
            <li>Lumen does not store audio or voice transcripts</li>
            <li>Your browser handles speech recognition</li>
            <li>Voice commands never sign in, pay, trade or write to a blockchain</li>
            <li>Listening stops after each command or automatically after 15 seconds</li>
            <li>Buttons, touch and keyboard always remain available</li>
          </ul>
        </details>
      ) : null}

      {enabled ? (
        <div style={styles.help} aria-label="Safe microphone test">
          <strong style={styles.helpSummary}>Test microphone</strong>
          <p style={{ margin: "8px 0", fontSize: "12px" }}>
            Say: “{testExamples[language]}”. The recognized text is shown
            without changing a filter or setting.
          </p>
          <div style={styles.panel}>
            <button
              type="button"
              disabled={!supported || listening}
              style={{
                ...styles.button,
                ...(!supported || listening
                  ? { cursor: "default", opacity: 0.45 }
                  : {}),
              }}
              onClick={testMicrophone}
            >
              {listening ? "Listening…" : "Test microphone"}
            </button>

            {testResult !== null ? (
              <>
                <span style={styles.status}>
                  Recognized text: “{testResult || "Nothing recognized"}”
                </span>
                <button
                  type="button"
                  disabled={listening}
                  style={styles.button}
                  onClick={testMicrophone}
                >
                  Try again
                </button>
                <button
                  type="button"
                  disabled={listening}
                  style={styles.button}
                  onClick={listen}
                >
                  Start voice control
                </button>
                <button
                  type="button"
                  style={styles.button}
                  onClick={cancelTest}
                >
                  Cancel
                </button>
              </>
            ) : null}
          </div>
          <p style={{ margin: "8px 0 0", fontSize: "12px" }}>
            Lumen does not store the audio or recognized test text.
          </p>
        </div>
      ) : null}

      {enabled ? (
        <label style={styles.panel}>
          <span style={styles.label}>Confirmation speed</span>
          <select
            aria-label="Spoken confirmation speed"
            value={speechRate}
            style={styles.select}
            onChange={(event) =>
              setSpeechRate(Number(event.target.value) as SpeechRate)
            }
          >
            {speechRates.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {enabled ? (
        <label style={styles.panel}>
          <span style={styles.label}>Voice variant</span>
          <select
            aria-label="Spoken confirmation voice"
            value={selectedVoiceURI}
            style={styles.select}
            onChange={(event) => setSelectedVoiceURI(event.target.value)}
          >
            <option value="">Automatic</option>
            {matchingVoices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name}
              </option>
            ))}
          </select>
        </label>
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
          {readAloud
            ? "Spoken confirmations on"
            : "Spoken confirmations off"}
        </button>
      ) : null}

      {enabled && listening ? (
        <button
          type="button"
          style={styles.button}
          onClick={stopListening}
        >
          Stop listening
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

      {canUndo ? (
        <button
          type="button"
          style={styles.button}
          onClick={undoLastVoiceCommand}
        >
          Undo last voice command
        </button>
      ) : null}

      <button
        type="button"
        style={styles.button}
        onClick={resetVoiceSettings}
      >
        Reset voice settings
      </button>

      <span style={styles.status} aria-live="polite">
        {supported ? status : "Not supported on this device"}
      </span>
      </div>
    </details>
  )
}
