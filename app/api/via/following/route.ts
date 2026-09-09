import { NextResponse } from "next/server"
import { readFollowingPosts } from "../../../../lib/via/deso-following-read"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const identity = (url.searchParams.get("identity") ?? "").trim()

  if (!identity || identity.length > 128) {
    return NextResponse.json(
      { ok: false, error: "INVALID_IDENTITY" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    )
  }

  try {
    const posts = await readFollowingPosts(identity)
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
      { ok: false, error: "FOLLOWING_READ_UNAVAILABLE" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    )
  }
}
