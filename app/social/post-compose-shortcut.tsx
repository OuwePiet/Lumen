"use client"

import { Pencil } from "lucide-react"

export default function PostComposeShortcut() {
  function openComposer() {
    const composer = document.getElementById("via-post-composer") as HTMLDetailsElement | null
    if (!composer) return
    composer.open = true
    composer.scrollIntoView({ behavior: "smooth", block: "start" })
    window.setTimeout(() => {
      composer.querySelector<HTMLTextAreaElement>("textarea")?.focus({ preventScroll: true })
    }, 450)
  }

  return (
    <button type="button" onClick={openComposer} aria-label="Schrijf een bericht" title="Schrijf een bericht" className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-300/40 bg-[#0b3324] text-emerald-100 shadow-xl shadow-black/50 sm:bottom-6 sm:right-6">
      <Pencil size={25} aria-hidden="true" />
    </button>
  )
}
