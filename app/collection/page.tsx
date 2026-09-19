import "../home-wide.css"
import "../creator-nft-watermark.css"

import NFTGrid from "../nft-grid"
import ViaPriceBoard from "../via-price-board"
import ViaStoragePriceBoard from "../via-storage-price-board"
import CollectionHub from "./collection-hub"
import CreatorCollectionLocalizer from "./creator-collection-localizer"

export const dynamic = "force-dynamic"

export default function CollectionPage() {
  return (
    <div
      data-via-collection-page
      style={{
        minHeight: "100vh",
        overflow: "hidden",
        position: "relative",
        isolation: "isolate",
        backgroundColor: "#050807",
      }}
    >
      <CreatorCollectionLocalizer />

      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -2,
          pointerEvents: "none",
          backgroundImage: 'url("/via-nft-background-approved.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          pointerEvents: "none",
          background:
            "linear-gradient(180deg, rgba(3,7,5,.34) 0%, rgba(3,7,5,.50) 46%, rgba(3,7,5,.68) 100%)",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <CollectionHub />
        <NFTGrid />
        <div style={{ maxWidth: 1480, margin: "0 auto", padding: "0 20px 8px" }}>
          <ViaPriceBoard />
          <ViaStoragePriceBoard />
        </div>
      </div>
    </div>
  )
}
