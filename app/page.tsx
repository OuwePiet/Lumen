import ViaHomeEarth from "./via-home-earth"

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
    </main>
  )
}
