import Link from "next/link"

const primary = [
  { title: "People", text: "Find creators and accounts on DeSo.", href: "/discover/voices", action: "Discover People" },
  { title: "Content", text: "Browse posts, images, video and NFTs.", href: "/social", action: "Discover Content" },
  { title: "Categories", text: "Explore art, photography, music, video, collecting, heritage and stories.", href: "/discover/world", action: "Explore Categories" },
  { title: "Surprise", text: "Open something unexpected from VIA discovery.", href: "/discover/surprise", action: "Surprise Me" },
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
        <header className="mb-7 border-b border-white/10 pb-5">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Discover</h1>
          <p className="mt-2 text-sm text-zinc-500 sm:text-base">Find people, posts, media, NFTs and ideas across VIA and DeSo.</p>
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
            <h2 id="discover-more-heading" className="text-xl font-semibold">More to explore</h2>
            <div className="flex flex-wrap gap-2">
              {secondary.map((item) => (
                <Link key={item.title} href={item.href} className="rounded-full border border-zinc-800 px-3.5 py-2 text-sm text-zinc-300 hover:border-[#8fd4a9]/45 hover:text-[#9adbb2]">
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
