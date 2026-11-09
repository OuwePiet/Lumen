import { parseApprovedCalendarEvents, type ApprovedCalendarEvent } from "./approved-events"

/** Calendar-only date arithmetic in UTC; no timezone-dependent local Date parsing. */
export function approvedEventDaysForMonth(
  source: unknown,
  year: number,
  monthIndex: number,
  country: string = "world",
): Array<{ event: ApprovedCalendarEvent; day: number }> {
  if (!Number.isInteger(year) || year < 1 || year > 9999 || !Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11)
    throw new Error("Invalid calendar month")
  const events = parseApprovedCalendarEvents(source)
  const startOfMonth = new Date(Date.UTC(year, monthIndex, 1)).toISOString().slice(0, 10)
  const endOfMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).toISOString().slice(0, 10)
  const result: Array<{ event: ApprovedCalendarEvent; day: number }> = []
  for (const event of events) {
    if (country !== "world" && event.country !== country) continue
    if (event.endDate < startOfMonth || event.startDate > endOfMonth) continue
    const firstDay = Math.max(Number(event.startDate.slice(8, 10)) * (event.startDate.slice(0, 7) === startOfMonth.slice(0, 7) ? 1 : 0), 1)
    const lastDay = event.endDate.slice(0, 7) === endOfMonth.slice(0, 7)
      ? Number(event.endDate.slice(8, 10))
      : Number(endOfMonth.slice(8, 10))
    for (let day = firstDay; day <= lastDay; day++) result.push({ event, day })
  }
  return result
}
