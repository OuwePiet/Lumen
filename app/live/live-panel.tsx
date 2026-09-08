"use client"

import { useEffect, useState } from "react"

type Health = {
  checkedAt?: string
  via?: { status?: string }
  deso?: { status?: string; latencyMs?: number; httpStatus?: number; error?: string }
  mediaUpload?: { status?: string; reason?: string }
  mediaRetrieval?: { status?: string; reason?: string }
}

function Status({label,value,detail}:{label:string;value?:string;detail?:string}) {
  return <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8,padding:"12px 0",borderBottom:"1px solid #1f3d2d"}}>
    <div><strong>{label}</strong>{detail&&<div style={{fontSize:12,opacity:.7,marginTop:3}}>{detail}</div>}</div>
    <span style={{fontWeight:900,color:value==="OK"?"#7ee2a8":value==="FAILED"?"#ff8d8d":"#e8d889"}}>{value||"UNKNOWN"}</span>
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
    <section style={{border:"1px solid #254c36",borderRadius:20,padding:20,background:"#07100b",marginTop:22}}>
      <p style={{margin:0,color:"#7ee2a8",fontWeight:800,letterSpacing:1.5}}>VIA LIVE · AUDIO FIRST</p>
      <h2 style={{fontSize:"clamp(28px,5vw,46px)",margin:"8px 0"}}>Community Room</h2>
      <p>Camera is optional. This first interface separates listening, speaking, recording and publishing so none of those actions happen silently.</p>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:16}}>
        <button type="button" style={{padding:"10px 15px",borderRadius:10,border:0,fontWeight:900}}>Listen</button>
        <button type="button" onClick={()=>setSpeaker(v=>!v)} style={{padding:"10px 15px",borderRadius:10,border:"1px solid #456a53",background:"transparent",color:"white",fontWeight:800}}>{speaker?"Speaking requested ✓":"Request to speak"}</button>
        <button type="button" onClick={()=>setRecording(v=>!v)} style={{padding:"10px 15px",borderRadius:10,border:`1px solid ${recording?"#ff8d8d":"#456a53"}`,background:"transparent",color:"white",fontWeight:800}}>{recording?"Recording state demo: ON":"Recording state demo: OFF"}</button>
      </div>
      <p style={{fontSize:13,opacity:.72,marginBottom:0}}>Demo controls only. No microphone stream, external meeting connection or recording is active yet.</p>
    </section>

    <section style={{border:"1px solid #254c36",borderRadius:20,padding:20,background:"#07100b",marginTop:22}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><div><p style={{margin:0,color:"#7ee2a8",fontWeight:800}}>MEDIA HEALTH</p><h2 style={{margin:"5px 0"}}>What is actually failing?</h2></div><button type="button" onClick={refresh} disabled={loading} style={{padding:"9px 14px",borderRadius:9,border:0,fontWeight:800}}>{loading?"Checking…":"Check now"}</button></div>
      <Status label="VIA application" value={health.via?.status}/>
      <Status label="DeSo node/API" value={health.deso?.status} detail={health.deso?.latencyMs!=null?`${health.deso.latencyMs} ms${health.deso.httpStatus?` · HTTP ${health.deso.httpStatus}`:""}`:health.deso?.error}/>
      <Status label="Media upload" value={health.mediaUpload?.status} detail={health.mediaUpload?.reason}/>
      <Status label="Media retrieval" value={health.mediaRetrieval?.status} detail={health.mediaRetrieval?.reason}/>
      <p style={{fontSize:12,opacity:.68,marginBottom:0}}>Checked {health.checkedAt?new Date(health.checkedAt).toLocaleString():"not yet"}. UNKNOWN means VIA does not yet have enough verified evidence to blame that service.</p>
    </section>

    <section style={{border:"1px solid #254c36",borderRadius:20,padding:20,background:"#07100b",marginTop:22}}>
      <p style={{margin:0,color:"#7ee2a8",fontWeight:800}}>REPLAYS</p><h2>Listen later</h2>
      <p>No Replay is published yet. A recording will only appear here after an authorised host deliberately publishes it.</p>
    </section>
  </>
}
