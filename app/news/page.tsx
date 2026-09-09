import Link from "next/link";

const sections = [
  { title: "World", text: "International headlines and developments from around the world." },
  { title: "Technology", text: "Technology, digital culture and important new developments." },
  { title: "DeSo & Crypto", text: "News around DeSo, creators, decentralized social and crypto." },
  { title: "Art & Culture", text: "Art, photography, culture and creative work." },
  { title: "Music", text: "Music news, artists and discoveries." },
  { title: "Science", text: "Research, science and discoveries explained clearly." },
];

export default function DailyNewsPage() {
  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-green-400">VIA</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Daily News</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              Read the world, your way. A separate VIA environment for news and discovery.
            </p>
          </div>
          <Link href="/" className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-green-500 hover:text-green-300">
            Back to VIA
          </Link>
        </div>

        <section className="mb-8 rounded-2xl border border-green-900/60 bg-zinc-950 p-5">
          <h2 className="text-lg font-medium text-green-300">News without taking over your homepage</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Daily News lives on this full page. VIA will show source attribution and short summaries and link visitors to the original publication. News, community posts and Sponsored content remain clearly separate.
          </p>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <h2 className="text-lg font-medium text-white">{section.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{section.text}</p>
              <p className="mt-5 text-xs uppercase tracking-wider text-zinc-600">News sources coming next</p>
            </section>
          ))}
        </div>

        <p className="mt-8 text-xs leading-5 text-zinc-600">
          VIA does not republish complete news articles. Live source selection, language/country controls and daily summaries will be added only with suitable source and attribution handling.
        </p>
      </div>
    </main>
  );
}
