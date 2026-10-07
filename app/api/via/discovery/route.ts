import { NextResponse } from "next/server"
import { readDiscoveryPosts } from "../../../../lib/via/deso-discovery-read"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const rawLimit = Number(url.searchParams.get("limit") ?? "20")
  const limit = Number.isFinite(rawLimit) ? rawLimit : 20
  const sortByNew = url.searchParams.get("sort") === "new"
  const reader = (url.searchParams.get("reader") ?? "").trim()
  const readerPublicKey = reader.startsWith("BC1") && reader.length <= 128 ? reader : ""
  const seenPosts = (url.searchParams.get("seen") ?? "")
    .split(",")
    .map((hash) => hash.trim())
    .filter((hash) => /^[0-9a-f]{64}$/i.test(hash))
    .slice(0, 100)

  try {
    const posts = await readDiscoveryPosts(limit, sortByNew, seenPosts, readerPublicKey)
    return NextResponse.json(
      {
        ok: true,
        posts,
        source: sortByNew ? "deso-new-feed" : "deso-hot-feed",
        ranking: sortByNew ? "newest-first" : "experimental",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=60",
        },
      },
    )
  } catch {
    return NextResponse.json(
      { ok: false, error: "DISCOVERY_READ_UNAVAILABLE" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    )
  }
}
