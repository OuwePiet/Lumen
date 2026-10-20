"use client"

import { useEffect, useState } from "react"
import MintMediaStep from "./mint-media-step"
import MintPreflight from "./mint-preflight"
import MintPreflightLocalizer from "./mint-preflight-localizer"
import { useViaIdentitySession } from "../use-via-identity-session"
import NFTRecoveryNotice from "../nft-recovery-notice"

const REVIEW_VERSION = "2026-10-16"
function AccountMintFlow({ publicKey }: { publicKey: string }) {
  const [postHash, setPostHash] = useState("")
  const [reviewed, setReviewed] = useState<boolean | null>(null)
  const [checked, setChecked] = useState(false)
  const [storageMessage, setStorageMessage] = useState("")
  const storageKey = `via:nft-review:${REVIEW_VERSION}:${publicKey}`
  useEffect(() => {
    try { setReviewed(window.localStorage.getItem(storageKey) === "reviewed") }
    catch { setReviewed(false) }
  }, [storageKey])
  if (reviewed === null) return <p role="status">Mint-informatie laden…</p>
  return <>
    <MintPreflightLocalizer />
    <NFTRecoveryNotice />
    <section className="mb-4 rounded-xl border border-zinc-800 bg-black/20 p-5" aria-labelledby="via-nft-terms-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">VIA NFT · mint review {REVIEW_VERSION}</p>
      <h2 id="via-nft-terms-heading" className="mt-2 text-xl font-semibold">Before you mint</h2>
      <p className="mt-3 text-sm leading-6 text-zinc-300">Review the account, NFT terms and current DeSo cost before approval. Storage is separate. Never resend an uncertain transaction.</p>
      <details open={!reviewed} className="mt-3 text-sm text-zinc-400"><summary className="min-h-11 cursor-pointer py-3 text-[#b8ddc5]">Mint, storage and ownership information</summary><div className="space-y-3 leading-6">
        <p>You publish a public DeSo source post first. Turning that post into an NFT is a separate signed transaction. Review the active account, post hash, edition count, sale prices, creator royalty and coin royalty before approval.</p>
        <p>The fresh DeSo quote shows network fees and any mint spend. Storage and service charges, if shown, are separate. An unsigned quote does not mint an NFT. Ordinary DeSo minting does not require a paid VIA storage subscription.</p>
        <p>Publish only media you may distribute and state rights and utility accurately. Owning an NFT does not automatically grant copyright or commercial rights. Mark sensitive media on the source post before minting.</p>
        <p>Public blockchain records cannot be treated as private storage. Keep a backup of your media. An external link can become unavailable; an NFT does not guarantee permanent hosting. Upload and provider payment for the Arweave preview are not connected.</p>
        <p>A DeSo receipt is not proof of final block inclusion or final ownership. A timeout can leave the outcome uncertain. Do not retry an uncertain transaction after a reload or from another device; check its existing status first.</p>
        <p>Transfer requires recipient acceptance. Burn permanently destroys an edition. Unlockable delivery requires recipient-specific encryption; controls stay blocked where that delivery is not available.</p>
      </div></details>
      {!reviewed ? <>
        <label className="mt-5 flex items-start gap-3 text-sm text-zinc-300"><input type="checkbox" checked={checked} onChange={event => setChecked(event.target.checked)} className="mt-1" /><span>I have reviewed this mint information for the active account.</span></label>
        <button type="button" disabled={!checked} className="mt-5 min-h-11 rounded-lg border border-[#285f40] px-4 py-2 text-sm font-semibold text-[#9adbb2] disabled:text-zinc-600" onClick={() => {
          try { window.localStorage.setItem(storageKey, "reviewed") }
          catch { setStorageMessage("Review could not be remembered. Financial actions also require working recovery storage.") }
          setReviewed(true)
        }}>Continue to Mint</button>
      </> : null}
      {storageMessage ? <p role="status" className="mt-3 text-sm text-amber-300">{storageMessage}</p> : null}
    </section>
    {reviewed ? <><MintMediaStep onPostHash={setPostHash} /><MintPreflight initialPostHash={postHash} /></> : null}
  </>
}
export default function MintFlow() {
  const session = useViaIdentitySession()
  if (!session) return <p role="status" className="rounded-xl border border-zinc-800 p-5 text-sm text-zinc-400">Sign in through the VIA account menu to mint. Public NFT browsing remains available.</p>
  return <AccountMintFlow key={session.publicKey} publicKey={session.publicKey} />
}
