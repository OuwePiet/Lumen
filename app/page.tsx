import Link from "next/link"
import ViaFeatured from "./via-featured"
import ViaHomeEarth from "./via-home-earth"

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
        paddingBottom: "38px",
      }}
      aria-label="VIA homepage review"
    >
      <ViaHomeEarth />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "18px",
          pointerEvents: "none",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#8fd4a9",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          ART · PEOPLE · IDEAS · CREATORS · COLLECTORS · COMMUNITIES · MUSICIANS
        </p>

        <h1
          style={{
            margin: "14px 20px 0",
            color: "#f4f7f5",
            fontSize: "clamp(28px, 4vw, 54px)",
            lineHeight: 1.08,
            fontWeight: 650,
            letterSpacing: "-0.025em",
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          A global space for creators, collectors and communities.
        </h1>
      </div>

      <section
        aria-label="VIA quick actions"
        style={{
          position: "relative",
          zIndex: 2,
          width: "min(1480px, calc(100% - 32px))",
          margin: "18px auto 0",
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
                border: "1px solid rgba(143,212,169,.34)",
                borderRadius: "999px",
                background: "rgba(3,10,6,.74)",
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
    </main>
  )
}
