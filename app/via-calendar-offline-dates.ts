/** Zero-cost, offline calendar estimates. Never present religious dates as officially confirmed. */
export type ViaCalculatedDate = { id: string; nameNl: string; month: number; day: number; scope: "cultural"; status: "scheduled"; estimated: true }

const lunarNames: Record<string,string> = {
  "lunar-new-year": "Chinees/Lunair Nieuwjaar (berekend)",
  ramadan: "Begin ramadan (berekend; lokale maanwaarneming kan afwijken)",
  "eid-al-fitr": "Eid al-Fitr (berekend; lokale maanwaarneming kan afwijken)",
}

function calendarParts(date: Date, formatter: Intl.DateTimeFormat) {
  try {
    const parts = formatter.formatToParts(date)
    const value = (kind: string) => parts.find(p=>p.type===kind)?.value ?? ""
    return { month:value("month"), day:Number(value("day")) }
  } catch { return null }
}

/** Intl is bundled with the browser; no network requests, keys or billing. */
export function viaOfflineLunarDates(year: number): ViaCalculatedDate[] {
  if (!Number.isInteger(year) || year < 1900 || year > 2100) return []
  const results: ViaCalculatedDate[] = []
  const targets = [
    { id:"lunar-new-year", calendar:"chinese", month:"1" },
    { id:"ramadan", calendar:"islamic-umalqura", month:"9" },
    { id:"eid-al-fitr", calendar:"islamic-umalqura", month:"10" },
  ]
  const formatters = new Map(targets.map(target => [target.id, new Intl.DateTimeFormat("en-US-u-ca-" + target.calendar, { year:"numeric", month:"numeric", day:"numeric", timeZone:"UTC" })]))
  const seen = new Set<string>()
  for (let day = Date.UTC(year,0,1); day < Date.UTC(year+1,0,1); day += 86400000) {
    const date = new Date(day)
    for (const target of targets) {
      const parts = calendarParts(date,formatters.get(target.id)!)
      if (!parts || parts.month !== target.month || parts.day !== 1) continue
      const key = target.id + ":" + day
      if (seen.has(key)) continue
      seen.add(key)
      results.push({id:target.id,nameNl:lunarNames[target.id],month:date.getUTCMonth()+1,day:date.getUTCDate(),scope:"cultural",status:"scheduled",estimated:true})
    }
  }
  return results
}
