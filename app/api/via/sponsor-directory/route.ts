export const dynamic = "force-dynamic"

const PAGE_SIZE = 12
const MAX_CONFIGURED_CARDS = 96

type DirectoryCard = {
  id: string
  title: string
  sponsorName: string
  imageUrl: string | null
  destinationUrl: string
  startAt: string
  endAt: string
  pageOne: boolean
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

function cardFromIndex(index: number): DirectoryCard | null {
  const prefix = `VIA_AD_CARD_${index}_`
  const title = (process.env[`${prefix}TITLE`] ?? "").trim().slice(0, 120)
  const sponsorName = (process.env[`${prefix}NAME`] ?? "").trim().slice(0, 100)
  const imageUrl = safeHttps(process.env[`${prefix}IMAGE_URL`])
  const destinationUrl = safeHttps(process.env[`${prefix}DESTINATION_URL`])
  const startAt = safeIso(process.env[`${prefix}START_AT`])
  const endAt = safeIso(process.env[`${prefix}END_AT`])
  const pageOne = (process.env[`${prefix}PAGE_ONE`] ?? "").trim() === "1"

  if (!title || !sponsorName || !destinationUrl || !startAt || !endAt) return null
  const starts = Date.parse(startAt)
  const ends = Date.parse(endAt)
  if (!Number.isFinite(starts) || !Number.isFinite(ends) || ends <= starts) return null

  return {
    id: String(index),
    title,
    sponsorName,
    imageUrl,
    destinationUrl,
    startAt,
    endAt,
    pageOne,
  }
}

function rotate<T>(items: T[], offset: number) {
  if (!items.length) return items
  const normalized = ((offset % items.length) + items.length) % items.length
  return [...items.slice(normalized), ...items.slice(0, normalized)]
}

export async function GET(request: Request) {
  const now = Date.now()
  const url = new URL(request.url)
  const requestedPage = Math.max(1, Math.trunc(Number(url.searchParams.get("page") ?? "1")) || 1)

  const all = Array.from({ length: MAX_CONFIGURED_CARDS }, (_, i) => cardFromIndex(i + 1))
    .filter((card): card is DirectoryCard => Boolean(card))
    .filter((card) => {
      const starts = Date.parse(card.startAt)
      const ends = Date.parse(card.endAt)
      return starts <= now && now < ends
    })

  const pageOneCards = all.filter((card) => card.pageOne)
  const regularCards = all.filter((card) => !card.pageOne)

  // Fair rotation on page one: order changes every 20 minutes, no permanent top slot.
  const rotationWindow = Math.floor(now / (20 * 60 * 1000))
  const rotatedPageOne = rotate(pageOneCards, rotationWindow)
  const firstPage = [...rotatedPageOne.slice(0, PAGE_SIZE), ...regularCards.slice(0, Math.max(0, PAGE_SIZE - rotatedPageOne.length))]
    .slice(0, PAGE_SIZE)

  const usedRegularOnFirst = Math.max(0, PAGE_SIZE - Math.min(rotatedPageOne.length, PAGE_SIZE))
  const overflowPageOne = rotatedPageOne.slice(PAGE_SIZE)
  const overflowRegular = regularCards.slice(usedRegularOnFirst)
  const overflow = [...overflowPageOne, ...overflowRegular]

  const totalPages = Math.max(1, 1 + Math.ceil(overflow.length / PAGE_SIZE))
  const page = Math.min(requestedPage, totalPages)
  const cards = page === 1
    ? firstPage
    : overflow.slice((page - 2) * PAGE_SIZE, (page - 1) * PAGE_SIZE)

  return Response.json(
    {
      page,
      pageSize: PAGE_SIZE,
      totalPages,
      totalCards: all.length,
      pageOneCapacity: PAGE_SIZE,
      pageOneReserved: Math.min(pageOneCards.length, PAGE_SIZE),
      pageOneFull: pageOneCards.length >= PAGE_SIZE,
      cards,
    },
    { headers: { "Cache-Control": "public, max-age=60, s-maxage=120, stale-while-revalidate=120" } },
  )
}
