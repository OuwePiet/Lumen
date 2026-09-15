"use client"

export default function ViaHomeEarth() {
  return (
    <div aria-hidden="true" className="via-cinematic-earth">
      <div className="via-cinematic-earth-image" />
      <div className="via-cinematic-earth-atmosphere" />
      <style jsx>{`
        .via-cinematic-earth {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
          background:
            radial-gradient(ellipse 60% 30% at 72% 22%, rgba(42, 91, 67, .14), transparent 72%),
            linear-gradient(180deg, #010403 0%, #020705 52%, #010302 100%);
        }

        .via-cinematic-earth-image {
          position: absolute;
          left: 50%;
          top: 14%;
          width: min(100vw, 1540px);
          aspect-ratio: 1672 / 941;
          transform: translateX(-50%) scale(1.03);
          transform-origin: 50% 70%;
          background: url('/via-earth-home.webp') center center / cover no-repeat;
          filter: brightness(.93) contrast(1.07) saturate(.92);
          opacity: .98;
          animation: viaEarthDrift 1800s ease-in-out infinite alternate;
          will-change: transform;
        }

        .via-cinematic-earth-image::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(1,4,3,.18) 0%, rgba(1,4,3,0) 22%, rgba(1,4,3,0) 72%, rgba(1,4,3,.24) 100%);
        }

        .via-cinematic-earth-atmosphere {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 22% 9% at 50% 31%, rgba(255,235,170,.15), transparent 72%),
            linear-gradient(180deg, rgba(1,4,3,.05) 0%, rgba(1,4,3,0) 63%, rgba(1,4,3,.28) 100%);
        }

        @keyframes viaEarthDrift {
          0% { transform: translateX(-50%) scale(1.03) translateX(-.18%) rotate(-.04deg); }
          100% { transform: translateX(-50%) scale(1.03) translateX(.18%) rotate(.04deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .via-cinematic-earth-image { animation: none; }
        }

        @media (max-width: 900px) {
          .via-cinematic-earth-image {
            top: 20%;
            width: 1260px;
            max-width: none;
          }
        }
      `}</style>
    </div>
  )
}
