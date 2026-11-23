import { NextResponse } from "next/server"
import coverage from "../../../wereldspiegel/geo-coverage.generated.json"

// @OuwePiet 2026. Shared calendar/newspaper geographic inventory.
// This describes searchable GEO areas, not verified news coverage.
export function GET() {
  return NextResponse.json({
    status: "ready",
    countryCount: coverage.countryCount,
    placeCount: coverage.placeCount,
    countries: coverage.countries,
    distinction: "geo-index-only-not-news-coverage",
  }, { headers: { "Cache-Control": "public, max-age=0, s-maxage=86400" } })
}
