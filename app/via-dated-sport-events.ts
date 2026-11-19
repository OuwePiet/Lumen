/** VIA Wereldkalender — gecontroleerde eenmalige sportevenementen.
 * @OuwePiet 2026. Geen automatische jaarlijkse herhaling.
 * Bron: https://nnmarathonrotterdam.nl/ (gecontroleerd 19-11-2026).
 */
export const VIA_DATED_SPORT_EVENTS = [
  {id:"rotterdam-marathon-weekend-2027",nameNl:"NN Marathon Rotterdam — marathonweekend (Kids Runs, City Run en wandelen)",year:2027,month:4,day:10,scope:"regional" as const,status:"scheduled" as const,country:"NL",city:"Rotterdam",source:"https://nnmarathonrotterdam.nl/"},
  {id:"rotterdam-marathon-2027",nameNl:"NN Marathon Rotterdam — 46e editie, 42,195 km en NK Marathon",year:2027,month:4,day:11,scope:"regional" as const,status:"scheduled" as const,country:"NL",city:"Rotterdam",source:"https://nnmarathonrotterdam.nl/"},
] as const
