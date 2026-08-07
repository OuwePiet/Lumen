import { notFound } from "next/navigation"
import NFTView from "../../nft-view"

export const dynamic = "force-dynamic"

type NFTPageProps = {
  params: Promise<{ postHash: string }>
}

export default async function NFTPage({ params }: NFTPageProps) {
  const { postHash } = await params

  if (!/^[0-9a-fA-F]{64}$/.test(postHash)) {
    notFound()
  }

  return <NFTView postHash={postHash.toLowerCase()} />
}
