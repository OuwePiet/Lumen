"use client"
import Link from "next/link"
import { useEffect, useState } from "react"

type Card = { id:string; title:string; sponsorName:string; destinationUrl:string; startAt:string; endAt:string }
type Directory = { cards?:Card[] }
// @OuwePiet 2026 — reuse the existing VIA advertisement directory, never DeSo posts.
export default function WereldSpiegelAdvertentie() {
 const [card,setCard]=useState<Card|null>(null)
 useEffect(()=>{
  const controller=new AbortController()
  fetch("/api/via/sponsor-directory?page=1",{signal:controller.signal,cache:"no-store",credentials:"omit"})
   .then(r=>r.ok?r.json() as Promise<Directory>:Promise.reject(new Error("Ads unavailable")))
   .then(data=>{
    if(controller.signal.aborted)return
    const now=Date.now()
    const active=(Array.isArray(data.cards)?data.cards:[]).filter(c=>
      typeof c.title==="string"&&typeof c.sponsorName==="string"&&
      Date.parse(c.startAt)<=now&&now<Date.parse(c.endAt)&&
      typeof c.destinationUrl==="string"&&c.destinationUrl.startsWith("https://"))
    setCard(active[0]??null)
   }).catch(()=>{if(!controller.signal.aborted)setCard(null)})
  return()=>controller.abort()
 },[])
 return <aside aria-label="Advertentieruimte" style={{border:"1px solid #ddd9cd",borderRadius:8,padding:"12px 14px",margin:"16px 0",background:"#f6f4ee",fontSize:13}}>
  <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:1.3,color:"#6b685f",fontWeight:700}}>Advertentie · Sponsored</div>
  {card?<div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap",marginTop:8}}>
   <div><strong>{card.title}</strong><div style={{color:"#6b685f"}}>{card.sponsorName}</div></div>
   <a href={card.destinationUrl} target="_blank" rel="noopener noreferrer sponsored" style={{color:"#335b43",fontWeight:600}}>Bekijk advertentie</a>
  </div>:<p style={{margin:"8px 0",color:"#6b685f"}}>Hier is ruimte voor advertenties van ondernemers en organisaties.</p>}
  <Link href="/advertising" style={{display:"inline-block",marginTop:8,color:"#335b43"}}>Adverteren via VIA</Link>
 </aside>
}