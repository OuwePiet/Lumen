const CITY_POOL = [
  { city: "Tokyo", country: "Japan" },
  { city: "New York", country: "United States" },
  { city: "Lagos", country: "Nigeria" },
  { city: "São Paulo", country: "Brazil" },
  { city: "Seoul", country: "South Korea" },
  { city: "Mumbai", country: "India" },
  { city: "Sydney", country: "Australia" },
  { city: "Paris", country: "France" },
  { city: "Mexico City", country: "Mexico" },
  { city: "Cape Town", country: "South Africa" },
  { city: "Amsterdam", country: "Netherlands" },
  { city: "Singapore", country: "Singapore" },
] as const

type CommonsImage = {
  city: string
  country: string
  imageUrl: string | null
  descriptionUrl: string | null
  title: string | null
  artist: string | null
  license: string | null
  seasonal: boolean
}

type CommonsPage = {
  title?: string
  imageinfo?: Array<{
    thumburl?: string
    url?: string
    descriptionurl?: string
    width?: number
    height?: number
    extmetadata?: Record<string, { value?: string }>
  }>
}

type CommonsResponse = {
  query?: { pages?: Record<string, CommonsPage> }
}

function monthKey(date: Date) {
  return date.getUTCFullYear() * 12 + date.getUTCMonth()
}

function selectCities(date: Date) {
  const key = monthKey(date)
  const offsets = [0, 3, 6, 9]
  return offsets.map((offset) => CITY_POOL[(key + offset) % CITY_POOL.length])
}

function stripHtml(value?: string) {
  if (!value) return null
  return value.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim() || null
}

async function findCommonsImage(city: string, country: string, christmas: boolean): Promise<CommonsImage> {
  const search = christmas
    ? `${city} ${country} Christmas lights city`
    : `${city} ${country} skyline city`

  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    generator: "search",
    gsrsearch: search,
    gsrnamespace: "6",
    gsrlimit: "8",
    prop: "imageinfo",
    iiprop: "url|size|extmetadata",
    iiurlwidth: "1200",
  })

  try {
    const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params.toString()}`, {
      headers: { "User-Agent": "VIA/1.0 (viadeso.online)" },
      next: { revalidate: 2_678_400 },
    })
    if (!response.ok) throw new Error(`Commons ${response.status}`)

    const data = (await response.json()) as CommonsResponse
    const pages = Object.values(data.query?.pages ?? {})

    const candidate = pages
      .map((page) => ({ page, info: page.imageinfo?.[0] }))
      .find(({ page, info }) => {
        if (!info) return false
        const title = page.title?.toLowerCase() ?? ""
        const mimeOk = /\.(jpe?g|png|webp)$/i.test(title)
        const sizeOk = (info.width ?? 0) >= 900 && (info.height ?? 0) >= 500
        const license = info.extmetadata?.LicenseShortName?.value ?? ""
        const markedBad = /do not use|copyright violation|no permission/i.test(
          `${info.extmetadata?.Restrictions?.value ?? ""} ${info.extmetadata?.UsageTerms?.value ?? ""}`,
        )
        return mimeOk && sizeOk && Boolean(license) && !markedBad
      })

    if (!candidate?.info) throw new Error("No suitable Commons image")

    const metadata = candidate.info.extmetadata ?? {}
    return {
      city,
      country,
      imageUrl: candidate.info.thumburl ?? candidate.info.url ?? null,
      descriptionUrl: candidate.info.descriptionurl ?? null,
      title: stripHtml(metadata.ImageDescription?.value) ?? candidate.page.title?.replace(/^File:/, "") ?? null,
      artist: stripHtml(metadata.Artist?.value),
      license: stripHtml(metadata.LicenseShortName?.value),
      seasonal: christmas,
    }
  } catch {
    return {
      city,
      country,
      imageUrl: null,
      descriptionUrl: null,
      title: null,
      artist: null,
      license: null,
      seasonal: christmas,
    }
  }
}

export async function GET() {
  const now = new Date()
  const christmas = now.getUTCMonth() === 11
  const cities = selectCities(now)
  const items = await Promise.all(cities.map(({ city, country }) => findCommonsImage(city, country, christmas)))

  return Response.json(
    {
      month: now.toISOString().slice(0, 7),
      source: "Wikimedia Commons",
      items,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=2678400, stale-while-revalidate=604800, stale-if-error=2592000",
      },
    },
  )
}
