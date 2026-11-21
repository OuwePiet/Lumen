"use client"
import { useState } from "react"
import Link from "next/link"

// @OuwePiet 2026 — no uploads, no backend storage, no blockchain writes.
export default function LaatJeHoren() {
 const [name,setName]=useState("")
 const [place,setPlace]=useState("")
 const [country,setCountry]=useState("")
 const [language,setLanguage]=useState("nl")
 const [story,setStory]=useState("")
 const [anonymous,setAnonymous]=useState(true)
 const [consent,setConsent]=useState(false)
 const [notice,setNotice]=useState("")
 function saveDraft() {
  if(!story.trim() || !place.trim() || !country.trim() || !consent) {setNotice("Vul je verhaal, plaats en land in en bevestig de regels.");return}
  const data={version:1,type:"wereldspiegel-private-draft",place:place.trim(),country:country.trim(),language,story:story.trim(),displayName:anonymous?null:name.trim()||null,anonymous,createdAt:new Date().toISOString(),status:"not-submitted"}
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"})
  const url=URL.createObjectURL(blob)
  const a=document.createElement("a");a.href=url;a.download="wereldspiegel-verhaal-concept.json";a.click();URL.revokeObjectURL(url)
  setNotice("Privéconcept gedownload. Nog NIET naar VIA verstuurd of gepubliceerd.")
 }
 const inputStyle={width:"100%",padding:12,border:"1px solid #aeb8ac",borderRadius:8,background:"white",color:"#24372b"}
 return <main style={{minHeight:"100vh",background:"#fbf9f5",color:"#25372b",padding:"24px 16px",fontFamily:"system-ui,sans-serif"}}><div style={{maxWidth:720,margin:"auto"}}>
  <Link href="/wereldspiegel">Terug naar De WereldSpiegel</Link><h1 style={{fontFamily:"Georgia,serif",fontSize:36}}>Laat je horen</h1>
  <p>Ook verhalen uit kleine dorpen en gemeenschappen verdienen aandacht. Je kunt hier een privéconcept maken in je eigen taal, zonder account of betaling.</p>
  <p style={{padding:12,borderLeft:"3px solid #9b6c49",background:"#f2eee5"}}><strong>Dit is nog geen inzendformulier.</strong> Je verhaal blijft op dit apparaat totdat je zelf het concept downloadt. VIA ontvangt niets. De veilige redactionele ontvangst en moderatie worden nog gebouwd.</p>
  <div style={{display:"grid",gap:15}}>
   <label>Land<input value={country} onChange={e=>setCountry(e.target.value.slice(0,100))} maxLength={100} style={inputStyle} placeholder="Land" /></label>
   <label>Plaats of gemeenschap<input value={place} onChange={e=>setPlace(e.target.value.slice(0,140))} maxLength={140} style={inputStyle} placeholder="Dorp, stad of regio" /></label>
   <label>Taal<select value={language} onChange={e=>setLanguage(e.target.value)} style={inputStyle}><option value="nl">Nederlands</option><option value="en">English</option><option value="fr">Français</option><option value="es">Español</option><option value="zh">中文</option><option value="hi">हिन्दी</option><option value="other">Andere taal</option></select></label>
   <label>Jouw verhaal<textarea value={story} onChange={e=>setStory(e.target.value.slice(0,12000))} maxLength={12000} rows={9} style={inputStyle} placeholder="Wat wil je vertellen?" /></label>
   <label style={{display:"flex",gap:10,alignItems:"center"}}><input type="checkbox" checked={anonymous} onChange={e=>setAnonymous(e.target.checked)}/> Mijn naam niet vermelden</label>
   {!anonymous&&<label>Naam voor publicatie (optioneel)<input value={name} onChange={e=>setName(e.target.value.slice(0,100))} maxLength={100} style={inputStyle}/></label>}
   <p>Foto's, video en geluid zijn voorzien, maar kunnen hier nog niet veilig worden ingediend. Voeg geen privégegevens van anderen toe.</p>
   <label style={{display:"flex",gap:10,alignItems:"flex-start"}}><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/> Ik respecteer de regels: geen bedreigingen, haat, misleiding, schending van privacy of materiaal zonder toestemming. Ik begrijp dat een concept niet automatisch wordt gepubliceerd.</label>
   <button onClick={saveDraft} style={{padding:14,border:0,borderRadius:9,background:"#335b43",color:"white",fontWeight:700,cursor:"pointer"}}>Download privéconcept</button>
   <p role="status" aria-live="polite">{notice}</p>
  </div>
 </div></main>
}