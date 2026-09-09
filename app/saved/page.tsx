import Link from "next/link"
import SavedList from "./saved-list"

export default function SavedPage() {
  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">VIA</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Saved</h1>
            <p className="mt-3 max-w-2xl text-zinc-400">One calm place for things you explicitly choose to find again.</p>
          </div>
          <Link href="/my-via" className="rounded-full border border-zinc-700 px-4 py-2 text-sm hover:border-green-500 hover:text-green-300">My VIA</Link>
        </header>

        <section className="mb-6 rounded-2xl border border-green-900/60 bg-zinc-950 p-5">
          <h2 className="text-lg text-green-300">Your choice, not hidden profiling</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            VIA Saved only contains things you explicitly save. This first working version stores the list locally in this browser; it is not sent to VIA, used for hidden profiling, or treated as a signal for paid ranking.
          </p>
        </section>

        <SavedList />

        <p className="mt-8 text-xs leading-5 text-zinc-600">
          Clearing this browser&apos;s site data can remove local Saved items. Account sync can be considered later only with a clear privacy design and explicit visitor choice.
        </p>
      </div>
    </main>
  )
}
