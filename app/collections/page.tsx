import type { Metadata } from "next"
import CollectionHub from "../collection/collection-hub"
import NfViaTopbar from "../collection/nf-via-topbar"
import CollectionWorkspace from "./collection-workspace"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Collections & series · VIA", description: "Curated DeSo NFT collections and series." }
export default async function CollectionsPage({ searchParams }: { searchParams: Promise<{ publicKey?: string }> }) {
  const { publicKey } = await searchParams
  return <main data-via-public-nft-reader className="min-h-screen bg-[#070908] text-zinc-100"><NfViaTopbar /><CollectionHub /><section className="mx-auto max-w-5xl px-5 py-8"><CollectionWorkspace publicKey={publicKey} /></section></main>
}
