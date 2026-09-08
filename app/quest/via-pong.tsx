"use client"

import { useCallback, useEffect, useRef, useState } from "react"

const W = 720, H = 400, PW = 12, PH = 78, BALL = 10, WIN = 7

type Game = { py:number; ai:number; bx:number; by:number; vx:number; vy:number; player:number; cpu:number; running:boolean }

function fresh(): Game { return { py:H/2-PH/2, ai:H/2-PH/2, bx:W/2, by:H/2, vx:-5, vy:3, player:0, cpu:0, running:false } }

export default function ViaPong() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const game = useRef<Game>(fresh())
  const frame = useRef<number>(0)
  const [score, setScore] = useState("0 — 0")
  const [status, setStatus] = useState("Ready")

  const resetBall = useCallback((direction:number) => {
    const g=game.current; g.bx=W/2; g.by=H/2; g.vx=direction*5; g.vy=(Math.random()>.5?1:-1)*(2.4+Math.random()*1.8)
  }, [])

  const loop = useCallback(() => {
    const c=canvasRef.current, g=game.current
    if(!c) return
    const x=c.getContext("2d")!
    if(g.running){
      g.bx+=g.vx; g.by+=g.vy
      if(g.by<=BALL || g.by>=H-BALL) g.vy*=-1
      const target=g.by-PH/2; g.ai += Math.max(-3.6,Math.min(3.6,target-g.ai)); g.ai=Math.max(0,Math.min(H-PH,g.ai))
      if(g.vx<0 && g.bx-BALL<=30+PW && g.bx>24 && g.by>=g.py && g.by<=g.py+PH){ g.vx=Math.abs(g.vx)*1.035; g.vy += ((g.by-(g.py+PH/2))/(PH/2))*1.8 }
      if(g.vx>0 && g.bx+BALL>=W-30-PW && g.bx<W-24 && g.by>=g.ai && g.by<=g.ai+PH){ g.vx=-Math.abs(g.vx)*1.035; g.vy += ((g.by-(g.ai+PH/2))/(PH/2))*1.8 }
      if(g.bx<0){ g.cpu++; setScore(`${g.player} — ${g.cpu}`); if(g.cpu>=WIN){g.running=false;setStatus("Computer wins — play again?")} else resetBall(-1) }
      if(g.bx>W){ g.player++; setScore(`${g.player} — ${g.cpu}`); if(g.player>=WIN){g.running=false;setStatus("You win! 🏆")} else resetBall(1) }
    }
    x.fillStyle="#030805"; x.fillRect(0,0,W,H); x.strokeStyle="#244b36"; x.setLineDash([10,12]); x.beginPath();x.moveTo(W/2,0);x.lineTo(W/2,H);x.stroke();x.setLineDash([])
    x.fillStyle="#7ee2a8"; x.fillRect(30,g.py,PW,PH); x.fillRect(W-30-PW,g.ai,PW,PH); x.beginPath();x.arc(g.bx,g.by,BALL,0,Math.PI*2);x.fill()
    frame.current=requestAnimationFrame(loop)
  },[resetBall])

  useEffect(()=>{ frame.current=requestAnimationFrame(loop); return()=>cancelAnimationFrame(frame.current) },[loop])

  function move(clientY:number){ const c=canvasRef.current;if(!c)return;const r=c.getBoundingClientRect();const y=(clientY-r.top)*(H/r.height)-PH/2;game.current.py=Math.max(0,Math.min(H-PH,y)) }
  function start(){ game.current=fresh();game.current.running=true;setScore("0 — 0");setStatus("First to 7") }

  return <article style={{border:"1px solid #234b36",borderRadius:18,padding:20,marginTop:24,background:"#07100b"}}>
    <p style={{margin:0,color:"#7ee2a8",fontWeight:700}}>VIA ARCADE · SOLO</p><h2>VIA PONG</h2>
    <p>A VIA tribute to the classic paddle-and-ball idea. Move the left paddle with your finger, mouse or pointer. First to 7 wins.</p>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,marginBottom:10}}><strong style={{fontSize:24}}>{score}</strong><span>{status}</span><button type="button" onClick={start} style={{padding:"9px 14px",borderRadius:9,border:0,fontWeight:800}}>Play</button></div>
    <canvas ref={canvasRef} width={W} height={H} aria-label="VIA Pong game" onPointerMove={e=>move(e.clientY)} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);move(e.clientY)}} style={{display:"block",width:"100%",height:"auto",aspectRatio:"18 / 10",border:"1px solid #234b36",borderRadius:12,touchAction:"none",cursor:"ns-resize"}} />
    <p style={{fontSize:13,opacity:.75,marginBottom:0}}>Local browser game only. No wallet, DeSo signing or blockchain action is required. VIA uses its own presentation and code.</p>
  </article>
}
