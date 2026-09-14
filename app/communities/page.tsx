import Link from "next/link";

const communityTypes = [
  { title: "Art & Photography", text: "Creators, collectors and visitors around visual work and culture." },
  { title: "Music", text: "Music discovery, discussion and future VIA LIVE sessions." },
  { title: "DeSo & Builders", text: "DeSo, creator tools and platform development in one focused place." },
  { title: "NFT & Collecting", text: "Collections, releases, collecting and NFT discussion." },
  { title: "Games & Quest", text: "VIA World Quest, casual games and related community activity." },
  { title: "Open Community", text: "A broad public space for conversation, ideas and discovery." },
];

const quietAction = "rounded-[11px] border border-zinc-700/80 bg-transparent px-4 py-2 text-sm text-zinc-300 transition-[background-color,border-color,color] duration-200 ease-out hover:border-[#8fd4a9]/50 hover:bg-[#0c1711]/35 hover:text-[#9adbb2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/15";

export default function CommunitiesPage() {
  return (
    <main className="min-h-screen bg-[#050807] px-5 py-8 text-zinc-100 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8fd4a9]">VIA · COMMUNITY</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-[2.25rem]">Communities</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">Focused spaces for people who want to meet around the same subject without pushing every conversation into one global feed.</p>
          </div>
          <Link href="/my-via" className={quietAction}>Back to My VIA</Link>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {communityTypes.map((community) => (
            <section key={community.title} className="rounded-[14px] border border-zinc-800/80 bg-zinc-950/50 p-5">
              <h2 className="text-lg font-medium text-zinc-100">{community.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{community.text}</p>
            </section>
          ))}
        </div>

        <section className="mt-7 rounded-[14px] border border-zinc-800/80 bg-zinc-950/35 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">Community foundation</p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">Joining, posting, membership, visibility and moderation controls will only appear when they are backed by a reviewed DeSo-compatible implementation. VIA does not show local browser choices as if they were real community membership.</p>
        </section>
      </div>
    </main>
  );
}
