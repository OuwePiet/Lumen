import Link from "next/link";
import SaveButton from "../saved/save-button";

const eventTypes = [
  ["live", "Live", "Community talks, interviews and VIA LIVE sessions."],
  ["art-nft", "Art & NFT", "Exhibitions, drops and creator-led collection moments."],
  ["music", "Music", "Listening sessions, releases and public music events."],
  ["community", "Community", "Meetups and public initiatives shared by communities."],
  ["games", "Games", "World Quest moments, challenges and casual VIA events."],
  ["learning", "Learning", "Public explainers, workshops and knowledge sessions."],
];

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">VIA</p><h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Events</h1><p className="mt-3 max-w-2xl text-zinc-400">Discover what is happening without turning the homepage into a notice board.</p></div>
          <div className="flex flex-wrap gap-2"><Link href="/saved" className="rounded-full border border-zinc-700 px-4 py-2 text-sm hover:border-green-500 hover:text-green-300">Saved</Link><Link href="/my-via" className="rounded-full border border-zinc-700 px-4 py-2 text-sm hover:border-green-500 hover:text-green-300">My VIA</Link></div>
        </header>
        <section className="mb-6 rounded-2xl border border-green-900/60 bg-zinc-950 p-5"><h2 className="text-lg text-green-300">Visitor-controlled discovery</h2><p className="mt-2 text-sm leading-6 text-zinc-400">Events will use public event information or location chosen by the visitor. VIA will not silently infer a visitor&apos;s location. Publishing, RSVP and ticket/payment functions are not active in this foundation.</p><p className="mt-2 text-xs leading-5 text-zinc-500">Saving an event category is optional and stays in this browser.</p></section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{eventTypes.map(([id,title,text]) => <section id={id} key={title} className="scroll-mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-5"><h2 className="text-lg font-medium">{title}</h2><p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p><p className="mt-5 text-xs uppercase tracking-wider text-zinc-600">Event discovery foundation</p><div className="mt-4"><SaveButton title={`VIA Events · ${title}`} href={`/events#${id}`} kind="Event" /></div></section>)}</div>
      </div>
    </main>
  );
}
