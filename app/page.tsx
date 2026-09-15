import Link from "next/link"
import ViaFeatured from "./via-featured"
import ViaHomeEarth from "./via-home-earth"
import ViaSeasonal from "./via-seasonal"
import ViaWorldClock from "./via-world-clock"

const homeActions = [
  ["Explore NFTs", "/collection"],
  ["Join the Community", "/communities"],
  ["Create a Post", "/social"],
  ["Go Live", "/live"],
] as const

export default function Home() {
  return (
    <main
      style={{
        position: "relative",
        minHeight: "calc(100vh - 130px)",
        overflow: "hidden",
        background: "#000",
        paddingBottom: "34px",
      }}
      aria-label="VIA homepage review"
    >
      <ViaHomeEarth />
      <ViaSeasonal />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          justifyContent: "center",
          padding: "18px 18px 2px",
          pointerEvents: "none",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#8fd4a9",
            fontSize: "clamp(11px, 1.05vw, 13px)",
            fontWeight: 750,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            textAlign: "center",
            lineHeight: 1.7,
          }}
        >
          ART · PEOPLE · IDEAS · CREATORS · COLLECTORS · COMMUNITIES · MUSICIANS
        </p>
      </div>

      <section
        aria-label="VIA quick actions"
        style={{
          position: "relative",
          zIndex: 2,
          width: "min(1480px, calc(100% - 32px))",
          margin: "14px auto 0",
          display: "grid",
          gridTemplateColumns: "260px minmax(0,1fr)",
          columnGap: "18px",
        }}
      >
        <nav
          aria-label="VIA direct actions"
          style={{
            gridColumn: "1",
            display: "grid",
            gap: "9px",
            width: "100%",
          }}
        >
          {homeActions.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              style={{
                minHeight: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px 16px",
                border: "1px solid rgba(143,212,169,.28)",
                borderRadius: "999px",
                background: "rgba(3,10,6,.66)",
                backdropFilter: "blur(8px)",
                color: "#e1eae5",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: ".02em",
              }}
            >
              {label}
            </Link>
          ))}
        </nav>
      </section>

      <ViaFeatured />
      <ViaWorldClock />
    </main>
  )
}
