"use client"

export default function ViaHomeEarth() {
  return (
    <div aria-hidden="true" className="via-cinematic-earth">
      <img className="via-cinematic-earth-image" src="/via-earth-home.webp" alt="" />
      <div className="via-cinematic-earth-atmosphere" />
      <style jsx>{`
        .via-cinematic-earth {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          background: #010403;
        }

        .via-cinematic-earth-image {
          position: absolute;
          inset: -1.5%;
          width: 103%;
          height: 103%;
          object-fit: cover;
          object-position: 50% 50%;
          display: block;
          filter: brightness(.98) contrast(1.04) saturate(.98);
          animation: viaEarthDrift 420s ease-in-out infinite alternate;
          will-change: transform;
        }

        .via-cinematic-earth-atmosphere {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 19% 8% at 50% 39%, rgba(255,231,158,.08), transparent 72%),
            linear-gradient(180deg, rgba(0,0,0,.03) 0%, rgba(0,0,0,0) 72%, rgba(0,0,0,.08) 100%);
        }

        @keyframes viaEarthDrift {
          0% { transform: scale(1.018) translateX(-.18%) rotate(-.035deg); }
          100% { transform: scale(1.018) translateX(.18%) rotate(.035deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .via-cinematic-earth-image { animation: none; }
        }
      `}</style>
    </div>
  )
}
