"use client"

import { useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { viaModernIdentity } from "../deso-identity-modern"
import { useViaIdentitySession } from "../use-via-identity-session"
import { fetchViaRates, isViaRateStale } from "../via-live-rates"

type Props = { recipientPublicKey: string; username?: string; disabled?: boolean }

export default function ViaRewardButton({ recipientPublicKey, username, disabled = false }: Props) {
  const session = useViaIdentitySession()
  const [open, setOpen] = useState(false)
  const [usd, setUsd] = useState("1.00")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const ownPost = Boolean(session?.publicKey && session.publicKey === recipientPublicKey)
  const unavailable = disabled || !session || ownPost

  async function send() {
    if (!session || unavailable || busy) return
    const amountUsd = Number(usd)
    if (!Number.isFinite(amountUsd) || amountUsd <= 0 || amountUsd > 10000) {
      setMessage("Voer een geldig bedrag in.")
      return
    }
    const senderPublicKey = session.publicKey
    const recipient = username ? `@${username.replace(/^@/, "")}` : recipientPublicKey
    if (!window.confirm(`Reward voorbereiden voor ${recipient} van $${amountUsd.toFixed(2)}? De definitieve DESO-waarde en netwerkkosten volgen vóór ondertekening.`)) return
    setBusy(true)
    setMessage("Reward voorbereiden…")
    try {
      const rates = await fetchViaRates()
      if (isViaRateStale(rates.checkedAt) || !rates.rates?.USD || rates.rates.USD <= 0) throw new Error("RATE")
      const amountNanos = Math.round(amountUsd / rates.rates.USD * 1_000_000_000)
      if (!Number.isSafeInteger(amountNanos) || amountNanos < 1) throw new Error("AMOUNT")
      const response = await fetch("/api/via/social/reward", {
        method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store",
        body: JSON.stringify({ action: "prepare", senderPublicKey, recipientPublicKey, amountNanos, confirmed: true }),
      })
      const prepared = await response.json() as { ok?: boolean; transactionHex?: string; feeNanos?: number | null }
      if (!response.ok || !prepared.ok || !prepared.transactionHex) throw new Error("PREPARE")
      const feeText = typeof prepared.feeNanos === "number" && Number.isFinite(prepared.feeNanos)
        ? `${(prepared.feeNanos / 1_000_000_000).toFixed(9)} DESO` : "onbekend"
      if (feeText === "onbekend") throw new Error("FEE_UNKNOWN")
      if (!window.confirm(`Reward definitief verzenden?\nOntvanger: ${recipient}\nBedrag: $${amountUsd.toFixed(2)} (ongeveer ${(amountNanos / 1_000_000_000).toFixed(9)} DESO)\nNetwerkkosten: ${feeText}\nBlockchainbetalingen zijn onomkeerbaar.`)) {
        setMessage("Reward geannuleerd.")
        return
      }
      if ((await viaModernIdentity.currentUser())?.publicKey !== senderPublicKey) throw new Error("ACCOUNT_CHANGED")
      const signedTransactionHex = await viaModernIdentity.signTx(prepared.transactionHex)
      if ((await viaModernIdentity.currentUser())?.publicKey !== senderPublicKey) throw new Error("ACCOUNT_CHANGED")
      const submitted = await fetch("/api/via/social/reward", {
        method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store",
        body: JSON.stringify({ action: "submit", signedTransactionHex }),
      })
      const result = await submitted.json() as { ok?: boolean }
      if (!submitted.ok || !result.ok) throw new Error("SUBMIT")
      setMessage("Reward verzonden via DeSo.")
      setOpen(false)
    } catch (error) {
      setMessage(error instanceof Error && error.message === "FEE_UNKNOWN" ? "DeSo heeft geen controleerbare netwerkkosten teruggegeven. Er is niets ondertekend." : "Reward niet verzonden. Controleer DeSo en je machtigingen.")
    } finally {
      setBusy(false)
    }
  }

  return <span className="relative inline-flex flex-col items-start gap-1">
    <button type="button" disabled={unavailable || busy} onClick={() => { setOpen(value => !value); setMessage("") }}
      aria-label="Reward" aria-expanded={open} title={ownPost ? "Geen Reward naar eigen account" : !session ? "Log in via VIA" : "Reward via DeSo"}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-zinc-800 px-2 text-zinc-300 hover:border-[#8fd4a9] disabled:opacity-50">
      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
    </button>
    {open && !unavailable ? <span className="absolute right-0 top-full z-40 mt-2 flex w-56 max-w-[calc(100vw-2rem)] flex-col gap-2 rounded-xl border border-zinc-700 bg-[#080b09] p-3 shadow-2xl">
      <label className="text-xs text-zinc-300">Reward in USD
        <input value={usd} onChange={event => setUsd(event.target.value)} inputMode="decimal" aria-label="Reward bedrag in USD"
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white" />
      </label>
      <button type="button" disabled={busy} onClick={() => void send()} className="min-h-11 rounded-lg border border-[#8fd4a9] px-3 text-xs text-white disabled:opacity-50">
        {busy ? "Bezig…" : "Reward controleren"}
      </button>
    </span> : null}
    {message ? <span role="status" aria-live="polite" className="max-w-56 text-xs text-zinc-300">{message}</span> : null}
  </span>
}
