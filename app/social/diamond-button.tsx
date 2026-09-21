"use client"

import { useEffect, useRef, useState } from "react"
import { DESO_IDENTITY_ORIGIN, restoreIdentitySession } from "../deso-identity-session"\nimport { fetchViaRates, isViaRateStale } from "../via-live-rates"

type Props = { postHash: string; receiverPublicKey: string; initialCount: number; variant?: "default" | "icon" }
type PrepareResponse = { ok?: boolean; transactionHex?: string; feeNanos?: number | null; spendAmountNanos?: number | null; error?: string }\ntype DiamondLevelsResponse = { ok?: boolean; diamondLevelMap?: Record<string, number> }

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

export default function DiamondButton({ postHash, receiverPublicKey, initialCount, variant = "default" }: Props) {
  const [level, setLevel] = useState(1)
  const [count, setCount] = useState(initialCount)
  const [confirmValue, setConfirmValue] = useState(false)
  const [status, setStatus] = useState<"idle" | "preparing" | "approval" | "submitting" | "done" | "error">("idle")
  const [message, setMessage] = useState("")
  const [feeNanos, setFeeNanos] = useState<number | null>(null)
  const [spendNanos, setSpendNanos] = useState<number | null>(null)\n  const [diamondValues, setDiamondValues] = useState<Array<{ level: number; usd: number }> | null>(null)
  const popupRef = useRef<Window | null>(null)
  const popupWatch = useRef<number | null>(null)

  useEffect(() => {
    if (!confirmValue || diamondValues) return
    const controller = new AbortController()
    Promise.all([
      fetch("/api/via/social/diamond", { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", body: JSON.stringify({ action: "levels" }), signal: controller.signal }).then(async (response) => {
        const data = await response.json() as DiamondLevelsResponse
        if (!response.ok || !data.ok || !data.diamondLevelMap) throw new Error("DIAMOND_LEVELS_UNAVAILABLE")
        return data.diamondLevelMap
      }),
      fetchViaRates(controller.signal),
    ]).then(([levelMap, rates]) => {
      const usdRate = rates.rates?.USD
      if (typeof usdRate !== "number" || !Number.isFinite(usdRate) || isViaRateStale(rates.checkedAt)) throw new Error("RATE_UNAVAILABLE")
      const values = Object.entries(levelMap)
        .map(([key, nanos]) => ({ level: Number(key), usd: (nanos / 1_000_000_000) * usdRate }))
        .filter((entry) => Number.isInteger(entry.level) && entry.level >= 1 && entry.level <= 8 && Number.isFinite(entry.usd))
        .sort((a, b) => a.level - b.level)
      if (values.length) setDiamondValues(values)
    }).catch(() => setDiamondValues(null))
    return () => controller.abort()
  }, [confirmValue, diamondValues])

  useEffect(() => {
    async function onMessage(event: MessageEvent) {
      const signedTransactionHex = signedTransactionFromMessage(event, popupRef.current)
      if (!signedTransactionHex) return
      if (popupWatch.current !== null) window.clearInterval(popupWatch.current); popupWatch.current = null
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
    return () => {
      window.removeEventListener("message", onMessage)
      if (popupWatch.current !== null) window.clearInterval(popupWatch.current)
      popupWatch.current = null
      popupRef.current?.close()
      popupRef.current = null
    }
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
      popupRef.current = popup
      if (popupWatch.current !== null) window.clearInterval(popupWatch.current)
      popupWatch.current = window.setInterval(() => {
        if (popupRef.current?.closed) {
          popupRef.current = null
          if (popupWatch.current !== null) window.clearInterval(popupWatch.current)
          popupWatch.current = null
          setStatus("idle")
          setMessage("DeSo approval was closed. No Diamond was sent.")
        }
      }, 500)
      setStatus("approval"); setMessage("Review the exact Diamond value transfer in DeSo Identity. VIA cannot approve it for you.")
    } catch { setStatus("error"); setMessage("Diamond transaction could not be prepared. Nothing was sent.") }
  }

  if (variant === "icon") {
    return <div className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => setConfirmValue((value) => !value)}
        title="Diamond"
        aria-label={`Diamond · ${count}`}
        aria-pressed={confirmValue}
        className={`inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-full border px-2 text-xs transition ${confirmValue ? "border-[#8fd4a9] bg-[#285f40] text-white" : "border-zinc-800 text-zinc-300 hover:border-[#8fd4a9] hover:text-white"}`}
      >
        <span aria-hidden="true">◇</span><span>{count}</span>
      </button>
      {confirmValue ? <>
        <div className="flex max-w-full flex-wrap items-center gap-1.5" aria-label="Diamond value">
          {(diamondValues ?? Array.from({ length: 8 }, (_, index) => ({ level: index + 1, usd: NaN }))).map((entry) => (
            <button key={entry.level} type="button" onClick={() => setLevel(entry.level)} aria-pressed={level === entry.level} className={`min-w-[3.35rem] rounded-xl border px-2 py-1 text-center text-[10px] transition ${level === entry.level ? "border-[#8fd4a9] bg-[#285f40] text-white" : "border-zinc-800 text-zinc-400 hover:border-[#8fd4a9] hover:text-white"}`}>
              <span className="block text-sm" aria-hidden="true">💎</span>
              <span className="block">{Number.isFinite(entry.usd) ? `${entry.usd < 0.01 ? entry.usd.toFixed(3) : entry.usd < 1 ? entry.usd.toFixed(2) : entry.usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "…"}</span>
            </button>
          ))}
        </div>
        <button type="button" onClick={prepare} disabled={status === "preparing" || status === "approval" || status === "submitting" || !diamondValues} className="h-9 rounded-full border border-amber-700/70 px-3 text-xs text-amber-300 disabled:border-zinc-800 disabled:text-zinc-600">
          {status === "preparing" ? "Preparing…" : status === "approval" ? "Review…" : status === "submitting" ? "Submitting…" : "Send"}
        </button>
      </> : null}
      {message ? <span className="sr-only" role="status" aria-live="polite">{message}</span> : null}
    </div>
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
