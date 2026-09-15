const NASA_EARTH_SOURCES = [
  "https://svs.gsfc.nasa.gov/vis/a030000/a030000/a030082/viirs_dnb_night_lights_rotating_earth_1080p.mp4",
  "https://svs.gsfc.nasa.gov/vis/a030000/a030000/a030082/viirs_dnb_night_lights_rotating_earth_720p.mp4",
] as const

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const CACHE_CONTROL =
  "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=604800, stale-if-error=2592000"

async function fetchEarth(source: string, range: string | null) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000)

  try {
    return await fetch(source, {
      headers: range ? { Range: range } : undefined,
      cache: "force-cache",
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }
}

export async function GET(request: Request) {
  const range = request.headers.get("range")
  let upstream: Response | null = null

  for (const source of NASA_EARTH_SOURCES) {
    try {
      const candidate = await fetchEarth(source, range)
      if (candidate.ok || candidate.status === 206) {
        upstream = candidate
        break
      }
    } catch {
      // Try the next NASA source. The homepage itself also has a local poster fallback.
    }
  }

  if (!upstream) {
    return new Response("NASA Earth video temporarily unavailable", {
      status: 503,
      headers: {
        "Cache-Control": "no-store",
        "Retry-After": "60",
      },
    })
  }

  const headers = new Headers()
  headers.set("Content-Type", upstream.headers.get("content-type") || "video/mp4")
  headers.set("Accept-Ranges", upstream.headers.get("accept-ranges") || "bytes")
  headers.set("Cache-Control", CACHE_CONTROL)
  headers.set("CDN-Cache-Control", CACHE_CONTROL)
  headers.set("Vercel-CDN-Cache-Control", CACHE_CONTROL)

  for (const name of ["content-length", "content-range", "etag", "last-modified"]) {
    const value = upstream.headers.get(name)
    if (value) headers.set(name, value)
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  })
}
