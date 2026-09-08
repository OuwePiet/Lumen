import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const RADIO_BROWSER_SERVERS = [
  "https://de1.api.radio-browser.info",
  "https://nl1.api.radio-browser.info",
]
const USER_AGENT = "VIA/1.0 (+https://viadeso.online)"
const MAX_RESULTS = 24

type RadioBrowserStation = {
  stationuuid?: string
  name?: string
  url_resolved?: string
  homepage?: string
  favicon?: string
  tags?: string
  country?: string
  countrycode?: string
  codec?: string
  bitrate?: number
  lastcheckok?: number
}

function clean(value: string | null, max = 80) {
  return (value ?? "").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, max)
}

function safeHttps(value?: string) {
  if (!value) return ""
  try {
    const url = new URL(value)
    return url.protocol === "https:" ? url.toString() : ""
  } catch {
    return ""
  }
}

async function radioBrowserFetch(path: string, timeoutMs = 6000) {
  let lastError: unknown = null

  for (const server of RADIO_BROWSER_SERVERS) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const response = await fetch(`${server}${path}`, {
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
        cache: "no-store",
        signal: controller.signal,
      })
      if (response.ok) return response
      lastError = new Error(`Radio Browser returned ${response.status}`)
    } catch (error) {
      lastError = error
    } finally {
      clearTimeout(timeout)
    }
  }

  throw lastError ?? new Error("Radio Browser unavailable")
}

export async function GET(request: NextRequest) {
  const country = clean(request.nextUrl.searchParams.get("country"), 60)
  const tag = clean(request.nextUrl.searchParams.get("tag"), 60)
  const params = new URLSearchParams({
    hidebroken: "true",
    is_https: "true",
    order: "votes",
    reverse: "true",
    limit: String(MAX_RESULTS),
  })
  if (country) params.set("country", country)
  if (tag) params.set("tag", tag)

  try {
    const response = await radioBrowserFetch(`/json/stations/search?${params.toString()}`)
    const raw: RadioBrowserStation[] = await response.json()
    const stations = raw
      .map((station) => ({
        id: clean(station.stationuuid ?? "", 80),
        name: clean(station.name ?? "Unknown station", 120),
        streamUrl: safeHttps(station.url_resolved),
        homepage: safeHttps(station.homepage),
        favicon: safeHttps(station.favicon),
        tags: clean(station.tags ?? "", 180),
        country: clean(station.country ?? "", 80),
        countryCode: clean(station.countrycode ?? "", 4),
        codec: clean(station.codec ?? "", 20),
        bitrate: typeof station.bitrate === "number" ? station.bitrate : 0,
      }))
      .filter((station) => station.id && station.streamUrl)

    return NextResponse.json({ stations }, { headers: { "Cache-Control": "no-store" } })
  } catch {
    return NextResponse.json({ stations: [], error: "Radio directory request failed" }, { status: 502 })
  }
}

export async function POST(request: NextRequest) {
  let body: { stationId?: string } = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  const stationId = clean(body.stationId ?? "", 80)
  if (!/^[0-9a-f-]{20,80}$/i.test(stationId)) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  try {
    await radioBrowserFetch(`/json/url/${encodeURIComponent(stationId)}`, 3500)
  } catch {
    // Click counting is best-effort and must never block playback.
  }
  return NextResponse.json({ ok: true })
}
