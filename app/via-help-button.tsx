"use client"

import Link from "next/link"
import { BookOpen, Music2, House } from "lucide-react"

/** Central header links, never fixed over page content. */
export default function ViaHelpButton() {
  return <nav className="via-global-guides" aria-label="VIA handbook and music">
    <Link href="/" aria-label="Home" className="via-global-guide-link"><House size={17} aria-hidden="true" /><span>Home</span></Link>
    <Link href="/help" aria-label="Handboek VIA" className="via-global-guide-link"><BookOpen size={17} aria-hidden="true" /><span>Handboek VIA</span></Link>
    <Link href="/music" aria-label="VIA Muziek" className="via-global-guide-link"><Music2 size={17} aria-hidden="true" /><span>VIA Muziek</span></Link>
    <style>{`
      .via-global-guides { position: static; display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 4px; width: min(1480px, calc(100% - 24px)); margin: 0 auto; padding: 0 0 3px; }
      .via-global-guide-link { box-sizing: border-box; min-height: 36px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 4px 10px; border: 1px solid transparent; border-radius: 9px; background: transparent; color: #b8ddc5; font-size: 11px; text-decoration: none; }
      .via-global-guide-link:hover, .via-global-guide-link:focus-visible { color: white; border-color: #8fd4a9; }
      @media (max-width: 720px) { .via-global-guides { justify-content: center; gap: 2px; } .via-global-guide-link { padding-left: 5px; padding-right: 5px; gap: 4px; font-size: 10px; } }
      @media (pointer: coarse), (max-width: 720px) { .via-global-guide-link { min-height: 44px; } }
      @media (max-height: 500px) { .via-site-header:has(.via-global-guides) { position: relative !important; } }
    `}</style>
  </nav>
}
