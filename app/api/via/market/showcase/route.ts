import { NextResponse } from "next/server"
import { fetchDeSo } from "../../../../deso-api"
import { isViaSensitiveContent } from "../../../../../lib/via/sensitive-content"

export const dynamic = "force-dynamic"

type Collection = {
  ProfileEntryResponse?: { Username?: string }
  PostEntryResponse?: {
    PostHashHex?: string
    Body?: string
    ImageURLs?: string[]
    PostExtraData?: Record<string, unknown>
    ExtraData?: Record<string, unknown>
  }
  NumCopiesForSale?: number
  LowestBuyNowPriceNanos?: number | null
}

function safeImage(urls: unknown) {
  if (!Array.isArray(urls)) return ""
  return urls.find((url): url is string => {
    if (typeof url !== "string" || url.length > 4096) return false
    try {
      const parsed = new URL(url)
      return parsed.protocol === "https:" && !parsed.username && !parsed.password
    } catch {
      return false
    }
  }) ?? ""
}

export async function GET() {
  try {
    const response = await fetchDeSo("get-nft-showcase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ReaderPublicKeyBase58Check: "" }),
    })
    if (!response.ok) throw new Error("SOURCE_UNAVAILABLE")

    const data = await response.json() as { NFTCollections?: Collection[] }
    if (!Array.isArray(data.NFTCollections)) throw new Error("INVALID_SOURCE")

    const items = data.NFTCollections
      .filter((item) =>
        /^[a-f0-9]{64}$/i.test(item.PostEntryResponse?.PostHashHex ?? "") &&
        Number.isSafeInteger(item.NumCopiesForSale) &&
        item.NumCopiesForSale! > 0
      )
      .slice(0, 48)
      .map((item) => {
        const post = item.PostEntryResponse!
        const price = item.LowestBuyNowPriceNanos
        return {
          hash: post.PostHashHex!,
          title: (post.Body ?? "")
            .replace(/https?:\/\/(?:www\.)?nftz\.me\/\S+/gi, "")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 120) || "NFT",
          creator: typeof item.ProfileEntryResponse?.Username === "string"
            ? item.ProfileEntryResponse.Username.slice(0, 64)
            : "",
          image: isViaSensitiveContent(post.PostExtraData ?? post.ExtraData)
            ? ""
            : safeImage(post.ImageURLs),
          forSale: item.NumCopiesForSale!,
          buyNowNanos: typeof price === "number" && Number.isSafeInteger(price) && price >= 0
            ? price
            : null,
        }
      })

    return NextResponse.json(
      { ok: true, source: "deso-nft-showcase", checkedAt: Date.now(), items },
      { headers: { "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=120" } }
    )
  } catch {
    return NextResponse.json(
      { ok: false, error: "NFT_MARKET_UNAVAILABLE" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    )
  }
}
