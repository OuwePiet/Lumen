import Link from "next/link";

const kinds = ["Posts", "Creators", "NFTs", "Stories", "News", "Radio", "Events", "Knowledge"];

export default function SavedPage() {
  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">VIA</p><h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Saved</h1><p className="mt-3 max-w-2xl text-zinc-400">One calm place for things you want to find again.</p></div><Link href="/my-via" className="rounded-full border border-zinc-700 px-4 py-2 text-sm hover:border-green-500 hover:text-green-300">My VIA</Link></header>
        <section className="mb-6 rounded-2xl border border-green-900/60 bg-zinc-950 p-5"><h2 className="text-lg text-green-300">Your choice, not hidden profiling</h2><p className="mt-2 text-sm leading-6 text-zinc-400">Saved will contain items a visitor explicitly chooses to keep. This foundation does not yet persist bookmarks or infer interests from browsing behaviour.</p></section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{kinds.map((kind) => <section key={kind} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"><h2 className="font-medium">{kind}</h2><p className="mt-3 text-sm text-zinc-500">Nothing saved here yet.</p></section>)}</div>
      </div>
    </main>
  );
}
