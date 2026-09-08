"use client"

import { useEffect, useMemo, useState } from "react"
import YouTubeEmbed from "../youtube-embed"

const STORAGE_KEY = "via:studio:draft:v1"
const MAX_TITLE = 120
const MAX_BODY = 5000
const MAX_POLL_OPTION = 120

const languages = ["Dutch", "English", "French", "Spanish", "Chinese"] as const
const feeds = ["Hot Feed", "Following", "Recent"] as const

type DraftState = {
  title: string
  body: string
  language?: string
  feed?: string
  pollEnabled?: boolean
  pollOptions?: string[]
  updatedAt: number
}

function validDraft(value: unknown): value is DraftState {
  if (!value || typeof value !== "object") return false
  const draft = value as Partial<DraftState>
  const validPoll =
    draft.pollOptions === undefined ||
    (Array.isArray(draft.pollOptions) &&
      draft.pollOptions.length <= 4 &&
      draft.pollOptions.every(
        (option) => typeof option === "string" && option.length <= MAX_POLL_OPTION
      ))

  return (
    typeof draft.title === "string" &&
    draft.title.length <= MAX_TITLE &&
    typeof draft.body === "string" &&
    draft.body.length <= MAX_BODY &&
    (draft.language === undefined || typeof draft.language === "string") &&
    (draft.feed === undefined || typeof draft.feed === "string") &&
    (draft.pollEnabled === undefined || typeof draft.pollEnabled === "boolean") &&
    validPoll &&
    typeof draft.updatedAt === "number" &&
    Number.isFinite(draft.updatedAt)
  )
}

const toolbarStyle = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: "8px",
  margin: "0 0 14px",
}

const toolButtonStyle = {
  minHeight: "44px",
  minWidth: "44px",
  border: "1px solid #285f40",
  borderRadius: "10px",
  background: "#07100b",
  color: "#b9ffd4",
  font: "inherit",
  fontWeight: 800,
  cursor: "pointer",
  padding: "9px 12px",
}

const selectRowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "10px",
  margin: "0 0 16px",
}

const selectStyle = {
  minHeight: "44px",
  width: "100%",
  border: "1px solid #285f40",
  borderRadius: "10px",
  background: "#050807",
  color: "#f4f7f5",
  font: "inherit",
  padding: "9px 12px",
}

const pollStyle = {
  display: "grid",
  gap: "10px",
  margin: "0 0 16px",
  padding: "14px",
  border: "1px solid #254233",
  borderRadius: "12px",
  background: "#070b09",
}

const pollOptionStyle = {
  minHeight: "44px",
  width: "100%",
  border: "1px solid #254233",
  borderRadius: "10px",
  background: "#050807",
  color: "#f4f7f5",
  font: "inherit",
  padding: "10px 12px",
}

