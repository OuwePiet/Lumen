import { NextResponse } from "next/server"
import { searchPublicProfilesByPrefix } from "../../../../lib/via/deso-profile-read"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const prefix = (url.searchParams.get("prefix") ?? "").trim()

  if (!prefix || prefix.length > 64) {
    return NextResponse.json(
      { ok: false, error: "INVALID_PREFIX" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    )
  }

  try {
    const profiles = await searchPublicProfilesByPrefix(prefix, 8)
    return NextResponse.json(
      { ok: true, profiles },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=0, s-maxage=15, stale-while-revalidate=30",
        },
      },
    )
  } catch {
    return NextResponse.json(
      { ok: false, error: "PROFILE_SEARCH_UNAVAILABLE" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    )
  }
}
