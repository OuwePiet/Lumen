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
    </main>
  )
}
