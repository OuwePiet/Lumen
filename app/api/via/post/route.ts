import { NextResponse } from "next/server"
import { readPublicPostByHash } from "../../../../lib/via/deso-post-read"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const hash = (url.searchParams.get("hash") ?? "").trim().toLowerCase()

  if (!/^[0-9a-f]{64}$/.test(hash)) {
    return NextResponse.json({ ok: false, error: "INVALID_POST_HASH" }, { status: 400, headers: { "Cache-Control": "no-store" } })
  }

  try {
    const post = await readPublicPostByHash(hash)
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
