import NFTView from "./nft-view"

const EXAMPLE_POST_HASH =
  "000929e4490e3f744a7c889738d3aef52397ac72af906e5cd473bde710b49111"

export const dynamic = "force-dynamic"

export default function Home() {
  return <NFTView postHash={EXAMPLE_POST_HASH} />
}
