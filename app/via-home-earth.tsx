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
            radial-gradient(ellipse 62% 30% at 72% 21%, rgba(52, 103, 77, .12), transparent 74%),
            linear-gradient(180deg, #010403 0%, #020705 54%, #010302 100%);
        }

        .via-cinematic-earth-image {
          position: absolute;
          left: 50%;
          top: 7%;
          width: min(100vw, 1540px);
          aspect-ratio: 1672 / 941;
          transform: translateX(-50%) scale(1.005);
          transform-origin: 50% 67%;
          background: url('/via-earth-home.webp') center 47% / cover no-repeat;
          filter: brightness(.97) contrast(1.05) saturate(.96);
          opacity: .99;
          animation: viaEarthDrift 240s ease-in-out infinite alternate;
          will-change: transform, background-position;
        }

        .via-cinematic-earth-image::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(1,4,3,.08) 0%, rgba(1,4,3,0) 20%, rgba(1,4,3,0) 76%, rgba(1,4,3,.18) 100%);
        }

        .via-cinematic-earth-atmosphere {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 20% 8% at 50% 29%, rgba(255,231,158,.10), transparent 72%),
            linear-gradient(180deg, rgba(1,4,3,.03) 0%, rgba(1,4,3,0) 66%, rgba(1,4,3,.20) 100%);
        }

        @keyframes viaEarthDrift {
          0% {
            transform: translateX(-50%) scale(1.005) translateX(-.32%) rotate(-.055deg);
            background-position: 49.6% 47%;
          }
          100% {
            transform: translateX(-50%) scale(1.005) translateX(.32%) rotate(.055deg);
            background-position: 50.4% 47%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .via-cinematic-earth-image { animation: none; }
        }

        @media (max-width: 900px) {
          .via-cinematic-earth-image {
            top: 13%;
            width: 1260px;
            max-width: none;
          }
        }
      `}</style>
    </div>
  )
}
