"use client";
import { useEffect, useRef, useState } from "react";

// @OuwePiet 2026: reuse the existing calendar's Globe.GL engine; never fake GEO data.
type Point = {lat:number;lng:number;name:string;countryCode:string}|null;
type GlobeInstance = {
  globeImageUrl:(url:string)=>GlobeInstance;
  backgroundColor:(color:string)=>GlobeInstance;
  pointOfView:{():{lat:number;lng:number;altitude:number};(position:{lat:number;lng:number;altitude:number},duration?:number):GlobeInstance};
  width:(value:number)=>GlobeInstance;
  height:(value:number)=>GlobeInstance;
  controls:()=>{autoRotate?:boolean;autoRotateSpeed?:number};
  htmlLat:(key:string)=>GlobeInstance;
  htmlLng:(key:string)=>GlobeInstance;
  htmlAltitude:(altitude:number)=>GlobeInstance;
  htmlElement:(render:(point:NonNullable<Point>)=>HTMLElement)=>GlobeInstance;
  htmlElementsData:(points:NonNullable<Point>[])=>GlobeInstance;
  _destructor?:()=>void;
};
type GlobeFactory = (element:HTMLElement)=>GlobeInstance;
declare global { interface Window { Globe?:()=>GlobeFactory } }
const LIBRARY="https://unpkg.com/globe.gl@2.45.0/dist/globe.gl.min.js";
const EARTH="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg";
let libraryPromise:Promise<void>|null=null;
function loadLibrary(){
  if(window.Globe)return Promise.resolve();
  if(libraryPromise)return libraryPromise;
  libraryPromise=new Promise<void>((resolve,reject)=>{
    const script=document.createElement("script");
    script.src=LIBRARY;script.async=true;
    script.onload=()=>window.Globe?resolve():reject(new Error("Globe.GL unavailable"));
    script.onerror=()=>reject(new Error("Globe.GL failed to load"));
    document.head.appendChild(script);
  }).catch(error=>{libraryPromise=null;throw error});
  return libraryPromise;
}
export default function Wereldbol({place,language}:{place:Point;language:string}){
  const holder=useRef<HTMLDivElement>(null);
  const globe=useRef<GlobeInstance|null>(null);
  const [status,setStatus]=useState<"loading"|"ready"|"fallback">("loading");
  const [rotating,setRotating]=useState(true);
  useEffect(()=>{
    let disposed=false;let observer:ResizeObserver|null=null;
    loadLibrary().then(()=>{
      if(disposed||!holder.current||!window.Globe)return;
      const g=window.Globe()(holder.current).globeImageUrl(EARTH).backgroundColor("rgba(0,0,0,0)");
      globe.current=g;
      const controls=g.controls();controls.autoRotate=true;controls.autoRotateSpeed=0.45;
      observer=new ResizeObserver(()=>{if(holder.current){g.width(holder.current.clientWidth);g.height(holder.current.clientHeight)}});
      g.width(holder.current.clientWidth).height(holder.current.clientHeight);
      observer.observe(holder.current);
      g.htmlLat("lat").htmlLng("lng").htmlAltitude(0.045).htmlElement((location)=>{
        const marker=document.createElement("div");
        marker.style.cssText="display:flex;align-items:center;gap:4px;white-space:nowrap;pointer-events:none;transform:translate(-12px,-100%);filter:drop-shadow(0 2px 3px #000a)";
        const pin=document.createElement("span");pin.textContent=String.fromCodePoint(0x1F4CD);pin.style.cssText="font-size:23px;line-height:1";
        const label=document.createElement("span");label.textContent=location.name;label.style.cssText="background:#071d37ed;color:#fff5dc;border:1px solid #e9b86b;border-radius:6px;padding:3px 6px;font-size:11px;font-weight:700;max-width:160px;overflow:hidden;text-overflow:ellipsis";
        marker.append(pin,label);return marker;
      });
      g.pointOfView({lat:25,lng:5,altitude:2.3});
      setStatus("ready");
    }).catch(()=>{if(!disposed)setStatus("fallback")});
    return()=>{disposed=true;observer?.disconnect();globe.current?._destructor?.();globe.current=null};
  },[]);
  useEffect(()=>{
    if(status!=="ready"||!globe.current)return;
    globe.current.htmlElementsData(place&&Number.isFinite(place.lat)&&Number.isFinite(place.lng)?[place]:[]);
    if(place&&Number.isFinite(place.lat)&&Number.isFinite(place.lng)){
      globe.current.controls().autoRotate=false;
      setRotating(false);
      globe.current.pointOfView({lat:place.lat,lng:place.lng,altitude:2.15},1200);
    }
  },[place,status]);
  return <div className="ws-earth" style={{position:"relative",overflow:"hidden",minHeight:170}}>
    {status==="ready"&&<button type="button" aria-pressed={rotating} aria-label={language==="en"?(rotating?"Pause globe rotation":"Resume globe rotation"):(rotating?"Pauzeer wereldbol":"Laat wereldbol draaien")} title={language==="en"?(rotating?"Pause rotation":"Resume rotation"):(rotating?"Rotatie pauzeren":"Rotatie hervatten")} onClick={()=>{const next=!rotating;if(globe.current)globe.current.controls().autoRotate=next;setRotating(next)}} style={{position:"absolute",zIndex:2,top:76,right:6,background:"#08263d",border:"1px solid #4acde9",borderRadius:"50%",color:"white",width:29,height:29,padding:0,display:"grid",placeItems:"center",cursor:"pointer"}}>{rotating?"Ⅱ":"▶"}</button>}
    {status==="ready"&&<div style={{position:"absolute",zIndex:2,right:6,top:6,display:"flex",flexDirection:"column",gap:4}}>{([{symbol:"+",factor:0.8,label:language==="en"?"Zoom in":"Inzoomen"},{symbol:"−",factor:1.25,label:language==="en"?"Zoom out":"Uitzoomen"}] as const).map(action=><button key={action.symbol} type="button" aria-label={action.label} title={action.label} onClick={()=>{const g=globe.current;if(!g)return;const current=g.pointOfView();g.pointOfView({...current,altitude:Math.max(1.9,Math.min(4,current.altitude*action.factor))},450)}} style={{background:"#08263d",border:"1px solid #4acde9",borderRadius:"50%",color:"white",width:29,height:29,padding:0,cursor:"pointer"}}>{action.symbol}</button>)}</div>}
    <div ref={holder} aria-label={language==="en"?"Interactive geographic globe":"Interactieve geografische wereldbol"} role="img" style={{width:"100%",height:"100%",position:"absolute",inset:0}}/>
    {status!=="ready"&&<div role="status" style={{position:"absolute",inset:0,display:"grid",placeItems:"center",textAlign:"center",padding:12,background:"radial-gradient(circle,#17466b,#061528)",color:"#dceefa",fontSize:12}}>{status==="loading"?(language==="en"?"Loading 3D Earth…":"3D-aarde wordt geladen…"):(language==="en"?"3D Earth unavailable; geographic search remains available.":"3D-aarde niet beschikbaar; geografisch zoeken blijft werken.")}</div>}
  </div>;
}