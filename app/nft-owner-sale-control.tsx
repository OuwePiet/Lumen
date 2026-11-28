"use client"


import { useEffect, useMemo, useRef, useState } from "react"
import { viaModernIdentity, type ViaModernIdentityUser } from "./deso-identity-modern"

import { updateNFT, transferNFT, burnNFT, identity } from "deso-protocol"

type OwnerEdition = {
  serialNumber: number
  isForSale: boolean
  isPending?: boolean
  ownerPublicKey?: string
  minBidAmountNanos?: number
  isBuyNow?: boolean
  buyNowPriceNanos?: number
}

type Props = {
  postHash: string
  editions: OwnerEdition[]
  hasUnlockable: boolean
}

type PrepareResponse = {
  ok?: boolean
  transactionHex?: string
  feeNanos?: number | null
  error?: string
}

function desoToSafeNanos(input: string) {
  const trimmed = input.trim()
  if (!/^\d+(?:\.\d{0,9})?$/.test(trimmed)) return null
  const [whole, fraction = ""] = trimmed.split(".")
  const nanos = BigInt(whole) * BigInt(1_000_000_000) + BigInt((fraction + "000000000").slice(0, 9))
  if (nanos < BigInt(0) || nanos > BigInt(Number.MAX_SAFE_INTEGER)) return null
  return Number(nanos)
}

function formatDeso(nanos?: number) {
  if (typeof nanos !== "number" || !Number.isFinite(nanos)) return "0"
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 9 }).format(nanos / 1_000_000_000)
}

