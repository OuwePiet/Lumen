"use client"

import { useCallback, useEffect, useRef, useState } from "react"

const W=720,H=400,PW=12,PH=78,BALL=10,WIN=7
const MODES=["NEO","PULSE","GRAVITY"] as const
type Mode=typeof MODES[number]
type Game={py:number;ai:number;bx:number;by:number;vx:number;vy:number;player:number;cpu:number;running:boolean;tick:number;mode:Mode;trail:{x:number;y:number}[]}
function fresh(mode:Mode):Game{return{py:H/2-PH/2,ai:H/2-PH/2,bx:W/2,by:H/2,vx:-5,vy:3,player:0,cpu:0,running:false,tick:0,mode,trail:[]}}

export default function ViaPong(){
 const canvasRef=useRef<HTMLCanvasElement>(null),game=useRef<Game>(fresh("NEO")),frame=useRef(0)
 const [score,setScore]=useState("0 — 0"),[status,setStatus]=useState("Ready"),[mode,setMode]=useState<Mode>("NEO")
 const resetBall=useCallback((direction:number)=>{const g=game.current;g.bx=W/2;g.by=H/2;g.vx=direction*5;g.vy=(Math.random()>.5?1:-1)*(2.4+Math.random()*1.8);g.trail=[]},[])
 const loop=useCallback(()=>{const c=canvasRef.current,g=game.current;if(!c)return;const x=c.getContext("2d")!;g.tick++
  if(g.running){g.trail.push({x:g.bx,y:g.by});if(g.trail.length>16)g.trail.shift();g.bx+=g.vx;g.by+=g.vy
   if(g.mode==="GRAVITY")g.vy+=Math.sin(g.tick/45)*.035
   if(g.mode==="PULSE"&&g.tick%240===0){g.vx*=1.12;g.vy*=1.08;setStatus("Pulse boost ⚡")}
   if(g.by<=BALL){g.by=BALL;g.vy=Math.abs(g.vy)}if(g.by>=H-BALL){g.by=H-BALL;g.vy=-Math.abs(g.vy)}
   const target=g.by-PH/2;g.ai+=Math.max(-3.7,Math.min(3.7,target-g.ai));g.ai=Math.max(0,Math.min(H-PH,g.ai))
   if(g.vx<0&&g.bx-BALL<=42&&g.bx>24&&g.by>=g.py&&g.by<=g.py+PH){g.bx=42+BALL;g.vx=Math.abs(g.vx)*1.035;g.vy+=((g.by-(g.py+PH/2))/(PH/2))*1.8}
   if(g.vx>0&&g.bx+BALL>=W-42&&g.bx<W-24&&g.by>=g.ai&&g.by<=g.ai+PH){g.bx=W-42-BALL;g.vx=-Math.abs(g.vx)*1.035;g.vy+=((g.by-(g.ai+PH/2))/(PH/2))*1.8}
   if(g.bx<0){g.cpu++;setScore(`${g.player} — ${g.cpu}`);if(g.cpu>=WIN){g.running=false;setStatus("AI wins — rematch?")}else resetBall(-1)}
   if(g.bx>W){g.player++;setScore(`${g.player} — ${g.cpu}`);if(g.player>=WIN){g.running=false;setStatus("VIA victory 🏆")}else resetBall(1)}}
  const grad=x.createRadialGradient(W/2,H/2,20,W/2,H/2,W/1.7);grad.addColorStop(0,"#0b2116");grad.addColorStop(1,"#020504");x.fillStyle=grad;x.fillRect(0,0,W,H)
  x.strokeStyle="rgba(126,226,168,.16)";x.lineWidth=1;for(let i=40;i<W;i+=40){x.beginPath();x.moveTo(i,0);x.lineTo(i,H);x.stroke()}for(let i=40;i<H;i+=40){x.beginPath();x.moveTo(0,i);x.lineTo(W,i);x.stroke()}
  x.strokeStyle="rgba(126,226,168,.35)";x.setLineDash([9,13]);x.beginPath();x.moveTo(W/2,0);x.lineTo(W/2,H);x.stroke();x.setLineDash([])
  g.trail.forEach((p,i)=>{x.fillStyle=`rgba(126,226,168,${(i+1)/g.trail.length*.22})`;x.beginPath();x.arc(p.x,p.y,BALL*(i+1)/g.trail.length,0,Math.PI*2);x.fill()})
  x.shadowColor="#7ee2a8";x.shadowBlur=18;x.fillStyle="#7ee2a8";x.fillRect(30,g.py,PW,PH);x.fillRect(W-30-PW,g.ai,PW,PH);x.shadowBlur=25;x.fillStyle="#f4fff8";x.beginPath();x.arc(g.bx,g.by,BALL,0,Math.PI*2);x.fill();x.shadowBlur=0
  frame.current=requestAnimationFrame(loop)},[resetBall])
 useEffect(()=>{frame.current=requestAnimationFrame(loop);return()=>cancelAnimationFrame(frame.current)},[loop])
 function move(clientY:number){const c=canvasRef.current;if(!c)return;const r=c.getBoundingClientRect(),y=(clientY-r.top)*(H/r.height)-PH/2;game.current.py=Math.max(0,Math.min(H-PH,y))}
 function start(){game.current=fresh(mode);game.current.running=true;setScore("0 — 0");setStatus(mode==="NEO"?"First to 7":`${mode} arena · first to 7`)}
 return <article style={{border:"1px solid #285a3e",borderRadius:20,padding:20,marginTop:24,background:"linear-gradient(145deg,#07100b,#020504)",boxShadow:"0 0 40px rgba(70,210,130,.08)"}}>
  <p style={{margin:0,color:"#7ee2a8",fontWeight:800,letterSpacing:2}}>VIA ARCADE · NEO ARENA</p><h2 style={{fontSize:"clamp(28px,5vw,48px)",margin:"8px 0"}}>VIA NEO PONG</h2>
  <p>Classic paddle instinct rebuilt as a modern VIA arena. Touch, mouse or pointer control. Choose an arena mode and beat the VIA AI.</p>
  <div style={{display:"flex",gap:8,flexWrap:"wrap",margin:"14px 0"}}>{MODES.map(m=><button key={m} type="button" disabled={game.current.running} onClick={()=>setMode(m)} style={{padding:"8px 12px",borderRadius:999,border:`1px solid ${mode===m?"#7ee2a8":"#31513f"}`,background:mode===m?"#143222":"transparent",color:"white",fontWeight:800}}>{m}</button>)}</div>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,marginBottom:10,flexWrap:"wrap"}}><strong style={{fontSize:28}}>{score}</strong><span>{status}</span><button type="button" onClick={start} style={{padding:"10px 18px",borderRadius:10,border:0,fontWeight:900}}>ENTER ARENA</button></div>
  <canvas ref={canvasRef} width={W} height={H} aria-label="VIA Neo Pong arena" onPointerMove={e=>move(e.clientY)} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);move(e.clientY)}} style={{display:"block",width:"100%",height:"auto",aspectRatio:"18 / 10",border:"1px solid #285a3e",borderRadius:14,touchAction:"none",cursor:"ns-resize"}}/>
  <p style={{fontSize:13,opacity:.75,marginBottom:0}}>NEO = pure speed · PULSE = periodic energy boosts · GRAVITY = shifting ball physics. Local play only; no wallet or blockchain action.</p>
 </article>
}
