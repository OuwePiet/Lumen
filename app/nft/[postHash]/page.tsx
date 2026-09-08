import { notFound } from "next/navigation"
import NFTView from "../../nft-view"

export const dynamic = "force-dynamic"

type NFTPageProps = {
  params: Promise<{ postHash: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const SORT_VALUES = new Set([
  "collection",
  "title",
  "most-owned",
  "fewest-owned",
  "lowest-price",
  "highest-price",
])
const SALE_VALUES = new Set(["all", "for-sale", "not-for-sale"])
const MEDIA_VALUES = new Set(["all", "image", "video", "audio", "unavailable"])

function safeText(value: unknown, maxLength: number) {
  return typeof value === "string" && value.length > 0 && value.length <= maxLength
    ? value
    : undefined
}

export default async function NFTPage({ params, searchParams }: NFTPageProps) {
  const { postHash } = await params
  const context = await searchParams

  if (!/^[0-9a-fA-F]{64}$/.test(postHash)) {
    notFound()
  }

  const returnParams = new URLSearchParams()
  const account = safeText(context.account, 64)
  const accountKey = safeText(context.accountKey, 128)
  const query = safeText(context.query, 200)
  const view = context.view === "nfts" ? "nfts" : undefined
  const sort =
    typeof context.sort === "string" && SORT_VALUES.has(context.sort)
      ? context.sort
      : undefined
  const sale =
    typeof context.sale === "string" && SALE_VALUES.has(context.sale)
      ? context.sale
      : undefined
  const media =
    typeof context.media === "string" && MEDIA_VALUES.has(context.media)
      ? context.media
      : undefined

  if (account) returnParams.set("account", account)
  if (accountKey) returnParams.set("accountKey", accountKey)
  if (view) returnParams.set("view", view)
  if (query) returnParams.set("query", query)
  if (sort) returnParams.set("sort", sort)
  if (sale) returnParams.set("sale", sale)
  if (media) returnParams.set("media", media)

  const backHref = account
    ? `/?${returnParams.toString()}#account-lookup-heading`
    : "/"

  return <NFTView postHash={postHash.toLowerCase()} backHref={backHref} />
}
