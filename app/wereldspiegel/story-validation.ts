/**
 * Pure validation boundary for future WereldSpiegel feed ingestion.
 * This module performs no network requests and handles no account data.
 */
export type VerifiedStory = Readonly<{
  id: string
  title: string
  summary: string
  sourceName: string
  sourceUrl: string
  publishedAt: string
  placeId: string | null
}>

const MAX_TITLE = 180
const MAX_SUMMARY = 700
const MAX_SOURCE = 100
const MAX_URL = 2048
const MAX_AGE_DAYS = 30

function cleanText(value: unknown, limit: number): string | null {
  if (typeof value !== "string" || value.length > limit * 8) return null
  const cleaned = value
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  if (!cleaned || cleaned.length > limit) return null
  return cleaned
}

export function validateStory(input: unknown, now = Date.now()): VerifiedStory | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null
  const item = input as Record<string, unknown>
  const title = cleanText(item.title, MAX_TITLE)
  const summary = cleanText(item.summary, MAX_SUMMARY)
  const sourceName = cleanText(item.sourceName, MAX_SOURCE)
  if (!title || !summary || !sourceName) return null
  if (typeof item.sourceUrl !== "string" || item.sourceUrl.length > MAX_URL) return null
  let sourceUrl: URL
  try { sourceUrl = new URL(item.sourceUrl) } catch { return null }
  if (sourceUrl.protocol !== "https:" || sourceUrl.username || sourceUrl.password) return null
  if (typeof item.publishedAt !== "string" || item.publishedAt.length > 40) return null
  const published = Date.parse(item.publishedAt)
  if (!Number.isFinite(published) || published > now + 5 * 60_000 ||
      published < now - MAX_AGE_DAYS * 86_400_000) return null
  // Only an independently verified place identifier is accepted.
  const placeId = typeof item.placeId === "string" && /^[a-zA-Z0-9:_-]{1,80}$/.test(item.placeId)
    ? item.placeId : null
  const id = typeof item.id === "string" && /^[a-zA-Z0-9:_-]{1,120}$/.test(item.id)
    ? item.id : null
  if (!id) return null
  return { id, title, summary, sourceName, sourceUrl: sourceUrl.toString(),
    publishedAt: new Date(published).toISOString(), placeId }
}

export function deduplicateStories(stories: readonly VerifiedStory[]): VerifiedStory[] {
  const seen = new Set<string>()
  return stories.filter(story => {
    const normalizedTitle = story.title.toLocaleLowerCase("en").replace(/[^\p{L}\p{N}]+/gu, " ").trim()
    const key = normalizedTitle + "|" + (story.placeId || "")
    if (seen.has(story.id) || seen.has(key)) return false
    seen.add(story.id)
    seen.add(key)
    return true
  })
}
