"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { viaModernIdentity, type ViaModernIdentityUser } from "./deso-identity-modern"
import { restoreIdentitySession, VIA_IDENTITY_EVENT } from "./deso-identity-session"
import { useNFTActionReview } from "./nft-action-review"
import { financialSubmissionBlock, markFinancialPending, markFinancialSubmitted, readFinancialReceipt, withFinancialAccountLock, FINANCIAL_SUBMISSION_EVENT } from "./financial-submission"

type SaleEdition = {
  serialNumber: number
  minBidAmountNanos?: number
  buyNowPriceNanos?: number
  isBuyNow?: boolean
  ownerPublicKey?: string
}

type Props = {
  postHash: string
  editions: SaleEdition[]
}

type PrepareResponse = { ok?: boolean; transactionHex?: string; publicKey?: string; postHash?: string; serialNumber?: number; bidAmountNanos?: number; feeNanos?: number; spendAmountNanos?: number; balanceNanos?: number; preparedAt?: number; error?: string }

function desoToSafeNanos(input: string) {
  const trimmed = input.trim()
  if (!/^\d+(?:\.\d{0,9})?$/.test(trimmed)) return null
  const [whole, fraction = ""] = trimmed.split(".")
  const nanos = BigInt(whole) * BigInt(1_000_000_000) + BigInt((fraction + "000000000").slice(0, 9))
  if (nanos <= BigInt(0) || nanos > BigInt(Number.MAX_SAFE_INTEGER)) return null
  return Number(nanos)
}

function formatDeso(nanos?: number) {
  if (typeof nanos !== "number" || !Number.isFinite(nanos)) return "—"
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 9 }).format(nanos / 1_000_000_000)
}

