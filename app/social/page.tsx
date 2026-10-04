import type { Metadata } from "next"
import Link from "next/link"
import FeedChoice from "./feed-choice"
import PublicPosts from "./public-posts"
import ParticipationGate from "../participation-gate"
import PostComposer from "./post-composer"
import SocialLocalizer from "./social-localizer"
export const metadata: Metadata = {
  title: "VIA Post Office",
  description: "Write, publish and follow native DeSo posts in the VIA way.",
}


export default function SocialPage() {
  return (
    <main data-via-social-page className="min-h-screen bg-[#030504] bg-[radial-gradient(circle_at_18%_14%,rgba(143,212,169,0.08),transparent_24%),radial-gradient(circle_at_82%_32%,rgba(255,255,255,0.035),transparent_20%),linear-gradient(180deg,#030504_0%,#050806_48%,#030504_100%)] px-3 py-4 text-white sm:px-6 sm:py-6 lg:px-8">
      <style>{`[data-via-social-page]{position:relative;isolation:isolate;background:#030504}[data-via-social-page]::before{content:"";position:fixed;inset:0;z-index:-2;pointer-events:none;background:url("/via-postoffice-background.jpeg") center top/cover no-repeat}[data-via-social-page]::after{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;background:linear-gradient(180deg,rgba(3,7,5,.48) 0%,rgba(3,7,5,.72) 46%,rgba(3,7,5,.9) 100%)}`}</style>
      <SocialLocalizer />
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 sm:mb-5 sm:gap-4 sm:pb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">VIA Post Office</h1>
            <p className="mt-1 hidden text-sm text-zinc-500 sm:block">Write, publish and follow DeSo posts in the VIA way.</p>
          </div>
          <details className="w-full sm:hidden">
            <summary className="w-fit cursor-pointer list-none rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-sm text-zinc-300">Snelkeuzes ▾</summary>
            <nav className="mt-2 flex gap-2 overflow-x-auto pb-1" aria-label="VIA Post Office shortcuts">
              <Link href="/saved" className="shrink-0 rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-center text-sm text-zinc-300">Saved</Link>
              <Link href="/settings" className="shrink-0 rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-center text-sm text-zinc-300">Settings</Link>
              <Link href="/help" className="shrink-0 rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-center text-sm text-zinc-300">Handboek VIA</Link>
              <Link href="/music" className="shrink-0 rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-center text-sm text-zinc-300">VIA Muziek</Link>
            </nav>
          </details>
          <nav className="hidden w-auto flex-wrap gap-2 sm:flex" aria-label="VIA Post Office shortcuts">
            <Link href="/saved" className="rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-center text-sm text-zinc-300 transition hover:border-[#8fd4a9]/40 hover:text-[#9adbb2]">Saved</Link>
            <Link href="/settings" className="rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-center text-sm text-zinc-300 transition hover:border-[#8fd4a9]/40 hover:text-[#9adbb2]">Settings</Link>
            <Link href="/help" className="rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-center text-sm text-zinc-300 transition hover:border-[#8fd4a9]/40 hover:text-[#9adbb2]">Handboek VIA</Link>
            <Link href="/music" className="rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-center text-sm text-zinc-300 transition hover:border-[#8fd4a9]/40 hover:text-[#9adbb2]">VIA Muziek</Link>
          </nav>
        </header>

        <section id="via-post-composer" className="scroll-mt-24 rounded-2xl border border-white/10 bg-black/35 p-3 sm:p-4" aria-labelledby="composer-heading">
          <div className="flex flex-wrap items-center justify-between gap-3 sm:mb-2">
            <div>
              <h2 id="composer-heading" className="sr-only sm:not-sr-only sm:text-lg sm:font-semibold">Post Office</h2>
            </div>
          </div>
          <PostComposer />
        </section>

        <div className="mt-2 sm:mt-4">
          <FeedChoice />
        </div>

        <section className="mt-2 sm:mt-4" aria-label="VIA Post Office feed">
          <PublicPosts />
        </section>

        <a href="#via-post-composer" aria-label="Write a post" title="Write a post" className="fixed bottom-[calc(env(safe-area-inset-bottom)+72px)] right-3 z-40 inline-flex h-10 items-center justify-center rounded-full border border-[#8fd4a9]/55 bg-[#102117]/95 px-3 text-xs font-semibold text-[#9adbb2] shadow-xl backdrop-blur sm:hidden"><span aria-hidden="true" className="mr-1 text-sm">✎</span>Post Office</a>

        <details className="mt-3 rounded-2xl border border-white/10 bg-black/25 p-3 text-sm text-zinc-500 sm:mt-5 sm:p-4">
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
