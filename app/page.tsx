import Link from "next/link"
import ViaFeatured from "./via-featured"
import ViaHomeControls from "./via-home-controls"
import ViaHomeEarth from "./via-home-earth"
import ViaSeasonal from "./via-seasonal"
import ViaWorldClock from "./via-world-clock"

export default function Home() {
  return (
    <>
      <style>{`
        body:has(> .via-home-free-earth) > header { display: none !important; }
        body:has(> .via-home-free-earth) { margin: 0; background: #000; }
      `}</style>
      <main
        className="via-home-free-earth"
        style={{
          position: "relative",
          minHeight: "100vh",
          overflow: "hidden",
          background: "#000",
        }}
        aria-label="VIA homepage"
      >
        <ViaHomeEarth />
        <ViaSeasonal />
        <ViaHomeControls />

        <Link
          href="/ideas"
          aria-label="Open VIA Ideas Box"
          style={{
            position: "absolute",
            zIndex: 5,
            top: "34px",
            left: "50%",
            transform: "translateX(-50%)",
            minHeight: "42px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px 18px",
            border: "1px solid rgba(143,212,169,.58)",
            borderRadius: "999px",
            background: "rgba(4,18,10,.80)",
            color: "#b9ffd4",
            textDecoration: "none",
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            backdropFilter: "blur(10px)",
            boxShadow: "0 0 24px rgba(82,177,118,.16)",
            whiteSpace: "nowrap",
          }}
        >
          Ideeënbus
        </Link>

        <Link
          href="/storage"
          aria-label="Open VIA external storage"
          style={{
            position: "absolute",
            zIndex: 5,
            top: "86px",
            left: "50%",
            transform: "translateX(-50%)",
            minHeight: "38px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px 16px",
            border: "1px solid rgba(143,212,169,.34)",
            borderRadius: "999px",
            background: "rgba(3,12,7,.72)",
            color: "#9adbb2",
            textDecoration: "none",
            fontSize: "11px",
            fontWeight: 750,
            letterSpacing: ".06em",
            textTransform: "uppercase",
            backdropFilter: "blur(9px)",
            whiteSpace: "nowrap",
          }}
        >
          Externe opslag
        </Link>

        <ViaFeatured />
        <ViaWorldClock />
      </main>
    </>
  )
}
