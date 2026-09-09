import Link from "next/link";

const places = [
  { title: "Read", text: "Daily News today; stories and knowledge can grow here next.", href: "/news", action: "Open Daily News" },
  { title: "Listen", text: "World Radio and community conversation without requiring you to post.", href: "/radio", action: "Open World Radio" },
  { title: "Discover", text: "Explore creators, NFTs and VIA's world discovery routes.", href: "/discover", action: "Start discovering" },
  { title: "Talk", text: "Community spaces and private communication will be added in reviewed steps.", href: "/live", action: "Open VIA LIVE" },
  { title: "Create", text: "Use VIA Studio as the starting place for creator tools.", href: "/studio", action: "Open Studio" },
  { title: "Play", text: "World Quest and casual discovery give VIA another reason to visit.", href: "/quest", action: "Open World Quest" },
];

export default function MyViaPage() {
  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">VIA</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">My VIA</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              Choose why you are here. VIA does not require every visitor to live inside one feed.
            </p>
          </div>
          <Link href="/" className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-green-500 hover:text-green-300">Back to VIA</Link>
        </header>

        <section className="mb-7 rounded-2xl border border-green-900/60 bg-zinc-950 p-5">
          <h2 className="text-lg font-medium text-green-300">VIA revolves around the visitor</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Read, listen, discover, talk, create or play. Personal start preferences and saved choices come later with clear privacy controls; this first version does not silently profile you.
          </p>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((place) => (
            <section key={place.title} className="flex min-h-48 flex-col rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <h2 className="text-xl font-medium">{place.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-zinc-400">{place.text}</p>
              <Link href={place.href} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-green-900 bg-green-950/30 px-4 py-2 text-sm font-semibold text-green-300 hover:border-green-600">
                {place.action}
              </Link>
            </section>
          ))}
        </div>

        <p className="mt-8 text-xs leading-5 text-zinc-600">
          My VIA is currently a navigation foundation. It does not yet store a personal profile, infer sensitive interests or claim unavailable messaging/community features.
        </p>
      </div>
    </main>
  );
}
