import Link from "next/link"
import EditPostControl from "./edit-post-control"

export const dynamic = "force-dynamic"

export default function EditPostPage() {
  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">VIA · DeSo Social</p>
            <h1 className="mt-2 text-3xl font-semibold">Edit a post safely</h1>
          </div>
          <Link href="/social" className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-green-700 hover:text-green-300">Back to social</Link>
        </div>
        <EditPostControl />
      </div>
    </main>
  )
}
