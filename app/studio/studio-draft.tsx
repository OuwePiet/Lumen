"use client"

import { useEffect, useMemo, useState } from "react"
import YouTubeEmbed from "../youtube-embed"
import { restoreIdentitySession, VIA_IDENTITY_EVENT } from "../deso-identity-session"
import {
  readViaLocalSettings,
  VIA_FEEDS,
  VIA_LANGUAGES,
  VIA_STUDIO_DRAFT_KEY,
  type ViaFeed,
  type ViaLanguage,
} from "../via-local-settings"

const MAX_TITLE = 120
const MAX_BODY = 5000
const MAX_POLL_OPTION = 120

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
  const validPoll = draft.pollOptions === undefined || (Array.isArray(draft.pollOptions) && draft.pollOptions.length <= 4 && draft.pollOptions.every((option) => typeof option === "string" && option.length <= MAX_POLL_OPTION))
  return typeof draft.title === "string" && draft.title.length <= MAX_TITLE && typeof draft.body === "string" && draft.body.length <= MAX_BODY && (draft.language === undefined || typeof draft.language === "string") && (draft.feed === undefined || typeof draft.feed === "string") && (draft.pollEnabled === undefined || typeof draft.pollEnabled === "boolean") && validPoll && typeof draft.updatedAt === "number" && Number.isFinite(draft.updatedAt)
}

const toolButton = "min-h-11 min-w-11 rounded-[10px] border border-zinc-700/80 bg-transparent px-3 py-2 text-sm font-semibold text-zinc-300 transition-[background-color,border-color,color] duration-200 hover:border-[#8fd4a9]/45 hover:bg-[#0c1711]/35 hover:text-[#9adbb2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/15"
const field = "w-full rounded-[11px] border border-zinc-700/80 bg-[#050807] px-3 py-3 text-base text-zinc-100 outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-zinc-600 focus:border-[#8fd4a9]/55 focus:ring-2 focus:ring-[#8fd4a9]/10"
const selectClass = "min-h-11 w-full rounded-[10px] border border-zinc-700/80 bg-[#050807] px-3 py-2 text-sm text-zinc-100 outline-none focus:border-[#8fd4a9]/55 focus:ring-2 focus:ring-[#8fd4a9]/10"

