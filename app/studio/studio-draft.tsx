"use client"

import { useEffect, useMemo, useState } from "react"
import YouTubeEmbed from "../youtube-embed"

const STORAGE_KEY = "via:studio:draft:v1"
const MAX_TITLE = 120
const MAX_BODY = 5000

type DraftState = {
  title: string
  body: string
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
    typeof draft.updatedAt === "number" &&
    Number.isFinite(draft.updatedAt)
  )
}

export default function StudioDraft() {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
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
      setStatus(`Draft restored from ${new Date(parsed.updatedAt).toLocaleString()}.`)
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const remaining = useMemo(() => MAX_BODY - body.length, [body.length])

  function saveDraft() {
    const next: DraftState = { title: title.trim(), body, updatedAt: Date.now() }
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

      <div className="via-studio-editor-actions">
        <button type="button" onClick={saveDraft}>Save draft</button>
        <button type="button" className="via-studio-secondary" onClick={clearDraft}>Clear</button>
        <span aria-live="polite">{remaining} characters left</span>
      </div>

      <p className="via-studio-status" role="status" aria-live="polite">{status}</p>
    </section>
  )
}
