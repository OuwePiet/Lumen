"use client"
import { useEffect, useState } from "react"
import { getUsersStateless } from "deso-protocol"
import { fetchViaRates } from "./via-live-rates"
export default function ViaHeaderBalance({publicKey}:{publicKey:string}) {
 const [snapshot,setSnapshot]=useState<{key:string;price:number|null;balance:number|null}|null>(null)
 useEffect(()=>{
  let active=true; let sequence=0
  async function refresh(){
   const request=++sequence
   const [rate,user]=await Promise.allSettled([fetchViaRates(),getUsersStateless({PublicKeysBase58Check:[publicKey]})])
   if(!active||request!==sequence)return
   const price=rate.status==="fulfilled"?rate.value.rates?.USD:null
   const nanos=user.status==="fulfilled"?user.value.UserList?.find(u=>u.PublicKeyBase58Check===publicKey)?.BalanceNanos:null
   setSnapshot({key:publicKey,price:typeof price==="number"&&Number.isFinite(price)&&price>0?price:null,balance:typeof nanos==="number"&&Number.isFinite(nanos)&&nanos>=0?nanos/1e9:null})
  }
  void refresh(); const timer=window.setInterval(refresh,60000); window.addEventListener("focus",refresh)
  return()=>{active=false;window.clearInterval(timer);window.removeEventListener("focus",refresh)}
 },[publicKey])
 const data=snapshot?.key===publicKey?snapshot:null
 const usd=(n:number)=>n.toLocaleString("en-US",{style:"currency",currency:"USD",maximumFractionDigits:2})
 return <div className="via-header-balance" style={{display:"inline-flex",gap:8,alignItems:"center",flexShrink:0,fontSize:11,lineHeight:1.25,fontVariantNumeric:"tabular-nums"}}><span>DeSo Price<br/>{data?.price!=null?usd(data.price):"—"}</span><span>Your DeSo<br/>{data?.balance!=null?data.balance.toLocaleString("en-US",{maximumFractionDigits:4}):"—"}{data?.balance!=null&&data.price!=null?` · ${usd(data.balance*data.price)}`:""}</span></div>
}