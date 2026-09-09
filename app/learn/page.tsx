import Link from "next/link";

const topics = [
  ["Start with VIA", "Simple guides to the different VIA environments and visitor choices."],
  ["DeSo", "Understand profiles, posts, public keys and the DeSo social layer without unnecessary jargon."],
  ["NFTs", "Learn what an NFT is, ownership, editions, royalties and what VIA can and cannot do."],
  ["Safety", "Recognise phishing, protect wallet access and understand why VIA never asks for seed words."],
  ["Creators", "Practical explanations for publishing, discovery, Studio and creator tools."],
  ["Technology", "Clear background on decentralised social, storage, privacy and new platform technology."],
];

export default function LearnPage() {
  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">VIA</p><h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Learn</h1><p className="mt-3 max-w-2xl text-zinc-400">Understand VIA, DeSo and creator technology in ordinary language.</p></div><Link href="/my-via" className="rounded-full border border-zinc-700 px-4 py-2 text-sm hover:border-green-500 hover:text-green-300">My VIA</Link></header>
        <section className="mb-6 rounded-2xl border border-green-900/60 bg-zinc-950 p-5"><h2 className="text-lg text-green-300">Knowledge, not financial promotion</h2><p className="mt-2 text-sm leading-6 text-zinc-400">Learn is for explanations and practical guidance. Educational material must be distinguishable from Sponsored content and must not present speculation as guaranteed earnings or investment advice.</p></section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{topics.map(([title,text]) => <section key={title} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"><h2 className="text-lg font-medium">{title}</h2><p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p><p className="mt-5 text-xs uppercase tracking-wider text-zinc-600">Knowledge track</p></section>)}</div>
      </div>
    </main>
  );
}
