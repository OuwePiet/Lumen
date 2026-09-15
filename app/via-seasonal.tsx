"use client"

import { useMemo } from "react"

function easterSunday(year: number) {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

function withinEasterWindow(now: Date) {
  const easter = easterSunday(now.getFullYear())
  const start = new Date(easter)
  start.setDate(easter.getDate() - 2)
  const end = new Date(easter)
  end.setDate(easter.getDate() + 1)
  now = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return now >= start && now <= end
}

export default function ViaSeasonal() {
  const mode = useMemo(() => {
    const now = new Date()
    if (withinEasterWindow(now)) return "easter" as const
    if ([11, 0, 1].includes(now.getMonth())) return "snow" as const
    return "none" as const
  }, [])

  if (mode === "none") return null

  if (mode === "easter") {
    return (
      <div aria-hidden="true" className="via-easter-layer">
        <span className="via-easter-bunny via-easter-bunny-a">🐇</span>
        <span className="via-easter-bunny via-easter-bunny-b">🐇</span>
        <span className="via-easter-egg via-easter-egg-a">🥚</span>
        <span className="via-easter-egg via-easter-egg-b">🥚</span>
        <span className="via-easter-egg via-easter-egg-c">🥚</span>
        <style jsx>{`
          .via-easter-layer { position: fixed; inset: 0; z-index: 70; pointer-events: none; overflow: hidden; }
          .via-easter-bunny, .via-easter-egg { position: absolute; filter: saturate(.72); opacity: .34; user-select: none; }
          .via-easter-bunny { font-size: 24px; bottom: 18px; }
          .via-easter-bunny-a { left: 4vw; transform: scaleX(-1); }
          .via-easter-bunny-b { right: 4vw; }
          .via-easter-egg { font-size: 16px; bottom: 24px; opacity: .28; }
          .via-easter-egg-a { left: 13vw; transform: rotate(-14deg); }
          .via-easter-egg-b { left: 50%; transform: translateX(-50%) rotate(8deg); }
          .via-easter-egg-c { right: 13vw; transform: rotate(12deg); }
        `}</style>
      </div>
    )
  }

  return (
    <div aria-hidden="true" className="via-snow-layer">
      {Array.from({ length: 28 }, (_, index) => (
        <i key={index} style={{ "--i": index } as React.CSSProperties} />
      ))}
      <style jsx>{`
        .via-snow-layer { position: fixed; inset: 0; z-index: 70; pointer-events: none; overflow: hidden; opacity: .42; }
        .via-snow-layer i { position: absolute; top: -12px; left: calc((var(--i) * 37) % 100 * 1%); width: 3px; height: 3px; border-radius: 50%; background: rgba(255,255,255,.82); animation: viaSnow calc(16s + (var(--i) % 7) * 2s) linear infinite; animation-delay: calc(var(--i) * -1.2s); }
        .via-snow-layer i:nth-child(3n) { width: 2px; height: 2px; opacity: .55; }
        .via-snow-layer i:nth-child(4n) { width: 4px; height: 4px; opacity: .35; }
        @keyframes viaSnow { to { transform: translate3d(calc((var(--i) % 5 - 2) * 18px), 105vh, 0); } }
        @media (prefers-reduced-motion: reduce) { .via-snow-layer { display: none; } }
      `}</style>
    </div>
  )
}
