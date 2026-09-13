import { releasedCapabilities } from "../../lib/via/deso-capabilities"
import Link from "next/link"
import FeedChoice from "./feed-choice"
import PublicPosts from "./public-posts"
import ParticipationGate from "../participation-gate"
import PostComposer from "./post-composer"

const futureIdeas = [
  { title: "External creator collectible intake", text: "Evaluate a paid public creator route for preparing media and collectible metadata without operating a VIA blockchain or node. Any future external media storage must use an explicitly selected storage provider/path with disclosed retention and cost; the VIA application repository and Vercel deployment are not the collectible media archive. Public visitors may eventually View, Play/Watch and Share eligible external creator work without DeSo login; community members retain access everywhere and may use verified DeSo-native actions such as Follow, Reply, Repost/Quote and Diamond only when the external work has an explicitly verified DeSo post or creator identity; VIA must not infer that link from a matching name, handle or media title. Any external item shown in VIA must carry a clear External collectible label; native on-chain items keep the DeSo NFT label. A future Mint on DeSo action may only appear after creator consent, a creator rights/ownership declaration, media/metadata validation (supported type, size, integrity and required fields), an explicit live DeSo cost quote and final approval; purchase and ownership require their own verified flow." },
  { title: "Music & audio discovery", text: "Prepare public discovery plus full community access for creator-declared audio posts, releases and artist discovery once a durable DeSo-compatible media path is verified. VIA uses no proprietary third-party layout and will not operate its own blockchain or node." },
  { title: "Language & region views", text: "A future preference for discovering public content by explicit language or region metadata. It will not silently translate posts, infer location in the background or require a paid translation service." },
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
              Guests can read public DeSo posts and move through the public VIA pages. Posting, replies, Likes, Follow/Unfollow, Repost/Quote, Diamonds and image/video attachments are available after DeSo login through their own guarded paths.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/edit-post" className="rounded-full border border-green-800 px-4 py-2 text-sm text-green-300 hover:border-green-500">Edit post</Link>
            <Link href="/notifications" className="rounded-full border border-green-800 px-4 py-2 text-sm text-green-300 hover:border-green-500">Notifications</Link>
            <Link href="/show-your-stuff" className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-green-500 hover:text-green-300">How participation works</Link>
          </div>
        </header>

        <ParticipationGate
          title="Guest mode · view only"
          text="Public feeds stay open. When you want to take part, continue through DeSo Identity; VIA changes participation state only after a valid Identity login response is received."
        />

        <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/55 p-5" aria-labelledby="social-capabilities-heading">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">Available in VIA</p>
          <h2 id="social-capabilities-heading" className="mt-2 text-xl font-semibold">A broader DeSo social toolkit</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            VIA builds on DeSo&apos;s public social layer with its own guarded interface. Generic improvements from the wider DeSo ecosystem are considered when they are useful, affordable and technically verifiable; third-party branding and proprietary reward products are not copied.
          </p>
          <div className="mt-4 flex flex-wrap gap-2" aria-label="Released VIA social capabilities">
            {releasedCapabilities.map((capability) => (
              <span key={capability.id} title={capability.note} className="rounded-full border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300">{capability.label}</span>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5" aria-labelledby="composer-heading">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-400">Released participation controls</p>
          <h2 id="composer-heading" className="mt-2 text-2xl font-semibold">Post, reply and add media through DeSo</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            Posts can contain up to 5,000 characters and four images, with optional video. Media upload stays technically separate from publishing, and publishing still requires the exact DeSo transaction to be reviewed and approved through DeSo Identity.
          </p>
          <PostComposer />
        </section>

        <FeedChoice />
        <PublicPosts />

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
