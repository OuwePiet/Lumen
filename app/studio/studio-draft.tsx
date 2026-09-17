"use client"

import { useEffect, useMemo, useState } from "react"
import YouTubeEmbed from "../youtube-embed"
import { restoreIdentitySession, VIA_IDENTITY_EVENT } from "../deso-identity-session"
import {
  readViaLocalSettings,
  VIA_FEEDS,
  VIA_LANGUAGES,
  VIA_SETTINGS_EVENT,
  VIA_STUDIO_DRAFT_KEY,
  type ViaFeed,
  type ViaLanguage,
} from "../via-local-settings"
import { studioDraftCopy } from "./studio-draft-localized"

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
  const [interfaceLanguage, setInterfaceLanguage] = useState<ViaLanguage>("English")
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [language, setLanguage] = useState<ViaLanguage>("Dutch")
  const [feed, setFeed] = useState<ViaFeed>("Hot Feed")
  const [pollEnabled, setPollEnabled] = useState(false)
  const [pollOptions, setPollOptions] = useState(["", ""])
  const [status, setStatus] = useState("")
  const t = studioDraftCopy(interfaceLanguage)

  useEffect(() => {
    const refreshLanguage = () => setInterfaceLanguage(readViaLocalSettings().interfaceLanguage)
    refreshLanguage()
    window.addEventListener(VIA_SETTINGS_EVENT, refreshLanguage)
    return () => window.removeEventListener(VIA_SETTINGS_EVENT, refreshLanguage)
  }, [])

  useEffect(() => {
    function syncIdentity() {
      const active = Boolean(restoreIdentitySession())
      setCanEdit(active)
      if (!active) {
        setTitle("")
        setBody("")
        setPollEnabled(false)
        setPollOptions(["", ""])
        const activeCopy = studioDraftCopy(readViaLocalSettings().interfaceLanguage)
        setStatus(activeCopy.loginRequired)
      }
    }

    syncIdentity()
    window.addEventListener(VIA_IDENTITY_EVENT, syncIdentity)
    return () => window.removeEventListener(VIA_IDENTITY_EVENT, syncIdentity)
  }, [])

  useEffect(() => {
    if (!canEdit) return
    const defaults = readViaLocalSettings()
    const activeCopy = studioDraftCopy(defaults.interfaceLanguage)
    setLanguage(defaults.defaultLanguage)
    setFeed(defaults.defaultFeed)

    try {
      const raw = window.localStorage.getItem(VIA_STUDIO_DRAFT_KEY)
      if (!raw) {
        setStatus(`${activeCopy.usingDefaults}: ${defaults.defaultLanguage} / ${defaults.defaultFeed}.`)
        return
      }
      const parsed: unknown = JSON.parse(raw)
      if (!validDraft(parsed)) {
        try { window.localStorage.removeItem(VIA_STUDIO_DRAFT_KEY) } catch { /* Ignore blocked local storage during recovery. */ }
        setStatus(`${activeCopy.usingDefaults}: ${defaults.defaultLanguage} / ${defaults.defaultFeed}.`)
        return
      }
      setTitle(parsed.title)
      setBody(parsed.body)
      if (VIA_LANGUAGES.includes(parsed.language as ViaLanguage)) setLanguage(parsed.language as ViaLanguage)
      if (VIA_FEEDS.includes(parsed.feed as ViaFeed)) setFeed(parsed.feed as ViaFeed)
      setPollEnabled(Boolean(parsed.pollEnabled))
      if (parsed.pollOptions && parsed.pollOptions.length >= 2) setPollOptions(parsed.pollOptions.slice(0, 4))
      setStatus(`${activeCopy.restoredFrom} ${new Date(parsed.updatedAt).toLocaleString()}.`)
    } catch {
      try { window.localStorage.removeItem(VIA_STUDIO_DRAFT_KEY) } catch { /* Keep Studio usable when local storage is blocked. */ }
      setStatus(activeCopy.unavailable)
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
    const activeCopy = studioDraftCopy(readViaLocalSettings().interfaceLanguage)
    try { window.localStorage.setItem(VIA_STUDIO_DRAFT_KEY, JSON.stringify(next)); setStatus(activeCopy.saved) }
    catch { setStatus(activeCopy.saveFailed) }
  }

  function clearDraft() {
    const defaults = readViaLocalSettings()
    const activeCopy = studioDraftCopy(defaults.interfaceLanguage)
    setTitle(""); setBody(""); setLanguage(defaults.defaultLanguage); setFeed(defaults.defaultFeed); setPollEnabled(false); setPollOptions(["", ""])
    try {
      window.localStorage.removeItem(VIA_STUDIO_DRAFT_KEY)
      setStatus(`${activeCopy.clearedDefaults}: ${defaults.defaultLanguage} / ${defaults.defaultFeed}.`)
    } catch {
      setStatus(activeCopy.clearStorageFailed)
    }
  }

  if (!canEdit) {
    return (
      <section className="mb-4 rounded-[14px] border border-zinc-800/80 bg-zinc-950/55 p-5 sm:p-6" aria-labelledby="studio-draft-heading">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">{t.creatorDraft}</p>
        <h2 id="studio-draft-heading" className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100">{t.prepareNextPost}</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-400">{t.readOnly}</p>
      </section>
    )
  }

  return (
    <section className="mb-4 rounded-[14px] border border-zinc-800/80 bg-zinc-950/55 p-5 sm:p-6" aria-labelledby="studio-draft-heading">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">{t.creatorDraft}</p>
          <h2 id="studio-draft-heading" className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100">{t.prepareNextPost}</h2>
        </div>
        <span className="rounded-[9px] border border-[#8fd4a9]/30 bg-[#0c1711]/40 px-3 py-2 text-xs font-semibold text-[#8fd4a9]">{t.storedDevice}</span>
      </div>

      <p className="mb-5 rounded-[11px] border border-amber-900/50 bg-amber-950/15 px-3 py-3 text-sm leading-6 text-amber-100/80">{t.seedWarning}</p>

      <label className="mb-4 grid gap-2"><span className="text-sm font-semibold text-zinc-200">{t.title}</span><input type="text" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={MAX_TITLE} placeholder={t.titlePlaceholder} autoComplete="off" className={field} /></label>

      <div className="mb-4 flex flex-wrap gap-2" aria-label={t.postTools}>
        <button type="button" className={toolButton} onClick={() => appendText("🙂")} aria-label={t.addSmile}>🙂</button>
        <button type="button" className={toolButton} onClick={() => appendText("❤️")} aria-label={t.addHeart}>❤️</button>
        <button type="button" className={toolButton} onClick={() => appendText("🔥")} aria-label={t.addFire}>🔥</button>
        <button type="button" className={toolButton} onClick={() => appendText("https://youtu.be/")}>YouTube</button>
        <button type="button" className={toolButton} onClick={() => appendText("https://")}>Link</button>
        <button type="button" className={`${toolButton} ${pollEnabled ? "border-[#8fd4a9]/60 bg-[#0c1711]/55 text-[#9adbb2] shadow-[inset_0_0_16px_rgba(143,212,169,0.035)]" : ""}`} aria-pressed={pollEnabled} onClick={() => setPollEnabled((current) => !current)}>{t.poll}</button>
      </div>

      <label className="mb-4 grid gap-2"><span className="text-sm font-semibold text-zinc-200">{t.postText}</span><textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={MAX_BODY} rows={10} placeholder={t.postPlaceholder} className={`${field} resize-y`} /></label>

      <YouTubeEmbed text={body} title={title.trim() || "YouTube · VIA Studio"} />

      {pollEnabled ? (
        <div className="mb-4 grid gap-3 rounded-[12px] border border-zinc-800/80 bg-black/25 p-4" aria-label={t.pollDraft}>
          <strong className="text-sm text-zinc-100">{t.pollOptions}</strong>
          <span className="text-xs leading-5 text-zinc-500">{t.pollHelp}</span>
          {pollOptions.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <input className={field} value={option} maxLength={MAX_POLL_OPTION} onChange={(event) => updatePollOption(index, event.target.value)} placeholder={`${t.option} ${index + 1}`} aria-label={`${t.option} ${index + 1}`} />
              {pollOptions.length > 2 ? <button type="button" className={toolButton} onClick={() => removePollOption(index)} aria-label={`${t.removeOption} ${index + 1}`}>×</button> : null}
            </div>
          ))}
          {pollOptions.length < 4 ? <button type="button" className={toolButton} onClick={addPollOption}>{t.addOption}</button> : null}
        </div>
      ) : null}

      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        <label><span className="sr-only">{t.postLanguage}</span><select value={language} onChange={(event) => setLanguage(event.target.value as ViaLanguage)} className={selectClass} aria-label={t.postLanguage}>{VIA_LANGUAGES.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
        <label><span className="sr-only">{t.preferredFeed}</span><select value={feed} onChange={(event) => setFeed(event.target.value as ViaFeed)} className={selectClass} aria-label={t.preferredFeed}>{VIA_FEEDS.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={saveDraft} className="min-h-11 rounded-[11px] border border-[#8fd4a9]/55 bg-transparent px-4 py-2 text-sm font-semibold text-[#9adbb2] transition-[background-color,border-color] duration-200 hover:border-[#8fd4a9]/75 hover:bg-[#0c1711]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/15">{t.saveDraft}</button>
        <button type="button" onClick={clearDraft} className={toolButton}>{t.clear}</button>
        <a href="/social" className="min-h-11 inline-flex items-center rounded-[11px] border border-[#8fd4a9]/45 bg-transparent px-4 py-2 text-sm font-semibold text-[#9adbb2]">{t.continuePost}</a>
        <span className="ml-auto text-xs text-zinc-500" aria-live="polite">{remaining} {t.charactersLeft}</span>
      </div>

      <p className="mt-3 min-h-5 text-xs leading-5 text-zinc-400" role="status" aria-live="polite">{status}{status ? " · " : ""}{t.draftTarget}: {language} / {feed}{pollEnabled ? ` · ${t.pollPrepared}` : ""}. {t.localFooter}</p>
    </section>
  )
}
