import Link from "next/link";

const shelves = [
  { title: "Stories", text: "Creator-written stories, serials and long-form community writing." },
  { title: "Essays", text: "Ideas, reflection and deeper creator writing beyond short posts." },
  { title: "Guides", text: "Practical explainers and how-to material from VIA and its community." },
  { title: "Creator Editions", text: "Optional special editions can later connect to creator/NFT tools without making reading dependent on owning an NFT." },
];

export default function ReadPage() {
  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">VIA</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Read & Stories</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              A calm place for long-form creator and community work. Separate from Daily News.
            </p>
          </div>
          <Link href="/my-via" className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-green-500 hover:text-green-300">Back to My VIA</Link>
        </header>

        <section className="mb-7 rounded-2xl border border-green-900/60 bg-zinc-950 p-5">
          <h2 className="text-lg font-medium text-green-300">Reading should not require buying</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            VIA can support creator-owned editions later, but ordinary reading remains an open visitor experience unless an author explicitly offers something as unlockable content.
          </p>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          {shelves.map((shelf) => (
            <section key={shelf.title} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <h2 className="text-lg font-medium">{shelf.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{shelf.text}</p>
              <p className="mt-5 text-xs uppercase tracking-wider text-zinc-600">Publishing tools coming later</p>
            </section>
          ))}
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/news" className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-green-500">Go to Daily News</Link>
          <Link href="/studio" className="rounded-full border border-green-900 bg-green-950/30 px-4 py-2 text-sm font-semibold text-green-300">Open Studio</Link>
        </div>
      </div>
    </main>
  );
}
