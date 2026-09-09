import Link from "next/link";
import CommunityInterests from "./community-interests";

const communityTypes = [
  { title: "Art & Photography", text: "A place for creators, collectors and visitors to share work and talk about visual culture." },
  { title: "Music", text: "Discussion, discovery and future VIA LIVE sessions around music and sound." },
  { title: "DeSo & Builders", text: "Talk about the DeSo ecosystem, creator tools and platform ideas without mixing every topic into one feed." },
  { title: "NFT & Collecting", text: "NFT discussion, collections, creator releases and collector conversations." },
  { title: "Games & Quest", text: "Community around VIA World Quest and casual VIA games." },
  { title: "Open Community", text: "A broad visitor space for conversation, ideas and discovery." },
];

export default function CommunitiesPage() {
  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">VIA</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Communities</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              Shared-interest spaces so every conversation does not have to compete inside one global feed.
            </p>
          </div>
          <Link href="/my-via" className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-green-500 hover:text-green-300">Back to My VIA</Link>
        </header>

        <section className="mb-7 rounded-2xl border border-green-900/60 bg-zinc-950 p-5">
          <h2 className="text-lg font-medium text-green-300">Foundation first</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            This version defines the community structure and lets a visitor mark local interests. Joining, posting, moderation, membership and visibility rules are not presented as live until their DeSo-compatible implementation is reviewed.
          </p>
        </section>

        <CommunityInterests />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {communityTypes.map((community) => (
            <section key={community.title} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <h2 className="text-lg font-medium">{community.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{community.text}</p>
              <p className="mt-5 text-xs uppercase tracking-wider text-zinc-600">Community tools in development</p>
            </section>
          ))}
        </div>

        <p className="mt-8 text-xs leading-5 text-zinc-600">
          Future community controls must include clear membership/visibility rules plus leave, mute, block/report and moderation controls where applicable.
        </p>
      </div>
    </main>
  );
}
