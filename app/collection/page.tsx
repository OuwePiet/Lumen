import "../home-wide.css"

import NFTGrid from "../nft-grid"
import ViaPriceBoard from "../via-price-board"
import ViaStoragePriceBoard from "../via-storage-price-board"

export const dynamic = "force-dynamic"

type CollectionPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CollectionPage({ searchParams }: CollectionPageProps) {
  const params = await searchParams
  const account = typeof params.account === "string" ? params.account : undefined

  return (
    <div style={{ minHeight: "100vh", overflow: "hidden", position: "relative", background: "#050807" }}>
      <div style={{ position: "relative", zIndex: 1 }}>
        <NFTGrid initialAccount={account} />
        <div style={{ maxWidth: 1480, margin: "0 auto", padding: "0 20px 8px" }}>
          <ViaPriceBoard />
          <ViaStoragePriceBoard />
        </div>
      </div>
    </div>
  )
}
