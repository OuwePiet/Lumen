import { NextRequest, NextResponse } from "next/server"

/** Public holiday data from Nager.Date, without API keys or paid plans. */
type Holiday = { date: string; localName: string; name: string; counties?: string[] | null; types?: string[] }
export async function GET(request: NextRequest) {
  const year = Number(request.nextUrl.searchParams.get("year"))
  const country = (request.nextUrl.searchParams.get("country") ?? "").toUpperCase()
  if (!Number.isInteger(year) || year < 1900 || year > 2100 || !/^[A-Z]{2}$/.test(country)) {
    return NextResponse.json({ error: "Invalid year or country" }, { status: 400 })
  }
  try {
    const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`, {
      next: { revalidate: 86400 },
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(9000),
    })
    if (!response.ok) return NextResponse.json({ holidays: [], available: false })
    const source: unknown = await response.json()
    if (!Array.isArray(source)) throw new Error("Unexpected response")
    const holidays = source.filter((entry): entry is Holiday => {
      if (!entry || typeof entry !== "object") return false
      const item = entry as Record<string, unknown>
      return typeof item.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item.date) && typeof item.name === "string" && typeof item.localName === "string"
    }).map(item => ({
      date: item.date, name: item.name.slice(0, 180), localName: item.localName.slice(0, 180),
      country, regions: Array.isArray(item.counties) ? item.counties.filter((v): v is string => typeof v === "string") : [],
      types: Array.isArray(item.types) ? item.types.filter((v): v is string => typeof v === "string") : [],
    }))
    return NextResponse.json({ holidays, available: true, source: "Nager.Date" }, { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } })
  } catch {
    return NextResponse.json({ holidays: [], available: false })
  }
}
