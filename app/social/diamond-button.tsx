"use client"

import { useEffect, useRef, useState } from "react"
import { Gem } from "lucide-react"
import { viaModernIdentity } from "../deso-identity-modern"
import { fetchViaRates } from "../via-live-rates"

type Props = { postHash: string; receiverPublicKey: string; initialCount: number; variant?: "default" | "icon" }
type PrepareResponse = { ok?: boolean; transactionHex?: string; diamondLevel?: number; feeNanos?: number | null; spendAmountNanos?: number | null; error?: string }
type DiamondLevelsResponse = { ok?: boolean; diamondLevelMap?: Record<string, number> }

export default function DiamondButton({ postHash, receiverPublicKey, initialCount, variant = "default" }: Props) {
  const [level, setLevel] = useState(1)
  const [count, setCount] = useState(initialCount)
  useEffect(() => setCount(initialCount), [initialCount])
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
  const [diamondValues, setDiamondValues] = useState<Array<{ level: number; nanos: number }> | null>(null)
  const [desoUsd, setDesoUsd] = useState<number | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetchViaRates(controller.signal).then((rates) => setDesoUsd(rates.rates?.USD ?? null)).catch(() => setDesoUsd(null))
    return () => controller.abort()
  }, [])

  function diamondUsd(nanos: number) {
    if (!Number.isFinite(nanos) || !desoUsd) return null
    const usd = (nanos / 1_000_000_000) * desoUsd
    return usd < 0.01 ? `<$0.01` : usd < 1 ? `${usd.toFixed(2)}` : `${usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  useEffect(() => {
    if (diamondValues) return
    const controller = new AbortController()
    fetch("/api/via/social/diamond", { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", body: JSON.stringify({ action: "levels" }), signal: controller.signal })
      .then(async (response) => {
        const data = await response.json() as DiamondLevelsResponse
        if (!response.ok || !data.ok || !data.diamondLevelMap) throw new Error("DIAMOND_LEVELS_UNAVAILABLE")
        const values = Object.entries(data.diamondLevelMap)
          .map(([key, nanos]) => ({ level: Number(key), nanos }))
          .filter((entry) => Number.isInteger(entry.level) && entry.level >= 1 && entry.level <= 8 && Number.isFinite(entry.nanos) && entry.nanos > 0)
          .sort((a, b) => a.level - b.level)
        if (values.length) setDiamondValues(values)
      }).catch(() => setDiamondValues(null))
    return () => controller.abort()
  }, [diamondValues])

  async function prepare(chosenLevel = level) {
    const session = await viaModernIdentity.currentUser()
    if (!session || !diamondValues?.some((item) => item.level === chosenLevel) || status === "preparing" || status === "approval" || status === "submitting") return
    setCelebrate(false); setStatus("preparing"); setMessage("Preparing the exact value-transfer transaction…"); setFeeNanos(null)
    try {
      const response = await fetch("/api/via/social/diamond", { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", body: JSON.stringify({ action: "prepare", senderPublicKey: session.publicKey, receiverPublicKey, diamondPostHashHex: postHash, diamondLevel: chosenLevel }) })
      const data = await response.json() as PrepareResponse
      if (!response.ok || !data.ok || !data.transactionHex) throw new Error(data.error || "PREPARE_FAILED")
      const selected = diamondValues?.find((item) => item.level === chosenLevel)
      if (!selected || data.diamondLevel !== chosenLevel || typeof data.feeNanos !== "number" || !Number.isFinite(data.feeNanos) || data.feeNanos < 0 || typeof data.spendAmountNanos !== "number" || !Number.isFinite(data.spendAmountNanos) || data.spendAmountNanos < 0) throw new Error("INVALID_DESO_TRANSACTION_DATA")
      setFeeNanos(data.feeNanos)
      const diamondSpendLimit = data.spendAmountNanos + data.feeNanos
      if (!Number.isSafeInteger(diamondSpendLimit) || diamondSpendLimit < 0) throw new Error("INVALID_DESO_SPEND_LIMIT")
      const currentSpendingLimits = await viaModernIdentity.spendingLimits()
      const currentGlobalDESOLimit = currentSpendingLimits?.GlobalDESOLimit ?? 0
      if (!Number.isSafeInteger(currentGlobalDESOLimit) || currentGlobalDESOLimit < 0) throw new Error("INVALID_DESO_SPENDING_LIMITS")
      const requiredPermissions = {
        GlobalDESOLimit: currentGlobalDESOLimit + diamondSpendLimit,
        TransactionCountLimitMap: { BASIC_TRANSFER: 1 },
      }
      if (!viaModernIdentity.hasPermissions(requiredPermissions)) {
        setStatus("approval"); setMessage("Confirm this Diamond spending permission with DeSo Identity…")
        await viaModernIdentity.requestPermissions(requiredPermissions)
      }
      setStatus("approval"); setMessage("Signing the confirmed Diamond with your VIA DeSo session…")
      const signedTransactionHex = await viaModernIdentity.signTx(data.transactionHex)
      setStatus("submitting"); setMessage("Submitting your confirmed Diamond to DeSo…")
      const submitResponse = await fetch("/api/via/social/diamond", { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", body: JSON.stringify({ action: "submit", signedTransactionHex }) })
      const submitData = await submitResponse.json() as { ok?: boolean; error?: string }
      if (!submitResponse.ok || !submitData.ok) throw new Error(submitData.error || "SUBMIT_FAILED")
      await viaModernIdentity.refreshSpendingLimits()
      setStatus("done"); setMessage(`Diamond level ${chosenLevel} submitted to DeSo. Awaiting the DeSo count.`)
      setCelebrate(true)
      window.setTimeout(() => setCelebrate(false), 3200)
      window.dispatchEvent(new Event("via:social:post-published"))
    } catch { setStatus("error"); setMessage("DeSo did not confirm completion. Check the transaction on DeSo before trying again.") }
  }

  if (variant === "icon") {
    return <div ref={menuRootRef} className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => { setCompactOpen((open) => !open) }}
        title="Diamond"
        aria-label={`Diamond · ${count}`}
        aria-expanded={compactOpen}
        className={`inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-full border px-2 text-xs transition ${compactOpen ? "border-[#8fd4a9] bg-[#285f40] text-white" : "border-zinc-800 text-zinc-300 hover:border-[#8fd4a9] hover:text-white"}`}
      >
        <Gem className="h-4 w-4" aria-hidden="true" /><span>{count}</span>
      </button>
      {compactOpen ? <div className="basis-full rounded-xl border border-zinc-800 bg-[#050806] p-2">
        <div className="flex max-w-full flex-wrap items-center gap-1.5" aria-label="Diamond value">
          {(diamondValues ?? Array.from({ length: 8 }, (_, index) => ({ level: index + 1, nanos: NaN }))).map((entry) => (
            <button key={entry.level} type="button" onClick={() => { if (!Number.isFinite(entry.nanos) || status === "preparing" || status === "approval" || status === "submitting") return; setLevel(entry.level) }} aria-pressed={level === entry.level} className={`min-w-[3.35rem] rounded-xl border px-2 py-1 text-center text-[10px] transition ${level === entry.level ? "border-[#8fd4a9] bg-[#285f40] text-white" : "border-zinc-800 text-zinc-400 hover:border-[#8fd4a9] hover:text-white"}`}>
              <span className="block">{Number.isFinite(entry.nanos) ? (diamondUsd(entry.nanos) ?? "prijs laden…") : "prijs laden…"}</span>
              <Gem className="mx-auto h-4 w-4" aria-hidden="true" /><span className="block">{entry.level}</span>
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" onClick={() => void prepare(level)} disabled={!diamondValues?.some((item) => item.level === level) || status === "preparing" || status === "approval" || status === "submitting"} className="h-9 rounded-full border border-[#8fd4a9] px-3 text-xs text-[#9adbb2] disabled:opacity-60">Bevestig 💎 {level}</button><button type="button" onClick={() => { setCompactOpen(false) }} disabled={status === "preparing" || status === "approval" || status === "submitting"} className="h-9 rounded-full border border-zinc-700 px-3 text-xs text-zinc-300 disabled:opacity-60">Sluiten</button>
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
        {(diamondValues ?? Array.from({ length: 8 }, (_, index) => ({ level: index + 1, nanos: NaN }))).map((entry) => <button key={entry.level} type="button" onClick={() => { if (!Number.isFinite(entry.nanos) || status === "preparing" || status === "approval" || status === "submitting") return; setLevel(entry.level) }} aria-pressed={level === entry.level} className={`rounded-lg border px-2 py-2 text-xs ${level === entry.level ? "border-[#8fd4a9] bg-[#285f40] text-white" : "border-zinc-800 text-zinc-300 hover:border-[#8fd4a9]"}`}><span className="block text-[11px] text-amber-300">{Number.isFinite(entry.nanos) ? (diamondUsd(entry.nanos) ?? "prijs laden…") : "prijs laden…"}</span><span className="block">{entry.level} 💎</span></button>)}
        <button type="button" onClick={() => void prepare(level)} disabled={!diamondValues?.some((item) => item.level === level) || status === "preparing" || status === "approval" || status === "submitting"} className="col-span-2 rounded-lg border border-[#8fd4a9] px-2 py-2 text-xs text-[#9adbb2] disabled:opacity-60">Bevestig 💎 {level}</button><button type="button" onClick={(event) => { (event.currentTarget.closest("details") as HTMLDetailsElement | null)?.removeAttribute("open") }} className="col-span-2 rounded-lg border border-zinc-700 px-2 py-2 text-xs text-zinc-300 hover:border-[#8fd4a9]">Sluiten</button>
      </div>
    </details>
    {leafRain}
    {message ? <span className={`text-[11px] ${status === "error" ? "text-amber-300" : "text-zinc-500"}`}>{message}</span> : null}
  </div>
}
