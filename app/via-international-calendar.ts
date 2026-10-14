/** VIA internationale kalender — vaste dagen keren automatisch jaarlijks terug.
 * Regionale en maan-/religieuze kalenders hebben wisselende data en vereisen
 * een afzonderlijk, gecontroleerd jaarschema voordat ze live worden getoond.
 * Deze catalogus heeft geen externe API of betaalde dienst nodig.
 */
export type ViaCalendarDay = {
  id: string
  nameNl: string
  month?: number
  day?: number
  scope: "international" | "regional" | "cultural"
  status: "scheduled" | "date-required"
}

export const VIA_INTERNATIONAL_DAYS: readonly ViaCalendarDay[] = [
  { id: "new-year", nameNl: "Nieuwjaarsdag", month: 1, day: 1, scope: "international", status: "scheduled" },
  { id: "women", nameNl: "Internationale Vrouwendag", month: 3, day: 8, scope: "international", status: "scheduled" },
  { id: "trans-visibility", nameNl: "Internationale Dag van Transgendervisibiliteit", month: 3, day: 31, scope: "international", status: "scheduled" },
  { id: "earth", nameNl: "Dag van de Aarde", month: 4, day: 22, scope: "international", status: "scheduled" },
  { id: "idahobit", nameNl: "Internationale Dag tegen Homo-, Bi-, Intersekse- en Transfobie (IDAHOBIT)", month: 5, day: 17, scope: "international", status: "scheduled" },
  { id: "pride", nameNl: "Pride Month", month: 6, scope: "international", status: "scheduled" },
  { id: "peace", nameNl: "Internationale Dag van de Vrede", month: 9, day: 21, scope: "international", status: "scheduled" },
  { id: "animals", nameNl: "Werelddierendag", month: 10, day: 4, scope: "international", status: "scheduled" },
  { id: "coming-out", nameNl: "Coming Out Day", month: 10, day: 11, scope: "international", status: "scheduled" },
  { id: "halloween", nameNl: "Halloween", month: 10, day: 31, scope: "cultural", status: "scheduled" },
  { id: "children", nameNl: "Wereldkinderdag", month: 11, day: 20, scope: "international", status: "scheduled" },
  { id: "trans-remembrance", nameNl: "Transgender Day of Remembrance", month: 11, day: 20, scope: "international", status: "scheduled" },
  { id: "aids", nameNl: "Wereld Aids Dag", month: 12, day: 1, scope: "international", status: "scheduled" },
  { id: "christmas-eve", nameNl: "Kerstavond", month: 12, day: 24, scope: "cultural", status: "scheduled" },
  { id: "christmas", nameNl: "Kerstmis", month: 12, day: 25, scope: "cultural", status: "scheduled" },
  { id: "boxing-day", nameNl: "Tweede kerstdag", month: 12, day: 26, scope: "regional", status: "scheduled" },
  { id: "new-years-eve", nameNl: "Oudejaarsavond", month: 12, day: 31, scope: "international", status: "scheduled" },
  { id: "human-rights", nameNl: "Dag van de Mensenrechten", month: 12, day: 10, scope: "international", status: "scheduled" },
  { id: "environment", nameNl: "Wereldmilieudag", month: 6, day: 5, scope: "international", status: "scheduled" },
  { id: "ocean", nameNl: "Wereldoceanendag", month: 6, day: 8, scope: "international", status: "scheduled" },
  { id: "refugees", nameNl: "Wereldvluchtelingendag", month: 6, day: 20, scope: "international", status: "scheduled" },
  { id: "youth", nameNl: "Internationale Jongerendag", month: 8, day: 12, scope: "international", status: "scheduled" },
  { id: "literacy", nameNl: "Internationale Dag van de Alfabetisering", month: 9, day: 8, scope: "international", status: "scheduled" },
  { id: "mental-health", nameNl: "Werelddag voor de Geestelijke Gezondheid", month: 10, day: 10, scope: "international", status: "scheduled" },
  { id: "disabilities", nameNl: "Internationale Dag van Personen met een Handicap", month: 12, day: 3, scope: "international", status: "scheduled" },
  { id: "volunteers", nameNl: "Internationale Vrijwilligersdag", month: 12, day: 5, scope: "international", status: "scheduled" },
  { id: "education", nameNl: "Internationale Dag van het Onderwijs", month: 1, day: 24, scope: "international", status: "scheduled" },
  { id: "water", nameNl: "Wereldwaterdag", month: 3, day: 22, scope: "international", status: "scheduled" },
  { id: "health", nameNl: "Wereldgezondheidsdag", month: 4, day: 7, scope: "international", status: "scheduled" },
  { id: "biodiversity", nameNl: "Internationale Dag van de Biodiversiteit", month: 5, day: 22, scope: "international", status: "scheduled" },
  { id: "indigenous", nameNl: "Internationale Dag van Inheemse Volkeren", month: 8, day: 9, scope: "international", status: "scheduled" },
  { id: "easter", nameNl: "Pasen", scope: "cultural", status: "date-required" },
  { id: "lunar-new-year", nameNl: "Lunair Nieuwjaar", scope: "cultural", status: "date-required" },
  { id: "ramadan", nameNl: "Ramadan", scope: "cultural", status: "date-required" },
  { id: "eid", nameNl: "Eid al-Fitr", scope: "cultural", status: "date-required" },
  { id: "diwali", nameNl: "Diwali", scope: "cultural", status: "date-required" },
  { id: "holi", nameNl: "Holi", scope: "cultural", status: "date-required" },
]

export function viaDaysForDate(date: Date): ViaCalendarDay[] {
  const month = date.getMonth() + 1
  const day = date.getDate()
  return VIA_INTERNATIONAL_DAYS.filter((entry) =>
    entry.status === "scheduled" && entry.month === month && (entry.day === undefined || entry.day === day)
  )
}
