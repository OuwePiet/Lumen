"use client"
import Link from "next/link"
import { ChangeEvent,useEffect,useRef,useState } from "react"
import { Camera,Save } from "lucide-react"
import {updateProfile,identity} from "deso-protocol"
import {viaModernIdentity} from "../../deso-identity-modern"
import {ensureNFTPermission} from "../../nft-permissions"
import { useViaIdentitySession } from "../../use-via-identity-session"
type Profile={username:string;description:string;profilePic:string|null;creatorBasisPoints:number|null;stakeMultipleBasisPoints:number|null;isHidden:boolean}
export default function EditProfilePage(){
 const session=useViaIdentitySession()
 const [ready,setReady]=useState(false),[username,setUsername]=useState(""),[description,setDescription]=useState(""),[profilePic,setProfilePic]=useState(""),[fr,setFr]=useState("0"),[stakeMultiple,setStakeMultiple]=useState<number|null>(null),[isHidden,setIsHidden]=useState<boolean|null>(null),[message,setMessage]=useState("")
 const lock=useRef(false)
 const [busy,setBusy]=useState(false)
 useEffect(()=>{
  setReady(false);setUsername("");setDescription("");setProfilePic("");setFr("0");setStakeMultiple(null);setIsHidden(null)

  if(!session)return
  const controller=new AbortController()
  fetch("/api/via/profile?identity="+encodeURIComponent(session.publicKey),{cache:"no-store",signal:controller.signal}).then(r=>r.json()).then(d=>{if(controller.signal.aborted||!d?.profile)return;setUsername(d.profile.username||"");setDescription(d.profile.description||"");setProfilePic(d.profile.profilePic||"");setFr(String(d.profile.creatorBasisPoints??0));setStakeMultiple(typeof d.profile.stakeMultipleBasisPoints==="number"?d.profile.stakeMultipleBasisPoints:null);setIsHidden(typeof d.profile.isHidden==="boolean"?d.profile.isHidden:null);setReady(true)}).catch(()=>{})
  return()=>controller.abort()
 },[session?.publicKey])


 function choosePhoto(e:ChangeEvent<HTMLInputElement>){const file=e.target.files?.[0];if(!file||file.size>2_000_000){setMessage("Choose an image up to 2 MB.");return}const reader=new FileReader();reader.onload=()=>setProfilePic(typeof reader.result==="string"?reader.result:"");reader.readAsDataURL(file)}
 async function save(){
  if(!session||!ready||lock.current||stakeMultiple===null||isHidden===null)return
  const key=session.publicKey,frValue=Number(fr),name=username.trim()
  if(!name||name.length>25||description.length>20000||profilePic.length>5000000||!Number.isInteger(frValue)||frValue<0||frValue>10000||!Number.isInteger(stakeMultiple)||stakeMultiple<0||stakeMultiple>1000000){setMessage("Invalid profile settings.");return}
  lock.current=true;setBusy(true);setMessage("Preparing DeSo profile update...")
  const assertAccount=async()=>{if((await viaModernIdentity.currentUser())?.publicKey!==key||(await identity.snapshot()).currentUser?.publicKey!==key)throw new Error("ACCOUNT_CHANGED")}
  try{
   await assertAccount()
   const {constructedTransactionResponse:tx}=await updateProfile({UpdaterPublicKeyBase58Check:key,ProfilePublicKeyBase58Check:key,NewUsername:name,NewDescription:description,NewProfilePic:profilePic,NewCreatorBasisPoints:frValue,NewStakeMultipleBasisPoints:stakeMultiple,IsHidden:isHidden,MinFeeRateNanosPerKB:1000,TransactionFees:[]},{broadcast:false,checkPermissions:false,localConstruction:false})
   if(!tx.TransactionHex||!Number.isSafeInteger(tx.FeeNanos)||tx.FeeNanos<0)throw new Error("INVALID_FEE")
   await ensureNFTPermission({GlobalDESOLimit:tx.FeeNanos,TransactionCountLimitMap:{UPDATE_PROFILE:1}},assertAccount)
   await assertAccount()
   const signed=await viaModernIdentity.signTx(tx.TransactionHex)
   await assertAccount()
   await identity.submitTx(signed)
   setMessage("Profile update submitted to DeSo.")
  }catch{setMessage("Profile update not confirmed. Check DeSo before retrying.")}
  finally{lock.current=false;setBusy(false)}
 }
 if(!session)return <main className="min-h-screen bg-[#050807] p-5 text-zinc-100"><p>Log in with DeSo Identity to edit your profile.</p><Link href="/profile">Back</Link></main>
 return <main className="min-h-screen bg-[#050807] p-4 text-zinc-100"><section className="mx-auto max-w-xl rounded-2xl border border-[#8fd4a9]/25 bg-[#0b1710] p-4">
 <div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[.16em] text-[#8fd4a9]">VIA · DeSo</p><h1 className="text-xl font-semibold">Edit Profile</h1></div><Link href="/profile" className="text-sm text-zinc-400">Cancel</Link></div>
 <div className="mt-5 flex justify-center"><label className="relative cursor-pointer"><div className="h-24 w-24 overflow-hidden rounded-full border border-[#8fd4a9]/35 bg-black/30">{profilePic?<img src={profilePic} alt="" className="h-full w-full object-cover"/>:<span className="grid h-full place-items-center text-3xl">V</span>}</div><span className="absolute bottom-0 right-0 grid h-9 w-9 place-items-center rounded-full bg-[#10271a] text-[#9adbb2]"><Camera className="h-4 w-4"/></span><input className="hidden" type="file" accept="image/*" onChange={choosePhoto}/></label></div>
 <div className="mt-5 grid gap-4"><label className="grid gap-1 text-sm">USERNAME<input value={username} maxLength={25} onChange={e=>setUsername(e.target.value)} className="rounded-xl border border-zinc-700 bg-[#050807] p-3"/></label><label className="grid gap-1 text-sm">DESCRIPTION<textarea value={description} maxLength={20000} rows={6} onChange={e=>setDescription(e.target.value)} className="rounded-xl border border-zinc-700 bg-[#050807] p-3"/></label><label className="grid gap-1 text-sm">FOUNDER REWARD PERCENTAGE<input type="number" min="0" max="100" step=".01" value={(Number(fr)/100).toString()} onChange={e=>setFr(String(Math.round(Number(e.target.value)*100)))} className="rounded-xl border border-zinc-700 bg-[#050807] p-3"/></label></div>
 <button onClick={()=>void save()} disabled={busy||!ready||!username.trim()} className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#8fd4a9]/45 bg-[#10271a] font-semibold text-[#9adbb2] disabled:opacity-40"><Save className="h-4 w-4"/>Save with DeSo Identity</button><p role="status" className="mt-3 text-sm text-zinc-400">{message||"Changes require your DeSo Identity approval."}</p>
 </section></main>
}