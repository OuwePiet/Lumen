import Link from "next/link";
import SaveButton from "../saved/save-button";

const places = [
  { title: "Read", text: "Daily News today; stories and knowledge can grow here next.", href: "/news", action: "Open Daily News" },
  { title: "Listen", text: "World Radio and community conversation without requiring you to post.", href: "/radio", action: "Open World Radio" },
  { title: "Discover", text: "Explore creators, NFTs and VIA's world discovery routes.", href: "/discover", action: "Start discovering" },
  { title: "Talk", text: "Community conversation without turning VIA into one compulsory feed.", href: "/live", action: "Open VIA LIVE" },
  { title: "Create", text: "Use VIA Studio as the starting place for creator tools.", href: "/studio", action: "Open Studio" },
  { title: "Play", text: "World Quest and casual discovery give VIA another reason to visit.", href: "/quest", action: "Open World Quest" },
];

const morePlaces = [
  { title: "Social", text: "Choose how you want to enter VIA's DeSo social layer instead of being forced into one feed.", href: "/social" },
  { title: "Communities", text: "Find spaces built around shared interests and conversation.", href: "/communities" },
  { title: "Read & Stories", text: "A quieter place for longer-form reading beyond a fast feed.", href: "/read" },
  { title: "Events", text: "Discover live, art, music, community, game and learning moments.", href: "/events" },
  { title: "Learn", text: "Understand VIA, DeSo, NFTs, safety and creator tools in plain language.", href: "/learn" },
  { title: "Saved", text: "Return to things you explicitly chose to keep, without inferred interests.", href: "/saved" },
  { title: "Idea Box", text: "Tell VIA what would make the platform more useful, enjoyable or clear.", href: "/ideas" },
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
            Read, listen, discover, talk, create or play. Save only the routes you choose; those choices stay locally in this browser and are not silently used to profile you.
          </p>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((place) => (
            <section key={place.title} className="flex min-h-48 flex-col rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <h2 className="text-xl font-medium">{place.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-zinc-400">{place.text}</p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Link href={place.href} className="inline-flex min-h-11 items-center justify-center rounded-full border border-green-900 bg-green-950/30 px-4 py-2 text-sm font-semibold text-green-300 hover:border-green-600">
                  {place.action}
                </Link>
                <SaveButton title={place.title} href={place.href} kind="My VIA" />
              </div>
            </section>
          ))}
        </div>

        <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5" aria-labelledby="more-via-heading">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-400">More of VIA</p>
            <h2 id="more-via-heading" className="mt-2 text-2xl font-semibold">Choose another route</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Useful places stay available without crowding the six main visitor modes.</p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {morePlaces.map((place) => (
              <section key={place.title} className="rounded-xl border border-zinc-800 bg-black/40 p-4">
                <strong className="text-sm text-zinc-100">{place.title}</strong>
                <p className="mt-1 text-sm leading-5 text-zinc-500">{place.text}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Link href={place.href} className="inline-flex min-h-10 items-center rounded-full border border-zinc-700 px-3 py-2 text-sm text-zinc-200 transition hover:border-green-800 hover:text-green-300">Open</Link>
                  {place.href !== "/saved" ? <SaveButton title={place.title} href={place.href} kind="My VIA" /> : null}
                </div>
              </section>
            ))}
          </div>
        </section>

        <p className="mt-8 text-xs leading-5 text-zinc-600">
          My VIA is currently a visitor-controlled navigation foundation. It does not infer sensitive interests or claim unavailable messaging, identity or recommendation features.
        </p>
      </div>
    </main>
  );
}
