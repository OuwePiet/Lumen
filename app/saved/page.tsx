"use client"
import Link from "next/link"
import SavedList from "./saved-list"
import { useSavedCopy } from "./saved-copy"
export default function SavedPage(){
 const t=useSavedCopy()
 return <main className="min-h-screen bg-black px-4 py-4 text-white sm:px-6">
  <div className="mx-auto max-w-6xl">
   <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
    <div><h1 className="text-2xl font-semibold">{t.title}</h1><p className="mt-2 text-sm text-zinc-400">{t.intro}</p></div>
    <Link href="/my-via" className="rounded-full border border-zinc-700 px-4 py-2 text-sm">{t.myVia}</Link>
   </header>
   <details className="mb-4 rounded-xl border border-[#285f40]/70 bg-zinc-950 px-4 py-3"><summary className="cursor-pointer text-sm text-[#9adbb2]">{t.privacyTitle}</summary><p className="mt-2 text-sm leading-6 text-zinc-400">{t.privacy}</p></details>
   <SavedList />
   <p className="mt-5 text-xs leading-5 text-zinc-500">{t.footer}</p>
  </div>
 </main>
}
