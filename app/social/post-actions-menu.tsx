"use client"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { MoreHorizontal } from "lucide-react"
import XShareButton from "../x-share-button"
import FollowButton from "./follow-button"
import { readViaLocalSettings } from "../via-local-settings"
import { translateViaTextLocally } from "../via-local-translation"
export default function PostActionsMenu({postHash,body,publicKey,authenticated=false,onReward}:{postHash:string;body:string;publicKey?:string;authenticated?:boolean;onReward?:()=>void}) {
 const [translation,setTranslation]=useState("")
 const [opened,setOpened]=useState(false)
 const [copied,setCopied]=useState(false)
 const menu=useRef<HTMLDetailsElement>(null)
 useEffect(()=>{
   if(!opened)return
   const close=(event:PointerEvent)=>{if(!menu.current?.contains(event.target as Node))menu.current?.removeAttribute("open")}
   const escape=(event:KeyboardEvent)=>{if(event.key==="Escape")menu.current?.removeAttribute("open")}
   document.addEventListener("pointerdown",close)
   document.addEventListener("keydown",escape)
   return ()=>{document.removeEventListener("pointerdown",close);document.removeEventListener("keydown",escape)}
 },[opened])
 const href="/social?post="+encodeURIComponent(postHash)
 const item="block w-full px-3 py-2 text-left text-xs text-zinc-300 hover:bg-white/10"
 const url=()=>window.location.origin+href
 return <details ref={menu} className="relative" onToggle={e=>setOpened(e.currentTarget.open)}><summary aria-label="More post actions" className="grid h-9 w-9 cursor-pointer list-none place-items-center rounded-full border border-zinc-800 text-zinc-300"><MoreHorizontal size={18}/></summary><div className="absolute right-0 z-30 mt-1 w-48 rounded-xl border border-zinc-700 bg-[#080b09] p-1 shadow-xl">
 <Link href={href} className={item}>Open post</Link>
 <button type="button" className={item} onClick={async()=>{try{await navigator.clipboard.writeText(url());setCopied(true)}catch{window.prompt("Copy link",url())}}}>{copied?"Copied":"Link to Post"}</button>
 <XShareButton href={href} text={body.slice(0,180)} label="X" className={item}/>
 <button type="button" className={item} onClick={()=>window.open("https://wa.me/?text="+encodeURIComponent(url()),"_blank","noopener,noreferrer")}>WhatsApp</button>
 <button type="button" className={item} onClick={async()=>{const lang=readViaLocalSettings().interfaceLanguage;const target=({Dutch:"nl",English:"en",French:"fr",Spanish:"es",Chinese:"zh",Hindi:"hi"} as Record<string,string>)[lang]??"en";const result=await translateViaTextLocally(body,target);setTranslation(result.text||result.message)}}>Translate / Vertalen</button>
 {translation?<p className="whitespace-pre-wrap break-words p-2 text-xs">{translation}</p>:null}
 {opened&&authenticated&&publicKey?<div className="[&_button]:w-full"><FollowButton followedPublicKey={publicKey}/></div>:null}
 {onReward?<button type="button" className={item} onClick={e=>{e.currentTarget.closest("details")?.removeAttribute("open");onReward()}}>Reward in $</button>:null}
 <button type="button" className={item} onClick={e=>e.currentTarget.closest("details")?.removeAttribute("open")}>Close</button>
 </div></details>
}
