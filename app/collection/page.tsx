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
        backgroundColor: "#050807",
        backgroundImage:
          'linear-gradient(180deg, rgba(2,7,4,.42) 0%, rgba(3,9,6,.54) 42%, rgba(5,8,7,.66) 100%), radial-gradient(circle at 52% 18%, rgba(28,92,55,.16), transparent 48%), url("/via-nft-background-approved.jpg")',
        backgroundSize: "cover, cover, cover",
        backgroundPosition: "center top, center top, center top",
        backgroundRepeat: "no-repeat",
      }}
    >
      <CreatorCollectionLocalizer />

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
