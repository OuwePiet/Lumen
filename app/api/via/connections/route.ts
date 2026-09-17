import { NextResponse } from "next/server"
import { readConnections } from "../../../../lib/via/deso-connections-read"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const identity = (url.searchParams.get("identity") ?? "").trim()
  const mode = (url.searchParams.get("mode") ?? "followers").trim()
  const limitValue = Number(url.searchParams.get("limit") ?? "50")

  if (!identity || identity.length > 128) {
    return NextResponse.json(
      { ok: false, error: "INVALID_IDENTITY" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    )
  }

  if (mode !== "followers" && mode !== "following") {
    return NextResponse.json(
      { ok: false, error: "INVALID_MODE" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    )
  }

  const limit = Number.isFinite(limitValue)
    ? Math.max(1, Math.min(100, Math.trunc(limitValue)))
    : 50

  try {
    const result = await readConnections(identity, mode, limit)
    return NextResponse.json(
      { ok: true, mode, ...result },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=60",
        },
      },
    )
  } catch {
    return NextResponse.json(
      { ok: false, error: "CONNECTIONS_READ_UNAVAILABLE" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    )
  }
}
