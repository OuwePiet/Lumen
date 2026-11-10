"use client"

import { useEffect, useRef, useState } from "react"
import { Gem } from "lucide-react"
import { restoreIdentitySession, VIA_IDENTITY_EVENT } from "../deso-identity-session"
import { financialSubmissionBlock, markFinancialPending, markFinancialSubmitted, withFinancialAccountLock } from "../financial-submission"
import { viaModernIdentity } from "../deso-identity-modern"
import { fetchViaRates } from "../via-live-rates"

type Props = { postHash: string; receiverPublicKey: string; initialCount: number; variant?: "default" | "icon" }
type PrepareResponse = { ok?: boolean; transactionHex?: string; diamondLevel?: number; feeNanos?: number | null; spendAmountNanos?: number | null; error?: string }
type DiamondLevelsResponse = { ok?: boolean; diamondLevelMap?: Record<string, number> }

/**
 * Fail closed if DeSo Identity never answers (notably on mobile Safari).
 * A late permission/signing response cannot resume this payment chain:
 * Promise.race has already rejected and the caller exits via catch.
 * No transaction is submitted or retried on timeout.
 */
function awaitIdentityResponse<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error("DESO_IDENTITY_NO_RESPONSE")), timeoutMs)
    operation.then(
      value => { window.clearTimeout(timer); resolve(value) },
      error => { window.clearTimeout(timer); reject(error) },
    )
  })
}

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
    return usd < 0.01 ? "< $0.01" : new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(usd)
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

  const sendLock = useRef(false)
  async function prepare(chosenLevel = level) {
    if (sendLock.current || !diamondValues?.some(item => item.level === chosenLevel)) return
    sendLock.current = true
    const session = restoreIdentitySession()
    let invalidated = false, sent = false, accepted = false
    const onIdentity = (event: Event) => {
      if (event.type === "storage") {
        const changed = event as StorageEvent
        if (changed.key === null || changed.key === "desoIdentityUsers" || (changed.key === "desoActivePublicKey" && changed.newValue !== session?.publicKey)) invalidated = true
      }
      if (restoreIdentitySession()?.publicKey !== session?.publicKey) invalidated = true
    }
    const assertAccount = async () => {
      if (!session || invalidated || restoreIdentitySession()?.publicKey !== session.publicKey) throw new Error("ACCOUNT_CHANGED")
      const current = await viaModernIdentity.currentUser()
      if (invalidated || current?.publicKey !== session.publicKey) throw new Error("ACCOUNT_CHANGED")
    }
    window.addEventListener(VIA_IDENTITY_EVENT, onIdentity)
    window.addEventListener("storage", onIdentity)
    try {
      if (!session) throw new Error("DESO_LOGIN_REQUIRED")
      const intent = "diamond:" + postHash + ":" + receiverPublicKey + ":" + chosenLevel
      await withFinancialAccountLock(session.publicKey, async () => {
        await assertAccount()
        const blocked = financialSubmissionBlock(session.publicKey, intent)
        if (blocked) throw new Error(blocked)
        setCelebrate(false); setStatus("preparing"); setMessage("Preparing the Diamond and exact DeSo cost…"); setFeeNanos(null)
        const response = await fetch("/api/via/social/diamond", { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", body: JSON.stringify({ action: "prepare", senderPublicKey: session.publicKey, receiverPublicKey, diamondPostHashHex: postHash, diamondLevel: chosenLevel }) })
        const data = await response.json() as PrepareResponse
        await assertAccount()
        if (!response.ok || !data.ok || !data.transactionHex || data.diamondLevel !== chosenLevel ||
            typeof data.feeNanos !== "number" || !Number.isSafeInteger(data.feeNanos) || data.feeNanos < 0 ||
            typeof data.spendAmountNanos !== "number" || !Number.isSafeInteger(data.spendAmountNanos) || data.spendAmountNanos < 0) throw new Error(data.error || "INVALID_DESO_TRANSACTION_DATA")
        const cost = data.spendAmountNanos + data.feeNanos
        if (!Number.isSafeInteger(cost) || cost < 1) throw new Error("INVALID_DESO_SPEND_LIMIT")
        setFeeNanos(data.feeNanos)
        // DeSo permissions are granted at homepage login; never open a second
        // permission request from a diamond click. Fail closed if the grant is absent.
        setStatus("approval"); setMessage("Checking the DeSo permission granted at login…")
        const permitted = await awaitIdentityResponse(Promise.resolve(viaModernIdentity.hasPermissions({ GlobalDESOLimit: cost, TransactionCountLimitMap: { BASIC_TRANSFER: 1 } })), 20000)
        if (!permitted) throw new Error("DeSo diamantmachtiging ontbreekt in deze sessie. Meld je opnieuw aan via de VIA-homepage om de eenmalige toestemming te verlenen.")
        await assertAccount()
        setMessage("DeSo Identity is signing your Diamond…")
        const signedTransactionHex = await awaitIdentityResponse(viaModernIdentity.signTx(data.transactionHex), 20000)
        await assertAccount()
        const submission = { publicKey: session.publicKey, intent, amountNanos: cost, startedAt: Date.now() }
        markFinancialPending(submission)
        if (invalidated || restoreIdentitySession()?.publicKey !== session.publicKey) throw new Error("ACCOUNT_CHANGED")
        setStatus("submitting"); setMessage("Submitting your Diamond to DeSo…")
        sent = true
        const submit = await fetch("/api/via/social/diamond", { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", body: JSON.stringify({ action: "submit", signedTransactionHex }) })
        const result = await submit.json() as { ok?: boolean; error?: string; transaction?: { TxnHashHex?: string; TransactionHashHex?: string } }
        if (!submit.ok || !result.ok) throw new Error(result.error || "SUBMIT_FAILED")
        accepted = true
        markFinancialSubmitted(submission, result.transaction?.TxnHashHex ?? result.transaction?.TransactionHashHex)
        setStatus("done"); setCompactOpen(false); menuRootRef.current?.querySelectorAll("details[open]").forEach((menu) => menu.removeAttribute("open")); setMessage("Diamond received by DeSo. Final confirmation is not yet verified.")
        setCelebrate(true); window.setTimeout(() => setCelebrate(false), 3200)
        window.dispatchEvent(new Event("via:social:post-published"))
        await viaModernIdentity.refreshSpendingLimits().catch(() => {})
        try {
          const response = await fetch("/api/via/post?hash=" + encodeURIComponent(postHash) + "&reader=" + encodeURIComponent(session.publicKey), { cache: "no-store" })
          const data = await response.json() as { ok?: boolean; post?: { diamondCount?: number } }
          const count = data.post?.diamondCount
          if (!invalidated && response.ok && data.ok && typeof count === "number" && Number.isSafeInteger(count) && count >= 0) setCount(count)
        } catch { /* Read failures never resend or clear recovery state. */ }
      })
    } catch (error) {
      setStatus(accepted ? "done" : "error")
      setMessage(accepted ? "DeSo received the Diamond. Recovery storage could not be updated; check DeSo before any new payment." : sent ? "The Diamond outcome is uncertain. Do not resend; check DeSo." : error instanceof Error && error.message === "DESO_IDENTITY_NO_RESPONSE" ? "DeSo Identity reageert niet. Er is vanuit VIA geen diamant verzonden. Controleer de DeSo-machtiging voordat je opnieuw probeert." : error instanceof Error ? error.message : "Diamond preparation stopped. Nothing was submitted.")
    } finally {
      window.removeEventListener(VIA_IDENTITY_EVENT, onIdentity)
      window.removeEventListener("storage", onIdentity)
      sendLock.current = false
    }
  }

  if (variant === "icon") {
    return <div ref={menuRootRef} className="contents">
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
      {compactOpen ? <div className="order-last w-full basis-full rounded-xl border border-zinc-800 bg-[#050806] p-2">
        <div className="flex max-w-full flex-wrap items-center gap-1.5" aria-label="Diamond value">
          {(diamondValues ?? Array.from({ length: 8 }, (_, index) => ({ level: index + 1, nanos: NaN }))).map((entry) => (
            <button key={entry.level} type="button" onClick={() => { if (!Number.isFinite(entry.nanos) || status === "preparing" || status === "approval" || status === "submitting") return; setLevel(entry.level); void prepare(entry.level) }} aria-pressed={level === entry.level} className={`min-w-[3.35rem] rounded-xl border px-2 py-1 text-center text-[10px] transition ${level === entry.level ? "border-[#8fd4a9] bg-[#285f40] text-white" : "border-zinc-800 text-zinc-400 hover:border-[#8fd4a9] hover:text-white"}`}>
              <span className="block">{Number.isFinite(entry.nanos) ? (diamondUsd(entry.nanos) ?? "prijs laden…") : "prijs laden…"}</span>
              <Gem className="mx-auto h-4 w-4" aria-hidden="true" /><span className="block">{entry.level}</span>
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" onClick={() => { setCompactOpen(false) }} disabled={status === "preparing" || status === "approval" || status === "submitting"} className="h-9 rounded-full border border-zinc-700 px-3 text-xs text-zinc-300 disabled:opacity-60">Sluiten</button>
        </div>
      </div> : null}
      {leafRain}
      {message ? <span className="order-last w-full basis-full text-xs text-amber-200" role="status" aria-live="polite">{message}</span> : null}
    </div>
  }

  return <div ref={menuRootRef} className="flex flex-wrap items-center gap-2">
    <span>{count} Diamonds</span>
    <details className="relative">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-full border border-zinc-800 px-2 py-1 text-xs text-zinc-300"><Gem className="h-3.5 w-3.5" aria-hidden="true" /> {level} ▾</summary>
      <div className="absolute top-full left-0 z-30 mt-2 grid w-56 grid-cols-2 gap-1 rounded-xl border border-zinc-800 bg-[#050806] p-2 shadow-xl">
        {(diamondValues ?? Array.from({ length: 8 }, (_, index) => ({ level: index + 1, nanos: NaN }))).map((entry) => <button key={entry.level} type="button" onClick={() => { if (!Number.isFinite(entry.nanos) || status === "preparing" || status === "approval" || status === "submitting") return; setLevel(entry.level); void prepare(entry.level) }} aria-pressed={level === entry.level} className={`rounded-lg border px-2 py-2 text-xs ${level === entry.level ? "border-[#8fd4a9] bg-[#285f40] text-white" : "border-zinc-800 text-zinc-300 hover:border-[#8fd4a9]"}`}><span className="block text-[11px] text-amber-300">{Number.isFinite(entry.nanos) ? (diamondUsd(entry.nanos) ?? "prijs laden…") : "prijs laden…"}</span><span className="block">{entry.level} 💎</span></button>)}
        <button type="button" onClick={(event) => { (event.currentTarget.closest("details") as HTMLDetailsElement | null)?.removeAttribute("open") }} className="col-span-2 rounded-lg border border-zinc-700 px-2 py-2 text-xs text-zinc-300 hover:border-[#8fd4a9]">Sluiten</button>
      </div>
    </details>
    {leafRain}
    {message ? <span className={`text-[11px] ${status === "error" ? "text-amber-300" : "text-zinc-500"}`}>{message}</span> : null}
  </div>
}
