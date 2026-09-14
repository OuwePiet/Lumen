import Link from "next/link"

const primary = [
  { title: "People", text: "Find creators and accounts through VIA's public DeSo discovery paths.", href: "/discover/voices", action: "Discover People" },
  { title: "Content", text: "Browse public DeSo posts, images, video and NFTs through the Social and NFT views.", href: "/social", action: "Discover Content" },
  { title: "Categories", text: "Explore art, photography, music, video, collecting, heritage and stories without duplicating each route on this page.", href: "/discover/world", action: "Explore Categories" },
  { title: "Surprise", text: "Open VIA's daily deterministic discovery route without signing, spending or changing account state.", href: "/discover/surprise", action: "Surprise Me" },
]

const secondary = [
  { title: "Around the World", href: "/discover/world" },
  { title: "New Voices", href: "/discover/voices" },
  { title: "NFTs", href: "/collection" },
  { title: "World Radio", href: "/radio" },
  { title: "The World News", href: "/news" },
]

export default function DiscoverPage() {
  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-7">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8fd4a9]">VIA · Discover</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Discover people, work and ideas.</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">
            A calm public window into DeSo and VIA. Read, watch, listen and explore without turning Discover into a second homepage.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2" aria-label="Primary discovery choices">
          {primary.map((item) => (
            <article key={item.title} className="rounded-2xl border border-zinc-800 bg-zinc-950/75 p-5">
              <h2 className="text-xl font-medium text-zinc-100">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{item.text}</p>
              <Link href={item.href} className="mt-5 inline-flex rounded-full border border-[#285f40] px-4 py-2 text-sm font-medium text-[#9adbb2] hover:border-[#8fd4a9]/70">
                {item.action}
              </Link>
            </article>
          ))}
        </section>

        <section className="mt-8 border-t border-zinc-900 pt-6" aria-labelledby="discover-more-heading">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">More of VIA</p>
              <h2 id="discover-more-heading" className="mt-1 text-xl font-semibold">Open a specific destination</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {secondary.map((item) => (
                <Link key={item.title} href={item.href} className="rounded-full border border-zinc-800 px-3.5 py-2 text-sm text-zinc-300 hover:border-[#8fd4a9]/45 hover:text-[#9adbb2]">
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <details className="mt-8 rounded-2xl border border-zinc-900 bg-zinc-950/40 p-4 text-sm text-zinc-400">
          <summary className="cursor-pointer font-medium text-zinc-300">Public mode & DeSo participation</summary>
          <p className="mt-3 leading-6">
            Discover is read-only for public visitors. Actions such as posting, following, replying, reposting and giving Diamonds stay in their own verified DeSo flows after login. VIA does not infer creator location, verification or importance from incomplete public data.
          </p>
        </details>
      </div>
    </main>
  )
}
