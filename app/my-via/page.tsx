import Link from "next/link";
import CreatorQuickMenu from "./creator-quick-menu";

const released = [
  { title: "Saved", text: "Return to posts and content you explicitly saved.", href: "/saved", action: "Open Saved" },
  { title: "Drafts", text: "Continue local creator drafts inside VIA Studio.", href: "/studio#drafts", action: "Open Drafts" },
];

const accountSections = [
  { title: "Profile", text: "Your signed-in DeSo profile belongs here. Until a dedicated VIA profile route is released, use the avatar/account menu for account access." },
  { title: "Wallet", text: "Balance and wallet actions stay account-level. VIA does not expose a separate Wallet page until that route is complete and verified." },
  { title: "Settings", text: "Personal preferences and security controls remain account-level until the dedicated Settings surface is released." },
];

const action = "inline-flex min-h-11 items-center justify-center rounded-[12px] border border-[#8fd4a9]/45 bg-transparent px-4 py-2 text-sm font-semibold text-[#9adbb2] transition-[background-color,border-color] hover:border-[#8fd4a9]/70 hover:bg-[#0c1711]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/20";
const quietAction = "inline-flex min-h-10 items-center rounded-[10px] border border-zinc-700/80 bg-transparent px-3 py-2 text-sm text-zinc-300 transition-colors hover:border-[#8fd4a9]/50 hover:text-[#9adbb2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/15";

export default function MyViaPage() {
  return (
    <main className="min-h-screen bg-[#050807] px-5 py-8 text-zinc-100 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8fd4a9]">VIA · PERSONAL</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-[2.25rem]">My VIA</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">Your personal VIA hub for account, saved work, drafts and creator shortcuts.</p>
          </div>
          <Link href="/" className={quietAction}>Back to VIA</Link>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          {released.map((item) => (
            <article key={item.title} className="rounded-[14px] border border-zinc-800/80 bg-zinc-950/50 p-5">
              <h2 className="text-xl font-medium text-zinc-100">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{item.text}</p>
              <Link href={item.href} className={`${action} mt-5`}>{item.action}</Link>
            </article>
          ))}
        </section>

        <section className="mt-8" aria-labelledby="account-heading">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">Account</p>
          <h2 id="account-heading" className="mt-2 text-2xl font-semibold text-zinc-100">Profile · Wallet · Settings</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {accountSections.map((item) => (
              <article key={item.title} className="rounded-[14px] border border-zinc-800/80 bg-zinc-950/45 p-5">
                <h3 className="text-lg font-medium text-zinc-100">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <CreatorQuickMenu />

        <p className="mt-8 text-xs leading-5 text-zinc-600">Read, Listen, Discover, Live, Communities and other VIA destinations remain in the global navigation instead of being duplicated here.</p>
      </div>
    </main>
  );
}
