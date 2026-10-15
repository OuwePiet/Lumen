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
  // Independent, key-free fallback. OpenHolidays currently covers a smaller
  // set of countries; only ask it when Nager.Date has no usable response.
  const fallbackCodes = new Set(["AT","BE","BG","CH","CZ","DE","DK","EE","ES","FI","FR","GB","HR","HU","IE","IT","LT","LU","LV","NL","NO","PL","PT","RO","SE","SI","SK"])
  const missing = selectedCountries.filter(code=>!results.some(result=>result.code===code && result.available) && fallbackCodes.has(code))
  const fallbackResults = await Promise.all(missing.map(async code => {
    try {
      const url = new URL("https://openholidaysapi.org/PublicHolidays")
      url.searchParams.set("countryIsoCode",code)
      url.searchParams.set("validFrom",`${year}-01-01`)
      url.searchParams.set("validTo",`${year}-12-31`)
      url.searchParams.set("languageIsoCode","EN")
      const response = await fetch(url.toString(),{next:{revalidate:86400},headers:{Accept:"application/json"},signal:AbortSignal.timeout(9000)})
      if (!response.ok) return {code,available:false,holidays:[] as typeof results[number]["holidays"]}
      const data:unknown = await response.json()
      if (!Array.isArray(data)) return {code,available:false,holidays:[] as typeof results[number]["holidays"]}
      const holidays = data.flatMap((entry:unknown)=>{
        if (!entry || typeof entry!=="object") return []
        const item=entry as Record<string,unknown>
        if (typeof item.startDate!=="string" || !/^\d{4}-\d{2}-\d{2}$/.test(item.startDate)) return []
        const names=Array.isArray(item.name)?item.name:[]
        const nameItem=names.find((name:unknown)=>name!==null && typeof name==="object" && typeof (name as Record<string,unknown>).text==="string") as {text:string}|undefined
        if (!nameItem) return []
        const name=nameItem.text.slice(0,180)
        return [{date:item.startDate,name,localName:name,country:code,regions:[] as string[],types:["Public"]}]
      })
      return {code,available:true,holidays}
    } catch {return {code,available:false,holidays:[] as typeof results[number]["holidays"]}}
  }))
  results.push(...fallbackResults.filter(result=>result.available))
  const fallbackAvailableCountries=fallbackResults.filter(result=>result.available).map(result=>result.code)
  const availableCountries = results.filter(result=>result.available).map(result=>result.code)
  const unavailableCountries = selectedCountries.filter(code=>!availableCountries.includes(code))
  const allHolidays = results.flatMap(result=>result.holidays)
  const uniqueHolidays = Array.from(new Map(allHolidays.map(item=>[`${item.country}|${item.date}|${item.name}|${item.regions.join(",")}`,item])).values())
  return NextResponse.json({
    holidays:uniqueHolidays,
    available:availableCountries.length>0,
    complete:unavailableCountries.length===0,
    availableCountries,unavailableCountries,unsupportedCountries:unsupportedCountries.filter(code=>!fallbackAvailableCountries.includes(code)),fallbackAvailableCountries,
    source:"Nager.Date + OpenHolidays fallback",updatedAt:new Date().toISOString(),
    diagnostics:{requestedCountries:selectedCountries.length,returnedHolidays:uniqueHolidays.length,duplicatesRemoved:allHolidays.length-uniqueHolidays.length},
  },{headers:{"Cache-Control":"public, s-maxage=86400, stale-while-revalidate=604800"}})
}
