export function measuredCount(value: unknown): number | null {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : null
}
export function visitorCount(value: unknown): number | null {
  if (!value || typeof value !== "object") return null
  const data = value as Record<string, unknown>
  const nested = data.data && typeof data.data === "object" ? data.data as Record<string, unknown> : {}
  // Pageviews are a different metric and must never stand in for visitors.
  for (const candidate of [nested.visitors, data.visitors, data.total, data.count, data.value]) {
    const result = measuredCount(candidate)
    if (result !== null) return result
  }
  return null
}
export function consistentVisitors(input: { today: number | null; month: number | null; year: number | null }, countries: Array<{ visitors: number }>) {
  const values = { ...input }, warnings: string[] = []
  if (values.today === 0 && countries.some(row => row.visitors > 0)) {
    values.today = null
    warnings.push("DAILY_SOURCE_CONFLICT")
  }
  if (values.today !== null && values.month !== null && values.month < values.today) {
    values.month = null; warnings.push("MONTH_SOURCE_CONFLICT")
  }
  if (input.month !== null && values.year !== null && values.year < input.month) {
    values.year = null; warnings.push("TOTAL_SOURCE_CONFLICT")
  }
  return { values, warnings }
}
