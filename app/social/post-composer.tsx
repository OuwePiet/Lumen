"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { DESO_IDENTITY_ORIGIN, restoreIdentitySession, VIA_IDENTITY_EVENT, type ViaIdentitySession } from "../deso-identity-session"

const MAX_POST_LENGTH = 5000

type PrepareResponse = {
  ok?: boolean
  transactionHex?: string
  feeNanos?: number | null
  error?: string
}

type SubmitResponse = {
  ok?: boolean
  transaction?: Record<string, unknown>
  error?: string
}

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

export default function PostComposer() {
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const [body, setBody] = useState("")
  const [status, setStatus] = useState<"idle" | "preparing" | "awaiting-approval" | "submitting" | "done" | "error">("idle")
  const [message, setMessage] = useState("")
  const [feeNanos, setFeeNanos] = useState<number | null>(null)
  const popupRef = useRef<Window | null>(null)

  useEffect(() => {
    setSession(restoreIdentitySession())
    const onSession = (event: Event) => {
      const custom = event as CustomEvent<ViaIdentitySession | null>
      setSession(custom.detail ?? restoreIdentitySession())
    }
    window.addEventListener(VIA_IDENTITY_EVENT, onSession)
    return () => window.removeEventListener(VIA_IDENTITY_EVENT, onSession)
  }, [])

  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      const signedTransactionHex = signedTransactionFromMessage(event, popupRef.current)
      if (!signedTransactionHex) return

      popupRef.current?.close()
      popupRef.current = null
      setStatus("submitting")
      setMessage("Submitting the approved post to DeSo…")

      try {
        const response = await fetch("/api/via/social/post", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ action: "submit", signedTransactionHex }),
        })
        const data = await response.json() as SubmitResponse
        if (!response.ok || !data.ok) throw new Error(data.error || "SUBMIT_FAILED")

        setStatus("done")
        setMessage("Post submitted to DeSo.")
        setBody("")
        setFeeNanos(null)
      } catch {
        setStatus("error")
        setMessage("The post could not be submitted. Nothing was posted by VIA.")
      }
    }

    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [])

  const remaining = MAX_POST_LENGTH - body.length
  const canPrepare = Boolean(session && body.trim() && body.length <= MAX_POST_LENGTH && status !== "preparing" && status !== "awaiting-approval" && status !== "submitting")
  const feeLabel = useMemo(() => {
    if (feeNanos === null) return null
    return `${feeNanos.toLocaleString()} nanos network fee in the prepared transaction`
  }, [feeNanos])

  async function preparePost() {
    if (!session || !canPrepare) return
    setStatus("preparing")
    setMessage("Preparing the exact DeSo post transaction…")
    setFeeNanos(null)

    try {
      const response = await fetch("/api/via/social/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ action: "prepare", publicKey: session.publicKey, body }),
      })
      const data = await response.json() as PrepareResponse
      if (!response.ok || !data.ok || !data.transactionHex) throw new Error(data.error || "PREPARE_FAILED")

      setFeeNanos(typeof data.feeNanos === "number" ? data.feeNanos : null)
      const approveUrl = `${DESO_IDENTITY_ORIGIN}/approve?tx=${encodeURIComponent(data.transactionHex)}`
      const width = Math.min(800, window.screen.availWidth)
      const height = Math.min(900, window.screen.availHeight)
      const popup = window.open(approveUrl, "via-deso-approve", `popup=yes,width=${Math.round(width)},height=${Math.round(height)}`)

      if (!popup) {
        setStatus("error")
        setMessage("Approval window was blocked. Nothing was posted. Allow the popup and try again.")
        return
      }

      popupRef.current = popup
      setStatus("awaiting-approval")
      setMessage("Review and approve the exact post in DeSo Identity. VIA will not submit it without that approval.")
    } catch {
      setStatus("error")
      setMessage("The post transaction could not be prepared. Nothing was posted.")
    }
  }

  if (!session) {
    return (
      <div className="mt-4 rounded-xl border border-zinc-800 bg-black/30 p-4 text-sm text-zinc-500">
        Connect through the DeSo participation gate above before composing a public post.
      </div>
    )
  }

  return (
    <div className="mt-5 rounded-2xl border border-green-900/60 bg-black/35 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-400">First write action · DeSo post</p>
          <p className="mt-1 text-xs text-zinc-500">Connected key: {session.publicKey.slice(0, 10)}…{session.publicKey.slice(-6)}</p>
        </div>
        <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400">Approval required every post</span>
      </div>

      <label htmlFor="via-post-body" className="mt-4 block text-sm font-medium text-zinc-200">Post text</label>
      <textarea
        id="via-post-body"
        value={body}
        onChange={(event) => { setBody(event.target.value); if (status === "done" || status === "error") { setStatus("idle"); setMessage("") } }}
        maxLength={MAX_POST_LENGTH}
        rows={5}
        placeholder="What would you like to share on DeSo?"
        className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm text-zinc-100 outline-none focus:border-green-700"
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
        <span>{remaining.toLocaleString()} characters left</span>
        {feeLabel ? <span>{feeLabel}</span> : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={preparePost}
          disabled={!canPrepare}
          className="rounded-xl border border-green-700 px-4 py-2 text-sm font-semibold text-green-300 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:text-zinc-600"
        >
          {status === "preparing" ? "Preparing…" : status === "awaiting-approval" ? "Awaiting DeSo approval…" : status === "submitting" ? "Submitting…" : "Review in DeSo & post"}
        </button>
        <span className="text-xs text-zinc-600">VIA never signs this transaction itself.</span>
      </div>

      {message ? <p className={`mt-3 text-sm ${status === "done" ? "text-green-300" : status === "error" ? "text-amber-300" : "text-zinc-400"}`}>{message}</p> : null}
    </div>
  )
}
