import ViaFeatured from "./via-featured"
import ViaHomeControls from "./via-home-controls"
import ViaHomeEarth from "./via-home-earth"
import ViaSeasonal from "./via-seasonal"
import ViaWorldClock from "./via-world-clock"

export default function Home() {
  return (
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
      <ViaFeatured />
      <ViaWorldClock />
    </main>
  )
}
