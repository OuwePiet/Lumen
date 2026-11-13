import { NextResponse } from "next/server"
import { visitorCount, measuredCount, consistentVisitors } from "../../../../../lib/via/analytics-counts"
export const dynamic = "force-dynamic"
type SourceResult = { data: unknown; status: number | null; error: string | null }
async function readSource(endpoint: "count" | "aggregate", since: Date, until: Date): Promise<SourceResult> {
  const token = process.env.VIA_VERCEL_ANALYTICS_TOKEN
  const teamId = process.env.VIA_VERCEL_ANALYTICS_TEAM_ID
  const projectId = process.env.VIA_VERCEL_ANALYTICS_PROJECT_ID
  if (!token || !teamId || !projectId) return { data: null, status: null, error: "ANALYTICS_NOT_CONFIGURED" }
  const url = new URL("https://api.vercel.com/v1/query/web-analytics/visits/" + endpoint)
  url.searchParams.set("projectId", projectId)
  url.searchParams.set("teamId", teamId)
  url.searchParams.set("since", since.toISOString())
  url.searchParams.set("until", until.toISOString())
  if (endpoint === "aggregate") { url.searchParams.set("by", "country"); url.searchParams.set("limit", "100") }
  try {
    const response = await fetch(url, { headers: { Authorization: "Bearer " + token, Accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(8000) })
    if (!response.ok) return { data: null, status: response.status, error: response.status === 401 || response.status === 403 ? "ANALYTICS_ACCESS_DENIED" : "ANALYTICS_SOURCE_UNAVAILABLE" }
    return { data: await response.json(), status: response.status, error: null }
  } catch { return { data: null, status: null, error: "ANALYTICS_SOURCE_UNAVAILABLE" } }
}
function countryRows(input: unknown) {
  const data = input && typeof input === "object" ? input as Record<string, unknown> : {}
  const rawRows = Array.isArray(input) ? input : ["data", "rows", "results", "items"].map(key => data[key]).find(Array.isArray)
  const rows: unknown[] = rawRows ?? []
  const countries: Array<{ country: string; visitors: number }> = []
  let complete = Array.isArray(rawRows) && rows.length < 100
  const seen = new Set<string>()
  for (const item of rows) {
    if (!item || typeof item !== "object") { complete = false; continue }
    const row = item as Record<string, unknown>
    const code = [row.country, row.Country, row.requestCountry, row.request_country, row.key, row.name].find(value => typeof value === "string") as string | undefined
    if (!code || !/^[A-Za-z]{2,3}$/.test(code)) { complete = false; continue }
    const visitors = [row.visitors, row.count, row.total, row.value].map(measuredCount).find(value => value !== null)
    if (visitors === undefined || visitors === null || seen.has(code.toUpperCase())) { complete = false; continue }
    seen.add(code.toUpperCase()); countries.push({ country: code.toUpperCase(), visitors })
  }
  return { countries: countries.sort((a, b) => b.visitors - a.visitors), complete, available: Array.isArray(rawRows) && (rows.length === 0 || countries.length > 0) }
}
async function calculate() {
  const now = new Date()
  const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const start = new Date("2026-09-17T00:00:00.000Z")
  const recent = new Date(now.getTime() - 5 * 60_000)
  const [daily, monthly, total, geographic, active] = await Promise.all([
    readSource("count", day, now), readSource("count", month, now), readSource("count", start, now),
    readSource("aggregate", day, now), readSource("count", recent, now),
  ])
  const { countries, complete, available: countriesAvailable } = countryRows(geographic.data)
  const reported = { today: visitorCount(daily.data), month: visitorCount(monthly.data), year: visitorCount(total.data) }
  const { values, warnings } = consistentVisitors(reported, countries)
  const activeNow = visitorCount(active.data)
  const available = Object.values(values).some(value => value !== null) || countriesAvailable || activeNow !== null
  const failures = [daily, monthly, total, geographic, active].filter(value => value.error)
  const error = failures.some(value => value.error === "ANALYTICS_ACCESS_DENIED") ? "ANALYTICS_ACCESS_DENIED" : failures[0]?.error ?? null
  return { body: {
    ok: available, source: "vercel-web-analytics", privacy: "aggregated", measuredAt: now.toISOString(),
    visitors: values, reportedVisitors: reported, activeNow,
    activeDefinition: "distinct-visitors-last-five-minutes-not-live-presence",
    countries, countriesAvailable, countriesComplete: complete,
    todayCountSource: "visits-count", warnings,
    partial: failures.length > 0 || warnings.length > 0,
    error: available ? null : error ?? "ANALYTICS_RESPONSE_UNRECOGNIZED",
    periods: { timezone: "UTC", today: { since: day.toISOString(), until: now.toISOString() }, month: { since: month.toISOString(), until: now.toISOString() }, year: { since: start.toISOString(), until: now.toISOString() }, active: { since: recent.toISOString(), until: now.toISOString() } },
  }, status: available ? 200 : 503 }
}

// Public aggregates only: collapse simultaneous requests and cool down failed upstream calls.
let cached: { value: Awaited<ReturnType<typeof calculate>>; expiresAt: number } | null = null
let flight: Promise<Awaited<ReturnType<typeof calculate>>> | null = null
export async function GET() {
  if (!cached || cached.expiresAt <= Date.now()) {
    if (!flight) flight = calculate().then(value => { cached = { value, expiresAt: Date.now() + (value.status === 200 ? 300000 : 60000) }; return value }).finally(() => { flight = null })
    await flight
  }
  const value = cached!.value
  return NextResponse.json(value.body, { status: value.status, headers: { "Cache-Control": value.status === 200 ? "public, max-age=30, s-maxage=300, stale-while-revalidate=300" : "no-store" } })
}
