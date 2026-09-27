import type { Metadata } from "next"
import "../home-wide.css"
import "../creator-nft-watermark.css"

export const metadata: Metadata = {
  title: "NF.VIA",
  description: "Create, collect and discover DeSo NFTs on VIA.",
}

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
      className="nf-via-page"
      style={{
        minHeight: "100vh",
        overflow: "hidden",
        position: "relative",
        isolation: "isolate",
        background: "linear-gradient(180deg, #0b0d0c 0%, #070908 55%, #050605 100%)",
      }}
    >
      <CreatorCollectionLocalizer />

      <div aria-hidden="true" className="nf-via-screenprint">
        <span>VIA</span>
      </div>

      <div style={{ position: "relative", zIndex: 2 }}>
        <CollectionHub />
        <NFTGrid />
        <div style={{ maxWidth: 1480, margin: "0 auto", padding: "0 20px 8px" }}>
          <ViaPriceBoard />
          <ViaStoragePriceBoard />
        </div>
      </div>

      <style>{`
        .nf-via-screenprint {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: clamp(86px, 12vh, 150px);
          opacity: .055;
        }
        .nf-via-screenprint span {
          color: #d9dedb;
          font-family: Arial Black, Arial, sans-serif;
          font-size: clamp(190px, 43vw, 690px);
          font-weight: 900;
          letter-spacing: -.12em;
          line-height: .8;
          transform: translateX(-.04em) scaleY(1.08);
          user-select: none;
        }
        @media (max-width: 720px) {
          .nf-via-screenprint {
            padding-top: 132px;
            justify-content: flex-start;
            opacity: .06;
          }
          .nf-via-screenprint span {
            font-size: 72vw;
            transform: translateX(-14vw) scaleY(1.12);
          }
        }
      `}</style>
    </div>
  )
}
