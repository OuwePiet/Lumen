export const dynamic = "force-dynamic"

function safeHttps(value: string | undefined) {
  if (!value) return null
  try {
    const url = new URL(value.trim())
    return url.protocol === "https:" && !url.username && !url.password ? url.toString() : null
  } catch {
    return null
  }
}

function safeIso(value: string | undefined) {
  if (!value) return null
  const time = Date.parse(value)
  return Number.isFinite(time) ? new Date(time).toISOString() : null
}

export async function GET() {
  const now = Date.now()
  const title = (process.env.VIA_SPONSOR_CARD_TITLE ?? "").trim().slice(0, 120)
  const sponsorName = (process.env.VIA_SPONSOR_CARD_NAME ?? "").trim().slice(0, 100)
  const imageUrl = safeHttps(process.env.VIA_SPONSOR_CARD_IMAGE_URL)
  const videoUrl = safeHttps(process.env.VIA_SPONSOR_CARD_VIDEO_URL)
  const destinationUrl = safeHttps(process.env.VIA_SPONSOR_CARD_DESTINATION_URL)
  const startAt = safeIso(process.env.VIA_SPONSOR_CARD_START_AT)
  const endAt = safeIso(process.env.VIA_SPONSOR_CARD_END_AT)

  const startMs = startAt ? Date.parse(startAt) : null
  const endMs = endAt ? Date.parse(endAt) : null
  const configured = Boolean(title && sponsorName && (imageUrl || videoUrl) && destinationUrl && startAt && endAt)
  const active = Boolean(configured && startMs !== null && endMs !== null && startMs <= now && now < endMs)

  return Response.json(
    {
      configured,
      active,
      sponsor: active ? { title, sponsorName, imageUrl, videoUrl, destinationUrl, startAt, endAt } : null,
      nextChangeAt: active ? endAt : configured && startMs !== null && startMs > now ? startAt : null,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=60",
      },
    },
  )
}
