"use client"
import {useEffect,useState} from "react"

type Place={name:string;countryCode:string;admin1?:string;id?:string}
export default function ViaGeographySearch({onSelect}:{onSelect:(place:Place)=>void}){
 const [query,setQuery]=useState("")
 const [results,setResults]=useState<Place[]>([])
 const [status,setStatus]=useState("")
 useEffect(()=>{
  if(query.trim().length<2){setResults([]);setStatus("");return}
  const controller=new AbortController()
  const timeout=setTimeout(async()=>{
   try{
    const response=await fetch("/api/via/plaatsen?q="+encodeURIComponent(query.trim()),{signal:controller.signal,cache:"no-store"})
    const body=await response.json()
    if(controller.signal.aborted)return
    setResults(response.ok&&Array.isArray(body.places)?body.places:[])
    setStatus(response.ok?"":body.error||"Plaatszoeker niet beschikbaar")
   }catch{if(!controller.signal.aborted){setResults([]);setStatus("Plaatszoeker tijdelijk niet beschikbaar")}}
  },350)
  return ()=>{clearTimeout(timeout);controller.abort()}
 },[query])
 return <section aria-label="VIA geographic search" style={{margin:"16px 0",padding:12,border:"1px solid rgba(153,196,155,.36)",borderRadius:12}}>
  <label htmlFor="via-place-search" style={{display:"block",fontWeight:600,marginBottom:8}}>VIA Wereldregister · zoek een plaats</label>
  <input id="via-place-search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Land, provincie, stad of dorp" style={{width:"100%",boxSizing:"border-box",padding:10,borderRadius:8,color:"inherit",background:"transparent",border:"1px solid #899d8b"}}/>
  {status&&<p role="status" style={{fontSize:13}}>{status}</p>}
  {results.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:8}}>{results.map((p,i)=><button type="button" key={p.id??p.countryCode+":"+p.name+":"+i} onClick={()=>{onSelect(p);setQuery(p.name);setResults([])}} style={{padding:"7px 10px",borderRadius:8,border:"1px solid #899d8b",background:"transparent",color:"inherit",cursor:"pointer"}}>{p.name} · {p.countryCode}{p.admin1?" · "+p.admin1:""}</button>)}</div>}
  <p style={{fontSize:12,opacity:.7,marginTop:8}}>Geografische bron: GeoNames (CC BY 4.0). Een plaatsselectie is geen bevestiging van een lokaal evenement of tijdzone.</p>
 </section>
}
