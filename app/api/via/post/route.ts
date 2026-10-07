import { NextResponse } from "next/server"
import { readPublicPostByHash, readPublicPostComments } from "../../../../lib/via/deso-post-read"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const hash = (url.searchParams.get("hash") ?? "").trim().toLowerCase()
  const reader = (url.searchParams.get("reader") ?? "").trim()

  if (!/^[0-9a-f]{64}$/.test(hash)) {
    return NextResponse.json({ ok: false, error: "INVALID_POST_HASH" }, { status: 400, headers: { "Cache-Control": "no-store" } })
  }

  try {
    if (url.searchParams.has("comments")) {
      const offset = Math.max(0, Math.min(10000, Number(url.searchParams.get("offset") || 0) || 0))
      const comments = await readPublicPostComments(hash, offset, 20, reader)
      if (comments === null) return NextResponse.json({ ok: false, error: "COMMENTS_UNAVAILABLE" }, { status: 503, headers: { "Cache-Control": "no-store" } })
      return NextResponse.json({ ok: true, comments }, { headers: { "Cache-Control": "no-store" } })
    }
    const post = await readPublicPostByHash(hash, reader)
    if (!post) {
      return NextResponse.json({ ok: false, error: "POST_NOT_FOUND" }, { status: 404, headers: { "Cache-Control": "no-store" } })
    }
    return NextResponse.json({ ok: true, post }, {
      status: 200,
      headers: { "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=60" },
    })
  } catch {
    return NextResponse.json({ ok: false, error: "POST_READ_UNAVAILABLE" }, { status: 503, headers: { "Cache-Control": "no-store" } })
  }
}
