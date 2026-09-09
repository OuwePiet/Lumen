import Link from "next/link";
import SaveButton from "../saved/save-button";
import CreatorQuickMenu from "./creator-quick-menu";

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

const primaryAction = "inline-flex min-h-11 items-center justify-center rounded-[12px] border border-[#8fd4a9]/45 bg-transparent px-4 py-2 text-sm font-semibold text-[#9adbb2] transition-[background-color,border-color,box-shadow] duration-200 ease-out hover:border-[#8fd4a9]/70 hover:bg-[#0c1711]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/20";
const quietAction = "inline-flex min-h-10 items-center rounded-[10px] border border-zinc-700/80 bg-transparent px-3 py-2 text-sm text-zinc-300 transition-[background-color,border-color,color] duration-200 ease-out hover:border-[#8fd4a9]/50 hover:bg-[#0c1711]/35 hover:text-[#9adbb2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/15";

export default function MyViaPage() {
  return (
    <main className="min-h-screen bg-[#050807] px-5 py-8 text-zinc-100 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8fd4a9]">VIA · viadeso.online</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-[2.25rem]">My VIA</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              Choose why you are here. VIA does not require every visitor to live inside one feed.
            </p>
          </div>
          <Link href="/" className={quietAction}>Back to VIA</Link>
        </header>

        <section className="mb-7 rounded-[14px] border border-zinc-800/80 bg-zinc-950/55 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">Visitor controlled</p>
          <h2 className="mt-2 text-lg font-medium text-zinc-100">VIA revolves around the visitor</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Read, listen, discover, talk, create or play. Save only the routes you choose; those choices stay locally in this browser and are not silently used to profile you.
          </p>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((place) => (
            <section key={place.title} className="flex min-h-48 flex-col rounded-[14px] border border-zinc-800/80 bg-zinc-950/50 p-5">
              <h2 className="text-xl font-medium text-zinc-100">{place.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-zinc-400">{place.text}</p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Link href={place.href} className={primaryAction}>{place.action}</Link>
                <SaveButton title={place.title} href={place.href} kind="My VIA" />
              </div>
            </section>
          ))}
        </div>

        <CreatorQuickMenu />

        <section className="mt-8 rounded-[14px] border border-zinc-800/80 bg-zinc-950/45 p-5" aria-labelledby="more-via-heading">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">More of VIA</p>
            <h2 id="more-via-heading" className="mt-2 text-2xl font-semibold text-zinc-100">Choose another route</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Useful places stay available without crowding the six main visitor modes.</p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {morePlaces.map((place) => (
              <section key={place.title} className="rounded-[12px] border border-zinc-800/80 bg-black/30 p-4">
                <strong className="text-sm text-zinc-100">{place.title}</strong>
                <p className="mt-1 text-sm leading-5 text-zinc-500">{place.text}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Link href={place.href} className={quietAction}>Open</Link>
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
