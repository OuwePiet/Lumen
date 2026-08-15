import NFTGrid from "./nft-grid"

export const dynamic = "force-dynamic"

type HomeProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams
  const account =
    typeof params.account === "string" ? params.account : undefined

  return <NFTGrid initialAccount={account} />
}
