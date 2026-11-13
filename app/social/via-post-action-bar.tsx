"use client"

import type { ReactNode } from "react"

/** Shared action-row geometry for VIA posts across pages.
 * Financial actions remain in their existing Identity-backed components.
 */
export const VIA_ACTION_BUTTON_CLASS = "inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-full border border-zinc-800 px-2 text-xs text-zinc-300 transition hover:border-[#8fd4a9] hover:text-white"

export function ViaPostActionBar({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div data-via-post-actions className={`flex flex-wrap items-center gap-2 text-xs ${className}`}>{children}</div>
}

export function ViaMoreActions({ children, label = "Meer postacties" }: { children: ReactNode; label?: string }) {
  return <details className="relative">
    <summary aria-label={label} title={label} className={`${VIA_ACTION_BUTTON_CLASS} cursor-pointer list-none`}>•••</summary>
    <div className="absolute right-0 z-30 mt-2 min-w-44 overflow-hidden rounded-xl border border-zinc-700 bg-[#080b09] p-2 shadow-2xl [&_button]:min-h-9">
      {children}
    </div>
  </details>
}
