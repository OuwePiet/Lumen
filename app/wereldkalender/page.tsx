"use client"

import { useEffect, useMemo, useState } from "react"
import { VIA_INTERNATIONAL_DAYS } from "../via-international-calendar"
import { VIA_CALENDAR_REGIONS, viaCalendarLocalDate, type ViaCalendarRegion } from "../via-calendar-regions"
import { readViaLocalSettings, saveViaLocalSettings, VIA_LANGUAGES, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"

const monthNames = ["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"]
const weekdays = ["ma","di","wo","do","vr","za","zo"]

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
  const continentByRegion: Record<ViaCalendarRegion,string> = {world:"world",NL:"europe",GB:"europe",FR:"europe",ES:"europe",US:"north-america",CN:"asia",IN:"asia"}
  const [continent,setContinent] = useState("world")
  const regionOptions = VIA_CALENDAR_REGIONS.filter(item => item.code==="world" || continent==="world" || continentByRegion[item.code]===continent)
  const local = viaCalendarLocalDate(today,region)
  const days = useMemo(() => {
    const easter=easterSunday(year)
    return VIA_INTERNATIONAL_DAYS.filter(d => d.status==="scheduled" && d.month===month+1)
      .map(d=>({ ...d, day:d.day??null }))
      .concat(easter.month===month+1 ? [{id:"easter",nameNl:"Pasen",month:easter.month,day:easter.day,scope:"cultural" as const,status:"scheduled" as const}]:[])
  },[year,month])
  const unresolved = VIA_INTERNATIONAL_DAYS.filter(d=>d.status==="date-required" && d.id!=="easter")
  const offset=(new Date(year,month,1).getDay()+6)%7
  const length=new Date(year,month+1,0).getDate()
  const move=(direction:number)=>{
    const next=new Date(year,month+direction,1)
    setYear(next.getFullYear());setMonth(next.getMonth());setSelected(null)
  }
  const shown=selected===null ? days : days.filter(d=>d.day===selected || d.day===null)
  return (
    <main style={{maxWidth:920,margin:"0 auto",padding:"24px 16px",color:"inherit"}}>
      <a href="/" style={{display:"inline-block",marginBottom:16}}>← VIA Home</a>
      <h1 style={{fontSize:"clamp(25px,5vw,38px)",fontWeight:700}}>🌍 VIA Wereldkalender</h1>
      <p>Internationale dagen, vieringen en herdenkingen. Vaste datums keren ieder jaar automatisch terug.</p>
      <label style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",marginTop:16}}>VIA-taal
        <select value={language} onChange={event=>saveViaLocalSettings({interfaceLanguage:event.target.value as ViaLanguage,defaultLanguage:event.target.value as ViaLanguage})} style={{padding:10,border:"1px solid #777",borderRadius:8,background:"#18241e",color:"white"}}>
          {VIA_LANGUAGES.map(item=><option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <p style={{fontSize:13}}>De gekozen taal wordt voor heel VIA bewaard. De vertaling van alle kalenderteksten volgt nog.</p>
      <label style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",marginTop:20}}>Werelddeel
        <select value={continent} onChange={event=>{setContinent(event.target.value);setRegion("world")}} style={{padding:10,border:"1px solid #777",borderRadius:8,background:"#18241e",color:"white"}}>
          {[["world","Wereldwijd"],["europe","Europa"],["asia","Azië"],["africa","Afrika"],["north-america","Noord-Amerika"],["south-america","Zuid-Amerika"],["oceania","Oceanië"]].map(([value,label])=><option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",marginTop:12}}>Land / tijdzone
        <select value={region} onChange={event=>setRegion(event.target.value as ViaCalendarRegion)} style={{padding:10,border:"1px solid #777",borderRadius:8,background:"#18241e",color:"white"}}>
          {regionOptions.map(item=><option key={item.code} value={item.code}>{item.label}</option>)}
        </select>
      </label>
      <p style={{fontSize:13}}>Lokale datum: {local.day}-{local.month}-{local.year} ({local.zone}). Landenkeuze past de tijdzone aan; de kalender blijft inclusief en toont internationale dagen.</p>
      <button type="button" onClick={()=>{setYear(local.year);setMonth(local.month-1);setSelected(local.day)}} style={{marginTop:8,padding:"8px 12px",border:"1px solid currentColor",borderRadius:8}}>Vandaag in deze tijdzone</button>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,margin:"24px 0 16px"}}>
        <button type="button" onClick={()=>move(-1)} aria-label="Vorige maand" style={{padding:"10px 16px",border:"1px solid currentColor",borderRadius:10}}>‹</button>
        <h2 style={{fontSize:22,fontWeight:600,textTransform:"capitalize"}}>{monthNames[month]} {year}</h2>
        <button type="button" onClick={()=>move(1)} aria-label="Volgende maand" style={{padding:"10px 16px",border:"1px solid currentColor",borderRadius:10}}>›</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(0,1fr))",gap:5}}>
        {weekdays.map(w=><div key={w} style={{textAlign:"center",fontWeight:700,padding:6}}>{w}</div>)}
        {Array.from({length:offset},(_,i)=><div key={"blank"+i}/>)}
        {Array.from({length},(_,i)=>{
          const day=i+1, events=days.filter(d=>d.day===day)
          return <button key={day} type="button" onClick={()=>setSelected(selected===day?null:day)}
            aria-pressed={selected===day} aria-label={day+" "+monthNames[month]+", "+events.length+" vieringen"}
            style={{minHeight:64,padding:6,border:"1px solid",borderColor:selected===day?"#4d9f77":"#7775",borderRadius:9,background:selected===day?"#4d9f7725":"transparent",textAlign:"left",color:"inherit"}}>
            <span style={{fontWeight:600}}>{day}</span>{events.length>0&&<span style={{display:"block",fontSize:12}}>● {events.length}</span>}
          </button>
        })}
      </div>
      <h2 style={{fontSize:21,fontWeight:600,marginTop:28}}>{selected===null?"Vieringen deze maand":"Vieringen op "+selected+" "+monthNames[month]}</h2>
      {shown.length===0?<p>Geen geregistreerde vieringen voor deze selectie.</p>:<ul style={{paddingLeft:22}}>{shown.map(d=><li key={d.id} style={{margin:"8px 0"}}>{d.day??"Hele maand"} — {d.nameNl}</li>)}</ul>}
      <h2 style={{fontSize:21,fontWeight:600,marginTop:28}}>Wisselende datums — nog te bevestigen</h2>
      <p>Voor deze vieringen worden geen onbetrouwbare datums verzonnen. Landelijke en religieuze bevestigingen kunnen verschillen.</p>
      <ul style={{paddingLeft:22}}>{unresolved.map(d=><li key={d.id}>{d.nameNl}: datum nog niet gekoppeld</li>)}</ul>
      <p style={{marginTop:24,fontSize:13,opacity:.8}}>Maandlange vieringen worden in de lijst vermeld, maar niet als losse dagmeldingen geteld. Een eerste landen- en tijdzonekeuze is beschikbaar. Regionale feestdagenfilters, juridische controles en automatische bevestigingsbronnen zijn nog in ontwikkeling.</p>
    </main>
  )
}
