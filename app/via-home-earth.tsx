"use client"

export default function ViaHomeEarth() {
  return (
    <div aria-hidden="true" className="via-cinematic-earth">
      <div className="via-cinematic-earth-image" />
      <div className="via-cinematic-earth-shade" />
      <style jsx>{`
        .via-cinematic-earth {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
          background:
            radial-gradient(ellipse 72% 42% at 50% 28%, rgba(60, 112, 84, .11), transparent 70%),
            linear-gradient(180deg, #010403 0%, #020705 48%, #010302 100%);
        }
        .via-cinematic-earth-image {
          position: absolute;
          left: 50%;
          bottom: -14%;
          width: max(1440px, 112vw);
          height: min(790px, 64vw);
          min-height: 610px;
          transform: translateX(-50%) scale(1.035);
          transform-origin: 50% 74%;
          border-radius: 50% 50% 0 0 / 64% 64% 0 0;
          background-image:
            linear-gradient(180deg, rgba(0,0,0,.02) 0%, rgba(0,0,0,.06) 58%, rgba(0,0,0,.42) 100%),
            url('https://images.unsplash.com/photo-1614732414444-096e5f1122d5?auto=format&fit=crop&w=2400&q=88');
          background-position: center 58%;
          background-size: cover;
          filter: brightness(.73) contrast(1.18) saturate(.88) hue-rotate(15deg);
          box-shadow:
            0 -2px 18px rgba(143,212,169,.40),
            0 -8px 54px rgba(103,188,139,.18);
          animation: viaEarthDrift 1800s ease-in-out infinite alternate;
          will-change: transform, background-position;
        }
        .via-cinematic-earth-image::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          box-shadow: inset 0 16px 28px rgba(154,219,178,.12);
        }
        .via-cinematic-earth-shade {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 34% 18% at 50% 43%, rgba(228,245,213,.13), transparent 70%),
            linear-gradient(180deg, rgba(0,0,0,.03), rgba(0,0,0,0) 40%, rgba(0,4,2,.15) 76%, rgba(0,4,2,.82) 100%);
        }
        @keyframes viaEarthDrift {
          0% { transform: translateX(-50%) scale(1.035) rotate(-0.18deg); background-position: 49.4% 58%; }
          100% { transform: translateX(-50%) scale(1.035) rotate(0.18deg); background-position: 50.6% 58%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .via-cinematic-earth-image { animation: none; }
        }
        @media (max-width: 760px) {
          .via-cinematic-earth-image {
            width: 1320px;
            height: 680px;
            bottom: -8%;
          }
        }
      `}</style>
    </div>
  )
}
