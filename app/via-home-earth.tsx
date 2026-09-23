"use client"

import { useEffect, useMemo, useRef, useState } from "react"

const NASA_EARTHS = [
  {
    id: "night-lights-2012",
    src: "https://svs.gsfc.nasa.gov/vis/a030000/a030000/a030082/viirs_dnb_night_lights_rotating_earth_1080p.mp4",
  },
  {
    id: "earth-clouds-night-2025",
    src: "https://svs.gsfc.nasa.gov/vis/a000000/a005500/a005570/Earth_wAtmos_spin_02_1080p60.mp4",
  },
] as const

export default function ViaHomeEarth() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [videoFailed, setVideoFailed] = useState(false)
  const earth = useMemo(() => NASA_EARTHS[new Date().getMonth() % NASA_EARTHS.length], [])

  useEffect(() => {
    setVideoFailed(false)
  }, [earth.id])

  useEffect(() => {
    function keepPlaying() {
      const video = videoRef.current
      if (!video || videoFailed) return
      video.playbackRate = 0.72
      if (video.paused) void video.play().catch(() => undefined)
    }

    keepPlaying()
    document.addEventListener("visibilitychange", keepPlaying)
    window.addEventListener("pageshow", keepPlaying)
    window.addEventListener("focus", keepPlaying)

    return () => {
      document.removeEventListener("visibilitychange", keepPlaying)
      window.removeEventListener("pageshow", keepPlaying)
      window.removeEventListener("focus", keepPlaying)
    }
  }, [videoFailed, earth.id])

  return (
    <div aria-hidden="true" className="via-nasa-earth" data-nasa-visual={earth.id}>
      <img src="/via-earth-approved.jpg" alt="" className="via-nasa-earth-poster" />

      {!videoFailed && (
        <video
          key={earth.id}
          ref={videoRef}
          className="via-nasa-earth-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/via-earth-approved.jpg"
          onCanPlay={(event) => {
            event.currentTarget.playbackRate = 0.72
            void event.currentTarget.play().catch(() => undefined)
          }}
          onPause={(event) => {
            if (!document.hidden) void event.currentTarget.play().catch(() => undefined)
          }}
          onError={() => setVideoFailed(true)}
        >
          <source src={earth.src} type="video/mp4" />
          {earth.id === "night-lights-2012" ? <source src="/api/nasa-earth" type="video/mp4" /> : null}
        </video>
      )}

      <style jsx>{`
        .via-nasa-earth {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
          background: #000;
        }

        .via-nasa-earth-poster,
        .via-nasa-earth-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center center;
          transform: translateY(-60vh);
          display: block;
          background: #000;
        }

        .via-nasa-earth-poster { z-index: 0; }
        .via-nasa-earth-video { z-index: 1; }

        @media (max-width: 900px) {
          .via-nasa-earth-poster,
          .via-nasa-earth-video {
            width: 120%;
            height: 120%;
            left: -10%;
            top: -10%;
            image-rendering: auto;
            filter: contrast(1.06) saturate(1.04);
          }
        }
      `}</style>
    </div>
  )
}
