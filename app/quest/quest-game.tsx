"use client"

import { useEffect, useMemo, useState } from "react"
import styles from "./quest.module.css"

type QuestState = { points:number; streak:number; lastDailyDate:string | null }
const STORAGE_KEY="via:world-quest:v2"
const LEGACY_KEY="via:world-quest:v1"
const dailySteps=["Discover a DeSo creator you do not already know.","Open one NFT or collection and inspect its public details.","Visit one public post or creator profile from VIA Discovery.","Choose one world stop: creator, NFT or radio discovery."]
const surpriseRoutes=[["Netherlands","Ghana","Japan","Argentina"],["Canada","Spain","India","South Africa"],["France","Brazil","South Korea","Australia"],["Germany","Nigeria","Mexico","Indonesia"]]
const initialState:QuestState={points:0,streak:0,lastDailyDate:null}
function localDate(d=new Date()){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),day=String(d.getDate()).padStart(2,"0");return `${y}-${m}-${day}`}
function yesterday(){const d=new Date();d.setDate(d.getDate()-1);return localDate(d)}

export default function QuestGame(){
 const [state,setState]=useState<QuestState>(initialState),[step,setStep]=useState(0),[mode,setMode]=useState<"daily"|"surprise">("daily"),[routeIndex,setRouteIndex]=useState(0),[ready,setReady]=useState(false)
 const today=localDate(),completedToday=state.lastDailyDate===today
 useEffect(()=>{try{const saved=window.localStorage.getItem(STORAGE_KEY);if(saved){const p=JSON.parse(saved) as Partial<QuestState>;setState({points:Number.isFinite(p.points)?Number(p.points):0,streak:Number.isFinite(p.streak)?Number(p.streak):0,lastDailyDate:typeof p.lastDailyDate==="string"?p.lastDailyDate:null})}else{const legacy=window.localStorage.getItem(LEGACY_KEY);if(legacy){const p=JSON.parse(legacy) as {points?:number;streak?:number};setState({points:Number.isFinite(p.points)?Number(p.points):0,streak:Number.isFinite(p.streak)?Number(p.streak):0,lastDailyDate:null})}}}catch{}finally{setReady(true)}},[])
 useEffect(()=>{if(!ready)return;try{window.localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch{}},[state,ready])
 const route=useMemo(()=>surpriseRoutes[routeIndex%surpriseRoutes.length],[routeIndex]),totalSteps=mode==="daily"?dailySteps.length:route.length,currentLabel=mode==="daily"?dailySteps[step]:`World stop ${step+1}: ${route[step]}`,finished=step>=totalSteps
 function startDaily(){setMode("daily");setStep(0)}
 function startSurprise(){setMode("surprise");setRouteIndex(v=>(v+1)%surpriseRoutes.length);setStep(0)}
 function completeStep(){if(finished)return;const next=step+1;setStep(next);setState(v=>({...v,points:v.points+10}));if(next===totalSteps)setState(v=>{if(mode!=="daily")return{...v,points:v.points+25};if(v.lastDailyDate===today)return{...v,points:v.points+25};const nextStreak=v.lastDailyDate===yesterday()?v.streak+1:1;return{points:v.points+25,streak:nextStreak,lastDailyDate:today}})}
 return <section className={styles.game} aria-label="Playable VIA World Quest prototype">
  <div className={styles.scoreRow}><div><strong>{state.points}</strong><span>VIA Points</span></div><div><strong>{state.streak}</strong><span>Day streak</span></div><div><strong>{completedToday?"✓":"—"}</strong><span>Daily Quest</span></div></div>
  <div className={styles.modeButtons}><button type="button" onClick={startDaily}>Daily Quest</button><button type="button" onClick={startSurprise}>Surprise Route</button></div>
  <article className={styles.questCard}><div className={styles.progressLine}><span>{mode==="daily"?"Daily Quest":"Surprise Route"}</span><span>{Math.min(step,totalSteps)} / {totalSteps}</span></div>
   {!finished?<><h2>{currentLabel}</h2><p>This prototype records only local game progress. Future versions will connect each step to verified VIA Discovery destinations.</p><button className={styles.primary} type="button" onClick={completeStep}>Mark step complete · +10 points</button></>:<div className={styles.finished}><span aria-hidden="true">◆</span><h2>Quest complete</h2><p>{mode==="daily"&&completedToday?"Today’s Daily Quest is recorded. Come back tomorrow to continue your streak.":"You earned the completion bonus. Try another route."}</p><button className={styles.primary} type="button" onClick={mode==="daily"?startSurprise:startDaily}>Play another route</button></div>}
  </article>
  <article className={styles.questCard} aria-labelledby="diamond-reward-heading"><div className={styles.progressLine}><span id="diamond-reward-heading">VIA Diamond Reward</span><span>Maximum: 1 shower</span></div><h2>◆ Diamond Shower</h2><p>A qualifying Quest may later receive a DeSo Diamond Shower. One reward event can never pay more than one shower. VIA will first calculate the number of posts, diamond level, estimated DESO value and available reward budget.</p><p className={styles.note}>No automatic blockchain payment is active in this prototype. A future shower is allowed only when the verified cost fits the funded reward pool and the DeSo transaction is explicitly authorised through a safe signing flow.</p></article>
  <p className={styles.note}>VIA Points are currently local, non-transferable game points. They are not DESO, money or proof that a blockchain reward was paid.</p>
 </section>
}
