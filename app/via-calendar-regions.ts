/** Transparante landenvoorkeur voor de VIA Wereldkalender.
 * Geen automatische blokkade van identiteiten, religies of LHBTIQ+-informatie.
 * Land bepaalt de lokale kalendercontext; juridische publicatiebeoordeling blijft handmatig.
 * Geen netwerkverzoeken, locatiepermissies of opslag van IP-adressen.
 */
export const VIA_CALENDAR_REGIONS = [
  { code:"world", label:"Wereldwijd", zone:"UTC" },
  { code:"NL", label:"Nederland", zone:"Europe/Amsterdam" },
  { code:"GB", label:"Verenigd Koninkrijk", zone:"Europe/London" },
  { code:"US", label:"Verenigde Staten", zone:"America/New_York" },
  { code:"FR", label:"Frankrijk", zone:"Europe/Paris" },
  { code:"ES", label:"Spanje", zone:"Europe/Madrid" },
  { code:"CN", label:"China", zone:"Asia/Shanghai" },
  { code:"IN", label:"India", zone:"Asia/Kolkata" },
] as const

export type ViaCalendarRegion = typeof VIA_CALENDAR_REGIONS[number]["code"]

export function viaCalendarLocalDate(now: Date, region: ViaCalendarRegion) {
  const entry = VIA_CALENDAR_REGIONS.find(item => item.code===region) ?? VIA_CALENDAR_REGIONS[0]
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: entry.zone, year:"numeric", month:"2-digit", day:"2-digit"
  }).formatToParts(now)
  const part = (type:string) => Number(parts.find(item=>item.type===type)?.value ?? 0)
  return {year:part("year"),month:part("month"),day:part("day"),zone:entry.zone}
}

/** Future-reviewed country policies may annotate presentation; never hide factual calendar entries by default. */
export type ViaCalendarPresentationPolicy = "standard" | "review-required"
export const VIA_CALENDAR_DEFAULT_PRESENTATION: ViaCalendarPresentationPolicy = "standard"
