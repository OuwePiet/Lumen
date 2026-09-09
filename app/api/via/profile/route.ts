import { NextResponse } from "next/server"
import { readPublicProfile } from "../../../../lib/via/deso-profile-read"

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
    const profile = await readPublicProfile(identity)

    if (!profile) {
      return NextResponse.json(
        { ok: false, error: "PROFILE_NOT_FOUND" },
        { status: 404, headers: { "Cache-Control": "no-store" } },
      )
    }

    return NextResponse.json(
      { ok: true, profile },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=120",
        },
      },
    )
  } catch {
    return NextResponse.json(
      { ok: false, error: "PROFILE_READ_UNAVAILABLE" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    )
  }
}
