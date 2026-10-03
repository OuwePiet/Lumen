"use client"

import { useEffect, useState } from "react"
import { Gem } from "lucide-react"
import { restoreIdentitySession } from "../deso-identity-session"
import { signViaTransaction } from "../deso-identity-sign"
import { fetchViaRates, isViaRateStale } from "../via-live-rates"

type Props = { postHash: string; receiverPublicKey: string; initialCount: number; variant?: "default" | "icon" }
type PrepareResponse = { ok?: boolean; transactionHex?: string; diamondLevel?: number; feeNanos?: number | null; spendAmountNanos?: number | null; error?: string }
type DiamondLevelsResponse = { ok?: boolean; diamondLevelMap?: Record<string, number> }

export default function DiamondButton({ postHash, receiverPublicKey, initialCount, variant = "default" }: Props) {
  const [level, setLevel] = useState(1)
  const [count, setCount] = useState(initialCount)
  const [confirmValue, setConfirmValue] = useState(false)
  const [compactOpen, setCompactOpen] = useState(false)
  const [status, setStatus] = useState<"idle" | "preparing" | "approval" | "submitting" | "done" | "error">("idle")
  const [message, setMessage] = useState("")
  const [feeNanos, setFeeNanos] = useState<number | null>(null)
  const [spendNanos, setSpendNanos] = useState<number | null>(null)
  const [diamondValues, setDiamondValues] = useState<Array<{ level: number; usd: number; nanos: number }> | null>(null)

  useEffect(() => {
    if (diamondValues) return
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
        .map(([key, nanos]) => ({ level: Number(key), usd: (nanos / 1_000_000_000) * usdRate, nanos }))
        .filter((entry) => Number.isInteger(entry.level) && entry.level >= 1 && entry.level <= 8 && Number.isFinite(entry.usd))
        .sort((a, b) => a.level - b.level)
      if (values.length) setDiamondValues(values)
    }).catch(() => setDiamondValues(null))
    return () => controller.abort()
  }, [diamondValues])

  async function prepare() {
    const session = restoreIdentitySession()
    if (!session || !confirmValue || !diamondValues?.some((item) => item.level === level) || status === "preparing" || status === "approval" || status === "submitting") return
    setStatus("preparing"); setMessage("Preparing the exact value-transfer transaction…"); setFeeNanos(null); setSpendNanos(null)
    try {
      const response = await fetch("/api/via/social/diamond", { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", body: JSON.stringify({ action: "prepare", senderPublicKey: session.publicKey, receiverPublicKey, diamondPostHashHex: postHash, diamondLevel: level, confirmed: true }) })
      const data = await response.json() as PrepareResponse
      if (!response.ok || !data.ok || !data.transactionHex) throw new Error(data.error || "PREPARE_FAILED")
      const selected = diamondValues?.find((item) => item.level === level)
      if (!selected || data.diamondLevel !== level || !Number.isFinite(data.spendAmountNanos) || !Number.isFinite(data.feeNanos) || typeof data.spendAmountNanos !== "number" || typeof data.feeNanos !== "number" || data.spendAmountNanos <= 0 || data.feeNanos < 0 || data.spendAmountNanos > selected.nanos + data.feeNanos) throw new Error("DIAMOND_COST_MISMATCH")
      setFeeNanos(typeof data.feeNanos === "number" ? data.feeNanos : null); setSpendNanos(typeof data.spendAmountNanos === "number" ? data.spendAmountNanos : null)
      setStatus("approval"); setMessage("Signing the confirmed Diamond with your VIA DeSo session…")
      const signedTransactionHex = await signViaTransaction(session.publicKey, data.transactionHex)
      setStatus("submitting"); setMessage("Submitting your confirmed Diamond to DeSo…")
      const submitResponse = await fetch("/api/via/social/diamond", { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", body: JSON.stringify({ action: "submit", signedTransactionHex }) })
      const submitData = await submitResponse.json() as { ok?: boolean; error?: string }
      if (!submitResponse.ok || !submitData.ok) throw new Error(submitData.error || "SUBMIT_FAILED")
      setCount((value) => value + 1); setStatus("done"); setMessage(`Diamond level ${level} submitted.`); setConfirmValue(false)
    } catch { setStatus("error"); setMessage("Diamond transaction could not be prepared. Nothing was sent.") }
  }

  if (variant === "icon") {
    return <div className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => { setCompactOpen((open) => !open); setConfirmValue(false) }}
        title="Diamond"
        aria-label={`Diamond · ${count}`}
        aria-expanded={compactOpen}
        className={`inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-full border px-2 text-xs transition ${compactOpen ? "border-[#8fd4a9] bg-[#285f40] text-white" : "border-zinc-800 text-zinc-300 hover:border-[#8fd4a9] hover:text-white"}`}
      >
        <Gem className="h-4 w-4" aria-hidden="true" /><span>{count}</span>
      </button>
      {compactOpen ? <div className="basis-full rounded-xl border border-zinc-800 bg-[#050806] p-2">
        <div className="flex max-w-full flex-wrap items-center gap-1.5" aria-label="Diamond value">
          {(diamondValues ?? Array.from({ length: 8 }, (_, index) => ({ level: index + 1, usd: NaN }))).map((entry) => (
            <button key={entry.level} type="button" onClick={() => { setLevel(entry.level); setConfirmValue(false) }} aria-pressed={level === entry.level} className={`min-w-[3.35rem] rounded-xl border px-2 py-1 text-center text-[10px] transition ${level === entry.level ? "border-[#8fd4a9] bg-[#285f40] text-white" : "border-zinc-800 text-zinc-400 hover:border-[#8fd4a9] hover:text-white"}`}>
              <span className="block">{Number.isFinite(entry.usd) ? `$${entry.usd < 0.01 ? entry.usd.toFixed(3) : entry.usd < 1 ? entry.usd.toFixed(2) : entry.usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "prijs laden…"}</span>
              <Gem className="mx-auto h-4 w-4" aria-hidden="true" /><span className="block">{entry.level}</span>
            </button>
          ))}
        </div>
        <label className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-300"><input type="checkbox" checked={confirmValue} onChange={(event) => setConfirmValue(event.target.checked)} />I understand this sends $DESO value</label>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" onClick={prepare} disabled={!confirmValue || !diamondValues || status === "preparing" || status === "approval" || status === "submitting"} className="h-9 rounded-full border border-amber-700/70 px-3 text-xs text-amber-300 disabled:border-zinc-800 disabled:text-zinc-600">
            {status === "preparing" ? "Preparing…" : status === "approval" ? "Review…" : status === "submitting" ? "Submitting…" : "Send"}
          </button>
          <button type="button" onClick={() => { setCompactOpen(false); setConfirmValue(false) }} disabled={status === "preparing" || status === "approval" || status === "submitting"} className="h-9 rounded-full border border-zinc-700 px-3 text-xs text-zinc-300 disabled:opacity-60">Sluiten</button>
        </div>
      </div> : null}
      {message ? <span className="sr-only" role="status" aria-live="polite">{message}</span> : null}
    </div>
  }

  return <div className="flex flex-wrap items-center gap-2">
    <span>{count} Diamonds</span>
    <details className="relative">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-full border border-zinc-800 px-2 py-1 text-xs text-zinc-300"><Gem className="h-3.5 w-3.5" aria-hidden="true" /> {level} ▾</summary>
      <div className="absolute bottom-full left-0 z-30 mb-2 grid w-56 grid-cols-2 gap-1 rounded-xl border border-zinc-800 bg-[#050806] p-2 shadow-xl">
        {(diamondValues ?? Array.from({ length: 8 }, (_, index) => ({ level: index + 1, usd: NaN }))).map((entry) => <button key={entry.level} type="button" onClick={() => { setLevel(entry.level); setConfirmValue(false) }} aria-pressed={level === entry.level} className={`rounded-lg border px-2 py-2 text-xs ${level === entry.level ? "border-[#8fd4a9] bg-[#285f40] text-white" : "border-zinc-800 text-zinc-300 hover:border-[#8fd4a9]"}`}><span className="block text-[11px] text-amber-300">{Number.isFinite(entry.usd) ? `${entry.usd < 0.01 ? entry.usd.toFixed(3) : entry.usd < 1 ? entry.usd.toFixed(2) : entry.usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "prijs laden…"}</span><span className="block">{entry.level} 💎</span></button>)}
        <button type="button" onClick={(event) => { setConfirmValue(false); (event.currentTarget.closest("details") as HTMLDetailsElement | null)?.removeAttribute("open") }} className="col-span-2 rounded-lg border border-zinc-700 px-2 py-2 text-xs text-zinc-300 hover:border-[#8fd4a9]">Sluiten</button>
      </div>
    </details>
    <label className="flex items-center gap-1 text-[11px] text-amber-300"><input type="checkbox" checked={confirmValue} onChange={(e) => setConfirmValue(e.target.checked)} />I understand this sends $DESO value</label>
    <button type="button" onClick={prepare} disabled={!confirmValue || status === "preparing" || status === "approval" || status === "submitting"} className="rounded-full border border-amber-700/70 px-3 py-1 text-amber-300 disabled:border-zinc-800 disabled:text-zinc-600">{status === "preparing" ? "Preparing…" : status === "approval" ? "Review in DeSo…" : status === "submitting" ? "Submitting…" : "Send Diamond"}</button>
    {(feeNanos !== null || spendNanos !== null) ? <span className="text-[11px] text-zinc-500">Prepared: {spendNanos !== null ? `${spendNanos.toLocaleString()} nanos total spend` : "value transfer"}{feeNanos !== null ? ` · ${feeNanos.toLocaleString()} nanos fee` : ""}</span> : null}
    {message ? <span className={`text-[11px] ${status === "error" ? "text-amber-300" : "text-zinc-500"}`}>{message}</span> : null}
  </div>
}
