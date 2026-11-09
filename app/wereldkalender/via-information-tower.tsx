"use client"

import { useEffect, useRef, useState } from "react"

export type ViaTowerEvent = { id: string; day: number | null; title: string; country?: string }
type Props = { events: ViaTowerEvent[]; selectedDay: number | null; onSelectDay: (day: number) => void; language: string }

const titles: Record<string, [string,string,string]> = {
  Dutch:["📡 Informatietoren VIA","⏸ Pauzeer","▶ Hervat"],
  English:["📡 VIA Information Tower","⏸ Pause","▶ Resume"],
  French:["📡 Tour d’information VIA","⏸ Pause","▶ Reprendre"],
  Spanish:["📡 Torre informativa VIA","⏸ Pausar","▶ Reanudar"],
  Chinese:["📡 VIA 信息塔","⏸ 暂停","▶ 继续"],
  Hindi:["📡 VIA सूचना टॉवर","⏸ रोकें","▶ फिर चलाएँ"],
}

export default function ViaInformationTower({events,selectedDay,onSelectDay,language}:Props) {
  const scrollRef=useRef<HTMLDivElement>(null)
  const [paused,setPaused]=useState(false)
  const [interacting,setInteracting]=useState(false)
  useEffect(()=>{
    if(paused || interacting || events.length<2) return
    const media=window.matchMedia("(prefers-reduced-motion: reduce)")
    if(media.matches) return
    const timer=window.setInterval(()=>{
      const node=scrollRef.current
      if(!node || document.hidden || media.matches || node.scrollHeight<=node.clientHeight) return
      node.scrollTop=node.scrollTop>=node.scrollHeight-node.clientHeight-1?0:node.scrollTop+1
    },95)
    return ()=>window.clearInterval(timer)
  },[paused,interacting,events.length])
  const t=titles[language]??titles.English
  return <section aria-label={t[0]} style={{minWidth:0,border:"1px solid rgba(196,160,100,.55)",borderRadius:16,background:"linear-gradient(155deg,rgba(13,48,74,.86),rgba(16,51,43,.82))",padding:12,color:"#f4f5ef"}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexWrap:"wrap",marginBottom:8}}>
      <h2 style={{fontSize:17,fontWeight:700,margin:0}}>{t[0]}</h2>
      <button type="button" aria-pressed={paused} onClick={()=>setPaused(v=>!v)} style={{padding:"7px 10px",border:"1px solid #b69b68",borderRadius:9,color:"inherit"}}>{paused?t[2]:t[1]}</button>
    </div>
    <div ref={scrollRef} tabIndex={0} onPointerEnter={()=>setInteracting(true)} onPointerLeave={()=>setInteracting(false)} onFocus={()=>setInteracting(true)} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setInteracting(false)}} onTouchStart={()=>setInteracting(true)} onTouchEnd={()=>setInteracting(false)}
      style={{maxHeight:330,overflowY:"auto",display:"grid",gap:7,scrollBehavior:"auto"}}>
      {events.map(e=><button key={e.id} type="button" disabled={e.day===null} onClick={()=>{if(e.day!==null)onSelectDay(e.day)}} aria-pressed={selectedDay===e.day && e.day!==null} style={{textAlign:"left",padding:11,borderRadius:10,border:selectedDay===e.day&&e.day!==null?"1px solid #f1d37c":"1px solid #597e8d",background:selectedDay===e.day&&e.day!==null?"#255d58":"#163a53",color:"inherit",cursor:e.day===null?"default":"pointer"}}>
        <strong>{e.day===null?"—":e.day} · {e.title}</strong>{e.country&&<span style={{display:"block",fontSize:12,opacity:.8}}>{e.country}</span>}
      </button>)}
    </div>
  </section>
}
