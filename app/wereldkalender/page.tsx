"use client"

import { useEffect, useMemo, useState } from "react"
import { VIA_INTERNATIONAL_DAYS } from "../via-international-calendar"
import { viaOfflineLunarDates } from "../via-calendar-offline-dates"
import { VIA_CALENDAR_REGIONS, viaCalendarLocalDate, type ViaCalendarRegion } from "../via-calendar-regions"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"

// Inline vector pictograms: no network requests, external fonts or icon package.
const holidaySymbol = (id: string, name: string): {paths:string; color:string} | null => {
  const text = (id + " " + name).toLowerCase()
  if (/animal|dier|wildlife/.test(text)) return {paths:"M12 20c-3 0-7-2-7-5 0-2 2-3 3-3 2 0 2 2 4 2s2-2 4-2c1 0 3 1 3 3 0 3-4 5-7 5ZM5 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm5-3a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm5 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm5 3a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",color:"#e9c979"}
  if (/health|gezondheid/.test(text)) return {paths:"M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8ZM3 12h5l2-4 4 8 2-4h5",color:"#a6e4bd"}
  if (/food|voedsel/.test(text)) return {paths:"M12 21V8m0 9c-4 0-6-3-6-6 4 0 6 2 6 6Zm0-4c4 0 6-3 6-6-4 0-6 2-6 6Zm0-9c-2-2-2-4 0-6 2 2 2 4 0 6Z",color:"#e8c876"}
  if (/teacher|leraar|education|onderwijs/.test(text)) return {paths:"M12 7C9 5 6 5 3 6v14c3-1 6-1 9 1 3-2 6-2 9-1V6c-3-1-6-1-9 1Zm0 0v14",color:"#d4e9b7"}
  if (/united.nations|verenigde.naties/.test(text)) return {paths:"M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-10 10h20M12 2c-5 5-5 15 0 20M12 2c5 5 5 15 0 20M4 7h16M4 17h16",color:"#a9d6f5"}
  if (/earth|aarde|environment|milieu/.test(text)) return {paths:"M20 4c-9 0-15 4-15 11a5 5 0 0 0 5 5c7 0 11-6 10-16ZM5 20c3-6 7-9 12-12",color:"#b5e3b2"}
  return null
}

const HolidayIcon = ({id,name}:{id:string;name:string}) => {
  const icon = holidaySymbol(id,name)
  if (!icon) return null
  return <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke={icon.color} strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{filter:"drop-shadow(0 1px 3px rgba(0,0,0,.25))",flexShrink:0}}><path d={icon.paths}/></svg>
}

const flagForCountry = (code:string):string => /^[A-Z]{2}$/.test(code) ? [...code].map(letter=>String.fromCodePoint(127397+letter.charCodeAt(0))).join("") : "🌍"

const holidayEmoji = (id:string,name:string):string => {
  const text=(id+" "+name).toLowerCase()
  const nationalFlag: Record<string,string> = {"es-national":"🇪🇸","nl-kings-day":"🇳🇱","nl-liberation":"🇳🇱","be-national":"🇧🇪","fr-bastille":"🇫🇷","de-unity":"🇩🇪","pt-national":"🇵🇹","us-independence":"🇺🇸","ca-canada":"🇨🇦","mx-independence":"🇲🇽","br-independence":"🇧🇷","in-republic":"🇮🇳","cn-national":"🇨🇳","jp-foundation":"🇯🇵","za-freedom":"🇿🇦","au-day":"🇦🇺","nz-waitangi":"🇳🇿"}
  if (nationalFlag[id]) return nationalFlag[id]
  if (/halloween/.test(text)) return "🎃"
  if (/christmas|kerst/.test(text)) return "🎄"
  if (/new.year|nieuwjaar/.test(text)) return "🎆"
  if (/easter|pasen/.test(text)) return "🐣"
  if (/lunar|chinese/.test(text)) return "🧧"
  if (/ramadan|eid/.test(text)) return "🌙"
  if (/diwali/.test(text)) return "🪔"
  if (/holi/.test(text)) return "🎨"
  if (/valentine|liefde/.test(text)) return "❤️"
  if (/coming.out|pride/.test(text)) return "🏳️‍🌈"
  if (/women|vrouw|girl|meisje/.test(text)) return "👩"
  return "🌍"
}

const monthNames = ["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"]
const calendarLocales: Record<ViaLanguage,string> = {Dutch:"nl-NL",English:"en-GB",French:"fr-FR",Spanish:"es-ES",Chinese:"zh-CN",Hindi:"hi-IN"}

const calendarUi = {
  Dutch: {home:"VIA Home",title:"VIA Wereldkalender",intro:"Internationale dagen, vieringen en herdenkingen.",language:"VIA-taal",continent:"Werelddeel",country:"Land / tijdzone",today:"Vandaag in deze tijdzone",month:"Vieringen deze maand",day:"Vieringen op",empty:"Geen geregistreerde vieringen voor deze selectie."},
  English: {home:"VIA Home",title:"VIA World Calendar",intro:"International observances, celebrations and commemorations.",language:"VIA language",continent:"Continent",country:"Country / time zone",today:"Today in this time zone",month:"Observances this month",day:"Observances on",empty:"No listed observances for this selection."},
  French: {home:"Accueil VIA",title:"Calendrier mondial VIA",intro:"Journées internationales, célébrations et commémorations.",language:"Langue VIA",continent:"Continent",country:"Pays / fuseau horaire",today:"Aujourd'hui dans ce fuseau horaire",month:"Événements de ce mois",day:"Événements du",empty:"Aucun événement répertorié pour cette sélection."},
  Spanish: {home:"Inicio VIA",title:"Calendario mundial VIA",intro:"Días internacionales, celebraciones y conmemoraciones.",language:"Idioma VIA",continent:"Continente",country:"País / zona horaria",today:"Hoy en esta zona horaria",month:"Celebraciones de este mes",day:"Celebraciones del",empty:"No hay celebraciones registradas para esta selección."},
  Chinese: {home:"VIA 首页",title:"VIA 世界日历",intro:"国际纪念日、庆祝活动和纪念事项。",language:"VIA 语言",continent:"大洲",country:"国家／时区",today:"此时区的今天",month:"本月纪念活动",day:"纪念活动日期",empty:"该选项暂无记录的活动。"},
  Hindi: {home:"VIA होम",title:"VIA विश्व कैलेंडर",intro:"अंतरराष्ट्रीय दिवस, उत्सव और स्मरण दिवस।",language:"VIA भाषा",continent:"महाद्वीप",country:"देश / समय क्षेत्र",today:"इस समय क्षेत्र में आज",month:"इस महीने के आयोजन",day:"इस तारीख के आयोजन",empty:"इस चयन के लिए कोई आयोजन सूचीबद्ध नहीं है।"},
} satisfies Record<ViaLanguage,Record<string,string>>

