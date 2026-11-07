"use client"

import { useEffect, useState } from "react"
import { useViaIdentitySession } from "./use-via-identity-session"
import { useNFTAction } from "./use-nft-action"

type Edition = { serialNumber: number; isPending: boolean; ownerPublicKey?: string }
export default function NFTAcceptTransferControl({ postHash, editions }: { postHash: string; editions: Edition[] }) {
  const session = useViaIdentitySession()
  const runner = useNFTAction()
  const [confirmedValue, setConfirmedValue] = useState(false)
  const [confirmationAccount, setConfirmationAccount] = useState<string | null>(null)
  const confirmed = confirmedValue && confirmationAccount === session?.publicKey
  function setConfirmed(value: boolean) { setConfirmedValue(value); setConfirmationAccount(value ? session?.publicKey ?? null : null) }
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)
  const pending = editions.filter(edition => session && edition.isPending && edition.ownerPublicKey === session.publicKey)
  useEffect(() => { setConfirmed(false); runner.current?.invalidate() }, [session?.publicKey])
  async function accept(serialNumber: number) {
    if (!session || !confirmed || !runner.current || !pending.some(edition => edition.serialNumber === serialNumber)) return
    const result = await runner.current.run({ kind: "accept-transfer", publicKey: session.publicKey, postHash, serialNumber, body: { publicKey: session.publicKey, postHash, serialNumber } }, (status, text) => { setBusy(["preparing", "approval", "submitting"].includes(status)); setMessage(text) })
    if (result.outcome !== "stopped") setConfirmed(false)
  }
  if (!session || pending.length === 0) return null
  return <section className="mt-5 rounded-xl border border-[#285f40]/60 bg-black/25 p-4">
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">Incoming NFT</p>
    <h2 className="mt-2 text-lg font-semibold">Accept transfer</h2>
    <p className="mt-2 text-sm text-zinc-400">DeSo marks these editions as pending for your active account. Ownership completes only after your signed acceptance has been processed.</p>
    <label className="mt-3 flex items-start gap-2 text-xs text-amber-200"><input type="checkbox" checked={confirmed} onChange={event => { runner.current?.invalidate(); setConfirmed(event.target.checked) }} />I understand this accepts a real on-chain NFT transfer.</label>
    <div className="mt-3 flex flex-wrap gap-2">{pending.map(edition => <button key={edition.serialNumber} disabled={!confirmed || busy} onClick={() => void accept(edition.serialNumber)} className="min-h-11 rounded-lg border border-[#8fd4a9]/55 px-4 py-2 text-sm font-semibold text-[#9adbb2] disabled:text-zinc-600">Accept edition #{edition.serialNumber}</button>)}</div>
    {message ? <p className="mt-3 text-xs text-zinc-400" role="status">{message}</p> : null}
  </section>
}
