"use client"

import { useEffect, useState } from "react"

type Health = {
  checkedAt?: string
  via?: { status?: string }
  deso?: { status?: string; latencyMs?: number; httpStatus?: number; error?: string }
  mediaUpload?: { status?: string; reason?: string }
  mediaRetrieval?: { status?: string; reason?: string }
}

const panelStyle = {border:"1px solid rgba(63,74,68,.72)",borderRadius:14,padding:20,background:"rgba(9,13,11,.72)",marginTop:18}
const quietButton = {padding:"10px 14px",borderRadius:11,border:"1px solid rgba(113,130,120,.55)",background:"transparent",color:"#dce4df",fontWeight:700,cursor:"pointer"}
const activeButton = { ...quietButton, border:"1px solid rgba(143,212,169,.62)", background:"rgba(12,23,17,.55)", color:"#9adbb2", boxShadow:"inset 0 0 18px rgba(143,212,169,.035)" }

function Status({label,value,detail}:{label:string;value?:string;detail?:string}) {
  return <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8,padding:"12px 0",borderBottom:"1px solid rgba(63,74,68,.55)"}}>
    <div><strong style={{fontWeight:650}}>{label}</strong>{detail&&<div style={{fontSize:12,color:"#7f8a84",marginTop:3}}>{detail}</div>}</div>
    <span style={{fontWeight:750,color:value==="OK"?"#8fd4a9":value==="FAILED"?"#e59a9a":"#d5c98b"}}>{value||"UNKNOWN"}</span>
  </div>
}

export default function LivePanel(){
  const [health,setHealth]=useState<Health>({})
  const [loading,setLoading]=useState(false)
  const [recording,setRecording]=useState(false)
  const [speaker,setSpeaker]=useState(false)

  async function refresh(){
    setLoading(true)
    try { const r=await fetch("/api/via/health",{cache:"no-store"}); setHealth(await r.json()) }
    catch { setHealth({via:{status:"FAILED"},deso:{status:"UNKNOWN"},mediaUpload:{status:"UNKNOWN"},mediaRetrieval:{status:"UNKNOWN"}}) }
    finally { setLoading(false) }
  }

  useEffect(()=>{void refresh()},[])

  return <>
    <section style={panelStyle}>
      <p style={{margin:0,color:"#8fd4a9",fontWeight:700,letterSpacing:1.5,fontSize:12}}>VIA LIVE · AUDIO FIRST</p>
      <h2 style={{fontSize:"clamp(26px,4vw,38px)",margin:"8px 0",letterSpacing:"-.02em"}}>Community Room</h2>
      <p style={{color:"#aebbb4",lineHeight:1.6}}>Camera is optional. This first interface separates listening, speaking, recording and publishing so none of those actions happen silently.</p>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:16}}>
        <button type="button" style={quietButton}>Listen</button>
        <button type="button" onClick={()=>setSpeaker(v=>!v)} style={speaker?activeButton:quietButton}>{speaker?"Speaking requested ✓":"Request to speak"}</button>
        <button type="button" onClick={()=>setRecording(v=>!v)} style={recording?{...activeButton,border:"1px solid rgba(229,154,154,.65)",color:"#e59a9a",background:"rgba(35,16,16,.45)"}:quietButton}>{recording?"Recording state demo: ON":"Recording state demo: OFF"}</button>
      </div>
      <p style={{fontSize:13,color:"#7f8a84",marginBottom:0}}>Demo controls only. No microphone stream, external meeting connection or recording is active yet.</p>
    </section>

    <section style={panelStyle}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><div><p style={{margin:0,color:"#8fd4a9",fontWeight:700,fontSize:12,letterSpacing:1.3}}>MEDIA HEALTH</p><h2 style={{margin:"5px 0",fontWeight:650}}>What is actually failing?</h2></div><button type="button" onClick={refresh} disabled={loading} style={quietButton}>{loading?"Checking…":"Check now"}</button></div>
      <Status label="VIA application" value={health.via?.status}/>
      <Status label="DeSo node/API" value={health.deso?.status} detail={health.deso?.latencyMs!=null?`${health.deso.latencyMs} ms${health.deso.httpStatus?` · HTTP ${health.deso.httpStatus}`:""}`:health.deso?.error}/>
      <Status label="Media upload" value={health.mediaUpload?.status} detail={health.mediaUpload?.reason}/>
      <Status label="Media retrieval" value={health.mediaRetrieval?.status} detail={health.mediaRetrieval?.reason}/>
      <p style={{fontSize:12,color:"#78847d",marginBottom:0}}>Checked {health.checkedAt?new Date(health.checkedAt).toLocaleString():"not yet"}. UNKNOWN means VIA does not yet have enough verified evidence to blame that service.</p>
    </section>

    <section style={panelStyle}>
      <p style={{margin:0,color:"#8fd4a9",fontWeight:700,fontSize:12,letterSpacing:1.3}}>REPLAYS</p><h2 style={{fontWeight:650}}>Listen later</h2>
      <p style={{color:"#aebbb4",lineHeight:1.6}}>No Replay is published yet. A recording will only appear here after an authorised host deliberately publishes it.</p>
    </section>
  </>
}
