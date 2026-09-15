const NASA_EARTH_URL =
  "https://svs.gsfc.nasa.gov/vis/a030000/a030000/a030082/viirs_dnb_night_lights_rotating_earth_1080p.mp4"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const range = request.headers.get("range")

  const upstream = await fetch(NASA_EARTH_URL, {
    headers: range ? { Range: range } : undefined,
    cache: "no-store",
  })

  if (!upstream.ok && upstream.status !== 206) {
    return new Response("NASA Earth video unavailable", { status: 502 })
  }

  const headers = new Headers()
  headers.set("Content-Type", upstream.headers.get("content-type") || "video/mp4")
  headers.set("Accept-Ranges", upstream.headers.get("accept-ranges") || "bytes")
  headers.set("Cache-Control", "public, max-age=3600")

  for (const name of ["content-length", "content-range", "etag", "last-modified"]) {
    const value = upstream.headers.get(name)
    if (value) headers.set(name, value)
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  })
}
