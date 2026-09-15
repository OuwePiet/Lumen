"use client"

import { useState } from "react"

export default function ViaHomeEarth() {
  const [videoFailed, setVideoFailed] = useState(false)

  return (
    <div aria-hidden="true" className="via-nasa-earth">
      <img
        src="/via-earth-approved.jpg"
        alt=""
        className="via-nasa-earth-poster"
      />

      {!videoFailed && (
        <video
          className="via-nasa-earth-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/via-earth-approved.jpg"
          onError={() => setVideoFailed(true)}
          onStalled={() => setVideoFailed(true)}
        >
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
          object-position: center center;
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
