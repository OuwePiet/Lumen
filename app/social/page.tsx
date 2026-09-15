import Link from "next/link"
import FeedChoice from "./feed-choice"
import PublicPosts from "./public-posts"
import ParticipationGate from "../participation-gate"
import PostComposer from "./post-composer"

export default function SocialPage() {
  return (
    <main className="min-h-screen bg-[#030504] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Social</h1>
            <p className="mt-1 text-sm text-zinc-500">Public DeSo conversation on VIA.</p>
          </div>
          <nav className="flex flex-wrap gap-2" aria-label="Social shortcuts">
            <Link href="/notifications" className="rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-sm text-zinc-300 transition hover:border-[#8fd4a9]/40 hover:text-[#9adbb2]">Notifications</Link>
            <Link href="/saved" className="rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-sm text-zinc-300 transition hover:border-[#8fd4a9]/40 hover:text-[#9adbb2]">Saved</Link>
          </nav>
        </header>

        <section className="rounded-2xl border border-white/10 bg-black/35 p-4 sm:p-5" aria-labelledby="composer-heading">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8fd4a9]">Create</p>
              <h2 id="composer-heading" className="mt-1 text-lg font-semibold">Share a post</h2>
            </div>
            <Link href="/edit-post" className="text-xs text-zinc-500 transition hover:text-[#9adbb2]">Edit your post</Link>
          </div>
          <PostComposer />
        </section>

        <div className="mt-4">
          <FeedChoice />
        </div>

        <section className="mt-4" aria-label="VIA social feed">
          <PublicPosts />
        </section>

        <details className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-zinc-500">
          <summary className="cursor-pointer font-medium text-zinc-300">Participation & safety</summary>
          <div className="mt-4">
            <ParticipationGate
              title="Public view · DeSo participation"
              text="Public feeds stay open. Posting and other DeSo actions become available only after a valid DeSo Identity login. Blockchain actions keep their own review and approval step."
            />
          </div>
          <p className="mt-4 leading-6">
            VIA never treats a login as a trust badge and never asks for or stores a visitor&apos;s seed phrase. Spam, bot, scam and moderation safeguards remain separate from DeSo account access.
          </p>
        </details>
      </div>
    </main>
  )
}
