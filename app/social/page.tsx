import Link from "next/link"
import FeedChoice from "./feed-choice"
import PublicPosts from "./public-posts"
import ParticipationGate from "../participation-gate"
import PostComposer from "./post-composer"

export default function SocialPage() {
  return (
    <main className="min-h-screen bg-[#050706] px-4 py-6 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8fd4a9]">VIA · SOCIAL</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">DeSo conversation, without the clutter.</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/notifications" className="rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-sm text-zinc-300 transition hover:border-[#8fd4a9]/45 hover:text-[#9adbb2]">Notifications</Link>
            <Link href="/saved" className="rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-sm text-zinc-300 transition hover:border-[#8fd4a9]/45 hover:text-[#9adbb2]">Saved</Link>
          </div>
        </header>

        <section className="rounded-2xl border border-white/10 bg-zinc-950/65 p-4 sm:p-5" aria-labelledby="composer-heading">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">Create</p>
              <h2 id="composer-heading" className="mt-1 text-lg font-semibold">Share a post</h2>
            </div>
            <Link href="/edit-post" className="text-sm text-zinc-400 transition hover:text-[#9adbb2]">Edit one of your posts</Link>
          </div>
          <PostComposer />
        </section>

        <div className="mt-5">
          <FeedChoice />
        </div>

        <div className="mt-5">
          <PublicPosts />
        </div>

        <details className="mt-6 rounded-2xl border border-white/10 bg-zinc-950/45 p-4 text-sm text-zinc-400">
          <summary className="cursor-pointer font-medium text-zinc-200">Participation & safety</summary>
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