const extraUi: Record<ViaLanguage,{localDate:string,monthAll:string,international:string,regional:string,cultural:string}> = {
  Dutch:{localDate:"Lokale datum",monthAll:"Hele maand",international:"internationale dag",regional:"landgebonden viering",cultural:"culturele viering"},
  English:{localDate:"Local date",monthAll:"All month",international:"international observance",regional:"country-specific observance",cultural:"cultural celebration"},
  French:{localDate:"Date locale",monthAll:"Tout le mois",international:"journée internationale",regional:"événement national",cultural:"célébration culturelle"},
  Spanish:{localDate:"Fecha local",monthAll:"Todo el mes",international:"día internacional",regional:"celebración nacional",cultural:"celebración cultural"},
  Chinese:{localDate:"当地日期",monthAll:"整个月",international:"国际纪念日",regional:"国家纪念活动",cultural:"文化庆典"},
  Hindi:{localDate:"स्थानीय तारीख",monthAll:"पूरा महीना",international:"अंतरराष्ट्रीय दिवस",regional:"देश-विशेष आयोजन",cultural:"सांस्कृतिक उत्सव"},
}

const guidanceUi: Record<ViaLanguage,{pendingTitle:string,pendingInfo:string,pendingDate:string,languageNote:string}> = {
  Dutch:{pendingTitle:"Wisselende datums — nog te bevestigen",pendingInfo:"Voor deze vieringen worden geen onbetrouwbare datums verzonnen. Landelijke en religieuze bevestigingen kunnen verschillen.",pendingDate:"datum nog niet gekoppeld",languageNote:"De gekozen taal wordt voor heel VIA bewaard. De vertaling van alle kalenderteksten volgt nog."},
  English:{pendingTitle:"Variable dates — awaiting confirmation",pendingInfo:"Unverified dates are not invented. National and religious confirmations may differ.",pendingDate:"date not yet linked",languageNote:"Your language choice is saved across VIA. Some calendar content still awaits translation."},
  French:{pendingTitle:"Dates variables — à confirmer",pendingInfo:"Aucune date non vérifiée n'est inventée. Les confirmations nationales et religieuses peuvent varier.",pendingDate:"date non encore renseignée",languageNote:"La langue choisie est enregistrée pour VIA. Certains contenus restent à traduire."},
  Spanish:{pendingTitle:"Fechas variables — pendientes de confirmar",pendingInfo:"No se inventan fechas sin verificar. Las confirmaciones nacionales y religiosas pueden variar.",pendingDate:"fecha aún no vinculada",languageNote:"El idioma elegido se guarda en VIA. Quedan algunos textos por traducir."},
  Chinese:{pendingTitle:"浮动日期——有待确认",pendingInfo:"不会编造未经核实的日期。各国及宗教机构的确认日期可能不同。",pendingDate:"日期尚未确定",languageNote:"语言选择将在 VIA 中保存。部分日历内容尚待翻译。"},
  Hindi:{pendingTitle:"बदलती तारीखें — पुष्टि बाकी",pendingInfo:"बिना पुष्टि के तारीखें नहीं दी जातीं। देश और धार्मिक परंपरा के अनुसार तारीखें अलग हो सकती हैं।",pendingDate:"तारीख अभी तय नहीं",languageNote:"चुनी गई भाषा VIA में सहेजी जाती है। कुछ कैलेंडर सामग्री का अनुवाद बाकी है।"},
}

const continentLabels: Record<ViaLanguage,Record<string,string>> = {
  Dutch: {world:"Wereldwijd",europe:"Europa",asia:"Azië",africa:"Afrika","north-america":"Noord-Amerika","south-america":"Zuid-Amerika",oceania:"Oceanië"},
  English: {world:"Worldwide",europe:"Europe",asia:"Asia",africa:"Africa","north-america":"North America","south-america":"South America",oceania:"Oceania"},
  French: {world:"Monde",europe:"Europe",asia:"Asie",africa:"Afrique","north-america":"Amérique du Nord","south-america":"Amérique du Sud",oceania:"Océanie"},
  Spanish: {world:"Mundial",europe:"Europa",asia:"Asia",africa:"África","north-america":"América del Norte","south-america":"América del Sur",oceania:"Oceanía"},
  Chinese: {world:"全球",europe:"欧洲",asia:"亚洲",africa:"非洲","north-america":"北美洲","south-america":"南美洲",oceania:"大洋洲"},
  Hindi: {world:"विश्वभर",europe:"यूरोप",asia:"एशिया",africa:"अफ़्रीका","north-america":"उत्तरी अमेरिका","south-america":"दक्षिणी अमेरिका",oceania:"ओशिनिया"},
}

function easterSunday(year: number) {
  const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4
  const f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30
  const i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451)
  const n=h+l-7*m+114
  return {month:Math.floor(n/31),day:n%31+1}
}

