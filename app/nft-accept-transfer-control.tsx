"use client"
import { useEffect, useRef, useState } from "react"
import { viaModernIdentity, type ViaModernIdentityUser } from "./deso-identity-modern"
import { acceptNFTTransfer, identity } from "deso-protocol"
type Edition={serialNumber:number;isPending:boolean;ownerPublicKey?:string}
export default function NFTAcceptTransferControl({postHash,editions}:{postHash:string;editions:Edition[]}){
 const [session,setSession]=useState<ViaModernIdentityUser|null>(null); const [confirmed,setConfirmed]=useState(false); const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false)
 const pending=editions.filter(e=>session&&e.isPending&&e.ownerPublicKey===session.publicKey)
 useEffect(()=>{void viaModernIdentity.currentUser().then(setSession);return viaModernIdentity.subscribe(setSession)},[])
 const lock=useRef(false)
 async function accept(serialNumber:number){
  if(!session||!confirmed||lock.current||!pending.some(e=>e.serialNumber===serialNumber))return
  lock.current=true;setBusy(true);setConfirmed(false)
  const key=session.publicKey
  let submitting=false
  const assertAccount=async()=>{if((await viaModernIdentity.currentUser())?.publicKey!==key||(await identity.snapshot()).currentUser?.publicKey!==key)throw new Error("Account changed")}
  try{
   await assertAccount()
   setMessage("Preparing transfer directly with DeSo...")
   submitting=true
   await acceptNFTTransfer({UpdaterPublicKeyBase58Check:key,NFTPostHashHex:postHash,SerialNumber:serialNumber,TransactionFees:[]},{localConstruction:false})
   setMessage("Submitted to DeSo. Refresh to verify ownership.")
  }catch{
   setMessage(submitting?"Submission outcome uncertain. Verify on DeSo before retrying.":"Transfer not submitted. Review account and permissions.")
  }finally{lock.current=false;setBusy(false)}
 }
 if(!session||pending.length===0)return null
 return <section className="mt-5 rounded-xl border border-[#285f40]/60 bg-black/25 p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">Incoming NFT</p><h2 className="mt-2 text-lg font-semibold">Accept transfer</h2><p className="mt-2 text-sm text-zinc-400">DeSo marks these editions as pending for your active account. Ownership completes only after your signed acceptance.</p><label className="mt-3 flex items-start gap-2 text-xs text-amber-200"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>I understand this accepts a real on-chain NFT transfer.</label><div className="mt-3 flex flex-wrap gap-2">{pending.map(e=><button key={e.serialNumber} disabled={!confirmed||busy} onClick={()=>void accept(e.serialNumber)} className="rounded-lg border border-[#8fd4a9]/55 px-4 py-2 text-sm font-semibold text-[#9adbb2] disabled:text-zinc-600">Accept edition #{e.serialNumber}</button>)}</div>{message?<p className="mt-3 text-xs text-zinc-400" role="status">{message}</p>:null}</section>
}
