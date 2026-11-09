"use client"

import { useEffect, useRef, useState } from "react"

/** Self-contained 3D-looking globe: Canvas 2D, no external CDN or paid services. */
export default function ViaGlobe() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const angle = useRef(0)
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)
  useEffect(() => {
    const node = canvas.current
    if (!node) return
    const ctx = node.getContext("2d")
    if (!ctx) return
    let raf = 0
    let last = 0
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    const draw = (time: number) => {
      const width = node.clientWidth
      const height = node.clientHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      if (node.width !== Math.round(width * dpr) || node.height !== Math.round(height * dpr)) {
        node.width = Math.round(width * dpr); node.height = Math.round(height * dpr)
      }
      ctx.setTransform(dpr,0,0,dpr,0,0)
      ctx.clearRect(0,0,width,height)
      const cx=width/2, cy=height/2, radius=Math.max(10,Math.min(width*.43,height*.43))
      const dt=last?Math.min(time-last,80):0;last=time
      if (playing && !reduced.matches && !document.hidden) angle.current += dt*.00012*speed
      const halo=ctx.createRadialGradient(cx,cy,radius*.7,cx,cy,radius*1.28)
      halo.addColorStop(0,"rgba(72,175,229,.25)");halo.addColorStop(1,"rgba(72,175,229,0)")
      ctx.fillStyle=halo;ctx.beginPath();ctx.arc(cx,cy,radius*1.28,0,Math.PI*2);ctx.fill()
      const ocean=ctx.createRadialGradient(cx-radius*.3,cy-radius*.4,radius*.06,cx,cy,radius)
      ocean.addColorStop(0,"#367fa0");ocean.addColorStop(.68,"#124768");ocean.addColorStop(1,"#071a37")
      ctx.fillStyle=ocean;ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.fill()
      ctx.save();ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.clip()
      const project=(lat:number,lon:number):[number,number,number]=>{
        const phi=lat*Math.PI/180, theta=lon*Math.PI/180+angle.current
        const depth=Math.cos(phi)*Math.cos(theta)
        return [cx+radius*Math.cos(phi)*Math.sin(theta),cy-radius*Math.sin(phi),depth]
      }
      // Graticule curves are clipped to the front hemisphere.
      ctx.strokeStyle="rgba(169,225,244,.17)";ctx.lineWidth=.8
      const path=(points:Array<[number,number]>)=>{
        ctx.beginPath();let open=false
        for(const [lat,lon] of points){const [x,y,z]=project(lat,lon);if(z<=0){open=false;continue}if(!open)ctx.moveTo(x,y);else ctx.lineTo(x,y);open=true}
        ctx.stroke()
      }
      for(let lat=-60;lat<=60;lat+=30)path(Array.from({length:361},(_,i)=>[lat,i-180]))
      for(let lon=-180;lon<180;lon+=30)path(Array.from({length:181},(_,i)=>[i-90,lon]))
      // A restrained constellation of light points, not a geographical map.
      for(let i=0;i<210;i++){
        const lat=Math.asin(2*((i*.61803398875)%1)-1)*180/Math.PI
        const lon=((i*.754877666)%1)*360-180
        const [x,y,z]=project(lat,lon)
        if(z<=0)continue
        ctx.fillStyle=i%9===0?"rgba(245,208,118,.9)":"rgba(128,223,186,.65)"
        ctx.beginPath();ctx.arc(x,y,i%9===0?1.8:1,0,Math.PI*2);ctx.fill()
      }
      const shade=ctx.createLinearGradient(cx-radius,cy,cx+radius,cy)
      shade.addColorStop(0,"rgba(0,0,0,.12)");shade.addColorStop(.7,"rgba(0,0,0,0)");shade.addColorStop(1,"rgba(0,0,0,.45)")
      ctx.fillStyle=shade;ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.fill()
      ctx.restore()
      raf=requestAnimationFrame(draw)
    }
    raf=requestAnimationFrame(draw)
    return ()=>cancelAnimationFrame(raf)
  },[playing,speed])
  return <section aria-label="VIA globe" style={{border:"1px solid rgba(100,173,202,.5)",borderRadius:16,overflow:"hidden",background:"radial-gradient(circle,#173d61,#07162b 75%)"}}>
    <canvas ref={canvas} role="img" aria-label="Rotating decorative globe with light points" style={{display:"block",width:"100%",height:"clamp(220px,32vw,360px)"}}/>
    <div style={{display:"flex",gap:8,justifyContent:"center",padding:10}}>
      <button type="button" onClick={()=>setPlaying(v=>!v)} aria-pressed={!playing} style={{padding:"8px 12px",border:"1px solid #6c9caf",borderRadius:8,color:"white"}}>{playing?"⏸":"▶"}</button>
      <button type="button" onClick={()=>setSpeed(s=>Math.min(s*1.5,4))} aria-label="Faster globe rotation" style={{padding:"8px 12px",border:"1px solid #6c9caf",borderRadius:8,color:"white"}}>＋</button>
      <button type="button" onClick={()=>setSpeed(s=>Math.max(s/1.5,.25))} aria-label="Slower globe rotation" style={{padding:"8px 12px",border:"1px solid #6c9caf",borderRadius:8,color:"white"}}>－</button>
    </div>
  </section>
}
