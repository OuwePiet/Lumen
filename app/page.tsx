import NFTGrid from "./nft-grid"
import ViaHomeEarth from "./via-home-earth"
import ViaHomeSignature from "./via-home-signature"

export const dynamic = "force-dynamic"

type HomeProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams
  const account =
    typeof params.account === "string" ? params.account : undefined

  return (
    <div
      style={{
        minHeight: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <ViaHomeSignature />
      <ViaHomeEarth />
      <div style={{ position: "relative", zIndex: 1 }}>
        <NFTGrid initialAccount={account} />
      </div>
    </div>
  )
}
