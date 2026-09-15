import Link from "next/link"
import NotificationCenter from "./notification-center"

export default function NotificationsPage() {
  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Notifications</h1>
            <p className="mt-2 text-sm text-zinc-500">Choose which DeSo activity you want to see.</p>
          </div>
          <Link href="/social" className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-[#8fd4a9]/70 hover:text-[#9adbb2]">Back to Social</Link>
        </header>

        <NotificationCenter />
      </div>
    </main>
  )
}
