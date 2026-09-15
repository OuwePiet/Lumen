"use client"

export default function ViaHomeEarth() {
  return (
    <div aria-hidden="true" className="via-official-earth">
      <img src="/via-earth-official.webp" alt="" className="via-official-earth-image" />
      <style jsx>{`
        .via-official-earth {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
          background: #010403;
        }

        .via-official-earth-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          display: block;
        }
      `}</style>
    </div>
  )
}
