import type { Metadata } from "next"
import StudioDraft from "./studio-draft"
import MintPreflight from "./mint-preflight"
import MintPreflightLocalizer from "./mint-preflight-localizer"
import StudioLocalizedShell from "./studio-localized-shell"

export const metadata: Metadata = {
  title: "Studio",
  description: "VIA creator workspace for posts, media, drafts and native DeSo NFT minting.",
}

export default function StudioPage() {
  return (
    <main className="min-h-screen bg-[#050807] px-5 py-8 text-zinc-100 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <StudioLocalizedShell />

        <section id="drafts" aria-label="Studio drafts">
          <StudioDraft />
        </section>

        <section id="mint-nft" aria-label="Mint NFT">
          <MintPreflightLocalizer />
          <MintPreflight />
        </section>
      </div>
    </main>
  )
}
