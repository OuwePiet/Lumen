"use client"

export default function ViaHomeEarth() {
  return (
    <div aria-hidden="true" className="via-cinematic-earth">
      <div className="via-cinematic-earth-stars" />
      <div className="via-cinematic-earth-orb">
        <div className="via-cinematic-earth-photo" />
      </div>
      <div className="via-cinematic-earth-dawn" />
      <div className="via-cinematic-earth-shade" />
      <style jsx>{`
        .via-cinematic-earth {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
          background:
            radial-gradient(ellipse 56% 28% at 52% 28%, rgba(64,118,89,.13), transparent 72%),
            radial-gradient(ellipse 70% 48% at 78% 18%, rgba(40,90,67,.10), transparent 75%),
            linear-gradient(180deg, #010403 0%, #020705 47%, #010302 100%);
        }

        .via-cinematic-earth-stars {
          position: absolute;
          inset: 0;
          opacity: .58;
          background-image:
            radial-gradient(circle at 8% 22%, rgba(255,255,255,.75) 0 1px, transparent 1.6px),
            radial-gradient(circle at 18% 34%, rgba(255,255,255,.46) 0 1px, transparent 1.4px),
            radial-gradient(circle at 71% 16%, rgba(255,255,255,.72) 0 1px, transparent 1.5px),
            radial-gradient(circle at 84% 28%, rgba(180,226,199,.66) 0 1px, transparent 1.5px),
            radial-gradient(circle at 94% 12%, rgba(255,255,255,.48) 0 1px, transparent 1.4px);
        }

        .via-cinematic-earth-orb {
          position: absolute;
          left: 50%;
          bottom: -33%;
          width: max(1480px, 118vw);
          height: max(820px, 67vw);
          transform: translateX(-50%);
          border-radius: 50% 50% 0 0 / 64% 64% 0 0;
          overflow: hidden;
          background: #020504;
          box-shadow:
            0 -2px 13px rgba(175,235,200,.62),
            0 -10px 46px rgba(94,191,133,.27),
            0 -24px 100px rgba(79,161,112,.10);
        }

        .via-cinematic-earth-photo {
          position: absolute;
          inset: -4% -3% 0;
          background-image:
            linear-gradient(180deg, rgba(0,0,0,.18) 0%, rgba(0,0,0,.08) 35%, rgba(0,0,0,.30) 100%),
            url('https://science.nasa.gov/wp-content/uploads/2023/06/iss070e075895-lrg.jpg');
          background-repeat: no-repeat;
          background-size: cover;
          background-position: 50% 43%;
          filter: brightness(.84) contrast(1.18) saturate(.86) sepia(.08) hue-rotate(12deg);
          transform: scale(1.045) rotate(-.12deg);
          transform-origin: 50% 68%;
          animation: viaEarthDrift 2100s ease-in-out infinite alternate;
          will-change: transform, background-position;
        }

        .via-cinematic-earth-dawn {
          position: absolute;
          left: 50%;
          top: 36.5%;
          width: 310px;
          height: 120px;
          transform: translateX(-50%);
          background: radial-gradient(ellipse at center, rgba(255,247,210,.54) 0%, rgba(195,236,196,.26) 24%, rgba(109,204,146,.09) 48%, transparent 73%);
          filter: blur(7px);
          opacity: .83;
        }

        .via-cinematic-earth-shade {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(0,0,0,.02) 0%, rgba(0,0,0,0) 34%, rgba(0,4,2,.06) 63%, rgba(0,4,2,.54) 100%),
            radial-gradient(ellipse 85% 56% at 50% 74%, transparent 55%, rgba(0,3,2,.30) 100%);
        }

        @keyframes viaEarthDrift {
          0% {
            transform: scale(1.045) rotate(-.12deg);
            background-position: 49.6% 43%;
          }
          100% {
            transform: scale(1.045) rotate(.12deg);
            background-position: 50.4% 43%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .via-cinematic-earth-photo { animation: none; }
        }

        @media (max-width: 900px) {
          .via-cinematic-earth-orb {
            width: 1500px;
            height: 840px;
            bottom: -27%;
          }
          .via-cinematic-earth-dawn { top: 38%; }
        }

        @media (max-width: 640px) {
          .via-cinematic-earth-orb {
            width: 1320px;
            height: 760px;
            bottom: -19%;
          }
          .via-cinematic-earth-photo { background-position: 51% 43%; }
          .via-cinematic-earth-dawn { top: 41%; }
        }
      `}</style>
    </div>
  )
}