export default function WereldkalenderPage() {
  const [today,setToday] = useState(() => new Date())
  useEffect(() => {
    const refresh = () => setToday(new Date())
    const interval = window.setInterval(refresh, 60_000)
    document.addEventListener("visibilitychange", refresh)
    return () => { window.clearInterval(interval); document.removeEventListener("visibilitychange", refresh) }
  }, [])
  const [year,setYear] = useState(() => viaCalendarLocalDate(today,"world").year)
  const [month,setMonth] = useState(() => viaCalendarLocalDate(today,"world").month-1)
  const [selected,setSelected] = useState<number|null>(null)
  const [eventPage,setEventPage] = useState(0)
  const [eventPageSize,setEventPageSize] = useState(16)
  const [region,setRegion] = useState<ViaCalendarRegion>("world")
  const [language,setLanguage] = useState<ViaLanguage>("English")
  useEffect(() => {
    const sync = () => setLanguage(readViaLocalSettings().interfaceLanguage)
    sync()
    window.addEventListener(VIA_SETTINGS_EVENT,sync)
    window.addEventListener("storage",sync)
    return () => { window.removeEventListener(VIA_SETTINGS_EVENT,sync);window.removeEventListener("storage",sync) }
  }, [])
  const continentByRegion = Object.fromEntries(VIA_CALENDAR_REGIONS.map(item => {
    const zone=item.zone
    const continent=item.code==="world"?"world":zone.startsWith("Europe/")?"europe":zone.startsWith("Africa/")?"africa":zone.startsWith("Asia/")?"asia":zone.startsWith("Australia/")||zone.startsWith("Pacific/")?"oceania":zone.startsWith("America/")?(["US","CA","MX","CR","PA","CU","DO","GT","HN","SV","NI","JM"].includes(item.code)?"north-america":"south-america"):"world"
    return [item.code,continent]
  })) as Record<ViaCalendarRegion,string>
  const [continent,setContinent] = useState("world")
  const regionOptions = VIA_CALENDAR_REGIONS.filter(item => continent==="world" ? true : continentByRegion[item.code]===continent)
  const availableRegions = regionOptions.length > 0 ? regionOptions : VIA_CALENDAR_REGIONS.filter(item=>item.code==="world")
  const selectedRegion = availableRegions.some(item=>item.code===region) ? region : availableRegions[0].code
  const local = viaCalendarLocalDate(today,selectedRegion)
  const [publicHolidays,setPublicHolidays] = useState<Array<{date:string;name:string;localName:string;country:string;regions:string[]}>>([])
  const [holidayDataAvailable,setHolidayDataAvailable] = useState<boolean|null>(null)
  const [holidayLoading,setHolidayLoading] = useState(false)
  const [holidayCoverage,setHolidayCoverage] = useState<{availableCountries:string[];unavailableCountries:string[];unsupportedCountries:string[]}|null>(null)
  useEffect(() => {
    
    const controller = new AbortController()
    setPublicHolidays([])
    setHolidayDataAvailable(null)
    setHolidayCoverage(null)
    setHolidayLoading(true)
    fetch(`/api/via-calendar-holidays?year=${year}&country=${selectedRegion}`,{signal:controller.signal})
      .then(response=>response.ok?response.json():Promise.reject(new Error("holiday lookup")))
      .then((data:{holidays?:Array<{date:string;name:string;localName:string;country:string;regions:string[]}>;available?:boolean;availableCountries?:string[];unavailableCountries?:string[];unsupportedCountries?:string[]})=>{
        if (!controller.signal.aborted) { setPublicHolidays(Array.isArray(data.holidays)?data.holidays:[]); setHolidayDataAvailable(data.available===true); setHolidayLoading(false); setHolidayCoverage({availableCountries:data.availableCountries??[],unavailableCountries:data.unavailableCountries??[],unsupportedCountries:data.unsupportedCountries??[]}) }
      })
      .catch(()=>{ if (!controller.signal.aborted) {setPublicHolidays([]);setHolidayDataAvailable(false);setHolidayLoading(false)} })
    return ()=>controller.abort()
  },[selectedRegion,year])
  const locale = calendarLocales[language]
  const ui = calendarUi[language]
  const labels = extraUi[language]
  const guidance = guidanceUi[language]
  const localizedMonth = new Intl.DateTimeFormat(locale,{month:"long",year:"numeric"}).format(new Date(year,month,1)).replace(/\bDe\b/g,"de")
  const localizedWeekdays = Array.from({length:7},(_,index)=>new Intl.DateTimeFormat(locale,{weekday:"short"}).format(new Date(2024,0,1+index)))
  const days = useMemo(() => {
    const easter=easterSunday(year)
    return VIA_INTERNATIONAL_DAYS.filter(d => d.status==="scheduled" && d.month===month+1)
      .map(d=>({ ...d, day:d.day??null }))
      .concat(easter.month===month+1 ? [{id:"easter",nameNl:"Pasen",month:easter.month,day:easter.day,scope:"cultural" as const,status:"scheduled" as const}]:[])
  },[year,month])
  const offlineLunar = useMemo(() => viaOfflineLunarDates(year), [year])
  const unresolved = VIA_INTERNATIONAL_DAYS.filter(d=>d.status==="date-required" && d.id!=="easter" && !offlineLunar.some(known=>known.id===d.id || (d.id==="eid" && known.id==="eid-al-fitr")))
  const easter=easterSunday(year)
  const easterDate=new Date(Date.UTC(year,easter.month-1,easter.day))
  const relativeDate=(daysFromEaster:number)=>{
    const date=new Date(easterDate.getTime()+daysFromEaster*86_400_000)
    return {month:date.getUTCMonth()+1,day:date.getUTCDate()}
  }
  const nthWeekday=(targetMonth:number,weekday:number,ordinal:number)=>{
    const first=new Date(Date.UTC(year,targetMonth-1,1)).getUTCDay()
    return 1+(weekday-first+7)%7+(ordinal-1)*7
  }
  const calculatedHolidays=[
    {id:"good-friday",nameNl:"Goede Vrijdag",...relativeDate(-2)},
    {id:"easter-monday",nameNl:"Tweede paasdag",...relativeDate(1)},
    {id:"ascension",nameNl:"Hemelvaartsdag",...relativeDate(39)},
    {id:"pentecost",nameNl:"Pinksteren",...relativeDate(49)},
    {id:"pentecost-monday",nameNl:"Tweede pinksterdag",...relativeDate(50)},
    {id:"mothers-day",nameNl:"Moederdag (tweede zondag mei; onder meer Nederland en VS)",month:5,day:nthWeekday(5,0,2)},
    {id:"fathers-day",nameNl:"Vaderdag (derde zondag juni; onder meer Nederland en VS)",month:6,day:nthWeekday(6,0,3)},
    {id:"thanksgiving-us",nameNl:"Thanksgiving (Verenigde Staten)",month:11,day:nthWeekday(11,4,4)},
  ].filter(d=>d.month===month+1 && (d.id==="thanksgiving-us" ? selectedRegion==="US" : d.id==="mothers-day" || d.id==="fathers-day" ? ["NL","US"].includes(selectedRegion) : ["NL","BE","DE","FR","GB","ES","IT","PT"].includes(selectedRegion)))
  // Landgebonden vaste dagen: alleen tonen voor het geselecteerde land.
  // Niet elke nationale viering is automatisch een wettelijke vrije dag.
  const countryDays = [
    {id:"nl-kings-day",nameNl:"Koningsdag (Nederland)",country:"NL",month:4,day:year>=2014 && new Date(year,3,27).getDay()===0?26:27},
    {id:"nl-liberation",nameNl:"Bevrijdingsdag (Nederland)",country:"NL",month:5,day:5},
    {id:"be-national",nameNl:"Nationale feestdag (België)",country:"BE",month:7,day:21},
    {id:"fr-bastille",nameNl:"Nationale feestdag (Frankrijk)",country:"FR",month:7,day:14},
    {id:"de-unity",nameNl:"Dag van de Duitse Eenheid",country:"DE",month:10,day:3},
    {id:"es-national",nameNl:"Nationale feestdag (Spanje)",country:"ES",month:10,day:12},
    {id:"pt-national",nameNl:"Dag van Portugal",country:"PT",month:6,day:10},
    {id:"us-independence",nameNl:"Independence Day (Verenigde Staten)",country:"US",month:7,day:4},
    {id:"ca-canada",nameNl:"Canada Day",country:"CA",month:7,day:1},
    {id:"mx-independence",nameNl:"Onafhankelijkheidsdag (Mexico)",country:"MX",month:9,day:16},
    {id:"br-independence",nameNl:"Onafhankelijkheidsdag (Brazilië)",country:"BR",month:9,day:7},
    {id:"in-republic",nameNl:"Dag van de Republiek (India)",country:"IN",month:1,day:26},
    {id:"cn-national",nameNl:"Nationale feestdag (China)",country:"CN",month:10,day:1},
    {id:"jp-foundation",nameNl:"Dag van de Stichting van Japan",country:"JP",month:2,day:11},
    {id:"za-freedom",nameNl:"Freedom Day (Zuid-Afrika)",country:"ZA",month:4,day:27},
    {id:"au-day",nameNl:"Australia Day",country:"AU",month:1,day:26},
    {id:"nz-waitangi",nameNl:"Waitangi Day (Nieuw-Zeeland)",country:"NZ",month:2,day:6},
  ].filter(d=>(selectedRegion===d.country || selectedRegion==="world") && d.month===month+1)
  // Compact, explicitly verified language hints; no assumption that country selects the VIA interface language.
  const countryLanguages:Record<string,string> = {
    NL:"Nederlands",BE:"Nederlands · français · Deutsch",DE:"Deutsch",FR:"Français",ES:"Español",PT:"Português",IT:"Italiano",GB:"English",US:"English",CA:"English · français",MX:"Español",BR:"Português",IN:"हिन्दी · English (en andere)",CN:"中文",JP:"日本語",ZA:"isiZulu · isiXhosa · Afrikaans · English (+ andere)",AU:"English",NZ:"English · te reo Māori · NZSL"
  }
  const sourceHolidays = publicHolidays.filter(d=>Number(d.date.slice(5,7))===month+1).map((d,i)=>({
    id:`public-${d.country}-${d.date}-${i}`,
    nameNl: language==="Dutch" ? d.localName : d.name,
    month:month+1,day:Number(d.date.slice(8,10)),country:d.country,
    scope:"regional" as const,status:"scheduled" as const,
  }))
  const monthEventsRaw=[...days,...offlineLunar.filter(d=>d.month===month+1),...calculatedHolidays.map(d=>({...d,scope:"cultural" as const,status:"scheduled" as const})),...(holidayDataAvailable!==true ? countryDays.map(d=>({...d,scope:"regional" as const,status:"scheduled" as const})) : []),...sourceHolidays]
  const monthEvents=Array.from(new Map(monthEventsRaw.map(d=>[`${d.month}|${d.day}|${"country" in d ? d.country : ""}|${d.nameNl.trim().toLowerCase()}`,d])).values()).sort((a,b)=>(a.day??0)-(b.day??0) || a.nameNl.localeCompare(b.nameNl,locale))
  const offset=(new Date(year,month,1).getDay()+6)%7
  const length=new Date(year,month+1,0).getDate()
  const move=(direction:number)=>{
    const next=new Date(year,month+direction,1)
    setYear(next.getFullYear());setMonth(next.getMonth());setSelected(null)
  }
  const shown=selected===null ? monthEvents : monthEvents.filter(d=>d.day===selected || d.day===null)
  const pageSize=eventPageSize
  const pageCount=Math.max(1,Math.ceil(shown.length/pageSize))
  const currentEventPage=Math.min(eventPage,pageCount-1)
  const pagedEvents=shown.slice(currentEventPage*pageSize,(currentEventPage+1)*pageSize)
  useEffect(()=>{setEventPage(0)},[month,year,selected,selectedRegion])
  const holidayNames: Record<string,Partial<Record<ViaLanguage,string>>> = {
    "es-national":{English:"National Day of Spain",French:"Fête nationale de l’Espagne",Spanish:"Fiesta Nacional de España",Chinese:"西班牙国庆日",Hindi:"स्पेन का राष्ट्रीय दिवस"},
    "nl-kings-day":{English:"King’s Day (The Netherlands)",French:"Fête du Roi (Pays-Bas)",Spanish:"Día del Rey (Países Bajos)",Chinese:"荷兰国王节",Hindi:"नीदरलैंड का राजा दिवस"},
    "nl-liberation":{English:"Liberation Day (The Netherlands)",French:"Jour de la Libération (Pays-Bas)",Spanish:"Día de la Liberación (Países Bajos)",Chinese:"荷兰解放日",Hindi:"नीदरलैंड मुक्ति दिवस"},
    "fr-bastille":{English:"National Day of France",French:"Fête nationale française",Spanish:"Fiesta Nacional de Francia",Chinese:"法国国庆日",Hindi:"फ्रांस का राष्ट्रीय दिवस"},
    "de-unity":{English:"German Unity Day",French:"Jour de l’Unité allemande",Spanish:"Día de la Unidad Alemana",Chinese:"德国统一日",Hindi:"जर्मन एकता दिवस"},
    "pt-national":{English:"Portugal Day",French:"Jour du Portugal",Spanish:"Día de Portugal",Chinese:"葡萄牙日",Hindi:"पुर्तगाल दिवस"},

    "teachers":{English:"World Teachers’ Day",French:"Journée mondiale des enseignants",Spanish:"Día Mundial de los Docentes",Chinese:"世界教师日",Hindi:"विश्व शिक्षक दिवस"},
    "food":{English:"World Food Day",French:"Journée mondiale de l’alimentation",Spanish:"Día Mundial de la Alimentación",Chinese:"世界粮食日",Hindi:"विश्व खाद्य दिवस"},
    "mental-health":{English:"World Mental Health Day",French:"Journée mondiale de la santé mentale",Spanish:"Día Mundial de la Salud Mental",Chinese:"世界精神卫生日",Hindi:"विश्व मानसिक स्वास्थ्य दिवस"},
    "girls":{English:"International Day of the Girl Child",French:"Journée internationale de la fille",Spanish:"Día Internacional de la Niña",Chinese:"国际女童日",Hindi:"अंतरराष्ट्रीय बालिका दिवस"},
    "coming-out":{English:"Coming Out Day",French:"Journée du coming out",Spanish:"Día para Salir del Armario",Chinese:"出柜日",Hindi:"कमिंग आउट दिवस"},
    "halloween":{English:"Halloween",French:"Halloween",Spanish:"Halloween",Chinese:"万圣夜",Hindi:"हैलोवीन"},
    "united-nations":{English:"United Nations Day",French:"Journée des Nations unies",Spanish:"Día de las Naciones Unidas",Chinese:"联合国日",Hindi:"संयुक्त राष्ट्र दिवस"},
    "trans-visibility":{English:"Transgender Day of Visibility",French:"Journée de visibilité transgenre",Spanish:"Día de la Visibilidad Trans",Chinese:"跨性别现身日",Hindi:"ट्रांसजेंडर दृश्यता दिवस"},
    "human-rights":{English:"Human Rights Day",French:"Journée des droits de l’homme",Spanish:"Día de los Derechos Humanos",Chinese:"人权日",Hindi:"मानवाधिकार दिवस"},
    "education":{English:"International Day of Education",French:"Journée internationale de l’éducation",Spanish:"Día Internacional de la Educación",Chinese:"国际教育日",Hindi:"अंतरराष्ट्रीय शिक्षा दिवस"},
    "water":{English:"World Water Day",French:"Journée mondiale de l’eau",Spanish:"Día Mundial del Agua",Chinese:"世界水日",Hindi:"विश्व जल दिवस"},
    "health":{English:"World Health Day",French:"Journée mondiale de la santé",Spanish:"Día Mundial de la Salud",Chinese:"世界卫生日",Hindi:"विश्व स्वास्थ्य दिवस"},
    "environment":{English:"World Environment Day",French:"Journée mondiale de l’environnement",Spanish:"Día Mundial del Medio Ambiente",Chinese:"世界环境日",Hindi:"विश्व पर्यावरण दिवस"},
    "ocean":{English:"World Oceans Day",French:"Journée mondiale de l’océan",Spanish:"Día Mundial de los Océanos",Chinese:"世界海洋日",Hindi:"विश्व महासागर दिवस"},
    "refugees":{English:"World Refugee Day",French:"Journée mondiale des réfugiés",Spanish:"Día Mundial de los Refugiados",Chinese:"世界难民日",Hindi:"विश्व शरणार्थी दिवस"},
    "youth":{English:"International Youth Day",French:"Journée internationale de la jeunesse",Spanish:"Día Internacional de la Juventud",Chinese:"国际青年日",Hindi:"अंतरराष्ट्रीय युवा दिवस"},
    "literacy":{English:"International Literacy Day",French:"Journée internationale de l’alphabétisation",Spanish:"Día Internacional de la Alfabetización",Chinese:"国际扫盲日",Hindi:"अंतरराष्ट्रीय साक्षरता दिवस"},
    "mother-language":{English:"International Mother Language Day",French:"Journée internationale de la langue maternelle",Spanish:"Día Internacional de la Lengua Materna",Chinese:"国际母语日",Hindi:"अंतरराष्ट्रीय मातृभाषा दिवस"},
    "forest":{English:"International Day of Forests",French:"Journée internationale des forêts",Spanish:"Día Internacional de los Bosques",Chinese:"国际森林日",Hindi:"अंतरराष्ट्रीय वन दिवस"},
    "social-justice":{English:"World Day of Social Justice",French:"Journée mondiale de la justice sociale",Spanish:"Día Mundial de la Justicia Social",Chinese:"世界社会公正日",Hindi:"विश्व सामाजिक न्याय दिवस"},
    "new-year":{English:"New Year’s Day",French:"Jour de l’An",Spanish:"Año Nuevo",Chinese:"元旦",Hindi:"नव वर्ष"},
    women:{English:"International Women’s Day",French:"Journée internationale des femmes",Spanish:"Día Internacional de la Mujer",Chinese:"国际妇女节",Hindi:"अंतरराष्ट्रीय महिला दिवस"},
    earth:{English:"Earth Day",French:"Jour de la Terre",Spanish:"Día de la Tierra",Chinese:"世界地球日",Hindi:"पृथ्वी दिवस"},
    pride:{English:"Pride Month",French:"Mois des fiertés",Spanish:"Mes del Orgullo",Chinese:"骄傲月",Hindi:"प्राइड माह"},
    peace:{English:"International Day of Peace",French:"Journée internationale de la paix",Spanish:"Día Internacional de la Paz",Chinese:"国际和平日",Hindi:"अंतरराष्ट्रीय शांति दिवस"},
    animals:{English:"World Animal Day",French:"Journée mondiale des animaux",Spanish:"Día Mundial de los Animales",Chinese:"世界动物日",Hindi:"विश्व पशु दिवस"},
    children:{English:"World Children’s Day",French:"Journée mondiale de l’enfance",Spanish:"Día Mundial de la Infancia",Chinese:"世界儿童日",Hindi:"विश्व बाल दिवस"},
    christmas:{English:"Christmas Day",French:"Noël",Spanish:"Navidad",Chinese:"圣诞节",Hindi:"क्रिसमस"},
    "christmas-eve":{English:"Christmas Eve",French:"Réveillon de Noël",Spanish:"Nochebuena",Chinese:"平安夜",Hindi:"क्रिसमस की पूर्व संध्या"},
    "boxing-day":{English:"Boxing Day",French:"Lendemain de Noël",Spanish:"Segundo día de Navidad",Chinese:"节礼日",Hindi:"बॉक्सिंग डे"},
    "new-years-eve":{English:"New Year’s Eve",French:"Réveillon du Nouvel An",Spanish:"Nochevieja",Chinese:"除夕（公历）",Hindi:"नव वर्ष की पूर्व संध्या"},
    easter:{English:"Easter Sunday",French:"Pâques",Spanish:"Domingo de Pascua",Chinese:"复活节",Hindi:"ईस्टर"},
    "good-friday":{English:"Good Friday",French:"Vendredi saint",Spanish:"Viernes Santo",Chinese:"耶稣受难日",Hindi:"गुड फ्राइडे"},
    "easter-monday":{English:"Easter Monday",French:"Lundi de Pâques",Spanish:"Lunes de Pascua",Chinese:"复活节星期一",Hindi:"ईस्टर सोमवार"},
    ascension:{English:"Ascension Day",French:"Ascension",Spanish:"Ascensión",Chinese:"耶稣升天节",Hindi:"स्वर्गारोहण दिवस"},
    pentecost:{English:"Pentecost",French:"Pentecôte",Spanish:"Pentecostés",Chinese:"圣灵降临节",Hindi:"पेंटेकोस्ट"},
    "pentecost-monday":{English:"Whit Monday",French:"Lundi de Pentecôte",Spanish:"Lunes de Pentecostés",Chinese:"圣灵降临节星期一",Hindi:"पेंटेकोस्ट सोमवार"},
    "lunar-new-year":{English:"Lunar New Year (estimated)",French:"Nouvel An lunaire (estimation)",Spanish:"Año Nuevo Lunar (estimado)",Chinese:"农历新年（估算）",Hindi:"चंद्र नव वर्ष (अनुमानित)"},
    ramadan:{English:"Start of Ramadan (estimated)",French:"Début du ramadan (estimation)",Spanish:"Inicio del Ramadán (estimado)",Chinese:"斋月开始（估算）",Hindi:"रमज़ान आरंभ (अनुमानित)"},
    "eid-al-fitr":{English:"Eid al-Fitr (estimated)",French:"Aïd el-Fitr (estimation)",Spanish:"Eid al-Fitr (estimado)",Chinese:"开斋节（估算）",Hindi:"ईद-उल-फ़ित्र (अनुमानित)"},
    diwali:{English:"Diwali",French:"Divali",Spanish:"Diwali",Chinese:"排灯节",Hindi:"दीपावली"},
    holi:{English:"Holi",French:"Holi",Spanish:"Holi",Chinese:"洒红节",Hindi:"होली"},
  }
  const holidayName=(id:string,fallback:string)=>language==="Dutch"?fallback:(holidayNames[id]?.[language]??fallback)
  const visualTestReady = false
  return (
    <main data-via-provenance="@OuwePiet-2026" style={{maxWidth:980,width:"100%",minWidth:0,boxSizing:"border-box",margin:"0 auto",padding:"clamp(16px,3vw,32px)",color:"inherit",overflowWrap:"anywhere",borderRadius:24,background:"radial-gradient(ellipse at 12% 4%,rgba(87,177,123,.25),transparent 46%),radial-gradient(ellipse at 92% 88%,rgba(216,172,79,.20),transparent 50%),linear-gradient(155deg,rgba(27,65,45,.31),rgba(14,35,30,.14) 48%,rgba(105,83,39,.18) 100%)",boxShadow:"0 22px 65px rgba(0,0,0,.24),inset 0 1px rgba(255,255,255,.20)",border:"1px solid rgba(153,196,155,.36)"}}>
      <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap",marginBottom:14}}><span aria-hidden="true" style={{fontSize:"clamp(36px,7vw,56px)",display:"inline-flex",alignItems:"center",justifyContent:"center",width:78,height:78,borderRadius:22,background:"linear-gradient(145deg,rgba(53,146,93,.40),rgba(212,173,85,.28))",border:"1px solid rgba(199,184,110,.5)",boxShadow:"0 10px 24px rgba(0,0,0,.2),inset 0 1px rgba(255,255,255,.2)"}}>🌍</span><div><h1 style={{fontSize:"clamp(25px,5vw,38px)",fontWeight:750,letterSpacing:"-.025em",margin:"2px 0",textShadow:"0 3px 16px rgba(57,135,94,.25)"}}>{ui.title}</h1></div></div>
      <p>{ui.intro}</p>
      {visualTestReady && <p style={{fontSize:12,opacity:.78,marginTop:8}}>{({Dutch:"VIA kalender · voorbeeldweergave: controleer de opmaak en navigatie. Niet alle variabele feestdagen zijn officieel bevestigd.",English:"VIA calendar · preview: check layout and navigation. Not all variable holiday dates are officially confirmed.",French:"Calendrier VIA · aperçu : vérifiez la mise en page et la navigation. Certaines dates restent à confirmer.",Spanish:"Calendario VIA · vista previa: compruebe el diseño y la navegación. Algunas fechas aún requieren confirmación.",Chinese:"VIA 日历 · 预览：请检查布局与导航。部分节日日期尚未正式确认。",Hindi:"VIA कैलेंडर · पूर्वावलोकन: लेआउट और नेविगेशन जाँचें। कुछ त्योहारों की तिथियाँ अभी अपुष्ट हैं।"} as Record<ViaLanguage,string>)[language]}</p>}
      <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:"12px 24px",padding:"12px 16px",marginTop:14,borderRadius:16,background:"linear-gradient(115deg,rgba(42,98,68,.27),rgba(151,120,54,.11))",border:"1px solid rgba(178,170,103,.30)",boxShadow:"inset 0 1px rgba(255,255,255,.08)"}}>
        <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:"8px 18px"}}>
      <label style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",marginTop:0}}>{ui.continent}
        <select value={continent} onChange={event=>{const next=event.target.value;setContinent(next);setRegion(next==="world"?"world":(VIA_CALENDAR_REGIONS.find(item=>continentByRegion[item.code]===next)?.code??"world"))}} style={{padding:"7px 10px",border:"1px solid #777",borderRadius:8,background:"#21392f",color:"#f5f8f4",boxShadow:"0 3px 9px rgba(0,0,0,.12)"}}>
          {Object.entries(continentLabels[language]).map(([value,label])=><option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",marginTop:0}}>{ui.country}
        <select value={selectedRegion} onChange={event=>{const next=event.target.value as ViaCalendarRegion;setRegion(next);const date=viaCalendarLocalDate(new Date(),next);setYear(date.year);setMonth(date.month-1);setSelected(date.day)}} style={{padding:"7px 10px",border:"1px solid #777",borderRadius:8,background:"#18241e",color:"white"}}>
          {availableRegions.map(item=><option key={item.code} value={item.code}>{item.code==="world"?({Dutch:"Wereldwijd",English:"Worldwide",French:"Monde",Spanish:"Mundial",Chinese:"全球",Hindi:"विश्वव्यापी"} as Record<ViaLanguage,string>)[language]:(item.code==="NL"&&language==="English"?"The Netherlands":new Intl.DisplayNames([locale],{type:"region"}).of(item.code)??item.label)}</option>)}
        </select>
        {countryLanguages[selectedRegion] && <span style={{fontSize:11,opacity:.8,maxWidth:240}}>{countryLanguages[selectedRegion]}</span>}
      </label>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginLeft:"auto",flexWrap:"wrap"}}>
          <span role="timer" aria-live="off" style={{fontSize:"clamp(19px,3vw,26px)",fontWeight:700,fontVariantNumeric:"tabular-nums",whiteSpace:"nowrap"}}>{new Intl.DateTimeFormat(locale,{timeZone:local.zone,hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).format(today)}</span>
          <button type="button" title={ui.today} aria-label={ui.today} onClick={()=>{setYear(local.year);setMonth(local.month-1);setSelected(local.day)}} style={{padding:"6px 10px",border:"1px solid rgba(201,211,176,.65)",borderRadius:9,fontSize:17}}>⌖</button>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,margin:"14px 0 12px"}}>
        <button type="button" onClick={()=>move(-1)} aria-label={language==="Dutch"?"Vorige maand":language==="French"?"Mois précédent":language==="Spanish"?"Mes anterior":language==="Chinese"?"上个月":language==="Hindi"?"पिछला महीना":"Previous month"} style={{padding:"10px 16px",border:"1px solid currentColor",borderRadius:10}}>‹</button>
        <h2 style={{fontSize:22,fontWeight:600,textTransform:"capitalize"}}>{localizedMonth}</h2>
        <button type="button" onClick={()=>move(1)} aria-label={language==="Dutch"?"Volgende maand":language==="French"?"Mois suivant":language==="Spanish"?"Mes siguiente":language==="Chinese"?"下个月":language==="Hindi"?"अगला महीना":"Next month"} style={{padding:"10px 16px",border:"1px solid currentColor",borderRadius:10}}>›</button>
      </div>
      <div style={{display:"grid",width:"100%",minWidth:0,padding:"clamp(4px,1.2vw,12px)",boxSizing:"border-box",borderRadius:16,background:"radial-gradient(ellipse at 10% 10%,rgba(74,159,110,.18),transparent 60%),linear-gradient(155deg,rgba(68,120,83,.17),rgba(188,154,79,.13))",border:"1px solid rgba(162,185,126,.38)",boxShadow:"inset 0 1px rgba(255,255,255,.09),0 10px 30px rgba(0,0,0,.12)",gridTemplateColumns:"repeat(7,minmax(0,1fr))",gap:"clamp(2px,0.7vw,5px)"}}>
        {localizedWeekdays.map((w,index)=><div key={index} style={{textAlign:"center",fontWeight:700,padding:6}}>{w}</div>)}
        {Array.from({length:offset},(_,i)=><div key={"blank"+i}/>)}
        {Array.from({length},(_,i)=>{
          const day=i+1, events=monthEvents.filter(d=>d.day===day)
          return <button key={day} type="button" onClick={()=>setSelected(selected===day?null:day)}
            aria-pressed={selected===day} aria-current={year===local.year && month+1===local.month && day===local.day?"date":undefined} aria-label={day+" "+localizedMonth+", "+events.length+" "+(language==="Dutch"?"vieringen":language==="French"?"événements":language==="Spanish"?"celebraciones":language==="Chinese"?"项活动":language==="Hindi"?"आयोजन":"observances")}
            style={{minWidth:0,minHeight:"clamp(52px,9vw,68px)",padding:"clamp(2px,0.8vw,6px)",overflow:"hidden",border:"1px solid",borderColor:selected===day?"#4d9f77":year===local.year && month+1===local.month && day===local.day?"#cba34c":"#7775",borderRadius:9,background:selected===day?"linear-gradient(145deg,rgba(70,170,117,.48),rgba(215,175,83,.22))":events.length>0?"linear-gradient(145deg,rgba(78,154,102,.22),rgba(173,148,72,.08))":"rgba(255,255,255,.035)",boxShadow:selected===day?"0 3px 12px rgba(38,99,65,.17)":"inset 0 1px rgba(255,255,255,.04)",textAlign:"left",color:"inherit"}}>
            <span style={{fontWeight:600}}>{day}</span>{events.length>0&&<span aria-hidden="true" style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap",marginTop:5,fontSize:"clamp(25px,3.6vw,34px)",lineHeight:1.15}}>{events.slice(0,3).map(event=><span key={event.id} title={holidayName(event.id,event.nameNl)}>{("country" in event && typeof event.country==="string") ? flagForCountry(event.country) : holidaySymbol(event.id,event.nameNl)?<HolidayIcon id={event.id} name={event.nameNl}/>:holidayEmoji(event.id,event.nameNl)}</span>)}{events.length>3&&<span style={{fontSize:10,opacity:.8}}>+{events.length-3}</span>}</span>}
          </button>
        })}
      </div>
      {holidayLoading && <p role="status" aria-live="polite" style={{fontSize:12,opacity:.8}}>{({Dutch:"Feestdagen worden opgehaald…",English:"Loading holiday data…",French:"Chargement des jours fériés…",Spanish:"Cargando festivos…",Chinese:"正在加载节日数据…",Hindi:"छुट्टियों का डेटा लोड हो रहा है…"} as Record<ViaLanguage,string>)[language]}</p>}
      {holidayCoverage && <p role="status" style={{fontSize:12,opacity:.8}}>Feestdagenbron: {holidayCoverage.availableCountries.length} landen beschikbaar; {holidayCoverage.unavailableCountries.length} niet beschikbaar. Gegevens worden dagelijks opnieuw gecontroleerd wanneer de kalender wordt geopend.</p>}
      {holidayCoverage && holidayCoverage.unsupportedCountries.length>0 && <p role="status" style={{fontSize:12,opacity:.8}}>Geen nationale feestdagenbron voor {holidayCoverage.unsupportedCountries.length} gekozen landen: {holidayCoverage.unsupportedCountries.join(", ")}.</p>}
      {holidayCoverage && holidayCoverage.unavailableCountries.length>0 && <p role="status" style={{fontSize:12,opacity:.8}}>Feestdagenbron niet beschikbaar voor: {holidayCoverage.unavailableCountries.join(", ")}. Andere gegevens blijven zichtbaar.</p>}
      {selectedRegion!=="world" && holidayDataAvailable===false && <p role="status" style={{fontSize:12,opacity:.8}}>{language==="Dutch"?"Geen feestdagengegevens beschikbaar voor dit land; de internationale kalender blijft zichtbaar.":"Country holiday data unavailable; international observances remain visible."}</p>}
      <h2 style={{fontSize:21,fontWeight:600,marginTop:28}}>{selected===null?ui.month:ui.day+" "+selected+" "+localizedMonth}</h2>
      {shown.length===0?<p>{ui.empty}</p>:<ul style={{paddingLeft:22}}>{pagedEvents.map(d=><li key={d.id} style={{margin:"8px 0"}}>{d.day??labels.monthAll} — {"country" in d && typeof d.country==="string" ? flagForCountry(d.country)+" " : ""}{holidayName(d.id,d.nameNl)} {"country" in d && typeof d.country==="string" ? " · "+(new Intl.DisplayNames([locale],{type:"region"}).of(d.country)??d.country) : ""} <span style={{fontSize:12,opacity:.75}}>({d.scope==="international"?labels.international:d.scope==="regional"?labels.regional:labels.cultural})</span></li>)}</ul>}
      {shown.length>8 && <div style={{display:"flex",justifyContent:"flex-end",alignItems:"center",gap:8,marginTop:12,flexWrap:"wrap"}}><label htmlFor="via-calendar-page-size" style={{fontSize:13}}>{language==="Dutch"?"Per pagina":language==="French"?"Par page":language==="Spanish"?"Por página":language==="Chinese"?"每页":language==="Hindi"?"प्रति पृष्ठ":"Per page"}</label><select id="via-calendar-page-size" value={eventPageSize} onChange={event=>{setEventPageSize(Number(event.target.value));setEventPage(0)}} style={{padding:"7px 10px",borderRadius:8,background:"#21392f",color:"white",border:"1px solid #777"}}><option value={8}>8</option><option value={16}>16</option><option value={32}>32</option></select></div>}
      {pageCount>1 && <nav aria-label="Calendar event pages" style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap",marginTop:18,padding:"12px 0",borderTop:"1px solid rgba(168,164,108,.3)"}}>
        <button type="button" disabled={currentEventPage===0} onClick={()=>setEventPage(p=>Math.max(0,p-1))} style={{padding:"10px 14px",borderRadius:9,border:"1px solid currentColor",opacity:currentEventPage===0?.4:1}}>← {language==="Dutch"?"Vorige":language==="French"?"Précédent":language==="Spanish"?"Anterior":"Previous"}</button>
        <span role="status" style={{fontSize:13}}>{language==="Dutch"?"Pagina":language==="French"?"Page":language==="Spanish"?"Página":"Page"} {currentEventPage+1} / {pageCount} · {shown.length} {language==="Dutch"?"vieringen":"events"}</span>
        <button type="button" disabled={currentEventPage>=pageCount-1} onClick={()=>setEventPage(p=>Math.min(pageCount-1,p+1))} style={{padding:"10px 14px",borderRadius:9,border:"1px solid currentColor",opacity:currentEventPage>=pageCount-1?.4:1}}>{language==="Dutch"?"Volgende":language==="French"?"Suivant":language==="Spanish"?"Siguiente":"Next"} →</button>
      </nav>}
      <details style={{marginTop:18,padding:"10px 14px",border:"1px solid rgba(168,164,108,.3)",borderRadius:12,background:"rgba(17,37,26,.23)"}}><summary style={{cursor:"pointer",fontWeight:600,color:"#c5d8b8"}}>{({Dutch:"ⓘ Toelichting bij feestdagen",English:"ⓘ About these observances",French:"ⓘ À propos des célébrations",Spanish:"ⓘ Sobre estas celebraciones",Chinese:"ⓘ 节日说明",Hindi:"ⓘ त्योहारों की जानकारी"} as Record<ViaLanguage,string>)[language]}</summary><div style={{paddingTop:8}}>
      <p style={{fontSize:13,opacity:.85}}>{({Dutch:"Berekende maanfeestdagen zijn indicatief; officiële datums kunnen per land of maanwaarneming verschillen. Geen betaalde dienst.",English:"Calculated lunar dates are estimates; official dates may vary by country or moon sighting. No paid service.",French:"Les dates lunaires calculées sont indicatives ; les dates officielles varient selon les pays et l’observation lunaire. Aucun service payant.",Spanish:"Las fechas lunares calculadas son orientativas; las fechas oficiales pueden variar según el país y la observación lunar. Sin servicios de pago.",Chinese:"农历日期仅为估算；各国官方日期可能因月相观测而不同。不使用付费服务。",Hindi:"गणना की गई चंद्र तिथियाँ अनुमानित हैं; देश और चंद्र-दर्शन के अनुसार आधिकारिक तिथियाँ बदल सकती हैं। कोई सशुल्क सेवा नहीं।"} as Record<ViaLanguage,string>)[language]}</p>
      {unresolved.length>0 && <h2 style={{fontSize:21,fontWeight:600,marginTop:28}}>{guidance.pendingTitle}</h2>}
      {unresolved.length>0 && <p>{guidance.pendingInfo}</p>}
      {unresolved.length>0 && <ul style={{paddingLeft:22}}>{unresolved.map(d=><li key={d.id}>{holidayName(d.id,d.nameNl)}: {guidance.pendingDate}</li>)}</ul>}
      <p style={{marginTop:24,fontSize:13,opacity:.8}}>{({Dutch:"Maandlange vieringen tellen niet als losse dagmeldingen. Nationale en religieuze datums zijn informatief; controleer officiële bronnen voor lokale feestdagen en wettelijke vrije dagen.",English:"Month-long observances are not counted as daily events. National and religious dates are informational; check official sources for local public holidays.",French:"Les célébrations mensuelles ne sont pas comptées comme événements quotidiens. Vérifiez les sources officielles pour les jours fériés locaux.",Spanish:"Las celebraciones de todo el mes no cuentan como eventos diarios. Consulte fuentes oficiales para los festivos locales.",Chinese:"整月纪念活动不计入每日活动。当地法定节假日请以官方资料为准。",Hindi:"पूरे महीने के आयोजन दैनिक कार्यक्रमों में नहीं गिने जाते। स्थानीय सार्वजनिक छुट्टियों के लिए आधिकारिक स्रोत देखें।"} as Record<ViaLanguage,string>)[language]}</p>
      </div></details>
      <footer style={{marginTop:30,padding:"16px 14px",borderTop:"1px solid rgba(112,151,119,.3)",borderRadius:12,background:"linear-gradient(100deg,rgba(51,105,75,.10),rgba(190,154,78,.06))",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap",fontSize:12,opacity:.85}}><span><strong>VIA</strong> · viadeso.online</span><span>{({Dutch:"VIA Wereldkalender · informatieve uitgave",English:"VIA World Calendar · informational edition",French:"Calendrier mondial VIA · édition informative",Spanish:"Calendario mundial VIA · edición informativa",Chinese:"VIA 世界日历 · 信息版",Hindi:"VIA विश्व कैलेंडर · सूचनात्मक संस्करण"} as Record<ViaLanguage,string>)[language]}</span></footer>
    </main>
  )
}
