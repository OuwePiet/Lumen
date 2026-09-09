import type { Metadata } from "next"
import StudioDraft from "./studio-draft"

export const metadata: Metadata = {
  title: "Studio",
  description: "Free VIA creator workspace for phone, tablet and desktop.",
}

const tools = [
  { title: "Create a post", text: "Prepare text and media for a future DeSo post workflow." },
  { title: "Prepare an NFT", text: "Organise artwork, title, copies and sale information before signing." },
  { title: "Media workspace", text: "Prepare image, video and audio details with safe previews." },
  { title: "Drafts", text: "Keep non-secret work in progress without storing wallet signing material." },
]

export default function StudioPage() {
  return (
    <main className="min-h-screen bg-[#050807] px-5 py-8 text-zinc-100 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-12 flex flex-wrap items-center justify-between gap-3" aria-label="Studio navigation">
          <a href="/" className="inline-flex min-h-10 items-center rounded-[11px] border border-zinc-700/80 bg-transparent px-3 py-2 text-sm font-semibold text-zinc-300 transition-[background-color,border-color,color] duration-200 hover:border-[#8fd4a9]/50 hover:bg-[#0c1711]/35 hover:text-[#9adbb2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/15">← VIA</a>
          <span className="inline-flex min-h-10 items-center rounded-[10px] border border-[#8fd4a9]/30 bg-[#0c1711]/40 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#8fd4a9]">Free Studio</span>
        </nav>

        <header className="mb-10 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8fd4a9]">VIA Studio</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-[2.5rem]">Create from any screen.</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400 sm:text-base">A free creator workspace designed for phone, tablet and desktop. VIA Studio is intentionally non-custodial: it never asks for or stores your DeSo seed phrase or private signing key.</p>
        </header>

        <StudioDraft />

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Studio tools">
          {tools.map((tool) => (
            <article className="rounded-[14px] border border-zinc-800/80 bg-zinc-950/50 p-5" key={tool.title}>
              <h2 className="text-lg font-medium text-zinc-100">{tool.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{tool.text}</p>
              <span className="mt-5 inline-block text-xs font-semibold uppercase tracking-[0.12em] text-[#8fd4a9]" aria-label={`${tool.title} development status`}>Foundation ready</span>
            </article>
          ))}
        </section>

        <section className="mt-4 rounded-[14px] border border-zinc-800/80 bg-zinc-950/45 p-5" aria-labelledby="studio-safety-heading">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">Safety boundary</p>
          <h2 id="studio-safety-heading" className="mt-2 text-lg font-medium text-zinc-100">Safe by design</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">Studio separates preparing content from authorising blockchain actions. Future on-chain publishing or minting must use an authoritative DeSo wallet-control flow and explicit signing confirmation.</p>
        </section>
      </div>
    </main>
  )
}
