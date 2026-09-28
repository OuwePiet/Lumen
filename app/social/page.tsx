import type { Metadata } from "next"
import Link from "next/link"
import FeedChoice from "./feed-choice"
import PublicPosts from "./public-posts"
import ParticipationGate from "../participation-gate"
import PostComposer from "./post-composer"
import SocialLocalizer from "./social-localizer"
export const metadata: Metadata = {
  title: "VIA Post Home",
  description: "Write, publish and follow native DeSo posts in the VIA way.",
}


export default function SocialPage() {
  return (
    <main data-via-social-page className="min-h-screen bg-[#030504] px-3 py-4 text-white sm:px-6 sm:py-6 lg:px-8">
      <SocialLocalizer />
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">VIA Post Home</h1>
            <p className="mt-1 hidden text-sm text-zinc-500 sm:block">Write, publish and follow DeSo posts in the VIA way.</p>
          </div>
          <nav className="flex w-full gap-2 overflow-x-auto pb-1 sm:w-auto sm:flex-wrap sm:overflow-visible sm:pb-0" aria-label="VIA Post Home shortcuts">
            <Link href="/saved" className="shrink-0 rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-center text-sm text-zinc-300 transition hover:border-[#8fd4a9]/40 hover:text-[#9adbb2]">Saved</Link>
            <Link href="/settings" className="shrink-0 rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-center text-sm text-zinc-300 transition hover:border-[#8fd4a9]/40 hover:text-[#9adbb2]">Settings</Link>
            <Link href="/help" className="shrink-0 rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-center text-sm text-zinc-300 transition hover:border-[#8fd4a9]/40 hover:text-[#9adbb2]">Handboek VIA</Link>
            <Link href="/music" className="shrink-0 rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-center text-sm text-zinc-300 transition hover:border-[#8fd4a9]/40 hover:text-[#9adbb2]">VIA Muziek</Link>
          </nav>
        </header>

        <section id="via-post-composer" className="scroll-mt-24 rounded-2xl border border-white/10 bg-black/35 p-3 sm:p-4" aria-labelledby="composer-heading">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="composer-heading" className="text-base font-semibold sm:text-lg">Post</h2>
            </div>
          </div>
          <PostComposer />
        </section>

        <div className="mt-4">
          <FeedChoice />
        </div>

        <section className="mt-4" aria-label="VIA social feed">
          <PublicPosts />
        </section>

        <a href="#via-post-composer" aria-label="Write a post" title="Write a post" className="fixed bottom-[calc(env(safe-area-inset-bottom)+18px)] right-4 z-40 inline-flex h-14 min-w-14 items-center justify-center rounded-full border border-[#8fd4a9]/55 bg-[#102117]/95 px-4 text-sm font-semibold text-[#9adbb2] shadow-xl backdrop-blur sm:hidden">Post</a>

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
