import type { Metadata } from "next"
import Link from "next/link"
import StudioDraft from "./studio-draft"
import MintPreflight from "./mint-preflight"

export const metadata: Metadata = {
  title: "Studio",
  description: "VIA creator workspace for posts, media, drafts and native DeSo NFT minting.",
}

const primaryChoices = [
  {
    title: "Create Post",
    text: "Open the released VIA Social composer and publish through the guarded DeSo flow.",
    href: "/social",
  },
  {
    title: "Mint NFT",
    text: "Set NFT terms, review the current cost preflight and approve the native DeSo mint.",
    href: "#mint-nft",
  },
  {
    title: "Media",
    text: "Prepare media for a post or NFT without creating a second upload route.",
    href: "#media",
  },
  {
    title: "Drafts",
    text: "Prepare and keep non-secret work locally on this device before publishing.",
    href: "#drafts",
  },
] as const

const choiceClass = "group rounded-[14px] border border-zinc-800/80 bg-zinc-950/55 p-5 transition-[background-color,border-color] duration-200 hover:border-[#8fd4a9]/45 hover:bg-[#0c1711]/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/15"

export default function StudioPage() {
  return (
    <main className="min-h-screen bg-[#050807] px-5 py-8 text-zinc-100 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-10 flex flex-wrap items-center justify-between gap-3" aria-label="Studio navigation">
          <Link href="/" className="inline-flex min-h-10 items-center rounded-[11px] border border-zinc-700/80 bg-transparent px-3 py-2 text-sm font-semibold text-zinc-300 transition-[background-color,border-color,color] duration-200 hover:border-[#8fd4a9]/50 hover:bg-[#0c1711]/35 hover:text-[#9adbb2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/15">← VIA</Link>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">VIA Studio</span>
        </nav>

        <header className="mb-7 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8fd4a9]">Create · prepare · mint</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-[2.5rem]">Studio</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">One calm workspace for creating a post, preparing media, saving drafts and minting a native DeSo NFT.</p>
        </header>

        <section className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Studio primary choices">
          {primaryChoices.map((choice) => (
            <Link href={choice.href} className={choiceClass} key={choice.title}>
              <span className="text-base font-semibold text-zinc-100 transition-colors group-hover:text-[#9adbb2]">{choice.title}</span>
              <span className="mt-2 block text-sm leading-5 text-zinc-400">{choice.text}</span>
            </Link>
          ))}
        </section>

        <section id="media" className="mb-4 rounded-[14px] border border-zinc-800/80 bg-zinc-950/45 p-5 sm:p-6" aria-labelledby="studio-media-heading">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">Media</p>
              <h2 id="studio-media-heading" className="mt-2 text-xl font-semibold tracking-tight">Prepare media where it will be used</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">Image and video attachments for posts stay in the released Social composer. NFT media and storage choices stay with the NFT mint flow below, so Studio does not duplicate upload controls.</p>
            </div>
            <Link href="/social" className="inline-flex min-h-11 items-center rounded-[11px] border border-[#8fd4a9]/45 bg-transparent px-4 py-2 text-sm font-semibold text-[#9adbb2] transition-[background-color,border-color] hover:border-[#8fd4a9]/70 hover:bg-[#0c1711]/40">Create with media</Link>
          </div>
        </section>

        <section id="drafts" aria-label="Studio drafts">
          <StudioDraft />
        </section>

        <section id="mint-nft" aria-label="Mint NFT">
          <MintPreflight />
        </section>

        <details className="mt-4 rounded-[14px] border border-zinc-800/80 bg-zinc-950/35 p-5 text-sm text-zinc-400">
          <summary className="cursor-pointer font-medium text-zinc-200">Studio safety</summary>
          <p className="mt-3 leading-6">VIA separates preparation from blockchain approval. Released DeSo posting and NFT minting keep their explicit DeSo Identity approval steps; VIA never asks for or stores a seed phrase or private signing key.</p>
        </details>
      </div>
    </main>
  )
}
