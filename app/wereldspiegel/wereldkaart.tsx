"use client";
import {useEffect,useMemo,useRef,useState} from "react";

type Place={lat:number;lng:number;name:string;countryCode:string}|null;
type Geometry={type:"Polygon"|"MultiPolygon";coordinates:number[][][]|number[][][][]};
type Feature={type:"Feature";geometry:Geometry|null};
type Collection={features:Feature[]};
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const x=(lng:number)=>((lng+180)/360)*1000;
const y=(lat:number)=>((90-lat)/180)*500;
function featurePath(f:Feature){if(!f.geometry)return "";const g=f.geometry;const polygons=g.type==="Polygon"?[g.coordinates as number[][][]]:g.coordinates as number[][][][];return polygons.map(poly=>poly.map(ring=>ring.map((p,i)=>(i?"L":"M")+x(p[0]).toFixed(2)+","+y(p[1]).toFixed(2)).join(" ")+" Z").join(" ")).join(" ");}
// @OuwePiet 2026. Local Natural Earth 1:110m boundaries (public domain); shared VIA GEO search remains the source for place coordinates.
export default function Wereldkaart({place,language}:{place:Place;language:string}){
 const [features,setFeatures]=useState<Feature[]>([]);
 const [error,setError]=useState(false);
 const [zoom,setZoom]=useState(1);
 const [offset,setOffset]=useState({x:0,y:0});
 const [large,setLarge]=useState(false);
 const drag=useRef<{x:number;y:number}|null>(null);
 useEffect(()=>{if(place){setZoom(3);setOffset({x:0,y:0})}else{setZoom(1);setOffset({x:0,y:0})}},[place?.lat,place?.lng]);
 useEffect(()=>{const controller=new AbortController();fetch("/wereldspiegel-natural-earth-countries.geojson",{signal:controller.signal}).then(r=>{if(!r.ok)throw Error("map unavailable");return r.json() as Promise<Collection>}).then(data=>setFeatures(data.features.filter(f=>f.geometry))).catch(()=>{if(!controller.signal.aborted)setError(true)});return()=>controller.abort()},[]);
 const shapes=useMemo(()=>features.map((f,i)=><path key={i} d={featurePath(f)} fill="#79a99c" stroke="#d9e6d7" strokeWidth={0.45} vectorEffect="non-scaling-stroke"/>),[features]);
 const center=place&&Number.isFinite(place.lat)&&Number.isFinite(place.lng)?place:{lat:0,lng:0,name:"",countryCode:""};
 const cx=zoom===1?500:x(center.lng),cy=zoom===1?250:y(center.lat);
 const width=1000/zoom,height=500/zoom;
 const viewBox=`${cx-width/2-offset.x} ${cy-height/2-offset.y} ${width} ${height}`;
 const en=language==="en";
 const reset=()=>{setZoom(1);setOffset({x:0,y:0})};
 const actions=[{name:en?"Zoom in":"Inzoomen",label:"+",fn:()=>setZoom(v=>clamp(v*1.5,1,12))},{name:en?"Zoom out":"Uitzoomen",label:"−",fn:()=>setZoom(v=>clamp(v/1.5,1,12))},{name:en?"Reset view":"Kaart herstellen",label:"⌂",fn:reset},{name:large?(en?"Close map":"Kaart sluiten"):(en?"Expand map":"Kaart vergroten"),label:large?"×":"⛶",fn:()=>setLarge(v=>!v)}];
 return <div className="ws-earth" style={{position:large?"fixed":"relative",inset:large?"5vh 5vw":undefined,width:large?"90vw":undefined,height:large?"90vh":220,overflow:"hidden",background:"#153d5b",borderRadius:10,zIndex:large?100:1,boxShadow:large?"0 0 0 100vmax #000b":undefined}}>
  <svg viewBox={viewBox} preserveAspectRatio="xMidYMid meet" role="img" aria-label={`${en?"World map":"Wereldkaart"}${place?": "+place.name:""}`} onPointerDown={e=>{if(e.button!==0)return;drag.current={x:e.clientX,y:e.clientY};e.currentTarget.setPointerCapture(e.pointerId)}} onPointerMove={e=>{if(!drag.current)return;const rect=e.currentTarget.getBoundingClientRect();const dx=(e.clientX-drag.current.x)*width/rect.width;const dy=(e.clientY-drag.current.y)*height/rect.height;setOffset(v=>({x:v.x+dx,y:v.y+dy}));drag.current={x:e.clientX,y:e.clientY}}} onPointerUp={()=>{drag.current=null}} onPointerCancel={()=>{drag.current=null}} style={{display:"block",width:"100%",height:"100%",touchAction:"none",cursor:"grab"}}>
   <rect x={cx-width/2-offset.x} y={cy-height/2-offset.y} width={width} height={height} fill="#153d5b"/>
   {shapes}
   {place&&<g transform={`translate(${x(place.lng)},${y(place.lat)})`}><g transform={`scale(${1/zoom})`} style={{filter:"drop-shadow(1px 2px 2px #001b2aaa)"}}><path d="M0 0 L-2.1 -10 L2.1 -10 Z" fill="#a8a8a8" stroke="#555" strokeWidth="0.55"/><circle cx="0" cy="-13" r="8" fill="#c60012" stroke="#8d0010" strokeWidth="0.7"/><circle cx="-2.3" cy="-15.6" r="3.7" fill="#ff2933" opacity=".88"/><circle cx="-3.4" cy="-17.3" r="1.35" fill="white" opacity=".95"/><text y="-25" textAnchor="middle" fontSize="11" paintOrder="stroke" stroke="#09253b" strokeWidth="2.5" fill="white" fontWeight="bold">{place.name}</text></g></g>}
  </svg>
  {error&&<p role="status" style={{position:"absolute",left:10,bottom:20,color:"white"}}>{en?"Map data unavailable":"Kaartgegevens niet beschikbaar"}</p>}
  {!features.length&&!error&&<p role="status" style={{position:"absolute",left:10,bottom:20,color:"white"}}>{en?"Loading local map":"Lokale kaart laden"}</p>}
  <div style={{position:"absolute",right:6,top:6,display:"grid",gap:4}}>{actions.map(a=><button type="button" key={a.name} aria-label={a.name} title={a.name} onClick={a.fn} style={{width:32,height:32,borderRadius:7,border:"1px solid #4acde9",background:"#08263d",color:"white",cursor:"pointer",fontSize:19}}>{a.label}</button>)}</div>
  <span style={{position:"absolute",left:6,bottom:4,fontSize:10,color:"#e6eff6",background:"#08263dbb",padding:"2px 4px"}}>Natural Earth · {en?"local map":"lokale kaart"}</span>
 </div>;
}
