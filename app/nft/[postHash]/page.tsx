import { notFound } from "next/navigation"
import NFTView from "../../nft-view"

export const dynamic = "force-dynamic"

type NFTPageProps = {
  params: Promise<{ postHash: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function NFTPage({ params, searchParams }: NFTPageProps) {
  const { postHash } = await params
  const context = await searchParams

  if (!/^[0-9a-fA-F]{64}$/.test(postHash)) {
    notFound()
  }

  const returnParams = new URLSearchParams()
  for (const key of ["account", "accountKey", "view", "query", "sort", "sale", "media"]) {
    const value = context[key]
    if (typeof value === "string" && value) {
      returnParams.set(key, value)
    }
  }

  const backHref = returnParams.has("account")
    ? `/?${returnParams.toString()}#account-lookup-heading`
    : "/"

  return (
    <NFTView postHash={postHash.toLowerCase()} backHref={backHref} />
  )
}
