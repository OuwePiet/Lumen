import { NextResponse } from "next/server"
import { readDiscoveryPosts } from "../../../../lib/via/deso-discovery-read"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const rawLimit = Number(url.searchParams.get("limit") ?? "20")
  const limit = Number.isFinite(rawLimit) ? rawLimit : 20

  try {
    const posts = await readDiscoveryPosts(limit)
    return NextResponse.json(
      { ok: true, posts, source: "deso-hot-feed", ranking: "experimental" },
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
