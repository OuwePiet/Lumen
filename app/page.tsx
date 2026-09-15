import ViaHomeEarth from "./via-home-earth"

export default function Home() {
  return (
    <main
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        overflow: "hidden",
        background: "#010403",
      }}
      aria-label="VIA homepage background review"
    >
      <ViaHomeEarth />
    </main>
  )
}