export default function NFTOwnerSaleControl({ postHash, editions, hasUnlockable }: Props) {
  const [session, setSession] = useState<ViaModernIdentityUser | null>(null)
  const owned = useMemo(() => editions.filter((item) => session && item.ownerPublicKey === session.publicKey), [editions, session])
  const [serialNumber, setSerialNumber] = useState<number | null>(null)
  const [minBid, setMinBid] = useState("0")
  const [buyNowEnabled, setBuyNowEnabled] = useState(false)
  const [buyNowPrice, setBuyNowPrice] = useState("0")
  const [confirmed, setConfirmed] = useState(false)
  const [receiverPublicKey, setReceiverPublicKey] = useState("")
  const [status, setStatus] = useState<"idle"|"preparing"|"approval"|"submitting"|"done"|"error">("idle")
  const [message, setMessage] = useState("")
  const [feeNanos, setFeeNanos] = useState<number | null>(null)
  const pendingMode = useRef<"list"|"update"|"remove"|"transfer"|"burn"|null>(null)

  const selected = owned.find((item) => item.serialNumber === serialNumber) ?? owned[0]

  useEffect(() => {
    void viaModernIdentity.currentUser().then(setSession)
    return viaModernIdentity.subscribe(setSession)
  }, [])

  useEffect(() => {
    if (!selected) return
    setSerialNumber(selected.serialNumber)
    setMinBid(formatDeso(selected.minBidAmountNanos))
    setBuyNowEnabled(Boolean(selected.isBuyNow && !hasUnlockable))
    setBuyNowPrice(formatDeso(selected.buyNowPriceNanos))
    setConfirmed(false)
  }, [selected?.serialNumber, selected?.isForSale, selected?.minBidAmountNanos, selected?.isBuyNow, selected?.buyNowPriceNanos, hasUnlockable])

  const lock=useRef(false)
  async function runNative(mode:"list"|"update"|"remove"|"transfer"|"burn"){
    if(!session||!selected||!confirmed||lock.current||busy||selected.isPending)return
    const key=session.publicKey, serial=selected.serialNumber
    const receiver=receiverPublicKey.trim()
    if(mode==="transfer"&&(selected.isForSale||hasUnlockable||receiver===key||!/^[1-9A-HJ-NP-Za-km-z]{40,128}$/.test(receiver)))return
    if(mode==="burn"&&selected.isForSale)return
    const sale=mode==="list"||mode==="update"||mode==="remove"
    const minimum=mode==="remove"?0:desoToSafeNanos(minBid)
    const buy=mode!=="remove"&&buyNowEnabled&&!hasUnlockable
    const price=buy?desoToSafeNanos(buyNowPrice):0
    if(sale&&(minimum===null||price===null||(buy&&price<minimum))){setMessage("Enter valid sale prices.");return}
    lock.current=true;setConfirmed(false);setStatus("preparing");setFeeNanos(null);pendingMode.current=mode
    let submitting=false
    const assertAccount=async()=>{if((await viaModernIdentity.currentUser())?.publicKey!==key||(await identity.snapshot()).currentUser?.publicKey!==key)throw new Error("Account changed")}
    try{
      await assertAccount()
      setMessage("Preparing directly with DeSo...")
      const common={NFTPostHashHex:postHash,SerialNumber:serial,TransactionFees:[]}
      await assertAccount()
      submitting=true;setStatus("submitting")
      const opts={localConstruction:false}
      const {constructedTransactionResponse:tx}=sale
        ?await updateNFT({...common,UpdaterPublicKeyBase58Check:key,IsForSale:mode!=="remove",MinBidAmountNanos:minimum??0,IsBuyNow:buy,BuyNowPriceNanos:price??0},opts)
        :mode==="transfer"
          ?await transferNFT({...common,SenderPublicKeyBase58Check:key,ReceiverPublicKeyBase58Check:receiver},opts)
          :await burnNFT({...common,UpdaterPublicKeyBase58Check:key},opts)
      setFeeNanos(tx.FeeNanos)
      setStatus("done");setMessage("Submitted to DeSo. Refresh to verify.")
    }catch{setStatus("error");setMessage(submitting?"Submission uncertain. Verify on DeSo before retrying.":"Transaction not submitted. Review account and permissions.")}
    finally{lock.current=false;pendingMode.current=null}
  }
  async function prepare(mode:"list"|"update"|"remove"){await runNative(mode)}
  async function prepareTransfer(){await runNative("transfer")}
  async function prepareBurn(){await runNative("burn")}

  const busy = status === "preparing" || status === "approval" || status === "submitting"

  return (
    <section className="mt-5 rounded-xl border border-zinc-800 bg-black/25 p-4" aria-labelledby="via-nft-owner-sale-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Owner control</p>
      <h2 id="via-nft-owner-sale-heading" className="mt-2 text-lg font-semibold">Manage sale</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-400">Only editions owned by the active DeSo account appear here. DeSo itself verifies ownership again when constructing and processing the transaction.</p>

      <label className="mt-4 block text-sm text-zinc-300">Owned edition
        <select value={selected?.serialNumber ?? ""} onChange={(event) => setSerialNumber(Number(event.target.value))} className="mt-2 block w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm">
          {owned.map((item) => <option key={item.serialNumber} value={item.serialNumber}>#{item.serialNumber} · {item.isForSale ? "for sale" : "not for sale"}</option>)}
        </select>
      </label>

      <label className="mt-3 block text-sm text-zinc-300">Minimum bid in DESO
        <input value={minBid} onChange={(event) => { setMinBid(event.target.value); setConfirmed(false) }} inputMode="decimal" className="mt-2 block w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm" />
      </label>
      {!hasUnlockable ? <label className="mt-3 flex items-center gap-2 text-sm text-zinc-300"><input type="checkbox" checked={buyNowEnabled} onChange={(event) => { setBuyNowEnabled(event.target.checked); setConfirmed(false) }} />Enable native DeSo Buy Now</label> : <p className="mt-3 text-xs text-zinc-500">Buy Now is unavailable for unlockable NFTs under DeSo rules.</p>}
      {buyNowEnabled && !hasUnlockable ? <label className="mt-3 block text-sm text-zinc-300">Buy Now price in DESO
        <input value={buyNowPrice} onChange={(event) => { setBuyNowPrice(event.target.value); setConfirmed(false) }} inputMode="decimal" className="mt-2 block w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm" />
      </label> : null}
      {selected?.isForSale ? <p className="mt-3 text-sm text-zinc-400">This edition is currently listed. You can update its sale price or remove it from sale. Removing it from sale also clears outstanding bids according to DeSo rules.</p> : null}

      <label className="mt-3 flex items-start gap-2 text-xs text-amber-200"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />I understand this is a real on-chain NFT sale-status transaction.</label>
      {feeNanos !== null ? <p className="mt-2 text-xs text-zinc-500">Prepared network fee: {feeNanos.toLocaleString()} nanos.</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" disabled={!confirmed || busy} onClick={() => void prepare(selected?.isForSale ? "update" : "list")} className="rounded-lg border border-[#8fd4a9]/55 px-4 py-2 text-sm font-semibold text-[#9adbb2] disabled:border-zinc-800 disabled:text-zinc-600">
          {status === "preparing" ? "Preparing…" : status === "approval" ? "Review in DeSo…" : status === "submitting" ? "Submitting…" : selected?.isForSale ? "Update price" : "List for sale"}
        </button>
        {selected?.isForSale ? <button type="button" disabled={!confirmed || busy} onClick={() => void prepare("remove")} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 disabled:border-zinc-800 disabled:text-zinc-600">Remove from sale</button> : null}
      </div>
      {message ? <p className={"mt-3 text-xs " + (status === "error" ? "text-amber-300" : status === "done" ? "text-[#9adbb2]" : "text-zinc-500")} role="status">{message}</p> : null}

      <div className="mt-5 border-t border-red-950/70 pt-4">
        <h3 className="text-sm font-semibold text-red-300">Permanent burn</h3>
        <p className="mt-2 text-xs leading-5 text-zinc-500">Burn permanently destroys this NFT edition. VIA only enables this when the edition is not for sale and not pending transfer. This cannot be undone.</p>
        <button type="button" disabled={!confirmed || busy || selected?.isForSale || selected?.isPending} onClick={() => void prepareBurn()} className="mt-3 rounded-lg border border-red-900 px-4 py-2 text-sm font-semibold text-red-300 disabled:border-zinc-800 disabled:text-zinc-600">Burn edition #{selected?.serialNumber}</button>
      </div>

      {!selected?.isForSale ? <div className="mt-5 border-t border-zinc-800 pt-4">
        <h3 className="text-sm font-semibold text-zinc-200">Transfer edition</h3>
        {hasUnlockable ? <p className="mt-2 text-xs text-zinc-500">Protected for now: unlockable NFT transfers require receiver-specific encrypted unlockable content.</p> : <>
          <label className="mt-3 block text-sm text-zinc-300">Receiver DeSo public key
            <input value={receiverPublicKey} onChange={(event) => { setReceiverPublicKey(event.target.value); setConfirmed(false) }} placeholder="BC1…" className="mt-2 block w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm" />
          </label>
          <p className="mt-2 text-xs text-zinc-500">The receiver must accept the native DeSo NFT transfer before ownership changes.</p>
          <button type="button" disabled={!confirmed || !receiverPublicKey.trim() || busy} onClick={() => void prepareTransfer()} className="mt-3 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 disabled:text-zinc-600">Transfer NFT</button>
        </>}
      </div> : null}
    </section>
  )
}
