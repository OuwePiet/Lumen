import Link from "next/link"
import SaveButton from "../saved/save-button"

const feeds = [
  { title: "Hot", text: "A future view for active public DeSo conversations. Ranking logic must stay explainable and must not be sold as organic placement." },
  { title: "Following", text: "A future chronological or clearly explained view based on accounts the visitor chooses to follow." },
  { title: "Recent", text: "A future public stream ordered by recency, without pretending that recency equals quality or trust." },
  { title: "Welcome", text: "A calm entry point for orientation, help and useful VIA/community posts rather than an engagement trap." },
  { title: "First Posts", text: "A discovery lane for early public posts, with anti-spam and safety checks before activation." },
]

const actions = [
  "Post text",
  "Add photo or video",
  "Embed video",
  "Create a poll",
  "Use emoji",
  "Save a draft",
  "Reply / quote / repost",
  "Like / Diamond",
]

export default function SocialPage() {
  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">VIA · DeSo Social</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Social without one compulsory feed</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">
              VIA keeps the DeSo social layer as a core track, but the visitor chooses how to enter it. This foundation does not yet publish, sign, follow, like, repost or send Diamonds.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <SaveButton title="VIA Social" href="/social" kind="Social" />
            <Link href="/my-via" className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-green-500 hover:text-green-300">My VIA</Link>
          </div>
        </header>

        <section className="mb-7 rounded-2xl border border-green-900/60 bg-zinc-950 p-5">
          <h2 className="text-lg font-medium text-green-300">Visitor control first</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Hot, Following, Recent, Welcome and First Posts remain separate choices. VIA should make ranking and paid placement understandable, keep Sponsored distinct from organic social content and avoid silent profile-based feed changes.
          </p>
        </section>

        <section aria-labelledby="feeds-heading">
          <h2 id="feeds-heading" className="text-2xl font-semibold">Feed choices</h2>
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

        <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5" aria-labelledby="composer-heading">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-400">Composer track</p>
          <h2 id="composer-heading" className="mt-2 text-2xl font-semibold">Create when the wallet boundary is ready</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            The social composer is a planned DeSo write surface. Drafting can stay local, but any blockchain write must show the action clearly and require the correct wallet proof/signing flow. VIA will not silently sign on behalf of a visitor.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {actions.map((action) => (
              <span key={action} className="rounded-full border border-zinc-700 px-3 py-2 text-xs text-zinc-300">{action}</span>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="text-lg font-medium">Community actions</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Replies, quotes, reposts, likes, Diamonds, follow/unfollow and notifications belong here once current DeSo write/read flows are verified and tested.</p>
          </article>
          <article className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="text-lg font-medium">Safety boundary</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Public-key display is not authority. Session login and blockchain signing stay separate. VIA never asks for, stores or backs up a visitor&apos;s 24-word seed phrase.</p>
          </article>
        </section>
      </div>
    </main>
  )
}
