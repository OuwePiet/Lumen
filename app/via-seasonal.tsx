"use client"

import { useEffect, useState } from "react"
import { viaSeasonalMode, type ViaSeasonalMode } from "./via-calendar-celebrations"

export default function ViaSeasonal() {
  const [mode,setMode]=useState<ViaSeasonalMode>("none")
  useEffect(()=>{
    const update=()=>{if(!document.hidden)setMode(viaSeasonalMode(new Date()))}
    update(); const timer=window.setInterval(update,60000)
    document.addEventListener("visibilitychange",update)
    return ()=>{window.clearInterval(timer);document.removeEventListener("visibilitychange",update)}
  },[])

  if (mode === "none") return null

  if (mode === "november-eleven" || mode === "carnival" || mode === "halloween") {
    const symbols=mode==="november-eleven"?["🏮","🎭","🏮"]:mode==="carnival"?["🎭","🎊","🎭"]:["🎃","🍂","🎃"]
    return <div data-via-seasonal={mode} aria-hidden="true" className="via-celebration-layer">
      {symbols.map((symbol,index)=><span key={index} style={{left:["3%","49%","94%"][index],animationDelay:(index*-1.7)+"s"}}>{symbol}</span>)}
      <style jsx>{`
        .via-celebration-layer { position:fixed;inset:0;z-index:64;pointer-events:none;overflow:hidden; }
        .via-celebration-layer span { position:absolute;bottom:18px;font-size:clamp(18px,3vw,27px);opacity:.45;animation:viaCelebrationFloat 6s ease-in-out infinite; }
        @keyframes viaCelebrationFloat { 50% { transform:translateY(-6px) rotate(5deg); } }
        @media(prefers-reduced-motion:reduce) { .via-celebration-layer span { animation:none; } }
      `}</style>
    </div>
  }

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
