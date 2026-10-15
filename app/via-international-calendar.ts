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
  { id: "united-nations", nameNl: "Dag van de Verenigde Naties", month: 10, day: 24, scope: "international", status: "scheduled" },
  { id: "press-freedom", nameNl: "Werelddag van de Persvrijheid", month: 5, day: 3, scope: "international", status: "scheduled" },
  { id: "teachers", nameNl: "Wereldlerarendag", month: 10, day: 5, scope: "international", status: "scheduled" },
  { id: "food", nameNl: "Wereldvoedseldag", month: 10, day: 16, scope: "international", status: "scheduled" },
  { id: "tolerance", nameNl: "Internationale Dag voor Verdraagzaamheid", month: 11, day: 16, scope: "international", status: "scheduled" },
  { id: "migrants", nameNl: "Internationale Migrantendag", month: 12, day: 18, scope: "international", status: "scheduled" },
  { id: "social-justice", nameNl: "Werelddag van Sociale Rechtvaardigheid", month: 2, day: 20, scope: "international", status: "scheduled" },
  { id: "mother-language", nameNl: "Internationale Dag van de Moedertaal", month: 2, day: 21, scope: "international", status: "scheduled" },
  { id: "forest", nameNl: "Internationale Dag van de Bossen", month: 3, day: 21, scope: "international", status: "scheduled" },
  { id: "girls", nameNl: "Internationale Dag van het Meisje", month: 10, day: 11, scope: "international", status: "scheduled" },
  { id: "braille", nameNl: "Wereldbrailledag", month: 1, day: 4, scope: "international", status: "scheduled" },
  { id: "holocaust", nameNl: "Internationale Holocaustherdenkingsdag", month: 1, day: 27, scope: "international", status: "scheduled" },
  { id: "wetlands", nameNl: "Wereldmoerasdag", month: 2, day: 2, scope: "international", status: "scheduled" },
  { id: "women-science", nameNl: "Internationale Dag van Vrouwen en Meisjes in de Wetenschap", month: 2, day: 11, scope: "international", status: "scheduled" },
  { id: "radio", nameNl: "Wereldradiodag", month: 2, day: 13, scope: "international", status: "scheduled" },
  { id: "wildlife", nameNl: "Werelddag van de Wilde Dieren", month: 3, day: 3, scope: "international", status: "scheduled" },
  { id: "happiness", nameNl: "Internationale Dag van het Geluk", month: 3, day: 20, scope: "international", status: "scheduled" },
  { id: "poetry", nameNl: "Wereldpoëziedag", month: 3, day: 21, scope: "international", status: "scheduled" },
  { id: "meteorology", nameNl: "Wereldmeteorologiedag", month: 3, day: 23, scope: "international", status: "scheduled" },
  { id: "autism", nameNl: "Wereldautismebewustzijnsdag", month: 4, day: 2, scope: "international", status: "scheduled" },
  { id: "sport-development", nameNl: "Internationale Dag van Sport voor Ontwikkeling en Vrede", month: 4, day: 6, scope: "international", status: "scheduled" },
  { id: "creativity", nameNl: "Werelddag van Creativiteit en Innovatie", month: 4, day: 21, scope: "international", status: "scheduled" },
  { id: "books-copyright", nameNl: "Wereldboekendag en Auteursrechtendag", month: 4, day: 23, scope: "international", status: "scheduled" },
  { id: "jazz", nameNl: "Internationale Jazzdag", month: 4, day: 30, scope: "international", status: "scheduled" },
  { id: "workers", nameNl: "Dag van de Arbeid", month: 5, day: 1, scope: "international", status: "scheduled" },
  { id: "families", nameNl: "Internationale Dag van het Gezin", month: 5, day: 15, scope: "international", status: "scheduled" },
  { id: "bees", nameNl: "Wereldbijendag", month: 5, day: 20, scope: "international", status: "scheduled" },
  { id: "cultural-diversity", nameNl: "Werelddag voor Culturele Diversiteit", month: 5, day: 21, scope: "international", status: "scheduled" },
  { id: "no-tobacco", nameNl: "Werelddag zonder Tabak", month: 5, day: 31, scope: "international", status: "scheduled" },
  { id: "parents", nameNl: "Werelddag van Ouders", month: 6, day: 1, scope: "international", status: "scheduled" },
  { id: "bicycle", nameNl: "Wereldfietsdag", month: 6, day: 3, scope: "international", status: "scheduled" },
  { id: "child-labour", nameNl: "Werelddag tegen Kinderarbeid", month: 6, day: 12, scope: "international", status: "scheduled" },
  { id: "desertification", nameNl: "Werelddag tegen Woestijnvorming en Droogte", month: 6, day: 17, scope: "international", status: "scheduled" },
  { id: "yoga", nameNl: "Internationale Yogadag", month: 6, day: 21, scope: "international", status: "scheduled" },
  { id: "anti-drugs", nameNl: "Internationale Dag tegen Drugsmisbruik en Illegale Handel", month: 6, day: 26, scope: "international", status: "scheduled" },
  { id: "population", nameNl: "Wereldbevolkingsdag", month: 7, day: 11, scope: "international", status: "scheduled" },
  { id: "friendship", nameNl: "Internationale Dag van de Vriendschap", month: 7, day: 30, scope: "international", status: "scheduled" },
  { id: "humanitarian", nameNl: "Wereldhumanitaire Dag", month: 8, day: 19, scope: "international", status: "scheduled" },
  { id: "charity", nameNl: "Internationale Dag van Liefdadigheid", month: 9, day: 5, scope: "international", status: "scheduled" },
  { id: "democracy", nameNl: "Internationale Dag van de Democratie", month: 9, day: 15, scope: "international", status: "scheduled" },
  { id: "ozone", nameNl: "Internationale Dag voor de Bescherming van de Ozonlaag", month: 9, day: 16, scope: "international", status: "scheduled" },
  { id: "sign-languages", nameNl: "Internationale Dag van Gebarentalen", month: 9, day: 23, scope: "international", status: "scheduled" },
  { id: "tourism", nameNl: "Wereldtoerismedag", month: 9, day: 27, scope: "international", status: "scheduled" },
  { id: "older-persons", nameNl: "Internationale Dag van Ouderen", month: 10, day: 1, scope: "international", status: "scheduled" },
  { id: "non-violence", nameNl: "Internationale Dag van Geweldloosheid", month: 10, day: 2, scope: "international", status: "scheduled" },
  { id: "disaster-risk", nameNl: "Internationale Dag voor Rampenrisicovermindering", month: 10, day: 13, scope: "international", status: "scheduled" },
  { id: "rural-women", nameNl: "Internationale Dag van Plattelandsvrouwen", month: 10, day: 15, scope: "international", status: "scheduled" },
  { id: "poverty", nameNl: "Internationale Dag voor de Uitbanning van Armoede", month: 10, day: 17, scope: "international", status: "scheduled" },
  { id: "cities", nameNl: "Wereldstedendag", month: 10, day: 31, scope: "international", status: "scheduled" },
  { id: "science-peace", nameNl: "Werelddag van Wetenschap voor Vrede en Ontwikkeling", month: 11, day: 10, scope: "international", status: "scheduled" },
  { id: "kindness", nameNl: "Wereldvriendelijkheidsdag", month: 11, day: 13, scope: "international", status: "scheduled" },
  { id: "toilets", nameNl: "Wereldtoiletdag", month: 11, day: 19, scope: "international", status: "scheduled" },
  { id: "violence-women", nameNl: "Internationale Dag tegen Geweld tegen Vrouwen", month: 11, day: 25, scope: "international", status: "scheduled" },
  { id: "solidarity-palestinian", nameNl: "Internationale Dag van Solidariteit met het Palestijnse Volk", month: 11, day: 29, scope: "international", status: "scheduled" },
  { id: "slavery-abolition", nameNl: "Internationale Dag voor de Afschaffing van Slavernij", month: 12, day: 2, scope: "international", status: "scheduled" },
  { id: "anti-corruption", nameNl: "Internationale Dag tegen Corruptie", month: 12, day: 9, scope: "international", status: "scheduled" },
  { id: "mountains", nameNl: "Internationale Bergendag", month: 12, day: 11, scope: "international", status: "scheduled" },
  { id: "solidarity", nameNl: "Internationale Dag van Menselijke Solidariteit", month: 12, day: 20, scope: "international", status: "scheduled" },
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
