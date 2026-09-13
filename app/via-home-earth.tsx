"use client"

import { useEffect, useState } from "react"

const DAY_MS = 86_400_000

function utcRotation(date = new Date()) {
  const utcMs =
    date.getUTCHours() * 3_600_000 +
    date.getUTCMinutes() * 60_000 +
    date.getUTCSeconds() * 1_000 +
    date.getUTCMilliseconds()
  return (utcMs / DAY_MS) * 360 - 180
}

export default function ViaHomeEarth() {
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (reduceMotion.matches) return

    const update = () => setRotation(utcRotation())
    update()
    const timer = window.setInterval(update, 60_000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: "50%",
        top: "clamp(150px, 16vw, 220px)",
        width: "clamp(760px, 94vw, 1420px)",
        aspectRatio: "1",
        transform: "translateX(-50%)",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.72,
      }}
    >
      <svg viewBox="0 0 1000 1000" width="100%" height="100%" role="presentation">
        <defs>
          <radialGradient id="viaEarthShade" cx="48%" cy="28%" r="70%">
            <stop offset="0%" stopColor="#183127" stopOpacity="0.7" />
            <stop offset="48%" stopColor="#0b1713" stopOpacity="0.58" />
            <stop offset="100%" stopColor="#020504" stopOpacity="0.16" />
          </radialGradient>
          <radialGradient id="viaEarthHorizon" cx="50%" cy="50%" r="50%">
            <stop offset="82%" stopColor="#79b796" stopOpacity="0" />
            <stop offset="96%" stopColor="#79b796" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#9adbb2" stopOpacity="0.28" />
          </radialGradient>
          <linearGradient id="viaEarthFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="62%" stopColor="#ffffff" stopOpacity=".92" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <mask id="viaEarthMask">
            <rect width="1000" height="1000" fill="url(#viaEarthFade)" />
          </mask>
          <clipPath id="viaEarthClip">
            <circle cx="500" cy="500" r="368" />
          </clipPath>
        </defs>
        <g mask="url(#viaEarthMask)">
          <circle cx="500" cy="500" r="374" fill="url(#viaEarthHorizon)" />
          <circle cx="500" cy="500" r="368" fill="url(#viaEarthShade)" stroke="#5a8b74" strokeOpacity="0.28" strokeWidth="1.2" />
          <g
            clipPath="url(#viaEarthClip)"
            fill="none"
            stroke="#6b9a84"
            strokeOpacity="0.17"
            strokeWidth="1"
            style={{
              transformOrigin: "500px 500px",
              transform: `rotate(${rotation}deg)`,
              transition: "transform 60s linear",
            }}
          >
            <ellipse cx="500" cy="500" rx="368" ry="108" />
            <ellipse cx="500" cy="500" rx="368" ry="226" />
            <ellipse cx="500" cy="500" rx="142" ry="368" />
            <ellipse cx="500" cy="500" rx="252" ry="368" />
            <path d="M132 500h736" />
            <path d="M286 290c74-54 142-67 204-48 48 15 78 55 124 66 46 10 91-4 139 18 43 20 67 57 82 101-49 14-92 36-119 78-28 45-19 99-55 137-32 34-82 40-114 75-37 40-42 97-72 142-32-32-58-72-72-117-16-49-18-103-47-146-26-38-70-59-99-94-38-45-39-109 29-212Z" />
            <path d="M574 232c50 30 86 70 112 117 24 46 26 97 57 139 30 39 81 59 104 102-20 61-54 117-99 164-45-15-89-27-121-65-31-39-38-91-72-128-28-31-68-49-85-89-22-53 5-107 34-151 21-34 43-63 70-89Z" />
            <g fill="#9adbb2" stroke="none" opacity="0.48">
              <circle cx="362" cy="388" r="2.1" />
              <circle cx="426" cy="342" r="1.8" />
              <circle cx="484" cy="414" r="2" />
              <circle cx="558" cy="372" r="1.8" />
              <circle cx="616" cy="446" r="2.1" />
              <circle cx="682" cy="506" r="1.7" />
              <circle cx="578" cy="570" r="2" />
              <circle cx="466" cy="604" r="1.8" />
              <circle cx="382" cy="548" r="2" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  )
}
