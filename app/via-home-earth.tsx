"use client"

import { useEffect, useRef, useState } from "react"

const NASA_EARTH_DIRECT =
  "https://svs.gsfc.nasa.gov/vis/a030000/a030000/a030082/viirs_dnb_night_lights_rotating_earth_1080p.mp4"

export default function ViaHomeEarth() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [videoFailed, setVideoFailed] = useState(false)

  useEffect(() => {
    function keepPlaying() {
      const video = videoRef.current
      if (!video || videoFailed) return
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
  }, [videoFailed])

  return (
    <div aria-hidden="true" className="via-nasa-earth">
      <img src="/via-earth-approved.jpg" alt="" className="via-nasa-earth-poster" />

      {!videoFailed && (
        <video
          ref={videoRef}
          className="via-nasa-earth-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/via-earth-approved.jpg"
          onCanPlay={(event) => void event.currentTarget.play().catch(() => undefined)}
          onPause={(event) => {
            if (!document.hidden) void event.currentTarget.play().catch(() => undefined)
          }}
          onError={() => setVideoFailed(true)}
        >
          <source src={NASA_EARTH_DIRECT} type="video/mp4" />
          <source src="/api/nasa-earth" type="video/mp4" />
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
          object-fit: cover;
          object-position: center 44%;
          display: block;
          background: #000;
        }

        .via-nasa-earth-poster {
          z-index: 0;
        }

        .via-nasa-earth-video {
          z-index: 1;
        }
      `}</style>
    </div>
  )
}
