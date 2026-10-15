import { NextRequest, NextResponse } from "next/server"
import { VIA_CALENDAR_REGIONS } from "../../via-calendar-regions"

/** Public holiday data from Nager.Date, without API keys or paid plans. */
type Holiday = { date: string; localName: string; name: string; counties?: string[] | null; types?: string[] }
export async function GET(request: NextRequest) {
  const year = Number(request.nextUrl.searchParams.get("year"))
  const country = (request.nextUrl.searchParams.get("country") ?? "").toUpperCase()
  const world = country === "WORLD"
  const selectedCountries = world ? VIA_CALENDAR_REGIONS.filter(entry=>entry.code!=="world").map(entry=>entry.code) : [country]
  if (!Number.isInteger(year) || year < 1900 || year > 2100 || (!world && !/^[A-Z]{2}$/.test(country))) {
    return NextResponse.json({ error: "Invalid year or country" }, { status: 400 })
  }
  // The provider publishes its actual country coverage. Never confuse a
  // country shown in VIA's selector with a country supported by the source.
  let supportedCountries: Set<string> | null = null
  try {
    const coverageResponse = await fetch("https://date.nager.at/api/v3/AvailableCountries", {
      next: { revalidate: 86400 },
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(9000),
    })
    if (coverageResponse.ok) {
      const coverage: unknown = await coverageResponse.json()
      if (Array.isArray(coverage)) {
        supportedCountries = new Set(coverage.filter((entry):entry is {countryCode:string} =>
          entry!==null && typeof entry==="object" && typeof (entry as {countryCode?:unknown}).countryCode==="string"
        ).map(entry=>entry.countryCode.toUpperCase()))
      }
    }
  } catch { /* Coverage endpoint may be temporarily unavailable. */ }
  const queryCountries = supportedCountries ? selectedCountries.filter(code=>supportedCountries!.has(code)) : selectedCountries
  const unsupportedCountries = supportedCountries ? selectedCountries.filter(code=>!supportedCountries!.has(code)) : []
  // World mode queries are distributed across multiple parallel batches.
  // Each country is independently cached for 24 hours by Next.js.
  const results: Array<{code:string;available:boolean;holidays:Array<{date:string;name:string;localName:string;country:string;regions:string[];types:string[]}>}> = []
  const batches = Array.from({length:Math.ceil(queryCountries.length/8)},(_,index)=>queryCountries.slice(index*8,index*8+8))
  const batchResults = await Promise.all(batches.map(batch=>Promise.all(batch.map(async code => {
    try {
      const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${code}`, {
        next: { revalidate: 86400 },
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(9000),
      })
      if (!response.ok) return { code, available:false, holidays:[] }
      const source: unknown = await response.json()
      if (!Array.isArray(source)) throw new Error("Unexpected response")
      const holidays = source.filter((entry): entry is Holiday => {
        if (!entry || typeof entry !== "object") return false
        const item = entry as Record<string, unknown>
        return typeof item.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item.date) && typeof item.name === "string" && typeof item.localName === "string"
      }).map(item => ({
        date:item.date, name:item.name.slice(0,180), localName:item.localName.slice(0,180),
        country:code, regions:Array.isArray(item.counties)?item.counties.filter((v):v is string=>typeof v==="string"):[],
        types:Array.isArray(item.types)?item.types.filter((v):v is string=>typeof v==="string"):[],
      }))
      return { code, available:true, holidays }
    } catch { return { code, available:false, holidays:[] } }
    }))))
  results.push(...batchResults.flat())
  const availableCountries = results.filter(result=>result.available).map(result=>result.code)
  const unavailableCountries = [...unsupportedCountries,...results.filter(result=>!result.available).map(result=>result.code)]
  return NextResponse.json({
    holidays:results.flatMap(result=>result.holidays),
    available:availableCountries.length>0,
    complete:unavailableCountries.length===0,
    availableCountries,unavailableCountries,unsupportedCountries,
    source:"Nager.Date",updatedAt:new Date().toISOString(),
  },{headers:{"Cache-Control":"public, s-maxage=86400, stale-while-revalidate=604800"}})
}
