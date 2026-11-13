"use client"

import type { ReactNode } from "react"

/** Shared action-row geometry for VIA posts across pages.
 * Financial actions remain in their existing Identity-backed components.
 */
export const VIA_ACTION_BUTTON_CLASS = "inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-full border border-zinc-800 px-2 text-xs text-zinc-300 transition hover:border-[#8fd4a9] hover:text-white"

export function ViaPostActionBar({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div data-via-post-actions className={`flex min-w-0 flex-wrap items-center gap-2 text-xs ${className}`}>{children}</div>
}

export function ViaMoreActions({ children, label = "Meer postacties" }: { children: ReactNode; label?: string }) {
  return <details className="relative shrink-0">
    <summary aria-label={label} title={label} className={`${VIA_ACTION_BUTTON_CLASS} cursor-pointer list-none`}>•••</summary>
    <div className="absolute right-0 z-30 mt-2 w-max min-w-44 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-zinc-700 bg-[#080b09] p-2 shadow-2xl [&_button]:min-h-11 [&_a]:min-h-11">
      {children}
    </div>
  </details>
}
