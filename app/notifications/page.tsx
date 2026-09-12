import Link from "next/link"
import NotificationCenter from "./notification-center"

export default function NotificationsPage() {
  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">VIA · Notifications</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">See DeSo activity without extra noise.</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">VIA groups recent DeSo notifications into practical filters while keeping this page read-only. The source remains DeSo; VIA does not invent counts or branded reward systems.</p>
          </div>
          <Link href="/social" className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-green-500 hover:text-green-300">Back to social</Link>
        </header>

        <NotificationCenter />
      </div>
    </main>
  )
}