export default function StudioDraft() {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [language, setLanguage] = useState<(typeof languages)[number]>("Dutch")
  const [feed, setFeed] = useState<(typeof feeds)[number]>("Hot Feed")
  const [pollEnabled, setPollEnabled] = useState(false)
  const [pollOptions, setPollOptions] = useState(["", ""])
  const [status, setStatus] = useState("No draft saved on this device.")

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed: unknown = JSON.parse(raw)
      if (!validDraft(parsed)) {
        window.localStorage.removeItem(STORAGE_KEY)
        return
      }
      setTitle(parsed.title)
      setBody(parsed.body)
      if (languages.includes(parsed.language as (typeof languages)[number])) {
        setLanguage(parsed.language as (typeof languages)[number])
      }
      if (feeds.includes(parsed.feed as (typeof feeds)[number])) {
        setFeed(parsed.feed as (typeof feeds)[number])
      }
      setPollEnabled(Boolean(parsed.pollEnabled))
      if (parsed.pollOptions && parsed.pollOptions.length >= 2) {
        setPollOptions(parsed.pollOptions.slice(0, 4))
      }
      setStatus(`Draft restored from ${new Date(parsed.updatedAt).toLocaleString()}.`)
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const remaining = useMemo(() => MAX_BODY - body.length, [body.length])

  function appendText(text: string) {
    setBody((current) => `${current}${current && !current.endsWith(" ") ? " " : ""}${text}`.slice(0, MAX_BODY))
  }

  function updatePollOption(index: number, value: string) {
    setPollOptions((current) =>
      current.map((option, optionIndex) =>
        optionIndex === index ? value.slice(0, MAX_POLL_OPTION) : option
      )
    )
  }

  function addPollOption() {
    setPollOptions((current) =>
      current.length >= 4 ? current : [...current, ""]
    )
  }

  function removePollOption(index: number) {
    setPollOptions((current) =>
      current.length <= 2 ? current : current.filter((_, optionIndex) => optionIndex !== index)
    )
  }

  function saveDraft() {
    const next: DraftState = {
      title: title.trim(),
      body,
      language,
      feed,
      pollEnabled,
      pollOptions: pollEnabled ? pollOptions : [],
      updatedAt: Date.now(),
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setStatus("Draft saved locally on this device.")
    } catch {
      setStatus("Draft could not be saved in this browser.")
    }
  }

  function clearDraft() {
    setTitle("")
    setBody("")
    setLanguage("Dutch")
    setFeed("Hot Feed")
    setPollEnabled(false)
    setPollOptions(["", ""])
    window.localStorage.removeItem(STORAGE_KEY)
    setStatus("Local Studio draft cleared.")
  }

  return (
    <section className="via-studio-editor" aria-labelledby="studio-draft-heading">
      <div className="via-studio-editor-head">
        <div>
          <p className="via-studio-kicker">Creator draft</p>
          <h2 id="studio-draft-heading">Prepare your next post</h2>
        </div>
        <span className="via-studio-local">Stored only on this device</span>
      </div>

      <p className="via-studio-warning">
        Never enter your 24-word DeSo seed phrase, private key or signing secret here.
      </p>

      <label className="via-studio-field">
        <span>Title</span>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={MAX_TITLE}
          placeholder="Give your draft a working title"
          autoComplete="off"
        />
      </label>

      <div style={toolbarStyle} aria-label="Post tools">
        <button type="button" style={toolButtonStyle} onClick={() => appendText("🙂")} aria-label="Add smile emoji">🙂</button>
        <button type="button" style={toolButtonStyle} onClick={() => appendText("❤️")} aria-label="Add heart emoji">❤️</button>
        <button type="button" style={toolButtonStyle} onClick={() => appendText("🔥")} aria-label="Add fire emoji">🔥</button>
        <button type="button" style={toolButtonStyle} onClick={() => appendText("https://youtu.be/")}>YouTube</button>
        <button type="button" style={toolButtonStyle} onClick={() => appendText("https://")}>Link</button>
        <button
          type="button"
          style={{ ...toolButtonStyle, background: pollEnabled ? "#10261a" : "#07100b" }}
          aria-pressed={pollEnabled}
          onClick={() => setPollEnabled((current) => !current)}
        >
          Poll
        </button>
      </div>

      <label className="via-studio-field">
        <span>Post text</span>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          maxLength={MAX_BODY}
          rows={10}
          placeholder="Write your post, NFT description or creator notes... Paste a YouTube link to preview it directly in VIA."
        />
      </label>

      <YouTubeEmbed text={body} title={title.trim() || "YouTube video shared in VIA Studio"} />

      {pollEnabled ? (
        <div style={pollStyle} aria-label="Poll draft">
          <strong>Poll options</strong>
          <span style={{ color: "#a9b8af", fontSize: "13px" }}>
            Draft only until VIA verifies the exact DeSo poll transaction/metadata format.
          </span>
          {pollOptions.map((option, index) => (
            <div key={index} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                style={pollOptionStyle}
                value={option}
                maxLength={MAX_POLL_OPTION}
                onChange={(event) => updatePollOption(index, event.target.value)}
                placeholder={`Option ${index + 1}`}
                aria-label={`Poll option ${index + 1}`}
              />
              {pollOptions.length > 2 ? (
                <button
                  type="button"
                  style={toolButtonStyle}
                  onClick={() => removePollOption(index)}
                  aria-label={`Remove poll option ${index + 1}`}
                >
                  ×
                </button>
              ) : null}
            </div>
          ))}
          {pollOptions.length < 4 ? (
            <button type="button" style={toolButtonStyle} onClick={addPollOption}>
              Add option
            </button>
          ) : null}
        </div>
      ) : null}

      <div style={selectRowStyle}>
        <label>
          <span className="sr-only">Post language</span>
          <select value={language} onChange={(event) => setLanguage(event.target.value as (typeof languages)[number])} style={selectStyle} aria-label="Post language">
            {languages.map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span className="sr-only">Preferred feed</span>
          <select value={feed} onChange={(event) => setFeed(event.target.value as (typeof feeds)[number])} style={selectStyle} aria-label="Preferred feed">
            {feeds.map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
        </label>
      </div>

      <div className="via-studio-editor-actions">
        <button type="button" onClick={saveDraft}>Save draft</button>
        <button type="button" className="via-studio-secondary" onClick={clearDraft}>Clear</button>
        <button
          type="button"
          className="via-studio-secondary"
          disabled
          title="Direct DeSo posting will only be enabled after authoritative wallet verification and explicit signing."
          aria-disabled="true"
        >
          Post to DeSo — signing not connected
        </button>
        <span aria-live="polite">{remaining} characters left</span>
      </div>

      <p className="via-studio-status" role="status" aria-live="polite">
        {status} · Draft target: {language} / {feed}{pollEnabled ? " · Poll prepared" : ""}. These choices are VIA draft settings until their DeSo behaviour is verified.
      </p>
    </section>
  )
}
