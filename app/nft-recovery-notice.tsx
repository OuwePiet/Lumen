"use client"

import { useEffect, useState } from "react"
import { financialAccountRecovery, FINANCIAL_SUBMISSION_EVENT, readFinancialReceipt } from "./financial-submission"
import { useViaIdentitySession } from "./use-via-identity-session"

function AccountRecovery({ publicKey }: { publicKey: string }) {
  const [recovery, setRecovery] = useState<ReturnType<typeof financialAccountRecovery> | null>(null)
  const [unavailable, setUnavailable] = useState(false)
  const [message, setMessage] = useState("")
  useEffect(() => {
    const sync = () => { try { setRecovery(financialAccountRecovery(publicKey)); setUnavailable(false) } catch { setUnavailable(true) } }
    sync()
    window.addEventListener("storage", sync)
    window.addEventListener(FINANCIAL_SUBMISSION_EVENT, sync)
    return () => { window.removeEventListener("storage", sync); window.removeEventListener(FINANCIAL_SUBMISSION_EVENT, sync) }
  }, [publicKey])
  if (!unavailable && !recovery?.uncertain && !recovery?.invalid && !recovery?.receipts.length) return null
  return <section className="my-5 rounded-xl border border-amber-900/60 bg-black/30 p-4" aria-labelledby="nft-recovery-heading">
    <h2 id="nft-recovery-heading" className="text-sm font-semibold text-amber-200">Eerdere transacties van de actieve account</h2>
    {unavailable || recovery?.invalid ? <p className="mt-3 text-sm text-amber-200">Herstelregistratie is niet volledig leesbaar. Niet opnieuw verzenden voordat de bestaande status is gecontroleerd.</p> : null}
    {recovery?.uncertain ? <p className="mt-3 text-sm text-amber-200">Een eerdere financiële verzending is onzeker. Nieuwe financiële acties zijn geblokkeerd. Herladen of een andere pagina openen maakt de uitkomst niet zeker; gebruik ook een ander apparaat niet om opnieuw te verzenden.</p> : null}
    <ul className="mt-3 grid gap-3">{recovery?.receipts.slice(0, 20).map(receipt => <li key={receipt.intent} className="rounded-lg border border-zinc-800 p-3 text-xs text-zinc-400">
      <p>{receipt.intent.split(":", 1)[0]} · {new Date(receipt.startedAt).toISOString()}</p>
      <p className="mt-2 break-all">DeSo heeft de verzending ontvangen. Referentie: {receipt.transactionHashHex ?? "geen betrouwbare hash beschikbaar"}</p>
      <button type="button" className="mt-2 min-h-11 text-[#9adbb2] underline" onClick={() => { void readFinancialReceipt(publicKey, receipt.intent).then(setMessage).catch(() => setMessage("Readback niet beschikbaar. Niet opnieuw verzenden.")) }}>Lees bestaande transactie terug</button>
    </li>)}</ul>
    {(recovery?.receipts.length ?? 0) > 20 ? <p className="mt-3 text-xs text-zinc-500">De twintig meest recente ontvangstbewijzen worden getoond; oudere blokkeringen blijven behouden.</p> : null}
    {message ? <p role="status" className="mt-3 text-sm text-zinc-400">{message}</p> : null}
  </section>
}
export default function NFTRecoveryNotice() {
  const session = useViaIdentitySession()
  return session ? <AccountRecovery key={session.publicKey} publicKey={session.publicKey} /> : null
}
