import ViaFeatured from "./via-featured"
import ViaHomeCenterActions from "./via-home-center-actions"
import ViaHomeControls from "./via-home-controls"
import ViaHomeEarth from "./via-home-earth"
import ViaSeasonal from "./via-seasonal"
import ViaWorldClock from "./via-world-clock"
import { getFeaturedCities } from "./api/via/featured-cities/route"

export default async function Home() {
  const featured = await getFeaturedCities()
  return (
    <>
      <style>{`
        body:has(> .via-home-free-earth) > header { display: none !important; }
        body:has(> .via-home-free-earth) { margin: 0; background: #000; }
        .via-home-iphone-clock-slot { display: none; }
        @media (max-width: 600px) {
          .via-home-iphone-clock-slot { display: block; position: relative; z-index: 4; }
          .via-home-standard-clock-slot { display: none; }
          .via-home-iphone-clock-slot .via-home-nasa-source { display: none !important; }
        }
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
        <div className="via-home-iphone-clock-slot"><ViaWorldClock /></div>
        <ViaHomeControls />
        <ViaHomeCenterActions />
        <ViaFeatured initialItems={featured.items} />
        <div className="via-home-standard-clock-slot"><ViaWorldClock /></div>
      </main>
    </>
  )
}
