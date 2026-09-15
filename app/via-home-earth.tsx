"use client"

export default function ViaHomeEarth() {
  return (
    <div aria-hidden="true" className="via-nasa-earth">
      <video
        className="via-nasa-earth-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/api/nasa-earth" type="video/mp4" />
      </video>
      <style jsx>{`
        .via-nasa-earth {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
          background: #000;
        }

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
      `}</style>
    </div>
  )
}
