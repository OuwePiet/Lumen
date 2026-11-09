import type { Metadata } from "next"
import Link from "next/link"
import MintFlow from "./mint-flow"

export const metadata: Metadata = {
  title: "Mint · NF.VIA",
  description: "Prepare and mint a native DeSo NFT on VIA.",
}

export default function StudioPage() {
  return (
    <main id="via-mint-page" className="min-h-screen bg-[#070908] px-4 py-5 text-zinc-100 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <nav className="mb-2 flex items-center justify-between gap-3" aria-label="NF.VIA mint navigation">
          <Link href="/collection" className="inline-flex min-h-10 items-center rounded-[11px] border border-zinc-700/80 px-3 py-2 text-sm font-semibold text-zinc-300 hover:border-[#8fd4a9]/50 hover:text-[#9adbb2]">← NF.VIA</Link>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">Mint</span>
        </nav>

        <header className="mb-3 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8fd4a9]">NF.VIA</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Mint NFT</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link href="/studio/storage-preview" className="inline-flex min-h-11 items-center rounded-lg border border-[#35533f] px-3 text-sm text-[#a5dfb8]">Opslagvoorbeeld</Link>
            <Link href="/nft-info" className="inline-flex min-h-11 items-center rounded-lg border border-[#35533f] px-3 text-sm text-[#a5dfb8]">Info · opslag en kosten</Link>
          </div>
        </header>

        <section id="mint-nft" aria-label="Mint NFT">
          <MintFlow />
        </section>
      </div>
    </main>
  )
}
