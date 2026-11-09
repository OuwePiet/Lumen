/**
 * VIA World Calendar — validation of externally approved public events.
 * Integration staging only: this module is NOT wired into the live calendar.
 * Never publish visitor submissions through this function.
 */
export type ApprovedCalendarEvent = {
  id: string
  title: string
  startDate: string
  endDate: string
  country: string
  city: string
  sourceUrl: string
  status: "approved"
}

const DATE = /^\d{4}-\d{2}-\d{2}$/
const MAX_EVENTS = 1000

function validDate(value: string): boolean {
  if (!DATE.test(value)) return false
  const d = new Date(value + "T00:00:00.000Z")
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value
}

export function parseApprovedCalendarEvents(input: unknown): ApprovedCalendarEvent[] {
  if (!Array.isArray(input) || input.length > MAX_EVENTS) throw new Error("Invalid calendar dataset size")
  const ids = new Set<string>()
  const result: ApprovedCalendarEvent[] = []
  for (const item of input) {
    if (!item || typeof item !== "object") throw new Error("Invalid calendar entry")
    const e = item as Record<string, unknown>
    for (const key of ["id", "title", "startDate", "endDate", "country", "city", "sourceUrl"]) {
      if (typeof e[key] !== "string" || !(e[key] as string).trim() || (e[key] as string).length > 500)
        throw new Error("Invalid calendar field: " + key)
    }
    if (e.status !== "approved") throw new Error("Unapproved calendar entry")
    const id = e.id as string
    const startDate = e.startDate as string
    const endDate = e.endDate as string
    if (!validDate(startDate) || !validDate(endDate) || endDate < startDate)
      throw new Error("Invalid calendar date range")
    if (ids.has(id)) throw new Error("Duplicate calendar event")
    ids.add(id)
    const sourceUrl = e.sourceUrl as string
    let url: URL
    try { url = new URL(sourceUrl) } catch { throw new Error("Invalid calendar source URL") }
    if (url.protocol !== "https:" || url.username || url.password) throw new Error("Unsafe calendar source URL")
    result.push({
      id, title: e.title as string, startDate, endDate,
      country: e.country as string, city: e.city as string, sourceUrl, status: "approved"
    })
  }
  return result
}