export default function StudioDraft() {
  const [canEdit, setCanEdit] = useState(false)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [language, setLanguage] = useState<ViaLanguage>("Dutch")
  const [feed, setFeed] = useState<ViaFeed>("Hot Feed")
  const [pollEnabled, setPollEnabled] = useState(false)
  const [pollOptions, setPollOptions] = useState(["", ""])
  const [status, setStatus] = useState("No draft saved on this device.")

  useEffect(() => {
    function syncIdentity() {
      const active = Boolean(restoreIdentitySession())
      setCanEdit(active)
      if (!active) {
        setTitle("")
        setBody("")
        setPollEnabled(false)
        setPollOptions(["", ""])
        setStatus("DeSo login is required to prepare or open local drafts.")
      }
    }

    syncIdentity()
    window.addEventListener(VIA_IDENTITY_EVENT, syncIdentity)
    return () => window.removeEventListener(VIA_IDENTITY_EVENT, syncIdentity)
  }, [])

  useEffect(() => {
    if (!canEdit) return
    const defaults = readViaLocalSettings()
    setLanguage(defaults.defaultLanguage)
    setFeed(defaults.defaultFeed)

    try {
      const raw = window.localStorage.getItem(VIA_STUDIO_DRAFT_KEY)
      if (!raw) {
        setStatus(`Using Settings defaults: ${defaults.defaultLanguage} / ${defaults.defaultFeed}.`)
        return
      }
      const parsed: unknown = JSON.parse(raw)
      if (!validDraft(parsed)) {
        try { window.localStorage.removeItem(VIA_STUDIO_DRAFT_KEY) } catch { /* Ignore blocked local storage during recovery. */ }
        setStatus(`Using Settings defaults: ${defaults.defaultLanguage} / ${defaults.defaultFeed}.`)
        return
      }
      setTitle(parsed.title)
      setBody(parsed.body)
      if (VIA_LANGUAGES.includes(parsed.language as ViaLanguage)) setLanguage(parsed.language as ViaLanguage)
      if (VIA_FEEDS.includes(parsed.feed as ViaFeed)) setFeed(parsed.feed as ViaFeed)
      setPollEnabled(Boolean(parsed.pollEnabled))
      if (parsed.pollOptions && parsed.pollOptions.length >= 2) setPollOptions(parsed.pollOptions.slice(0, 4))
      setStatus(`Draft restored from ${new Date(parsed.updatedAt).toLocaleString()}.`)
    } catch {
      try { window.localStorage.removeItem(VIA_STUDIO_DRAFT_KEY) } catch { /* Keep Studio usable when local storage is blocked. */ }
      setStatus("Local Studio drafts are unavailable in this browser.")
    }
  }, [canEdit])

  const remaining = useMemo(() => MAX_BODY - body.length, [body.length])

  function appendText(text: string) {
    setBody((current) => `${current}${current && !current.endsWith(" ") ? " " : ""}${text}`.slice(0, MAX_BODY))
  }

  function updatePollOption(index: number, value: string) {
    setPollOptions((current) => current.map((option, optionIndex) => optionIndex === index ? value.slice(0, MAX_POLL_OPTION) : option))
  }

  function addPollOption() { setPollOptions((current) => current.length >= 4 ? current : [...current, ""]) }
  function removePollOption(index: number) { setPollOptions((current) => current.length <= 2 ? current : current.filter((_, optionIndex) => optionIndex !== index)) }

  function saveDraft() {
    const next: DraftState = { title: title.trim(), body, language, feed, pollEnabled, pollOptions: pollEnabled ? pollOptions : [], updatedAt: Date.now() }
    try { window.localStorage.setItem(VIA_STUDIO_DRAFT_KEY, JSON.stringify(next)); setStatus("Draft saved locally on this device.") }
    catch { setStatus("Draft could not be saved in this browser.") }
  }

  function clearDraft() {
    const defaults = readViaLocalSettings()
    setTitle(""); setBody(""); setLanguage(defaults.defaultLanguage); setFeed(defaults.defaultFeed); setPollEnabled(false); setPollOptions(["", ""])
    try {
      window.localStorage.removeItem(VIA_STUDIO_DRAFT_KEY)
      setStatus(`Local Studio draft cleared. Settings defaults restored: ${defaults.defaultLanguage} / ${defaults.defaultFeed}.`)
    } catch {
      setStatus("Draft cleared from the editor, but local browser storage is unavailable.")
    }
  }

  if (!canEdit) {
    return (
      <section className="mb-4 rounded-[14px] border border-zinc-800/80 bg-zinc-950/55 p-5 sm:p-6" aria-labelledby="studio-draft-heading">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">Creator draft</p>
        <h2 id="studio-draft-heading" className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100">Prepare your next post</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-400">Public Entrance is read-only. Log in with DeSo to prepare, save or open local VIA drafts.</p>
      </section>
    )
  }

  return (
    <section className="mb-4 rounded-[14px] border border-zinc-800/80 bg-zinc-950/55 p-5 sm:p-6" aria-labelledby="studio-draft-heading">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">Creator draft</p>
          <h2 id="studio-draft-heading" className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100">Prepare your next post</h2>
        </div>
        <span className="rounded-[9px] border border-[#8fd4a9]/30 bg-[#0c1711]/40 px-3 py-2 text-xs font-semibold text-[#8fd4a9]">Stored only on this device</span>
      </div>

      <p className="mb-5 rounded-[11px] border border-amber-900/50 bg-amber-950/15 px-3 py-3 text-sm leading-6 text-amber-100/80">Never enter your 24-word DeSo seed phrase, private key or signing secret here.</p>

      <label className="mb-4 grid gap-2"><span className="text-sm font-semibold text-zinc-200">Title</span><input type="text" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={MAX_TITLE} placeholder="Give your draft a working title" autoComplete="off" className={field} /></label>

      <div className="mb-4 flex flex-wrap gap-2" aria-label="Post tools">
        <button type="button" className={toolButton} onClick={() => appendText("🙂")} aria-label="Add smile emoji">🙂</button>
        <button type="button" className={toolButton} onClick={() => appendText("❤️")} aria-label="Add heart emoji">❤️</button>
        <button type="button" className={toolButton} onClick={() => appendText("🔥")} aria-label="Add fire emoji">🔥</button>
        <button type="button" className={toolButton} onClick={() => appendText("https://youtu.be/")}>YouTube</button>
        <button type="button" className={toolButton} onClick={() => appendText("https://")}>Link</button>
        <button type="button" className={`${toolButton} ${pollEnabled ? "border-[#8fd4a9]/60 bg-[#0c1711]/55 text-[#9adbb2] shadow-[inset_0_0_16px_rgba(143,212,169,0.035)]" : ""}`} aria-pressed={pollEnabled} onClick={() => setPollEnabled((current) => !current)}>Poll</button>
      </div>

      <label className="mb-4 grid gap-2"><span className="text-sm font-semibold text-zinc-200">Post text</span><textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={MAX_BODY} rows={10} placeholder="Write your post, NFT description or creator notes... Paste a YouTube link to preview it directly in VIA." className={`${field} resize-y`} /></label>

      <YouTubeEmbed text={body} title={title.trim() || "YouTube video shared in VIA Studio"} />

      {pollEnabled ? (
        <div className="mb-4 grid gap-3 rounded-[12px] border border-zinc-800/80 bg-black/25 p-4" aria-label="Poll draft">
          <strong className="text-sm text-zinc-100">Poll options</strong>
          <span className="text-xs leading-5 text-zinc-500">Prepare poll options locally here. Publishing happens through the released VIA Social poll flow with explicit DeSo Identity approval.</span>
          {pollOptions.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <input className={field} value={option} maxLength={MAX_POLL_OPTION} onChange={(event) => updatePollOption(index, event.target.value)} placeholder={`Option ${index + 1}`} aria-label={`Poll option ${index + 1}`} />
              {pollOptions.length > 2 ? <button type="button" className={toolButton} onClick={() => removePollOption(index)} aria-label={`Remove poll option ${index + 1}`}>×</button> : null}
            </div>
          ))}
          {pollOptions.length < 4 ? <button type="button" className={toolButton} onClick={addPollOption}>Add option</button> : null}
        </div>
      ) : null}

      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        <label><span className="sr-only">Post language</span><select value={language} onChange={(event) => setLanguage(event.target.value as ViaLanguage)} className={selectClass} aria-label="Post language">{VIA_LANGUAGES.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
        <label><span className="sr-only">Preferred feed</span><select value={feed} onChange={(event) => setFeed(event.target.value as ViaFeed)} className={selectClass} aria-label="Preferred feed">{VIA_FEEDS.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={saveDraft} className="min-h-11 rounded-[11px] border border-[#8fd4a9]/55 bg-transparent px-4 py-2 text-sm font-semibold text-[#9adbb2] transition-[background-color,border-color] duration-200 hover:border-[#8fd4a9]/75 hover:bg-[#0c1711]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/15">Save draft</button>
        <button type="button" onClick={clearDraft} className={toolButton}>Clear</button>
        <a href="/social" className="min-h-11 inline-flex items-center rounded-[11px] border border-[#8fd4a9]/45 bg-transparent px-4 py-2 text-sm font-semibold text-[#9adbb2]">Continue to released DeSo post</a>
        <span className="ml-auto text-xs text-zinc-500" aria-live="polite">{remaining} characters left</span>
      </div>

      <p className="mt-3 min-h-5 text-xs leading-5 text-zinc-400" role="status" aria-live="polite">{status} · Draft target: {language} / {feed}{pollEnabled ? " · Poll prepared" : ""}. Draft settings stay local here. Released DeSo posting and poll publishing are handled by VIA Social with explicit DeSo Identity approval.</p>
    </section>
  )
}
