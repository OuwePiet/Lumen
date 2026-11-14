import type { Metadata } from "next"
import CollectionHub from "../collection-hub"
import NfViaTopbar from "../nf-via-topbar"
import MyNFTCollection from "./my-nft-collection"

export const metadata: Metadata = { title: "My NFTs · VIA", description: "NFTs belonging to your active VIA account." }

export default function MyNFTPage() {
  return <main className="min-h-screen bg-[#070908] text-zinc-100">
    <NfViaTopbar />
    <CollectionHub />
    <section className="mx-auto max-w-7xl px-5 py-8">
      <MyNFTCollection />
    </section>
  </main>
}
