export const dynamic = "force-dynamic"

type SponsorCard = {
  slot: number
  title: string
  sponsorName: string
  imageUrl: string | null
  videoUrl: string | null
  destinationUrl: string
  startAt: string
  endAt: string
}

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

function cardForSlot(slot: number): SponsorCard | null {
  const prefix = `VIA_SPONSOR_CARD_${slot}_`
  const title = (process.env[`${prefix}TITLE`] ?? "").trim().slice(0, 120)
  const sponsorName = (process.env[`${prefix}NAME`] ?? "").trim().slice(0, 100)
  const imageUrl = safeHttps(process.env[`${prefix}IMAGE_URL`])
  const videoUrl = safeHttps(process.env[`${prefix}VIDEO_URL`])
  const destinationUrl = safeHttps(process.env[`${prefix}DESTINATION_URL`])
  const startAt = safeIso(process.env[`${prefix}START_AT`])
  const endAt = safeIso(process.env[`${prefix}END_AT`])

  if (!title || !sponsorName || (!imageUrl && !videoUrl) || !destinationUrl || !startAt || !endAt) return null
  const starts = Date.parse(startAt)
  const ends = Date.parse(endAt)
  if (!Number.isFinite(starts) || !Number.isFinite(ends) || ends <= starts) return null

  return { slot, title, sponsorName, imageUrl, videoUrl, destinationUrl, startAt, endAt }
}

export async function GET() {
  const now = Date.now()
  const cards = [1,2,3,4].map(cardForSlot).filter((card): card is SponsorCard => Boolean(card))
  const reserved = cards.filter((card) => Date.parse(card.endAt) > now)
  const activeSponsors = reserved.filter((card) => Date.parse(card.startAt) <= now && now < Date.parse(card.endAt))
  const nextTimes = reserved
    .flatMap((card) => [Date.parse(card.startAt), Date.parse(card.endAt)])
    .filter((time) => Number.isFinite(time) && time > now)
    .sort((a,b) => a-b)

  return Response.json(
    {
      capacity: 4,
      reservedCount: reserved.length,
      availableCount: Math.max(0, 4 - reserved.length),
      full: reserved.length >= 4,
      activeSponsors,
      nextChangeAt: nextTimes[0] ? new Date(nextTimes[0]).toISOString() : null,
    },
    { headers: { "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=60" } },
  )
}
