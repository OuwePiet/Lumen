import { NextResponse } from "next/server"
import { readPublicPosts } from "../../../../lib/via/deso-post-read"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const identity = (url.searchParams.get("identity") ?? "").trim()
  const requestedLimit = Number(url.searchParams.get("limit") ?? 20)

  if (!identity || identity.length > 128) {
    return NextResponse.json(
      { ok: false, error: "INVALID_IDENTITY" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    )
  }

  const limit = Number.isFinite(requestedLimit)
    ? Math.max(1, Math.min(50, Math.trunc(requestedLimit)))
    : 20

  try {
    const posts = await readPublicPosts(identity, limit)
    return NextResponse.json(
      { ok: true, posts },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=60",
        },
      },
    )
  } catch {
    return NextResponse.json(
      { ok: false, error: "POST_READ_UNAVAILABLE" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    )
  }
}
