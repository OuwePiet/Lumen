import Link from "next/link"
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
      }}
      aria-label="VIA homepage review"
    >
      <ViaHomeEarth />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          justifyContent: "center",
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
      </div>

      <section
        aria-label="VIA quick actions"
        style={{
          position: "relative",
          zIndex: 2,
          width: "min(340px, calc(100% - 40px))",
          marginLeft: "clamp(20px, 5vw, 78px)",
          marginTop: "18px",
        }}
      >
        <img
          src="/via-logo.svg"
          alt="VIA"
          style={{
            display: "block",
            width: "auto",
            height: "130px",
            maxWidth: "100%",
            objectFit: "contain",
            objectPosition: "left center",
          }}
        />

        <nav
          aria-label="VIA direct actions"
          style={{
            display: "grid",
            gap: "9px",
            width: "min(270px, 100%)",
            marginTop: "14px",
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
    </main>
  )
}
