"use client"

import Link from "next/link"
import { BookOpen, Music2 } from "lucide-react"

export default function ViaHelpButton() {
  return (
    <nav className="via-global-guides" aria-label="VIA handbook and music">
      <Link href="/help" aria-label="Handboek VIA" title="Handboek VIA" className="via-global-guide-link">
        <BookOpen className="h-4 w-4" aria-hidden="true" />
        <span>Handboek VIA</span>
      </Link>
      <Link href="/music" aria-label="VIA Muziek" title="VIA Muziek" className="via-global-guide-link">
        <Music2 className="h-4 w-4" aria-hidden="true" />
        <span>VIA Muziek</span>
      </Link>
      <style>{`
        .via-global-guides {
          position: fixed;
          left: 12px;
          bottom: 12px;
          z-index: 80;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .via-global-guide-link {
          min-height: 40px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #285f40;
          border-radius: 999px;
          background: rgba(7,16,11,.95);
          padding: 8px 12px;
          color: #b8ddc5;
          box-shadow: 0 10px 28px rgba(0,0,0,.34);
          backdrop-filter: blur(10px);
          text-decoration: none;
          font-size: 12px;
          font-weight: 650;
          transition: border-color .18s ease, color .18s ease;
        }
        .via-global-guide-link:hover {
          border-color: rgba(143,212,169,.7);
          color: #fff;
        }
        body:has(> .via-home-free-earth) .via-global-guides {
          left: 12px;
          bottom: 12px;
        }
        body:has(> .via-home-free-earth) .via-global-guide-link {
          background: rgba(7,16,11,.72);
          border-color: rgba(143,212,169,.34);
        }
        @media (max-width: 1366px) and (min-width: 721px) {
          body:has(> .via-home-free-earth) .via-global-guides {
            left: 10px;
            bottom: 10px;
          }
          body:has(> .via-home-free-earth) .via-global-guide-link {
            min-height: 38px;
            padding: 7px 11px;
          }
        }
        @media (max-width: 600px) {
          body:has(> .via-home-free-earth) .via-global-guides { display: none !important; }
        }
        @media (max-width: 720px) {
          .via-global-guides {
            left: 10px;
            bottom: calc(env(safe-area-inset-bottom) + 10px);
          }
          .via-global-guide-link {
            width: 44px;
            height: 44px;
            min-height: 44px;
            padding: 0;
            justify-content: center;
          }
          .via-global-guide-link span { display: none; }
        }
      `}</style>
    </nav>
  )
}
