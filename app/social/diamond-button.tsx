"use client"

import { useEffect, useRef, useState } from "react"
import { Gem } from "lucide-react"
import { restoreIdentitySession } from "../deso-identity-session"
import { signViaTransaction } from "../deso-identity-sign"
import { fetchViaRates, isViaRateStale } from "../via-live-rates"

type Props = { postHash: string; receiverPublicKey: string; initialCount: number; variant?: "default" | "icon" }
type PrepareResponse = { ok?: boolean; transactionHex?: string; diamondLevel?: number; feeNanos?: number | null; spendAmountNanos?: number | null; error?: string }
type DiamondLevelsResponse = { ok?: boolean; diamondLevelMap?: Record<string, number> }

export default function DiamondButton({ postHash, receiverPublicKey, initialCount, variant = "default" }: Props) {
  const [level, setLevel] = useState(1)
  const [, setBestowedLevel] = useState<number | null>(null)
  const [count, setCount] = useState(initialCount)
  useEffect(() => { setCount(initialCount) }, [initialCount])
  const [confirmValue, setConfirmValue] = useState(false)
  const [submissionLocked, setSubmissionLocked] = useState(false)
  const [compactOpen, setCompactOpen] = useState(false)
  const menuRootRef = useRef<HTMLDivElement>(null)
  const [celebrate, setCelebrate] = useState(false)
  useEffect(() => {
    function dismissOnOutsidePointer(event: PointerEvent) {
      const root = menuRootRef.current
      if (root && event.target instanceof Node && !root.contains(event.target)) {
        setCompactOpen(false)
        root.querySelectorAll("details[open]").forEach((menu) => menu.removeAttribute("open"))
      }
    }
    document.addEventListener("pointerdown", dismissOnOutsidePointer)
    return () => document.removeEventListener("pointerdown", dismissOnOutsidePointer)
  }, [])

  const leafRain = celebrate ? <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">{Array.from({ length: 28 }, (_, i) => <span key={i} className="absolute top-[-12%] animate-[viaLeafFall_3s_ease-in_forwards]" style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 10) * 0.12}s`, transform: `rotate(${i * 41}deg)` }}><img src="/via-leaf.svg" alt="" width="36" height="34" className="h-9 w-9 object-contain" /></span>)}<style>{`@keyframes viaLeafFall { from { translate: 0 -10vh; opacity: 1 } to { translate: 8vw 115vh; opacity: 0 } }`}</style></div> : null
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

  async function prepare(chosenLevel = level) {
    const session = restoreIdentitySession()
    if (submissionLocked || !session || !diamondValues?.some((item) => item.level === chosenLevel) || status === "preparing" || status === "approval" || status === "submitting") return
    setCelebrate(false); setStatus("preparing"); setMessage("Preparing the exact value-transfer transaction…"); setFeeNanos(null); setSpendNanos(null)
    let submissionAttempted = false
    try {
      const readerResponse = await fetch("/api/via/social/diamond", { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", body: JSON.stringify({ action: "reader-level", postHash, readerPublicKey: session.publicKey }) })
      const readerData = await readerResponse.json() as { ok?: boolean; diamondLevelBestowed?: number }
      if (!readerResponse.ok || !readerData.ok || !Number.isInteger(readerData.diamondLevelBestowed)) throw new Error("DESO_READER_LEVEL_UNAVAILABLE")
      const existingLevel = readerData.diamondLevelBestowed as number
      setBestowedLevel(existingLevel)
      if (chosenLevel <= existingLevel) { setStatus("error"); setMessage(`DeSo: level ${existingLevel} already given. Choose a higher level.`); return }
      const response = await fetch("/api/via/social/diamond", { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", body: JSON.stringify({ action: "prepare", senderPublicKey: session.publicKey, receiverPublicKey, diamondPostHashHex: postHash, diamondLevel: chosenLevel, confirmed: true }) })
      const data = await response.json() as PrepareResponse
      if (!response.ok || !data.ok || !data.transactionHex) throw new Error(data.error || "PREPARE_FAILED")
      const selected = diamondValues?.find((item) => item.level === chosenLevel)
      const previousNanos = existingLevel === 0 ? 0 : diamondValues?.find((item) => item.level === existingLevel)?.nanos
      const upgradeNanos = selected && typeof previousNanos === "number" ? selected.nanos - previousNanos : null
      if (!selected || upgradeNanos === null || upgradeNanos <= 0 || data.diamondLevel !== chosenLevel || !Number.isFinite(data.spendAmountNanos) || !Number.isFinite(data.feeNanos) || typeof data.spendAmountNanos !== "number" || typeof data.feeNanos !== "number" || data.spendAmountNanos <= 0 || data.feeNanos < 0 || data.spendAmountNanos > upgradeNanos + data.feeNanos) throw new Error("DIAMOND_COST_MISMATCH")
      setFeeNanos(typeof data.feeNanos === "number" ? data.feeNanos : null); setSpendNanos(typeof data.spendAmountNanos === "number" ? data.spendAmountNanos : null)
      setStatus("approval"); setMessage("Signing the confirmed Diamond with your VIA DeSo session…")
      const signedTransactionHex = await signViaTransaction(session.publicKey, data.transactionHex)
      setStatus("submitting"); setMessage("Submitting your confirmed Diamond to DeSo…")
      submissionAttempted = true
      setSubmissionLocked(true)
      const submitResponse = await fetch("/api/via/social/diamond", { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", body: JSON.stringify({ action: "submit", signedTransactionHex }) })
      const submitData = await submitResponse.json() as { ok?: boolean; error?: string }
      if (!submitResponse.ok || !submitData.ok) throw new Error(submitData.error || "SUBMIT_FAILED")
      setConfirmValue(false)
      setMessage("DeSo accepted submission. Waiting for the DeSo reader state to confirm the diamond…")
      let confirmedByDeSo = false
      for (let attempt = 0; attempt < 4; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 4000 + attempt * 3000))
        try {
          const readerResponse = await fetch("/api/via/social/diamond", { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", body: JSON.stringify({ action: "reader-level", postHash, readerPublicKey: session.publicKey }) })
          const readerData = await readerResponse.json() as { ok?: boolean; diamondLevelBestowed?: number }
          if (readerResponse.ok && readerData.ok && readerData.diamondLevelBestowed === chosenLevel) {
            confirmedByDeSo = true
            setBestowedLevel(chosenLevel)
            const countResponse = await fetch(`/api/via/post?hash=${encodeURIComponent(postHash)}&verify=${Date.now()}`, { cache: "no-store" })
            const countData = await countResponse.json() as { ok?: boolean; post?: { diamondCount?: number } }
            if (countResponse.ok && countData.ok && typeof countData.post?.diamondCount === "number") setCount(countData.post.diamondCount)
            break
          }
        } catch { /* Never retry a paid submission after a read failure. */ }
      }
      setStatus(confirmedByDeSo ? "done" : "error")
      setMessage(confirmedByDeSo ? "Diamond confirmed by DeSo reader state." : "Submission accepted, but DeSo confirmation is pending. Check DeSo before taking further action; do not resend.")

    } catch { setStatus("error"); setMessage(submissionAttempted ? "Diamond status uncertain. Check DeSo before trying again; do not resend yet." : "Diamond preparation or signing failed; no submission was attempted.") }
  }

  if (variant === "icon") {
    return <div ref={menuRootRef} className="inline-flex flex-wrap items-center gap-2">
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
            <button key={entry.level} type="button" onClick={() => { if (!Number.isFinite(entry.usd) || status === "preparing" || status === "approval" || status === "submitting" || submissionLocked) return; setLevel(entry.level); setConfirmValue(true) }} aria-pressed={level === entry.level} className={`min-w-[3.35rem] rounded-xl border px-2 py-1 text-center text-[10px] transition ${level === entry.level ? "border-[#8fd4a9] bg-[#285f40] text-white" : "border-zinc-800 text-zinc-400 hover:border-[#8fd4a9] hover:text-white"}`}>
              <span className="block">{Number.isFinite(entry.usd) ? `$${entry.usd < 0.01 ? entry.usd.toFixed(3) : entry.usd < 1 ? entry.usd.toFixed(2) : entry.usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "prijs laden…"}</span>
              <Gem className="mx-auto h-4 w-4" aria-hidden="true" /><span className="block">{entry.level}</span>
            </button>
          ))}
        </div>
        {confirmValue ? <div className="mt-2 rounded-lg border border-amber-500/50 p-2 text-xs text-amber-200">Confirm diamond level {level}. DeSo determines the actual upgrade cost and network fee before signing. <button type="button" className="ml-2 rounded border px-2 py-1" onClick={() => { setConfirmValue(false); void prepare(level) }}>Confirm</button><button type="button" className="ml-2 rounded border px-2 py-1" onClick={() => setConfirmValue(false)}>Cancel</button></div> : null}
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" onClick={() => { setCompactOpen(false); setConfirmValue(false) }} disabled={status === "preparing" || status === "approval" || status === "submitting"} className="h-9 rounded-full border border-zinc-700 px-3 text-xs text-zinc-300 disabled:opacity-60">Sluiten</button>
        </div>
      </div> : null}
      {leafRain}
      {message ? <span className="sr-only" role="status" aria-live="polite">{message}</span> : null}
    </div>
  }

  return <div ref={menuRootRef} className="flex flex-wrap items-center gap-2">
    <span>{count} Diamonds</span>
    <details className="relative">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-full border border-zinc-800 px-2 py-1 text-xs text-zinc-300"><Gem className="h-3.5 w-3.5" aria-hidden="true" /> {level} ▾</summary>
      <div className="absolute bottom-full left-0 z-30 mb-2 grid w-56 grid-cols-2 gap-1 rounded-xl border border-zinc-800 bg-[#050806] p-2 shadow-xl">
        {(diamondValues ?? Array.from({ length: 8 }, (_, index) => ({ level: index + 1, usd: NaN }))).map((entry) => <button key={entry.level} type="button" onClick={() => { if (!Number.isFinite(entry.usd) || status === "preparing" || status === "approval" || status === "submitting") return; setLevel(entry.level); setConfirmValue(true) }} aria-pressed={level === entry.level} className={`rounded-lg border px-2 py-2 text-xs ${level === entry.level ? "border-[#8fd4a9] bg-[#285f40] text-white" : "border-zinc-800 text-zinc-300 hover:border-[#8fd4a9]"}`}><span className="block text-[11px] text-amber-300">{Number.isFinite(entry.usd) ? `${entry.usd < 0.01 ? entry.usd.toFixed(3) : entry.usd < 1 ? entry.usd.toFixed(2) : entry.usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "prijs laden…"}</span><span className="block">{entry.level} 💎</span></button>)}
        <button type="button" onClick={(event) => { setConfirmValue(false); (event.currentTarget.closest("details") as HTMLDetailsElement | null)?.removeAttribute("open") }} className="col-span-2 rounded-lg border border-zinc-700 px-2 py-2 text-xs text-zinc-300 hover:border-[#8fd4a9]">Sluiten</button>
      </div>
    </details>
    {confirmValue ? <span className="text-xs">Confirm diamond level {level}. DeSo calculates the upgrade cost and fee before signing. <button type="button" className="rounded border px-2" onClick={() => { setConfirmValue(false); void prepare(level) }}>Confirm</button> <button type="button" className="rounded border px-2" onClick={() => setConfirmValue(false)}>Cancel</button></span> : null}
    {leafRain}
    {(feeNanos !== null || spendNanos !== null) ? <span className="text-[11px] text-zinc-500">Prepared: {spendNanos !== null ? `${spendNanos.toLocaleString()} nanos total spend` : "value transfer"}{feeNanos !== null ? ` · ${feeNanos.toLocaleString()} nanos fee` : ""}</span> : null}
    {message ? <span className={`text-[11px] ${status === "error" ? "text-amber-300" : "text-zinc-500"}`}>{message}</span> : null}
  </div>
}
