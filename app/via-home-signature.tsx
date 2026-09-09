export default function ViaHomeSignature() {
  return (
    <div
      aria-hidden="true"
      style={{
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        position: "absolute",
        zIndex: 0,
      }}
    >
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMin slice"
        style={{
          height: "min(92vh, 900px)",
          left: "50%",
          maxWidth: "1800px",
          minHeight: "520px",
          opacity: 0.22,
          position: "absolute",
          top: "24px",
          transform: "translateX(-50%)",
          width: "112vw",
        }}
      >
        <g
          fill="none"
          stroke="rgba(67, 110, 84, 0.34)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        >
          <path d="M120 155 L520 770 L745 360" />
          <path d="M800 190 L800 755" />
          <path d="M880 760 L1165 150 L1480 760" />
          <path d="M1010 500 L1350 500" />
        </g>
      </svg>
    </div>
  )
}
