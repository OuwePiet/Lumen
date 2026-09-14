export default function ViaHomeEarth() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        right: "clamp(-150px, -8vw, -40px)",
        top: "clamp(110px, 17vw, 220px)",
        width: "clamp(280px, 38vw, 620px)",
        aspectRatio: "1",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.38,
      }}
    >
      <svg viewBox="0 0 600 600" width="100%" height="100%" role="presentation">
        <defs>
          <radialGradient id="viaEarthShade" cx="34%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#183127" stopOpacity="0.58" />
            <stop offset="58%" stopColor="#0b1713" stopOpacity="0.44" />
            <stop offset="100%" stopColor="#020504" stopOpacity="0.12" />
          </radialGradient>
          <clipPath id="viaEarthClip">
            <circle cx="300" cy="300" r="228" />
          </clipPath>
        </defs>
        <circle cx="300" cy="300" r="228" fill="url(#viaEarthShade)" stroke="#35594a" strokeOpacity="0.34" strokeWidth="1.2" />
        <g clipPath="url(#viaEarthClip)" fill="none" stroke="#4b7462" strokeOpacity="0.2" strokeWidth="1">
          <ellipse cx="300" cy="300" rx="228" ry="72" />
          <ellipse cx="300" cy="300" rx="228" ry="142" />
          <ellipse cx="300" cy="300" rx="86" ry="228" />
          <ellipse cx="300" cy="300" rx="158" ry="228" />
          <path d="M72 300h456" />
          <path d="M168 153c36-30 70-43 104-39 28 4 45 23 71 30 25 7 49 0 75 12 24 11 37 32 45 57-25 8-49 17-63 39-15 24-10 54-29 75-17 19-44 23-61 42-20 22-23 54-39 79-17-18-30-40-38-65-9-27-10-57-26-81-14-21-39-33-49-52-21-25-22-61 10-97Z" />
          <path d="M342 120c26 17 44 38 58 64 13 25 13 54 30 77 16 21 44 32 56 56-10 33-27 64-51 90-24-8-48-15-65-35-17-21-21-50-39-70-15-17-37-27-46-49-12-29 2-59 17-84 12-20 24-35 40-49Z" />
        </g>
      </svg>
    </div>
  )
}
