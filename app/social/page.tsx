import type { Metadata } from "next"
import Link from "next/link"
import FeedChoice from "./feed-choice"
import PublicPosts from "./public-posts"
import ParticipationGate from "../participation-gate"
import PostComposer from "./post-composer"
import SocialLocalizer from "./social-localizer"
import { ViaSettingsContent } from "../settings/page"
import { readPublicPostByHash } from "../../lib/via/deso-post-read"
export const metadata: Metadata = {
  title: "VIA Post Office",
  description: "Write, publish and follow native DeSo posts in the VIA way.",
}


export default async function SocialPage({ searchParams }: { searchParams: Promise<{ post?: string | string[] }> }) {
  const { post } = await searchParams
  const hash = typeof post === "string" ? post.trim().toLowerCase() : ""
  const initialPost = /^[0-9a-f]{64}$/.test(hash) ? await readPublicPostByHash(hash).catch(() => null) : null
  return (
    <main data-via-social-page className="min-h-screen w-full min-w-0 max-w-full overflow-x-clip bg-[#030504] bg-[radial-gradient(circle_at_18%_14%,rgba(143,212,169,0.08),transparent_24%),radial-gradient(circle_at_82%_32%,rgba(255,255,255,0.035),transparent_20%),linear-gradient(180deg,#030504_0%,#050806_48%,#030504_100%)] px-3 py-4 text-white sm:px-6 sm:py-6 lg:px-8">
      <style>{`[data-via-social-page]{position:relative;isolation:isolate;background:#d6c1a1}[data-via-social-page]::before{content:"";position:fixed;inset:0;z-index:-2;pointer-events:none;background:url("/65D13039-E69F-4A35-9EB7-54B90D1A27AB.png") center top/cover no-repeat}[data-via-social-page]::after{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;background:rgba(10,16,12,.08)}[data-via-social-page]>div{background:rgba(8,20,14,.94);border:1px solid rgba(185,157,107,.55);border-radius:17px;padding:clamp(12px,2vw,24px);box-shadow:0 12px 42px rgba(0,0,0,.22),inset 0 0 0 1px rgba(71,112,81,.17)}[data-via-social-page] :is(article,section){background-color:#0b1a14;border-color:rgba(184,158,110,.32)}[data-via-social-page] header{border-color:rgba(184,158,110,.3)}[data-via-social-page] h1{font-family:Georgia,Times New Roman,serif;letter-spacing:.01em}[data-via-postoffice-title]{display:flex;align-items:center;gap:14px}[data-via-postoffice-pen]{width:84px;height:56px;object-fit:cover;object-position:center;border-radius:10px;flex:0 0 auto}@media(max-width:640px){[data-via-postoffice-pen]{width:86px;height:60px}}[data-via-social-page] :is(article,section) :is(button,a){transition:background-color .15s ease}[data-via-social-page] h1{color:#f6f3e9}@media(min-width:900px){[data-via-social-page]>div{max-width:1200px}}`}</style>
      <SocialLocalizer />
      <div className="mx-auto w-full min-w-0 max-w-6xl [&_article]:min-w-0 [&_section]:min-w-0 [&_input]:max-w-full [&_textarea]:max-w-full">
        <header className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 sm:mb-3 sm:gap-3 sm:pb-3">
          <div data-via-postoffice-title>
            <img data-via-postoffice-pen src="/92D560F9-D984-4958-93C6-00C657796928.png" alt="" aria-hidden="true" />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Post Office</h1>
              <p className="mt-1 hidden text-sm text-zinc-500 sm:block">Write, publish and follow DeSo posts in the VIA way.</p>
            </div>
          </div>
          <Link href="/saved" className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-zinc-300">Saved</Link>
        </header>

        <section id="via-post-composer" className="scroll-mt-24 rounded-2xl border border-white/10 bg-black/35 p-3 sm:p-4" aria-label="Write a post">
          <PostComposer />
        </section>

        <div className="mt-2 sm:mt-4">
          <FeedChoice />
        </div>

        <section className="mt-0" aria-label="VIA Post Office feed">
          <PublicPosts initialPost={initialPost} />
        </section>


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
