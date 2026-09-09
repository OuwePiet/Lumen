"use client"

import { useEffect, useState } from "react"

const STORAGE_KEY = "via:social:draft:v1"
const MAX_LENGTH = 2000

export default function SocialDraft() {
  const [text, setText] = useState("")
  const [status, setStatus] = useState("")

  useEffect(() => {
    try {
      setText(window.localStorage.getItem(STORAGE_KEY) ?? "")
    } catch {
      setStatus("Local drafts are unavailable in this browser.")
    }
  }, [])

  function saveDraft() {
    try {
      window.localStorage.setItem(STORAGE_KEY, text)
      setStatus("Draft saved on this device.")
    } catch {
      setStatus("Draft could not be saved locally.")
    }
  }

  function clearDraft() {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Keep the editor usable even when browser storage is unavailable.
    }
    setText("")
    setStatus("Draft cleared.")
  }

  return (
    <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5" aria-labelledby="draft-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-400">Local draft</p>
      <h2 id="draft-heading" className="mt-2 text-2xl font-semibold">Write without publishing</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
        This editor saves only in this browser. It does not upload, publish, sign a DeSo transaction or send your text to VIA.
      </p>
      <label htmlFor="via-social-draft" className="mt-4 block text-sm font-medium text-zinc-200">Post draft</label>
      <textarea
        id="via-social-draft"
        value={text}
        maxLength={MAX_LENGTH}
        onChange={(event) => {
          setText(event.target.value)
          setStatus("")
        }}
        rows={6}
        placeholder="Write a future VIA / DeSo post..."
        className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-3 text-base leading-6 text-white outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-900"
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-zinc-500">{text.length}/{MAX_LENGTH} characters · local to this browser</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={clearDraft} className="min-h-11 rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500">Clear</button>
          <button type="button" onClick={saveDraft} className="min-h-11 rounded-full border border-green-800 bg-green-950/30 px-4 py-2 text-sm font-semibold text-green-300 hover:border-green-500">Save draft</button>
        </div>
      </div>
      <p className="mt-3 min-h-5 text-xs text-zinc-400" role="status" aria-live="polite">{status}</p>
    </section>
  )
}
