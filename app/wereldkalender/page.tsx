"use client"

import { useEffect, useMemo, useState } from "react"
import { VIA_INTERNATIONAL_DAYS } from "../via-international-calendar"
import { VIA_CALENDAR_REGIONS, viaCalendarLocalDate, type ViaCalendarRegion } from "../via-calendar-regions"
import { readViaLocalSettings, saveViaLocalSettings, VIA_LANGUAGES, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"

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
  Dutch:{pendingTitle:"Wisselende datums — nog te bevestigen",pendingInfo:"Voor deze vieringen worden geen onbetrouwbare datums verzonnen. Landelijke en religieuze bevestigingen kunnen verschillen.",pendingDate:"datum nog niet gekoppeld",languageNote:"{guidance.languageNote}"},
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
  const [year,setYear] = useState(today.getFullYear())
  const [month,setMonth] = useState(today.getMonth())
  const [selected,setSelected] = useState<number|null>(null)
  const [region,setRegion] = useState<ViaCalendarRegion>("world")
  const [language,setLanguage] = useState<ViaLanguage>("English")
  useEffect(() => {
    const sync = () => setLanguage(readViaLocalSettings().interfaceLanguage)
    sync()
    window.addEventListener(VIA_SETTINGS_EVENT,sync)
    window.addEventListener("storage",sync)
    return () => { window.removeEventListener(VIA_SETTINGS_EVENT,sync);window.removeEventListener("storage",sync) }
  }, [])
  const continentByRegion: Record<ViaCalendarRegion,string> = {world:"world",NL:"europe",GB:"europe",FR:"europe",ES:"europe",US:"north-america",CN:"asia",IN:"asia",BE:"europe",DE:"europe",IT:"europe",PT:"europe",JP:"asia",KR:"asia",ID:"asia",ZA:"africa",EG:"africa",NG:"africa",CA:"north-america",MX:"north-america",BR:"south-america",AR:"south-america",AU:"oceania",NZ:"oceania"}
  const [continent,setContinent] = useState("world")
  const regionOptions = VIA_CALENDAR_REGIONS.filter(item => continent==="world" ? item.code==="world" : continentByRegion[item.code]===continent)
  const availableRegions = regionOptions.length > 0 ? regionOptions : VIA_CALENDAR_REGIONS.filter(item=>item.code==="world")
  const selectedRegion = availableRegions.some(item=>item.code===region) ? region : availableRegions[0].code
  const local = viaCalendarLocalDate(today,selectedRegion)
  const locale = calendarLocales[language]
  const ui = calendarUi[language]
  const labels = extraUi[language]
  const guidance = guidanceUi[language]
  const localizedMonth = new Intl.DateTimeFormat(locale,{month:"long",year:"numeric"}).format(new Date(year,month,1))
  const localizedWeekdays = Array.from({length:7},(_,index)=>new Intl.DateTimeFormat(locale,{weekday:"short"}).format(new Date(2024,0,1+index)))
  const days = useMemo(() => {
    const easter=easterSunday(year)
    return VIA_INTERNATIONAL_DAYS.filter(d => d.status==="scheduled" && d.month===month+1)
      .map(d=>({ ...d, day:d.day??null }))
      .concat(easter.month===month+1 ? [{id:"easter",nameNl:"Pasen",month:easter.month,day:easter.day,scope:"cultural" as const,status:"scheduled" as const}]:[])
  },[year,month])
  const unresolved = VIA_INTERNATIONAL_DAYS.filter(d=>d.status==="date-required" && d.id!=="easter")
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
  ].filter(d=>selectedRegion===d.country && d.month===month+1)
  const monthEvents=[...days,...calculatedHolidays.map(d=>({...d,scope:"cultural" as const,status:"scheduled" as const})),...countryDays.map(d=>({...d,scope:"regional" as const,status:"scheduled" as const}))]
  const offset=(new Date(year,month,1).getDay()+6)%7
  const length=new Date(year,month+1,0).getDate()
  const move=(direction:number)=>{
    const next=new Date(year,month+direction,1)
    setYear(next.getFullYear());setMonth(next.getMonth());setSelected(null)
  }
  const shown=selected===null ? monthEvents : monthEvents.filter(d=>d.day===selected || d.day===null)
  return (
    <main style={{maxWidth:920,margin:"0 auto",padding:"24px 16px",color:"inherit"}}>
      <a href="/" style={{display:"inline-block",marginBottom:16}}>← {ui.home}</a>
      <h1 style={{fontSize:"clamp(25px,5vw,38px)",fontWeight:700}}>🌍 {ui.title}</h1>
      <p>{ui.intro}</p>
      <label style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",marginTop:16}}>{ui.language}
        <select value={language} onChange={event=>saveViaLocalSettings({interfaceLanguage:event.target.value as ViaLanguage})} style={{padding:10,border:"1px solid #777",borderRadius:8,background:"#18241e",color:"white"}}>
          {VIA_LANGUAGES.map(item=><option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <p style={{fontSize:13}}>De gekozen taal wordt voor heel VIA bewaard. De vertaling van alle kalenderteksten volgt nog.</p>
      <label style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",marginTop:20}}>{ui.continent}
        <select value={continent} onChange={event=>{const next=event.target.value;setContinent(next);setRegion(next==="world"?"world":(VIA_CALENDAR_REGIONS.find(item=>continentByRegion[item.code]===next)?.code??"world"))}} style={{padding:10,border:"1px solid #777",borderRadius:8,background:"#18241e",color:"white"}}>
          {Object.entries(continentLabels[language]).map(([value,label])=><option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",marginTop:12}}>{ui.country}
        <select value={selectedRegion} onChange={event=>setRegion(event.target.value as ViaCalendarRegion)} style={{padding:10,border:"1px solid #777",borderRadius:8,background:"#18241e",color:"white"}}>
          {availableRegions.map(item=><option key={item.code} value={item.code}>{item.label}</option>)}
        </select>
      </label>
      {regionOptions.length===0 && <p style={{fontSize:13}}>Voor dit werelddeel worden landen en tijdzones nog toegevoegd. De wereldwijde kalender blijft beschikbaar.</p>}
      <p style={{fontSize:13}}>{labels.localDate}: {local.day}-{local.month}-{local.year} ({local.zone}). Landenkeuze past de tijdzone aan; de kalender blijft inclusief en toont internationale dagen.</p>
      <button type="button" onClick={()=>{setYear(local.year);setMonth(local.month-1);setSelected(local.day)}} style={{marginTop:8,padding:"8px 12px",border:"1px solid currentColor",borderRadius:8}}>{ui.today}</button>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,margin:"24px 0 16px"}}>
        <button type="button" onClick={()=>move(-1)} aria-label="Vorige maand" style={{padding:"10px 16px",border:"1px solid currentColor",borderRadius:10}}>‹</button>
        <h2 style={{fontSize:22,fontWeight:600,textTransform:"capitalize"}}>{localizedMonth}</h2>
        <button type="button" onClick={()=>move(1)} aria-label="Volgende maand" style={{padding:"10px 16px",border:"1px solid currentColor",borderRadius:10}}>›</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(0,1fr))",gap:5}}>
        {localizedWeekdays.map((w,index)=><div key={index} style={{textAlign:"center",fontWeight:700,padding:6}}>{w}</div>)}
        {Array.from({length:offset},(_,i)=><div key={"blank"+i}/>)}
        {Array.from({length},(_,i)=>{
          const day=i+1, events=monthEvents.filter(d=>d.day===day)
          return <button key={day} type="button" onClick={()=>setSelected(selected===day?null:day)}
            aria-pressed={selected===day} aria-label={day+" "+monthNames[month]+", "+events.length+" vieringen"}
            style={{minHeight:64,padding:6,border:"1px solid",borderColor:selected===day?"#4d9f77":"#7775",borderRadius:9,background:selected===day?"#4d9f7725":"transparent",textAlign:"left",color:"inherit"}}>
            <span style={{fontWeight:600}}>{day}</span>{events.length>0&&<span style={{display:"block",fontSize:12}}>● {events.length}</span>}
          </button>
        })}
      </div>
      <h2 style={{fontSize:21,fontWeight:600,marginTop:28}}>{selected===null?ui.month:ui.day+" "+selected+" "+localizedMonth}</h2>
      {shown.length===0?<p>{ui.empty}</p>:<ul style={{paddingLeft:22}}>{shown.map(d=><li key={d.id} style={{margin:"8px 0"}}>{d.day??labels.monthAll} — {d.nameNl} <span style={{fontSize:12,opacity:.75}}>({d.scope==="international"?labels.international:d.scope==="regional"?labels.regional:labels.cultural})</span></li>)}</ul>}
      <h2 style={{fontSize:21,fontWeight:600,marginTop:28}}>{guidance.pendingTitle}</h2>
      <p>{guidance.pendingInfo}</p>
      <ul style={{paddingLeft:22}}>{unresolved.map(d=><li key={d.id}>{d.nameNl}: {guidance.pendingDate}</li>)}</ul>
      <p style={{marginTop:24,fontSize:13,opacity:.8}}>Maandlange vieringen worden in de lijst vermeld, maar niet als losse dagmeldingen geteld. Een eerste landen- en tijdzonekeuze is beschikbaar. Regionale feestdagenfilters, juridische controles en automatische bevestigingsbronnen zijn nog in ontwikkeling.</p>
    </main>
  )
}
