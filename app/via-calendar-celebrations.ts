import type { ViaLanguage } from "./via-local-settings"

/** Gregorian Easter, shared by the existing calendar and seasonal decoration. */
export function viaEasterSunday(year: number) {
  const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4
  const f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30
  const i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451)
  const n=h+l-7*m+114
  return {month:Math.floor(n/31),day:n%31+1}
}
const names: Record<ViaLanguage, readonly string[]> = {
  Dutch:["Elfde van de elfde · opening carnavalsseizoen","Sint-Maarten","Carnavalszondag","Carnavalsmaandag","Carnavalsdinsdag","Aswoensdag"],
  English:["11/11 · opening of the carnival season","Saint Martin’s Day","Carnival Sunday","Carnival Monday","Shrove Tuesday","Ash Wednesday"],
  French:["11/11 · ouverture de la saison du carnaval","Saint-Martin","Dimanche de carnaval","Lundi de carnaval","Mardi gras","Mercredi des Cendres"],
  Spanish:["11/11 · apertura de la temporada de carnaval","San Martín","Domingo de carnaval","Lunes de carnaval","Martes de carnaval","Miércoles de Ceniza"],
  Chinese:["11月11日 · 狂欢季开幕","圣马丁节","狂欢节星期日","狂欢节星期一","忏悔星期二","圣灰星期三"],
  Hindi:["11/11 · कार्निवल सत्र का आरंभ","संत मार्टिन दिवस","कार्निवल रविवार","कार्निवल सोमवार","कार्निवल मंगलवार","राख बुधवार"],
}
export const VIA_CARNIVAL_NOTE: Record<ViaLanguage,string> = {
  Dutch:"Regionale tradities in Nederland, België en delen van Duitsland; niet overal een vrije dag. 11/11 opent het seizoen vooral in Nederland en delen van Duitsland. Plaatselijke carnavalsdata en Braziliaanse evenementen kunnen afwijken.",
  English:"Regional traditions in the Netherlands, Belgium and parts of Germany; not public holidays everywhere. The 11/11 season opening is observed mainly in the Netherlands and parts of Germany. Local carnival dates and Brazilian events may differ.",
  French:"Traditions régionales aux Pays-Bas, en Belgique et dans certaines régions d’Allemagne ; pas partout des jours fériés. L’ouverture du 11/11 concerne surtout les Pays-Bas et certaines régions d’Allemagne. Les dates locales et les événements brésiliens peuvent différer.",
  Spanish:"Tradiciones regionales de Países Bajos, Bélgica y partes de Alemania; no son festivos en todas partes. El inicio del 11/11 se celebra sobre todo en Países Bajos y partes de Alemania. Las fechas locales y los eventos brasileños pueden variar.",
  Chinese:"荷兰、比利时及德国部分地区的地方传统，并非各地法定假日。11月11日开幕主要见于荷兰及德国部分地区。当地狂欢节日期及巴西活动可能不同。",
  Hindi:"नीदरलैंड, बेल्जियम और जर्मनी के कुछ क्षेत्रों की परंपराएँ; हर जगह सार्वजनिक अवकाश नहीं। 11/11 का आरंभ मुख्यतः नीदरलैंड और जर्मनी के कुछ क्षेत्रों में मनाया जाता है। स्थानीय कार्निवल और ब्राज़ील के कार्यक्रमों की तारीखें अलग हो सकती हैं।",
}
export function viaRegionalCelebrations(year: number, region: string, language: ViaLanguage = "Dutch") {
  const easter=viaEasterSunday(year), origin=Date.UTC(year,easter.month-1,easter.day)
  const definitions=[
    {id:"carnival-opening",month:11,day:11,countries:["NL","DE"],index:0},
    {id:"saint-martin",month:11,day:11,countries:["NL","BE","DE"],index:1},
    ...[-49,-48,-47,-46].map((offset,index)=>{
      const date=new Date(origin+offset*86400000)
      return {id:["carnival-sunday","carnival-monday","carnival-tuesday","ash-wednesday"][index],month:date.getUTCMonth()+1,day:date.getUTCDate(),countries:["NL","BE","DE"],index:index+2}
    }),
  ]
  return definitions.filter(event=>region==="world" || event.countries.includes(region)).map(({index,...event})=>({...event,nameNl:names[language][index],scope:"regional" as const,status:"scheduled" as const}))
}
export type ViaSeasonalMode = "none" | "easter" | "snow" | "november-eleven" | "carnival" | "halloween"
export function viaSeasonalMode(now: Date): ViaSeasonalMode {
  if (now.getMonth()===10 && now.getDate()===11) return "november-eleven"
  const events=viaRegionalCelebrations(now.getFullYear(),"world")
  if (events.some(event=>event.id.startsWith("carnival-") && event.id!=="carnival-opening" && event.month===now.getMonth()+1 && event.day===now.getDate())) return "carnival"
  const easter=viaEasterSunday(now.getFullYear())
  const date=Date.UTC(now.getFullYear(),now.getMonth(),now.getDate()), origin=Date.UTC(now.getFullYear(),easter.month-1,easter.day)
  if (date>=origin-2*86400000 && date<=origin+86400000) return "easter"
  if (now.getMonth()===9 && now.getDate()===31) return "halloween"
  return [11,0,1].includes(now.getMonth()) ? "snow" : "none"
}
