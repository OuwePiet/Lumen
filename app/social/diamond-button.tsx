"use client"

import { useEffect, useRef, useState } from "react"
import { DESO_IDENTITY_ORIGIN, restoreIdentitySession } from "../deso-identity-session"

type Props = { postHash: string; receiverPublicKey: string; initialCount: number }
type PrepareResponse = { ok?: boolean; transactionHex?: string; feeNanos?: number | null; spendAmountNanos?: number | null; error?: string }

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

export default function DiamondButton({ postHash, receiverPublicKey, initialCount }: Props) {
  const [level, setLevel] = useState(1)
  const [count, setCount] = useState(initialCount)
  const [confirmValue, setConfirmValue] = useState(false)
  const [status, setStatus] = useState<"idle" | "preparing" | "approval" | "submitting" | "done" | "error">("idle")
  const [message, setMessage] = useState("")
  const [feeNanos, setFeeNanos] = useState<number | null>(null)
  const [spendNanos, setSpendNanos] = useState<number | null>(null)
  const popupRef = useRef<Window | null>(null)

  useEffect(() => {
    async function onMessage(event: MessageEvent) {
      const signedTransactionHex = signedTransactionFromMessage(event, popupRef.current)
      if (!signedTransactionHex) return
      popupRef.current?.close(); popupRef.current = null
      setStatus("submitting"); setMessage("Submitting your explicitly approved Diamond to DeSo…")
      try {
        const response = await fetch("/api/via/social/diamond", { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", body: JSON.stringify({ action: "submit", signedTransactionHex }) })
        const data = await response.json() as { ok?: boolean; error?: string }
        if (!response.ok || !data.ok) throw new Error(data.error || "SUBMIT_FAILED")
        setCount((value) => value + 1); setStatus("done"); setMessage(`Diamond level ${level} submitted.`); setConfirmValue(false)
      } catch { setStatus("error"); setMessage("Diamond was not submitted by VIA.") }
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [level])

  async function prepare() {
    const session = restoreIdentitySession()
    if (!session || !confirmValue || status === "preparing" || status === "approval" || status === "submitting") return
    setStatus("preparing"); setMessage("Preparing the exact value-transfer transaction…"); setFeeNanos(null); setSpendNanos(null)
    try {
      const response = await fetch("/api/via/social/diamond", { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", body: JSON.stringify({ action: "prepare", senderPublicKey: session.publicKey, receiverPublicKey, diamondPostHashHex: postHash, diamondLevel: level, confirmed: true }) })
      const data = await response.json() as PrepareResponse
      if (!response.ok || !data.ok || !data.transactionHex) throw new Error(data.error || "PREPARE_FAILED")
      setFeeNanos(typeof data.feeNanos === "number" ? data.feeNanos : null); setSpendNanos(typeof data.spendAmountNanos === "number" ? data.spendAmountNanos : null)
      const popup = window.open(`${DESO_IDENTITY_ORIGIN}/approve?tx=${encodeURIComponent(data.transactionHex)}`, "via-deso-diamond-approve", `popup=yes,width=${Math.min(800, window.screen.availWidth)},height=${Math.min(900, window.screen.availHeight)}`)
      if (!popup) { setStatus("error"); setMessage("Approval window was blocked. No Diamond was sent."); return }
      popupRef.current = popup; setStatus("approval"); setMessage("Review the exact Diamond value transfer in DeSo Identity. VIA cannot approve it for you.")
    } catch { setStatus("error"); setMessage("Diamond transaction could not be prepared. Nothing was sent.") }
  }

  return <div className="flex flex-wrap items-center gap-2">
    <span>{count} Diamonds</span>
    <select aria-label="Diamond level" value={level} onChange={(e) => { setLevel(Number(e.target.value)); setConfirmValue(false) }} className="rounded-full border border-zinc-800 bg-black px-2 py-1 text-xs text-zinc-300">
      {[1,2,3,4,5,6].map((value) => <option key={value} value={value}>Level {value}</option>)}
    </select>
    <label className="flex items-center gap-1 text-[11px] text-amber-300"><input type="checkbox" checked={confirmValue} onChange={(e) => setConfirmValue(e.target.checked)} />I understand this sends $DESO value</label>
    <button type="button" onClick={prepare} disabled={!confirmValue || status === "preparing" || status === "approval" || status === "submitting"} className="rounded-full border border-amber-700/70 px-3 py-1 text-amber-300 disabled:border-zinc-800 disabled:text-zinc-600">{status === "preparing" ? "Preparing…" : status === "approval" ? "Review in DeSo…" : status === "submitting" ? "Submitting…" : "Send Diamond"}</button>
    {(feeNanos !== null || spendNanos !== null) ? <span className="text-[11px] text-zinc-500">Prepared: {spendNanos !== null ? `${spendNanos.toLocaleString()} nanos total spend` : "value transfer"}{feeNanos !== null ? ` · ${feeNanos.toLocaleString()} nanos fee` : ""}</span> : null}
    {message ? <span className={`text-[11px] ${status === "error" ? "text-amber-300" : "text-zinc-500"}`}>{message}</span> : null}
  </div>
}
