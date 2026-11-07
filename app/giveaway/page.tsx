import type { Metadata } from "next"
import CollectionHub from "../collection/collection-hub"
import NfViaTopbar from "../collection/nf-via-topbar"
import GiveawayWorkspace from "./giveaway-workspace"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Claim / Giveaway · VIA", description: "Free NFT requests with explicit owner transfer and recipient acceptance." }
export default async function GiveawayPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams
  return <main className="min-h-screen bg-[#070908] text-zinc-100"><NfViaTopbar /><CollectionHub /><section className="mx-auto max-w-5xl px-5 py-8"><GiveawayWorkspace id={id} /></section></main>
}
