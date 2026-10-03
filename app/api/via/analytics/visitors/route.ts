import { NextResponse } from "next/server"

const VERCEL_ANALYTICS_URL = "https://api.vercel.com/v1/query/web-analytics/visits/count"
const VERCEL_ANALYTICS_AGGREGATE_URL = "https://api.vercel.com/v1/query/web-analytics/visits/aggregate"

type VercelCountResponse = {
  total?: number
  count?: number
  value?: number
  data?: {
    visitors?: number
    pageviews?: number
  }
}

type CountryRow = Record<string, unknown>

function countFromResponse(data: VercelCountResponse) {
  for (const value of [data.data?.visitors, data.total, data.count, data.value, data.data?.pageviews]) {
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) return Math.floor(value)
  }
  return null
}

async function readCount(from: Date, to: Date) {
  const token = process.env.VIA_VERCEL_ANALYTICS_TOKEN
  const teamId = process.env.VIA_VERCEL_ANALYTICS_TEAM_ID
  const projectId = process.env.VIA_VERCEL_ANALYTICS_PROJECT_ID
  if (!token || !teamId || !projectId) {
    console.error("[VIA analytics] Missing configuration", { hasToken: Boolean(token), hasTeam: Boolean(teamId), hasProject: Boolean(projectId) })
    return null
  }

  const url = new URL(VERCEL_ANALYTICS_URL)
  url.searchParams.set("projectId", projectId)
  url.searchParams.set("since", from.toISOString())
  url.searchParams.set("until", to.toISOString())

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: { code?: unknown }; code?: unknown } | null
    const code = body?.error?.code ?? body?.code
    console.error("[VIA analytics] Upstream request failed", {
      status: response.status,
      errorCode: typeof code === "string" ? code.slice(0, 80) : "unavailable",
    })
    return null
  }
  const data = await response.json() as VercelCountResponse
  return countFromResponse(data)
}

function countryFromRow(row: CountryRow) {
  for (const key of ["country", "Country", "requestCountry", "request_country", "key", "name"]) {
    const value = row[key]
    if (typeof value === "string" && value.trim()) return value.trim().toUpperCase().slice(0, 3)
  }
  return null
}

function countryCountFromRow(row: CountryRow) {
  for (const key of ["visitors", "count", "total", "value"]) {
    const value = row[key]
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) return Math.floor(value)
  }
  return null
}

async function readCountries(from: Date, to: Date) {
  const token = process.env.VIA_VERCEL_ANALYTICS_TOKEN
  const teamId = process.env.VIA_VERCEL_ANALYTICS_TEAM_ID
  const projectId = process.env.VIA_VERCEL_ANALYTICS_PROJECT_ID
  if (!token || !teamId || !projectId) {
    console.error("[VIA analytics] Missing configuration", { hasToken: Boolean(token), hasTeam: Boolean(teamId), hasProject: Boolean(projectId) })
    return null
  }

  const url = new URL(VERCEL_ANALYTICS_AGGREGATE_URL)
  url.searchParams.set("projectId", projectId)
  url.searchParams.set("since", from.toISOString())
  url.searchParams.set("until", to.toISOString())
  url.searchParams.set("by", "country")
  // Vercel defaults to 10 groups; request all possible ISO country groups.
  url.searchParams.set("limit", "250")

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: { code?: unknown }; code?: unknown } | null
    const code = body?.error?.code ?? body?.code
    console.error("[VIA analytics] Upstream request failed", {
      status: response.status,
      errorCode: typeof code === "string" ? code.slice(0, 80) : "unavailable",
    })
    return null
  }
  const data = await response.json() as unknown
  const rows = Array.isArray(data)
    ? data
    : data && typeof data === "object"
      ? (["data", "rows", "results", "items"] as const)
          .map((key) => (data as Record<string, unknown>)[key])
          .find(Array.isArray) ?? []
      : []

  const countries = rows
    .map((entry) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null
      const row = entry as CountryRow
      const country = countryFromRow(row)
      const visitors = countryCountFromRow(row)
      return country && visitors !== null ? { country, visitors } : null
    })
    .filter((entry): entry is { country: string; visitors: number } => Boolean(entry))
    .sort((a, b) => b.visitors - a.visitors)

  return countries
}

export async function GET() {
  const now = new Date()
  const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1))

  const [today, month, year, countries] = await Promise.all([
    readCount(dayStart, now),
    readCount(monthStart, now),
    readCount(yearStart, now),
    readCountries(dayStart, now),
  ])

  if (today === null || month === null || year === null) {
    return NextResponse.json({
      ok: false,
      source: "vercel-web-analytics",
      error: "ANALYTICS_SOURCE_UNAVAILABLE",
    }, { status: 503 })
  }

  // Country aggregation and count responses can disagree. Never publish a
  // confirmed zero for today while the same interval has country activity.
  const todayConsistent = !(today === 0 && countries?.some((row) => row.visitors > 0))
  if (!todayConsistent) console.warn("[VIA analytics] Today count conflicts with country aggregate")

  return NextResponse.json({
    ok: true,
    source: "vercel-web-analytics",
    privacy: "aggregated",
    measuredAt: now.toISOString(),
    visitors: {
      today: todayConsistent ? today : null,
      month,
      year,
    },
    countries: countries ?? [],
  })
}
