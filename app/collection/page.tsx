import "../home-wide.css"
import "../creator-nft-watermark.css"

import NFTGrid from "../nft-grid"
import ViaPriceBoard from "../via-price-board"
import ViaStoragePriceBoard from "../via-storage-price-board"
import CreatorCollectionLocalizer from "./creator-collection-localizer"

export const dynamic = "force-dynamic"

export default function CollectionPage() {
  return (
    <div data-via-collection-page style={{ minHeight: "100vh", overflow: "hidden", position: "relative", background: "#050807" }}>
      <CreatorCollectionLocalizer />
      <div style={{ position: "relative", zIndex: 1 }}>
        <NFTGrid />
        <div style={{ maxWidth: 1480, margin: "0 auto", padding: "0 20px 8px" }}>
          <ViaPriceBoard />
          <ViaStoragePriceBoard />
        </div>
      </div>
    </div>
  )
}
