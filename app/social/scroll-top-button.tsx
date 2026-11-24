"use client"
import { ArrowUp } from "lucide-react"
export default function ScrollTopButton() {
  return <button type="button" title="Back to top" aria-label="Back to top" onClick={() => window.scrollTo({top:0,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"})} className="inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-zinc-800 px-2 text-zinc-300 hover:border-[#8fd4a9]"><ArrowUp className="h-4 w-4" aria-hidden="true" /></button>
}
