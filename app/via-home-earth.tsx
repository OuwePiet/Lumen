"use client"

import { useEffect, useRef, useState } from "react"

const VIA_EARTH = {
  id: "night-lights-2012",
  src: "https://svs.gsfc.nasa.gov/vis/a030000/a030000/a030082/viirs_dnb_night_lights_rotating_earth_1080p.mp4",
} as const

export default function ViaHomeEarth() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [videoFailed, setVideoFailed] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [videoEnabled, setVideoEnabled] = useState(false)
  const [posterReady, setPosterReady] = useState(false)
  const earth = VIA_EARTH

  useEffect(() => {
    setVideoFailed(false)
    setVideoReady(false)
    setVideoEnabled(false)

    const timer = window.setTimeout(() => setVideoEnabled(true), 2500)
    return () => window.clearTimeout(timer)
  }, [earth.id])

  useEffect(() => {
    function keepPlaying() {
      const video = videoRef.current
      if (!video || videoFailed || !videoEnabled) return
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
  }, [videoFailed, videoEnabled, earth.id])

  return (
    <div aria-hidden="true" className="via-nasa-earth" data-nasa-visual={earth.id}>
      <div className="via-nasa-earth-poster-shell">
        <img
          src="/via-earth-approved.jpg"
          alt=""
          className="via-nasa-earth-poster"
          fetchPriority="high"
          decoding="async"
          onLoad={() => setPosterReady(true)}
          onError={() => setPosterReady(false)}
        />
      </div>

      {videoEnabled && !videoFailed && (
        <video
          key={earth.id}
          ref={videoRef}
          className="via-nasa-earth-video"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster="/via-earth-approved.jpg"
          onCanPlay={(event) => {
            event.currentTarget.playbackRate = 0.72
            void event.currentTarget.play().catch(() => undefined)
          }}
          onPlaying={() => setVideoReady(true)}
          onPause={(event) => {
            if (!document.hidden) void event.currentTarget.play().catch(() => undefined)
          }}
          onError={() => {
            setVideoReady(false)
            setVideoFailed(true)
          }}
        >
          <source src={earth.src} type="video/mp4" />
          {earth.id === "night-lights-2012" ? <source src="/api/nasa-earth" type="video/mp4" /> : null}
        </video>
      )}

      <style jsx>{`
        .via-nasa-earth {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100vh;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
          background: #000;
        }

        .via-nasa-earth-poster-shell,
        .via-nasa-earth-video {
          position: absolute;
          width: min(1180px, 92vw);
          height: auto;
          aspect-ratio: 16 / 9;
          left: 50%;
          top: 50%;
          object-fit: contain;
          object-position: center center;
          transform: translate(-50%, -50%);
          display: block;
          background: transparent;
          image-rendering: auto;
          filter: brightness(1.32) contrast(1.12) saturate(1.12);
        }

        .via-nasa-earth-poster-shell {
          z-index: 2;
          opacity: ${videoReady ? 0 : 1};
          overflow: hidden;
          background: #000;
        }
        .via-nasa-earth-poster {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          opacity: ${posterReady ? 1 : 0};
        }
        .via-nasa-earth-video { z-index: 1; opacity: ${videoReady ? 1 : 0}; }

        @media (max-width: 900px) {
          .via-nasa-earth-poster-shell,
          .via-nasa-earth-video {
            width: 190vw;
            max-width: none;
          }
        }
      `}</style>
    </div>
  )
}
