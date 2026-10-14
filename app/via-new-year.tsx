"use client"

import { useEffect, useState } from "react"

type NewYearState = { phase: "countdown" | "celebrate" | "hidden"; year: number; seconds: number }

function getNewYearState(now: Date): NewYearState {
  const year = now.getFullYear()
  const month = now.getMonth()
  const day = now.getDate()
  if (month === 0 && day === 1 && now.getHours() === 0 && now.getMinutes() < 10) {
    return { phase: "celebrate", year, seconds: 0 }
  }
  if (month === 11 && day === 31) {
    const seconds = Math.max(0, Math.ceil((new Date(year + 1, 0, 1).getTime() - now.getTime()) / 1000))
    return { phase: "countdown", year: year + 1, seconds }
  }
  return { phase: "hidden", year, seconds: 0 }
}

function clock(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return [hours, minutes, secs].map((part) => String(part).padStart(2, "0")).join(":")
}

/** Local device time zone; automatically repeats each year without server jobs or paid APIs. */
export default function ViaNewYear() {
  const [state, setState] = useState<NewYearState | null>(null)

  useEffect(() => {
    const update = () => setState(getNewYearState(new Date()))
    update()
    const timer = window.setInterval(update, 1000)
    const onVisible = () => { if (!document.hidden) update() }
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [])

  if (!state || state.phase === "hidden") return null

  return (
    <aside className="via-new-year" aria-label="VIA jaarwisseling">
      {state.phase === "countdown" ? (
        <div className="via-new-year-message">
          <span>✨ VIA telt af naar {state.year}</span>
          <strong role="timer" aria-label="Tijd tot nieuwjaar">{clock(state.seconds)}</strong>
        </div>
      ) : (
        <>
          <div className="via-new-year-fireworks" aria-hidden="true">
            {Array.from({ length: 12 }, (_, index) => <span key={index} style={{ "--spark": index } as React.CSSProperties}>✦</span>)}
          </div>
          <div className="via-new-year-message" role="status">🎆 Gelukkig nieuwjaar {state.year}! — VIA 🌍</div>
        </>
      )}
      <style jsx>{`
        .via-new-year { position: fixed; z-index: 65; top: max(12px, env(safe-area-inset-top)); left: 50%; transform: translateX(-50%); width: max-content; max-width: calc(100vw - 24px); pointer-events: none; color: #f4f4e9; text-align: center; }
        .via-new-year-message { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px; padding: 9px 14px; border: 1px solid rgba(245,219,137,.5); border-radius: 18px; background: rgba(0,0,0,.82); font-size: clamp(12px, 2.5vw, 15px); }
        .via-new-year-message strong { font-variant-numeric: tabular-nums; color: #f5dc95; letter-spacing: .06em; }
        .via-new-year-fireworks { position: absolute; inset: -8px; overflow: visible; }
        .via-new-year-fireworks span { position: absolute; left: 50%; top: 50%; color: #f5d88c; font-size: 16px; animation: via-new-year-spark 2.6s ease-out infinite; animation-delay: calc(var(--spark) * -0.18s); }
        @keyframes via-new-year-spark { 0% { opacity: 0; transform: rotate(calc(var(--spark) * 30deg)) translateX(0) scale(.3); } 25% { opacity: 1; } 100% { opacity: 0; transform: rotate(calc(var(--spark) * 30deg)) translateX(95px) scale(.7); } }
        @media (prefers-reduced-motion: reduce) { .via-new-year-fireworks span { animation: none; display: none; } }
      `}</style>
    </aside>
  )
}