export default function NFTBidControl({ postHash, editions }: Props) {
  const review = useNFTActionReview()
  const [session, setSession] = useState<ViaModernIdentityUser | null>(null)
  const [serialNumber, setSerialNumber] = useState(editions[0]?.serialNumber ?? 1)
  const [amount, setAmount] = useState("")
  const [confirmed, setConfirmed] = useState(false)
  const [status, setStatus] = useState<"idle"|"preparing"|"approval"|"submitting"|"done"|"error">("idle")
  const [message, setMessage] = useState("")
  const [feeNanos, setFeeNanos] = useState<number | null>(null)
  const sendLock = useRef(false)
  const activeOperation = useRef<{ publicKey: string; invalidated: boolean } | null>(null)
  const [submissionBlock, setSubmissionBlock] = useState("")
  const selectedAccount = useRef<string | null>(null)

  const edition = useMemo(() => editions.find((item) => item.serialNumber === serialNumber) ?? editions[0], [editions, serialNumber])
  const bidNanos = desoToSafeNanos(amount)
  const minBid = edition?.minBidAmountNanos ?? 0
  const amountValid = typeof bidNanos === "number" && bidNanos >= minBid
  const isOwner = Boolean(session && edition?.ownerPublicKey === session.publicKey)
  const canBuyNow = Boolean(edition?.isBuyNow && typeof edition?.buyNowPriceNanos === "number" && edition.buyNowPriceNanos > 0)
  const busy = status === "preparing" || status === "approval" || status === "submitting"
  const intent = (nanos: number) => `nft-bid:${postHash}:${edition?.serialNumber}:${nanos}`

  useEffect(() => {
    const sync = (event?: Event) => {
      const operation = activeOperation.current
      if (operation && event?.type === "storage") {
        const change = event as StorageEvent
        if ((change.key === "viaActivePublicKey" || change.key === "desoActivePublicKey") && change.newValue !== operation.publicKey) operation.invalidated = true
      }
      const current = restoreIdentitySession()
      if (selectedAccount.current !== null && selectedAccount.current !== current?.publicKey) setConfirmed(false)
      selectedAccount.current = current?.publicKey ?? null
      if (operation && (current?.publicKey !== operation.publicKey)) operation.invalidated = true
      try { setSubmissionBlock(current ? financialSubmissionBlock(current.publicKey, intent(bidNanos ?? edition?.buyNowPriceNanos ?? 0)) : "") }
      catch { setSubmissionBlock("Herstelregistratie is niet beschikbaar. Niet verzenden.") }
    }
    sync()
    window.addEventListener(VIA_IDENTITY_EVENT, sync)
    window.addEventListener("storage", sync)
    window.addEventListener(FINANCIAL_SUBMISSION_EVENT, sync)
    return () => {
      window.removeEventListener(VIA_IDENTITY_EVENT, sync)
      window.removeEventListener("storage", sync)
      window.removeEventListener(FINANCIAL_SUBMISSION_EVENT, sync)
      if (activeOperation.current) activeOperation.current.invalidated = true
    }
  }, [postHash, edition?.serialNumber, edition?.ownerPublicKey, edition?.isBuyNow, edition?.buyNowPriceNanos, edition?.minBidAmountNanos, bidNanos])

  function invalidateSelection() {
    if (activeOperation.current) activeOperation.current.invalidated = true
  }

  useEffect(() => {
    return viaModernIdentity.subscribe(setSession)
  }, [])

  async function prepare(forBuyNow = false) {
    if (sendLock.current) return
    const effectiveBidNanos = forBuyNow && canBuyNow ? edition?.buyNowPriceNanos ?? null : bidNanos
    if (!edition || typeof effectiveBidNanos !== "number" || !Number.isSafeInteger(effectiveBidNanos) || effectiveBidNanos <= 0 || !confirmed || isOwner || busy) return
    if (!forBuyNow && !amountValid) return
    sendLock.current = true
    let submissionStarted = false
    let accepted = false
    const account = restoreIdentitySession()
    const operation = account ? { publicKey: account.publicKey, invalidated: false } : null
    activeOperation.current = operation
    try {
      if (!account || !operation || session?.publicKey !== account.publicKey) throw new Error("DESO_ACCOUNT_CHANGED")
      const assertAccount = async () => {
        const check = () => {
          if (operation.invalidated || restoreIdentitySession()?.publicKey !== account.publicKey) throw new Error("DESO_ACCOUNT_CHANGED_OR_SDK_REQUIRED")
        }
        check()
        const current = await viaModernIdentity.currentUser()
        check()
        if (current?.publicKey !== account.publicKey) throw new Error("DESO_ACCOUNT_CHANGED_OR_SDK_REQUIRED")
      }
      await withFinancialAccountLock(account.publicKey, async () => {
      await assertAccount()
      const actionIntent = intent(effectiveBidNanos)
      const blocked = financialSubmissionBlock(account.publicKey, actionIntent)
      if (blocked) { setSubmissionBlock(blocked); setMessage(blocked); return }
      setStatus("preparing")
      setMessage("Preparing the exact DeSo NFT bid transaction…")
      setFeeNanos(null)
      const response = await fetch("/api/via/nft/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          action: "prepare",
          publicKey: account.publicKey,
          postHash,
          serialNumber: edition.serialNumber,
          bidAmountNanos: effectiveBidNanos,
          buyNow: forBuyNow,
          expectedOwnerPublicKey: edition.ownerPublicKey,
        }),
      })
      const data = await response.json() as PrepareResponse
      await assertAccount()
      if (!response.ok || !data.ok || typeof data.transactionHex !== "string" || data.transactionHex.length > 500_000 || !/^(?:[0-9a-f]{2})+$/i.test(data.transactionHex)) throw new Error(data.error || "PREPARE_FAILED")
      if (data.publicKey !== account.publicKey || data.postHash !== postHash.toLowerCase() || data.serialNumber !== edition.serialNumber || data.bidAmountNanos !== effectiveBidNanos ||
        typeof data.feeNanos !== "number" || !Number.isSafeInteger(data.feeNanos) || data.feeNanos < 0 ||
        typeof data.spendAmountNanos !== "number" || !Number.isSafeInteger(data.spendAmountNanos) || data.spendAmountNanos < 0 ||
        typeof data.balanceNanos !== "number" || !Number.isSafeInteger(data.balanceNanos) || data.balanceNanos < 0 ||
        typeof data.preparedAt !== "number" || !Number.isSafeInteger(data.preparedAt)) throw new Error("INVALID_PREPARED_COST")
      const cost = Math.max(effectiveBidNanos, data.spendAmountNanos) + data.feeNanos
      if (!Number.isSafeInteger(cost) || cost > data.balanceNanos) throw new Error("INSUFFICIENT_DESO_BALANCE")
      const assertFresh = () => { if (Date.now() < data.preparedAt! || Date.now() - data.preparedAt! > 120_000) throw new Error("NFT_QUOTE_EXPIRED") }
      assertFresh()
      setFeeNanos(data.feeNanos)
      const reviewed = await review({ publicKey: account.publicKey, kind: forBuyNow ? "buy-now" : "bid", postHash, serialNumber: edition.serialNumber, body: { bidAmountNanos: effectiveBidNanos }, feeNanos: data.feeNanos, spendNanos: cost - data.feeNanos, expiresAt: data.preparedAt! + 120_000, isCurrent: () => !operation.invalidated && restoreIdentitySession()?.publicKey === account.publicKey })
      await assertAccount()
      assertFresh()
      if (!reviewed) throw new Error("NFT_REVIEW_CANCELLED")
      await viaModernIdentity.refreshSpendingLimits()
      await assertAccount()
      const limits = await viaModernIdentity.spendingLimits()
      await assertAccount()
      const remaining = limits?.GlobalDESOLimit ?? 0
      if (!Number.isSafeInteger(remaining) || remaining < 0) throw new Error("INVALID_DESO_SPENDING_LIMITS")
      const bidPermission = {
        GlobalDESOLimit: cost,
        NFTOperationLimitMap: {
          [postHash]: {
            [edition.serialNumber]: {
              nft_bid: 1,
            },
          },
        },
      }
      const permitted = await viaModernIdentity.hasPermissions(bidPermission)
      await assertAccount()
      if (!permitted) {
        const requested = remaining + cost
        if (!Number.isSafeInteger(requested)) throw new Error("INVALID_DESO_SPENDING_LIMITS")
        setMessage("Requesting permission for this exact DeSo NFT edition…")
        await viaModernIdentity.requestPermissions({ ...bidPermission, GlobalDESOLimit: requested })
        await assertAccount()
        if (!(await viaModernIdentity.hasPermissions(bidPermission))) throw new Error("NFT_PERMISSION_NOT_CONFIRMED")
        await assertAccount()
      }
      setStatus("approval")
      setMessage(forBuyNow ? "Signing the exact Buy Now purchase with DeSo Identity…" : "Signing the exact NFT bid with DeSo Identity…")
      await assertAccount()
      assertFresh()
      const signedTransactionHex = await viaModernIdentity.signTx(data.transactionHex)
      await assertAccount()
      assertFresh()
      if (typeof signedTransactionHex !== "string" || signedTransactionHex.length > 500_000 || !/^(?:[0-9a-f]{2})+$/i.test(signedTransactionHex)) throw new Error("INVALID_SIGNED_TRANSACTION")
      const submission = { publicKey: account.publicKey, intent: actionIntent, amountNanos: effectiveBidNanos, startedAt: Date.now() }
      markFinancialPending(submission)
      if (operation.invalidated || restoreIdentitySession()?.publicKey !== account.publicKey) throw new Error("DESO_ACCOUNT_CHANGED")
      setStatus("submitting")
      setMessage("Submitting the approved NFT bid to DeSo…")
      submissionStarted = true
      const submitResponse = await fetch("/api/via/nft/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ action: "submit", signedTransactionHex }),
      })
      const submitData = await submitResponse.json() as { ok?: boolean; error?: string; transaction?: { TxnHashHex?: unknown } }
      if (!submitResponse.ok || !submitData.ok) throw new Error(submitData.error || "SUBMIT_FAILED")
      accepted = true
      markFinancialSubmitted(submission, submitData.transaction?.TxnHashHex)
      setStatus("done")
      setMessage(forBuyNow ? "Buy Now purchase submitted to DeSo." : "NFT bid submitted to DeSo.")
      setConfirmed(false)
      setSubmissionBlock(financialSubmissionBlock(account.publicKey, actionIntent))
      try { await assertAccount(); await viaModernIdentity.refreshSpendingLimits() } catch { /* Accepted receipt stays; never resubmit on refresh failure. */ }
      try { setMessage(await readFinancialReceipt(account.publicKey, actionIntent)) } catch { setMessage("DeSo heeft de transactie ontvangen; readback is niet beschikbaar. Niet opnieuw verzenden.") }
      })
    } catch (error) {
      setStatus("error")
      setMessage(accepted ? "DeSo heeft de transactie ontvangen, maar herstelregistratie is onzeker. Niet opnieuw verzenden."
        : submissionStarted ? "Verzendstatus onzeker. Controleer DeSo; niet opnieuw verzenden."
        : `Niet uitgezonden door VIA. Controleer account, rechten, bedrag en herstelstatus. ${error instanceof Error ? error.message : ""}`)
    } finally {
      activeOperation.current = null
      sendLock.current = false
    }
  }

  if (editions.length === 0) return null

  return (
    <section className="mt-5 rounded-xl border border-[#285f40]/50 bg-black/30 p-4" aria-labelledby="via-nft-bid-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">Controlled DeSo NFT action</p>
      <h2 id="via-nft-bid-heading" className="mt-2 text-lg font-semibold">Place a bid</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-400">This creates a native DeSo NFT bid. VIA never signs or submits it without your DeSo Identity approval.</p>
      {!session ? <p className="mt-3 text-sm text-zinc-500">Connect through DeSo Identity on VIA before bidding.</p> : <>
        <label className="mt-4 block text-sm text-zinc-300">Edition
          <select value={serialNumber} onChange={(event) => { invalidateSelection(); setSerialNumber(Number(event.target.value)); setConfirmed(false) }} className="mt-2 block w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm">
            {editions.map((item) => <option key={item.serialNumber} value={item.serialNumber}>#${item.serialNumber} · min ${formatDeso(item.minBidAmountNanos)} DESO${typeof item.buyNowPriceNanos === "number" ? ` · buy now ${formatDeso(item.buyNowPriceNanos)} DESO` : ""}</option>)}
          </select>
        </label>
        <label className="mt-3 block text-sm text-zinc-300">Bid amount in DESO
          <input value={amount} onChange={(event) => { invalidateSelection(); setAmount(event.target.value); setConfirmed(false) }} inputMode="decimal" placeholder={minBid ? formatDeso(minBid) : "0.01"} className="mt-2 block w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm" />
        </label>
        {isOwner ? <p className="mt-2 text-xs text-amber-300">The active DeSo account owns this edition and cannot bid on itself through VIA.</p> : null}
        {!isOwner && amount && !amountValid ? <p className="mt-2 text-xs text-amber-300">Enter a valid amount of at least {formatDeso(minBid)} DESO.</p> : null}
        <label className="mt-3 flex items-start gap-2 text-xs text-amber-200"><input type="checkbox" checked={confirmed} onChange={(event) => { invalidateSelection(); setConfirmed(event.target.checked) }} />I understand this creates a real on-chain bid that may reserve/spend $DESO according to DeSo rules.</label>
        {feeNanos !== null ? <p className="mt-2 text-xs text-zinc-500">Prepared network fee: {feeNanos.toLocaleString()} nanos.</p> : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => void prepare(false)} disabled={!confirmed || !amountValid || isOwner || busy} className="rounded-lg border border-[#8fd4a9]/55 px-4 py-2 text-sm font-semibold text-[#9adbb2] disabled:border-zinc-800 disabled:text-zinc-600">
            {status === "preparing" ? "Preparing…" : status === "approval" ? "Review in DeSo…" : status === "submitting" ? "Submitting…" : "Review bid in DeSo"}
          </button>
          {canBuyNow ? <button type="button" onClick={() => void prepare(true)} disabled={!confirmed || isOwner || busy} className="rounded-lg border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-300 disabled:border-zinc-800 disabled:text-zinc-600">Buy now · {formatDeso(edition?.buyNowPriceNanos)} DESO</button> : null}
        </div>
        {message ? <p className={"mt-3 text-xs " + (status === "error" ? "text-amber-300" : status === "done" ? "text-[#9adbb2]" : "text-zinc-500")} role="status">{message}</p> : null}
        {submissionBlock ? <p role="status" className="mt-3 text-xs text-amber-300">{submissionBlock}</p> : null}
        {session && (bidNanos ?? edition?.buyNowPriceNanos) ? <button type="button" disabled={busy} onClick={() => { const key = session.publicKey; void readFinancialReceipt(key, intent(bidNanos ?? edition?.buyNowPriceNanos ?? 0)).then(setMessage).catch(() => setMessage("Readback niet beschikbaar. Niet opnieuw verzenden.")) }} className="mt-2 text-xs text-[#9adbb2]">Controleer eerdere verzending</button> : null}
      </>}
    </section>
  )
}
