"use client"

import { useEffect, useRef, useState } from "react"
import { Popover } from "@base-ui/react/popover"
import { Gem } from "lucide-react"
import { restoreIdentitySession, VIA_IDENTITY_EVENT } from "../deso-identity-session"
import { financialSubmissionBlock, markFinancialPending, markFinancialSubmitted, withFinancialAccountLock } from "../financial-submission"
import { viaModernIdentity } from "../deso-identity-modern"
import { fetchViaRates } from "../via-live-rates"
import PublicAccountLabel from "../public-account-label"
import { useViaIdentitySession } from "../use-via-identity-session"

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
  const [count, setCount] = useState(initialCount)
  useEffect(() => setCount(initialCount), [initialCount])
  const [menuOpen, setMenuOpen] = useState(false)
  const [celebrate, setCelebrate] = useState(false)
  const leafRain = celebrate ? <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">{Array.from({ length: 28 }, (_, i) => <span key={i} className="absolute top-[-12%] animate-[viaLeafFall_3s_ease-in_forwards]" style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 10) * 0.12}s`, transform: `rotate(${i * 41}deg)` }}><img src="/via-leaf.svg" alt="" width="36" height="34" className="h-9 w-9 object-contain" /></span>)}<style>{`@keyframes viaLeafFall { from { translate: 0 -10vh; opacity: 1 } to { translate: 8vw 115vh; opacity: 0 } }`}</style></div> : null
  const [status, setStatus] = useState<"idle" | "preparing" | "approval" | "submitting" | "done" | "error">("idle")
  const [message, setMessage] = useState("")
  const [diamondValues, setDiamondValues] = useState<Array<{ level: number; nanos: number }> | null>(null)
  const [desoUsd, setDesoUsd] = useState<number | null>(null)
  const [levelsFailed, setLevelsFailed] = useState(false)
  const [levelsAttempt, setLevelsAttempt] = useState(0)
  const [recipientOpen, setRecipientOpen] = useState(false)
  const reader = useViaIdentitySession()?.publicKey
  const [previousDiamond, setPreviousDiamond] = useState<{ reader: string; hash: string; level: number } | null>(null)
  const previousLevel = previousDiamond?.reader === reader && previousDiamond?.hash === postHash ? previousDiamond.level : null

  useEffect(() => {
    if (!menuOpen) return
    const controller = new AbortController()
    setPreviousDiamond(null)
    const params = new URLSearchParams({ hash: postHash, fresh: "1", reader: reader ?? "" })
    void fetch("/api/via/post?" + params, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return
        const data = await response.json() as { ok?: boolean; post?: { diamondCount?: number; diamondLevelByReader?: number | null } }
        const latestCount = data.post?.diamondCount
        const latestLevel = data.post?.diamondLevelByReader
        if (!controller.signal.aborted && data.ok && reader && typeof latestLevel === "number" && Number.isSafeInteger(latestLevel) && latestLevel >= 0) {
          setPreviousDiamond({ reader, hash: postHash, level: latestLevel })
        }
        if (!controller.signal.aborted && data.ok && typeof latestCount === "number" && Number.isSafeInteger(latestCount) && latestCount >= 0) {
          setCount(latestCount)
        }
      })
      .catch(() => {})
    return () => controller.abort()
  }, [menuOpen, postHash, reader])

  useEffect(() => {
    const controller = new AbortController()
    fetchViaRates(controller.signal).then((rates) => setDesoUsd(rates.rates?.USD ?? null)).catch(() => setDesoUsd(null))
    return () => controller.abort()
  }, [])

  function diamondUsd(nanos: number) {
    if (!Number.isFinite(nanos) || !desoUsd) return null
    const usd = (nanos / 1_000_000_000) * desoUsd
    return usd < 1 ? "<$1" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(usd)
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
          .filter((entry) => Number.isInteger(entry.level) && entry.level >= 1 && entry.level <= 8 && Number.isSafeInteger(entry.nanos) && entry.nanos > 0)
          .sort((a, b) => a.level - b.level)
        if (!values.length) throw new Error("DIAMOND_LEVELS_UNAVAILABLE")
        if (!controller.signal.aborted) {
          setDiamondValues(values)
        }
      }).catch(() => {
        if (!controller.signal.aborted) setLevelsFailed(true)
      })
    return () => controller.abort()
  }, [diamondValues, levelsAttempt])

  const retryLevels = levelsFailed ? (
    <button type="button" onClick={() => { setLevelsFailed(false); setLevelsAttempt((attempt) => attempt + 1) }}
      className="min-h-9 rounded-lg border border-zinc-700 px-2 text-xs text-amber-200">
      Prijzen niet beschikbaar · Opnieuw laden
    </button>
  ) : null

  function changeMenu(open: boolean) {
    setMenuOpen(open)
    setRecipientOpen(false)
  }

  const busy = status === "preparing" || status === "approval" || status === "submitting"
  const sendLock = useRef(false)
  async function prepare(chosenLevel: number) {
    if (sendLock.current || (previousLevel !== null && chosenLevel <= previousLevel) || !diamondValues?.some(item => item.level === chosenLevel)) return
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
        setCelebrate(false); setStatus("preparing"); setMessage("Preparing the Diamond and exact DeSo cost…")
        const response = await fetch("/api/via/social/diamond", { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", body: JSON.stringify({ action: "prepare", senderPublicKey: session.publicKey, receiverPublicKey, diamondPostHashHex: postHash, diamondLevel: chosenLevel }) })
        const data = await response.json() as PrepareResponse
        await assertAccount()
        if (!response.ok || !data.ok || !data.transactionHex || data.diamondLevel !== chosenLevel ||
            typeof data.feeNanos !== "number" || !Number.isSafeInteger(data.feeNanos) || data.feeNanos < 0 ||
            typeof data.spendAmountNanos !== "number" || !Number.isSafeInteger(data.spendAmountNanos) || data.spendAmountNanos < 0) throw new Error(data.error || "INVALID_DESO_TRANSACTION_DATA")
        const cost = data.spendAmountNanos + data.feeNanos
        if (!Number.isSafeInteger(cost) || cost < 1) throw new Error("INVALID_DESO_SPEND_LIMIT")
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
        setStatus("done"); changeMenu(false); setMessage("Diamond received by DeSo. Final confirmation is not yet verified.")
        setCelebrate(true); window.setTimeout(() => setCelebrate(false), 3200)
        window.dispatchEvent(new Event("via:social:post-published"))
        await viaModernIdentity.refreshSpendingLimits().catch(() => {})
        try {
          const response = await fetch("/api/via/post?fresh=1&hash=" + encodeURIComponent(postHash) + "&reader=" + encodeURIComponent(session.publicKey), { cache: "no-store" })
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

  return <>
    <Popover.Root open={menuOpen} onOpenChange={changeMenu}>
      <Popover.Trigger type="button" title="Diamanten" aria-label={"Diamanten · " + count}
        className="inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-full border border-zinc-800 px-2 text-xs text-zinc-300 hover:border-[#8fd4a9] data-[popup-open]:border-[#8fd4a9] data-[popup-open]:bg-[#285f40]">
        <Gem className="size-4" aria-hidden="true" />
        <span>{count}{variant === "default" ? " Diamanten" : ""}</span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="top" sideOffset={6} collisionPadding={8} className="z-50">
          <Popover.Popup aria-label="Diamant geven" className="w-max max-w-[calc(100vw-1rem)] rounded-2xl border border-[#376047] bg-[#0d1c14] p-1.5 text-zinc-100 shadow-xl">
            {recipientOpen ? (
              <div className="mb-1 flex flex-wrap items-center gap-x-1 px-1 text-xs">
                <span>Ontvanger</span>
                <PublicAccountLabel key={receiverPublicKey} publicKey={receiverPublicKey} />
                {previousLevel ? <span className="text-zinc-400">· Al gegeven op DeSo · {previousLevel}</span> : null}
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-0.5">
              {retryLevels}
              {!diamondValues && !levelsFailed ? <span role="status" className="px-1 text-xs text-zinc-400">Prijzen laden…</span> : null}
              {(diamondValues ?? []).map(({ level, nanos }) => {
                const price = diamondUsd(nanos)
                return (
                  <button key={level} type="button" disabled={busy || (previousLevel !== null && level <= previousLevel)}
                    onClick={() => void prepare(level)} aria-label={"Verstuur diamantniveau " + level + (price ? " · " + price : "")}
                    className="flex min-h-11 min-w-8 flex-col items-center justify-center gap-0.5 rounded-lg px-0.5 text-[#a8e5bd] hover:bg-[#285f40] hover:text-white disabled:opacity-40">
                    <span className="rounded-full bg-[#234131] px-0.5 text-[10px] leading-3 text-white">{price ?? "–"}</span>
                    <Gem className="size-5" aria-hidden="true" />
                  </button>
                )
              })}
              <button type="button" aria-label="Toon ontvanger" aria-expanded={recipientOpen}
                onClick={() => setRecipientOpen((open) => !open)}
                className="flex min-h-11 min-w-8 items-center justify-center rounded-lg text-[#a8e5bd] hover:bg-[#285f40]">
                <span aria-hidden="true" className="flex size-5 items-center justify-center rounded-full border border-current text-xs font-semibold">i</span>
              </button>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
    {leafRain}
    {message ? <span className="order-last w-full basis-full text-xs text-amber-200" role="status">{message}</span> : null}
  </>
}
