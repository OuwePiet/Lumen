"use client"

import { useEffect, useRef, useState } from "react"
import { DESO_IDENTITY_ORIGIN, restoreIdentitySession, VIA_IDENTITY_EVENT, type ViaIdentitySession } from "../deso-identity-session"

const MAX_QUOTE_LENGTH = 5000

type Props = {
  postHash: string
  initialCount: number
}

type PrepareResponse = { ok?: boolean; transactionHex?: string; feeNanos?: number | null; error?: string }
type SubmitResponse = { ok?: boolean; error?: string }

function signedTransactionFromMessage(event: MessageEvent, source: Window | null) {
  if (event.origin !== DESO_IDENTITY_ORIGIN || event.source !== source) return null
  if (!event.data || typeof event.data !== "object") return null
  const data = event.data as Record<string, unknown>
  if (data.service !== "identity") return null
  const payload = data.payload
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null
  const signed = (payload as Record<string, unknown>).signedTransactionHex
  return typeof signed === "string" && signed.length > 0 ? signed : null
}

export default function RepostButton({ postHash, initialCount }: Props) {
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const [count, setCount] = useState(initialCount)
  const [busy, setBusy] = useState(false)
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [quote, setQuote] = useState("")
  const [message, setMessage] = useState("")
  const popupRef = useRef<Window | null>(null)
  const pendingQuote = useRef(false)

  useEffect(() => {
    setSession(restoreIdentitySession())
    const onIdentity = (event: Event) => {
      const custom = event as CustomEvent<ViaIdentitySession | null>
      setSession(custom.detail ?? restoreIdentitySession())
    }
    window.addEventListener(VIA_IDENTITY_EVENT, onIdentity)
    return () => window.removeEventListener(VIA_IDENTITY_EVENT, onIdentity)
  }, [])

  useEffect(() => setCount(initialCount), [initialCount])

  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      const signedTransactionHex = signedTransactionFromMessage(event, popupRef.current)
      if (!signedTransactionHex) return
      popupRef.current?.close()
      popupRef.current = null
      try {
        const response = await fetch("/api/via/social/repost", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ action: "submit", signedTransactionHex }),
        })
        const data = await response.json() as SubmitResponse
        if (!response.ok || !data.ok) throw new Error(data.error || "SUBMIT_FAILED")
        setCount((current) => current + 1)
        setMessage(pendingQuote.current ? "Quote Repost submitted to DeSo." : "Reposted on DeSo.")
        setQuote("")
        setQuoteOpen(false)
      } catch {
        setMessage("Repost transaction failed. Nothing was changed by VIA.")
      } finally {
        setBusy(false)
      }
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [])

  async function prepareRepost(asQuote: boolean) {
    if (!session || busy) return
    const quoteText = asQuote ? quote.trim() : ""
    if (asQuote && !quoteText) {
      setMessage("Write a quote before continuing.")
      return
    }
    if (quoteText.length > MAX_QUOTE_LENGTH) return

    pendingQuote.current = asQuote
    setBusy(true)
    setMessage(asQuote ? "Preparing DeSo Quote Repost…" : "Preparing DeSo repost…")

    try {
      const response = await fetch("/api/via/social/repost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ action: "prepare", publicKey: session.publicKey, repostedPostHash: postHash, quote: quoteText }),
      })
      const data = await response.json() as PrepareResponse
      if (!response.ok || !data.ok || !data.transactionHex) throw new Error(data.error || "PREPARE_FAILED")

      const approveUrl = `${DESO_IDENTITY_ORIGIN}/approve?tx=${encodeURIComponent(data.transactionHex)}`
      const popup = window.open(approveUrl, "via-deso-repost-approve", "popup=yes,width=800,height=900")
      if (!popup) {
        setMessage("Approval window was blocked. Nothing changed.")
        setBusy(false)
        return
      }
      popupRef.current = popup
      setMessage(typeof data.feeNanos === "number"
        ? `Review in DeSo Identity · network fee ${data.feeNanos.toLocaleString()} nanos`
        : `Review this ${asQuote ? "Quote Repost" : "repost"} in DeSo Identity.`)
    } catch {
      setMessage("Repost transaction could not be prepared. Nothing changed.")
      setBusy(false)
    }
  }

  if (!session) return <span>{count} reposts</span>

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button type="button" onClick={() => void prepareRepost(false)} disabled={busy} className="rounded-full border border-green-900/70 px-3 py-1 text-green-300 hover:border-green-700 disabled:cursor-wait disabled:opacity-60">
        {busy && !pendingQuote.current ? "Waiting…" : `Repost · ${count}`}
      </button>
      <button type="button" onClick={() => setQuoteOpen((open) => !open)} disabled={busy} className="rounded-full border border-zinc-800 px-3 py-1 text-zinc-300 hover:border-zinc-700 disabled:opacity-60">
        Quote
      </button>
      {quoteOpen ? <span className="basis-full rounded-xl border border-zinc-800 bg-black/30 p-3">
        <label className="sr-only" htmlFor={`via-quote-${postHash}`}>Quote Repost text</label>
        <textarea id={`via-quote-${postHash}`} value={quote} onChange={(event) => setQuote(event.target.value)} maxLength={MAX_QUOTE_LENGTH} rows={3} placeholder="Add your public quote…" className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-green-700" />
        <button type="button" onClick={() => void prepareRepost(true)} disabled={busy || !quote.trim()} className="mt-2 rounded-lg border border-green-800 px-3 py-1.5 text-xs font-medium text-green-300 disabled:border-zinc-800 disabled:text-zinc-600">Review Quote Repost in DeSo</button>
      </span> : null}
      {message ? <span className="sr-only" role="status" aria-live="polite">{message}</span> : null}
    </span>
  )
}
