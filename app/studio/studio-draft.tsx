"use client"

import { useEffect, useMemo, useState } from "react"
import YouTubeEmbed from "../youtube-embed"

const STORAGE_KEY = "via:studio:draft:v1"
const MAX_TITLE = 120
const MAX_BODY = 5000

const languages = ["Dutch", "English", "French", "Spanish", "Chinese"] as const
const feeds = ["Hot Feed", "Following", "Recent"] as const

type DraftState = {
  title: string
  body: string
  language?: string
  feed?: string
  updatedAt: number
}

function validDraft(value: unknown): value is DraftState {
  if (!value || typeof value !== "object") return false
  const draft = value as Partial<DraftState>
  return (
    typeof draft.title === "string" &&
    draft.title.length <= MAX_TITLE &&
    typeof draft.body === "string" &&
    draft.body.length <= MAX_BODY &&
    (draft.language === undefined || typeof draft.language === "string") &&
    (draft.feed === undefined || typeof draft.feed === "string") &&
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

export default function StudioDraft() {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [language, setLanguage] = useState<(typeof languages)[number]>("Dutch")
  const [feed, setFeed] = useState<(typeof feeds)[number]>("Hot Feed")
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
      setStatus(`Draft restored from ${new Date(parsed.updatedAt).toLocaleString()}.`)
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const remaining = useMemo(() => MAX_BODY - body.length, [body.length])

  function appendText(text: string) {
    setBody((current) => `${current}${current && !current.endsWith(" ") ? " " : ""}${text}`.slice(0, MAX_BODY))
  }

  function saveDraft() {
    const next: DraftState = {
      title: title.trim(),
      body,
      language,
      feed,
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
        {status} · Draft target: {language} / {feed}. These choices are VIA draft settings until their DeSo behaviour is verified.
      </p>
    </section>
  )
}
