import Link from "next/link"
import FeedChoice from "./feed-choice"
import PublicPosts from "./public-posts"
import ParticipationGate from "../participation-gate"
import PostComposer from "./post-composer"

const feeds = [
  { title: "Hot", text: "A future view for active public DeSo conversations. Ranking logic must stay explainable and must not be sold as organic placement." },
  { title: "Following", text: "A future chronological or clearly explained view based on accounts the visitor chooses to follow." },
  { title: "Recent", text: "A future public stream ordered by recency, without pretending that recency equals quality or trust." },
  { title: "Welcome", text: "A calm entry point for orientation, help and useful VIA/community posts rather than an engagement trap." },
  { title: "First Posts", text: "A discovery lane for early public posts, with anti-spam and safety checks before activation." },
]

const actions = [
  "Add photo or video",
  "Embed video",
  "Create a poll",
  "Quote / repost",
  "Like / Diamond",
  "Follow / unfollow",
]

export default function SocialPage() {
  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">VIA · DeSo Social</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Look around freely. Participate through DeSo.</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">
              Guests can read public DeSo posts and move through the public VIA pages. Plain-text posting and direct replies are now available after DeSo login and explicit DeSo Identity approval. Other actions remain closed until they receive their own safe path.
            </p>
          </div>
          <Link href="/show-your-stuff" className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-green-500 hover:text-green-300">How participation works</Link>
        </header>

        <ParticipationGate
          title="Guest mode · view only"
          text="Public feeds stay open. When you want to take part, continue through DeSo Identity; VIA changes participation state only after a valid Identity login response is received."
        />

        <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5" aria-labelledby="composer-heading">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-400">Released participation control</p>
          <h2 id="composer-heading" className="mt-2 text-2xl font-semibold">Post text to DeSo</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            VIA prepares the exact DeSo transaction, shows the network fee returned by the construction response when available, and sends that exact transaction to DeSo Identity for approval. VIA submits only the signed result returned from the official Identity window. Replies use the same controlled path from each public post.
          </p>
          <PostComposer />
        </section>

        <FeedChoice />
        <PublicPosts />

        <section className="mt-8" aria-labelledby="feeds-heading">
          <h2 id="feeds-heading" className="text-2xl font-semibold">Planned feed lanes</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {feeds.map((feed) => (
              <article key={feed.title} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-400">Planned feed</p>
                <h3 className="mt-2 text-lg font-medium">{feed.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{feed.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5" aria-labelledby="remaining-controls-heading">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-400">Still protected</p>
          <h2 id="remaining-controls-heading" className="mt-2 text-2xl font-semibold">Release the remaining writes one by one</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            Login is not permission for every action. Each remaining DeSo write needs its own validation, abuse protection and explicit transaction/signing path before becoming operational.
          </p>
          <div className="mt-4 flex flex-wrap gap-2" aria-label="Actions reserved for later DeSo controls">
            {actions.map((action) => (
              <span key={action} className="rounded-full border border-zinc-800 px-3 py-2 text-xs text-zinc-500">{action} · protected</span>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="text-lg font-medium">Community boundary</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Guests observe. Authenticated DeSo users may participate only through released controls. Login never bypasses VIA&apos;s spam, bot, scam or moderation safeguards.</p>
          </article>
          <article className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="text-lg font-medium">Safety boundary</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Public-key display is not authority. VIA accepts session state from the official DeSo Identity origin and keeps blockchain signing separate. VIA never asks for or backs up a visitor&apos;s 24-word seed phrase.</p>
          </article>
        </section>
      </div>
    </main>
  )
}
