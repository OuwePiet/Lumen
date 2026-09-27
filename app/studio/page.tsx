import type { Metadata } from "next"
import Link from "next/link"
import MintPreflight from "./mint-preflight"
import MintPreflightLocalizer from "./mint-preflight-localizer"

export const metadata: Metadata = {
  title: "Mint · NF.VIA",
  description: "Prepare and mint a native DeSo NFT on VIA.",
}

export default function StudioPage() {
  return (
    <main className="min-h-screen bg-[#070908] px-4 py-5 text-zinc-100 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <nav className="mb-7 flex items-center justify-between gap-3" aria-label="NF.VIA mint navigation">
          <Link href="/collection" className="inline-flex min-h-10 items-center rounded-[11px] border border-zinc-700/80 px-3 py-2 text-sm font-semibold text-zinc-300 hover:border-[#8fd4a9]/50 hover:text-[#9adbb2]">← NF.VIA</Link>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">Mint</span>
        </nav>

        <header className="mb-6 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8fd4a9]">NF.VIA</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-[2.5rem]">Mint NFT</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">Prepare the NFT, review its terms and costs, then approve the native DeSo mint.</p>
        </header>

        <section id="mint-nft" aria-label="Mint NFT">
          <MintPreflightLocalizer />
          <MintPreflight />
        </section>
      </div>
    </main>
  )
}
