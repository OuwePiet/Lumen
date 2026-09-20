import { NextResponse } from "next/server"

const VERCEL_ANALYTICS_URL = "https://api.vercel.com/v1/query/web-analytics/visits/count"

type VercelCountResponse = {
  total?: number
  count?: number
  value?: number
}

function countFromResponse(data: VercelCountResponse) {
  for (const value of [data.total, data.count, data.value]) {
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) return Math.floor(value)
  }
  return null
}

async function readCount(from: Date, to: Date) {
  const token = process.env.VIA_VERCEL_ANALYTICS_TOKEN
  const teamId = process.env.VIA_VERCEL_ANALYTICS_TEAM_ID
  const projectId = process.env.VIA_VERCEL_ANALYTICS_PROJECT_ID
  if (!token || !teamId || !projectId) return null

  const url = new URL(VERCEL_ANALYTICS_URL)
  url.searchParams.set("teamId", teamId)
  url.searchParams.set("projectId", projectId)
  url.searchParams.set("from", from.toISOString())
  url.searchParams.set("to", to.toISOString())

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  })

  if (!response.ok) return null
  const data = await response.json() as VercelCountResponse
  return countFromResponse(data)
}

export async function GET() {
  const now = new Date()
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1))

  const [month, year] = await Promise.all([
    readCount(monthStart, now),
    readCount(yearStart, now),
  ])

  if (month === null || year === null) {
    return NextResponse.json({
      ok: false,
      source: "vercel-web-analytics",
      error: "ANALYTICS_SOURCE_UNAVAILABLE",
    }, { status: 503 })
  }

  return NextResponse.json({
    ok: true,
    source: "vercel-web-analytics",
    privacy: "aggregated",
    measuredAt: now.toISOString(),
    visitors: {
      month,
      year,
    },
  })
}
