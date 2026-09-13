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
  const shown =
    typeof context.shown === "string" &&
    /^\d{1,4}$/.test(context.shown) &&
    Number(context.shown) >= 25 &&
    Number(context.shown) <= 1000
      ? context.shown
      : undefined

  if (account) returnParams.set("account", account)
  if (accountKey) returnParams.set("accountKey", accountKey)
  if (view) returnParams.set("view", view)
  if (query) returnParams.set("query", query)
  if (sort) returnParams.set("sort", sort)
  if (sale) returnParams.set("sale", sale)
  if (media) returnParams.set("media", media)
  if (shown) returnParams.set("shown", shown)

  const returnTo =
    context.returnTo === "market" ||
    context.returnTo === "received-bids" ||
    context.returnTo === "my-bids"
      ? context.returnTo
      : undefined
  const marketPublicKey = safeText(context.publicKey, 128)

  const marketBack =
    returnTo && marketPublicKey
      ? returnTo === "received-bids"
        ? `/market/received-bids?publicKey=${encodeURIComponent(marketPublicKey)}`
        : returnTo === "my-bids"
          ? `/market/my-bids?publicKey=${encodeURIComponent(marketPublicKey)}`
          : `/market?publicKey=${encodeURIComponent(marketPublicKey)}`
      : undefined

  const hasVerifiedAccountContext = Boolean(account && accountKey)
  const backHref = marketBack ?? (hasVerifiedAccountContext
    ? `/?${returnParams.toString()}#collection-controls`
    : account
      ? `/?account=${encodeURIComponent(account)}#account-lookup-heading`
      : "/#account-lookup-heading")
  const backLabel = marketBack
    ? returnTo === "received-bids"
      ? "Back to received bids"
      : returnTo === "my-bids"
        ? "Back to my bids"
        : "Back to market"
    : "Back to collection"

  return <NFTView postHash={postHash.toLowerCase()} backHref={backHref} backLabel={backLabel} />
}
