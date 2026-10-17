"use client"

import Link from "next/link"
import PublicAccountNFTs from "../../public-account-nfts"
import { useViaIdentitySession } from "../../use-via-identity-session"
import NFTRecoveryNotice from "../../nft-recovery-notice"

/** Keying the reader destroys old account state and aborts its pending request. */
export default function MyNFTCollection() {
  const session = useViaIdentitySession()
  return <>
    <h1 className="text-2xl font-semibold">My NFTs</h1>
    <NFTRecoveryNotice />
    {session ? <>
      <p className="mt-3 break-all text-sm text-zinc-400">Active VIA account: {session.publicKey}</p>
      <PublicAccountNFTs key={session.publicKey} publicKey={session.publicKey} username={session.publicKey} autoLoad />
    </> : <p role="status" className="mt-4 text-zinc-400">
      Sign in through the VIA account menu to view your NFTs. <Link className="underline" href="/collection">Public collections</Link> remain available.
    </p>}
  </>
}
