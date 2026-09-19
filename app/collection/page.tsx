import "../home-wide.css"
import "../creator-nft-watermark.css"

import Link from "next/link"
import NFTGrid from "../nft-grid"
import ViaPriceBoard from "../via-price-board"
import ViaStoragePriceBoard from "../via-storage-price-board"
import CreatorCollectionLocalizer from "./creator-collection-localizer"

export const dynamic = "force-dynamic"

const hubLink = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: 38,
  padding: "8px 12px",
  border: "1px solid rgba(143,212,169,.28)",
  borderRadius: 11,
  color: "#b9e8c9",
  background: "rgba(4,12,7,.72)",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 700,
} as const

export default function CollectionPage() {
  return (
    <div data-via-collection-page style={{ minHeight: "100vh", overflow: "hidden", position: "relative", background: "#050807" }}>
      <CreatorCollectionLocalizer />

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "0 0 auto 0",
          height: "min(920px, 100vh)",
          backgroundImage: 'url("/via-nft-background-approved.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          opacity: 0.72,
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(2,7,4,.34) 0%, rgba(3,9,6,.58) 34%, rgba(5,8,7,.92) 78%, #050807 100%), radial-gradient(circle at 50% 18%, rgba(25,78,48,.14), transparent 46%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <section style={{ maxWidth: 1480, margin: "0 auto", padding: "22px 20px 4px" }} aria-label="NFT hub">
          <div style={{ border: "1px solid rgba(143,212,169,.24)", borderRadius: 16, background: "rgba(5,16,10,.74)", backdropFilter: "blur(5px)", padding: 16 }}>
            <p style={{ margin: 0, color: "#8fd4a9", fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase" }}>VIA · NFT hub</p>
            <h1 style={{ margin: "7px 0 5px", color: "#f1f6f3", fontSize: "clamp(24px,4vw,34px)", lineHeight: 1.08 }}>Everything NFT in one place</h1>
            <p style={{ margin: "0 0 14px", color: "#b3beb8", fontSize: 14, lineHeight: 1.55 }}>Browse collections, create and mint, buy or sell, manage bids and follow transfers without separate homepage groups.</p>
            <nav style={{ display: "flex", flexWrap: "wrap", gap: 8 }} aria-label="NFT sections">
              <a href="#collection-controls" style={hubLink}>Collection</a>
              <Link href="/studio#mint-nft" style={hubLink}>Create & Mint</Link>
              <Link href="/market" style={hubLink}>Market</Link>
              <Link href="/market/received-bids" style={hubLink}>Received Bids</Link>
              <Link href="/market/my-bids" style={hubLink}>My Bids</Link>
            </nav>
          </div>
        </section>
        <NFTGrid />
        <div style={{ maxWidth: 1480, margin: "0 auto", padding: "0 20px 8px" }}>
          <ViaPriceBoard />
          <ViaStoragePriceBoard />
        </div>
      </div>
    </div>
  )
}
