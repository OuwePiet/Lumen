"use client"

import { useEffect, useRef, useState } from "react"
import { DESO_IDENTITY_ORIGIN, restoreIdentitySession, VIA_IDENTITY_EVENT, type ViaIdentitySession } from "../deso-identity-session"
import { requestIdentityJwt } from "../social/identity-jwt"
import VideoUploadControl from "../social/video-upload-control"

type StorageMode = "deso" | "protected" | "advanced"

const choices: Array<{id:StorageMode; title:string; text:string}> = [
  { id:"deso", title:"Standard · DeSo", text:"Use the normal DeSo media route. Recommended for a simple native DeSo NFT." },
  { id:"protected", title:"Protected", text:"DeSo plus an additional decentralized backup. Provider and cost are confirmed before upload." },
  { id:"advanced", title:"Advanced", text:"Use a supported external/IPFS provider, your own server, or an existing durable media URL." },
]

export default function MintMediaStep({ onPostHash }: { onPostHash?: (postHash: string) => void }) {
  const [mode,setMode]=useState<StorageMode>("deso")
  const [fileName,setFileName]=useState("")
  const [file,setFile]=useState<File | null>(null)
  const [session,setSession]=useState<ViaIdentitySession | null>(null)
  const [uploading,setUploading]=useState(false)
  const [imageUrl,setImageUrl]=useState("")
  const [videoUrl,setVideoUrl]=useState("")
  const [message,setMessage]=useState("")
  const [description,setDescription]=useState("")
  const [sensitiveContent,setSensitiveContent]=useState(false)
  const [externalMediaUrl,setExternalMediaUrl]=useState("")
  const [postBusy,setPostBusy]=useState(false)
  const [sourcePostReady,setSourcePostReady]=useState(false)
  const postPopupRef=useRef<Window | null>(null)
  const postPopupWatchRef=useRef<number | null>(null)

  useEffect(()=>{
    const onApproval=async(event:MessageEvent)=>{
      if(event.origin!==DESO_IDENTITY_ORIGIN || event.source!==postPopupRef.current || !event.data || typeof event.data!=="object") return
      const data=event.data as Record<string,unknown>
      if(data.service!=="identity" || !data.payload || typeof data.payload!=="object" || Array.isArray(data.payload)) return
      const signedTransactionHex=(data.payload as Record<string,unknown>).signedTransactionHex
      if(typeof signedTransactionHex!=="string" || !signedTransactionHex) return
      postPopupRef.current?.close(); postPopupRef.current=null
      if(postPopupWatchRef.current!==null){ window.clearInterval(postPopupWatchRef.current); postPopupWatchRef.current=null }
      setPostBusy(true); setMessage("Submitting approved DeSo source post…")
      try {
        const response=await fetch("/api/via/social/post",{method:"POST",headers:{"Content-Type":"application/json"},cache:"no-store",body:JSON.stringify({action:"submit",signedTransactionHex})})
        const result=await response.json() as {ok?:boolean;postHashHex?:string|null;error?:string}
        if(!response.ok || !result.ok || !result.postHashHex) throw new Error(result.error || "POST_HASH_MISSING")
        if(!/^[0-9a-fA-F]{64}$/.test(result.postHashHex)) throw new Error("INVALID_POST_HASH")
        onPostHash?.(result.postHashHex)
        setSourcePostReady(true)
        setMessage("Source post confirmed. Its DeSo PostHash is ready for the NFT mint terms below.")
      } catch { setMessage("The approved source post could not be handed to the mint step. Minting did not start.") }
      finally { setPostBusy(false) }
    }
    window.addEventListener("message",onApproval)
    return ()=>{ window.removeEventListener("message",onApproval); if(postPopupWatchRef.current!==null) window.clearInterval(postPopupWatchRef.current) }
  },[onPostHash])

  useEffect(()=>{
    setSession(restoreIdentitySession())
    const onSession=(event:Event)=>setSession((event as CustomEvent<ViaIdentitySession | null>).detail ?? restoreIdentitySession())
    window.addEventListener(VIA_IDENTITY_EVENT,onSession)
    return ()=>window.removeEventListener(VIA_IDENTITY_EVENT,onSession)
  },[])

  async function createSourcePost(){
    const sourceUrl=mode==="advanced" ? externalMediaUrl.trim() : (videoUrl || imageUrl)
    if(mode==="protected"){ setMessage("Protected storage is not connected yet. Nothing was uploaded, posted or minted."); return }
    if(!session){ setMessage("Sign in with DeSo Identity before creating the source post. Nothing was posted or minted."); return }
    if(!sourceUrl || postBusy) return
    if(postPopupRef.current && !postPopupRef.current.closed){ postPopupRef.current.focus(); setMessage("Finish or close the existing DeSo Identity approval first."); return }
    if(description.trim().length===0){ setMessage("Add a description before creating the DeSo source post. Nothing was posted or minted."); return }
    if(mode==="advanced"){ try { const parsed=new URL(sourceUrl); if(parsed.protocol!=="https:" || !parsed.hostname) throw new Error("HTTPS_REQUIRED") } catch { setMessage("Use a valid HTTPS media URL. Nothing was posted or minted."); return } }
    setSourcePostReady(false); onPostHash?.(""); setPostBusy(true); setMessage("Preparing the DeSo source post…")
    try {
      const response=await fetch("/api/via/social/post",{method:"POST",headers:{"Content-Type":"application/json"},cache:"no-store",body:JSON.stringify({action:"prepare",publicKey:session.publicKey,body:description,imageUrls:videoUrl && mode==="deso" ? [] : [sourceUrl],videoUrls:videoUrl && mode==="deso" ? [sourceUrl] : [],sensitiveContent})})
      const data=await response.json() as {ok?:boolean;transactionHex?:string;error?:string}
      if(!response.ok || !data.ok || !data.transactionHex) throw new Error(data.error || "PREPARE_FAILED")
      const approveUrl=`${DESO_IDENTITY_ORIGIN}/approve?tx=${encodeURIComponent(data.transactionHex)}`
      const popup=window.open(approveUrl,"via-nft-source-post","popup=yes,width=800,height=900")
      if(!popup) throw new Error("POPUP_BLOCKED")
      postPopupRef.current=popup
      if(postPopupWatchRef.current!==null) window.clearInterval(postPopupWatchRef.current)
      postPopupWatchRef.current=window.setInterval(()=>{ if(postPopupRef.current?.closed){ window.clearInterval(postPopupWatchRef.current!); postPopupWatchRef.current=null; postPopupRef.current=null; setPostBusy(false); setMessage("DeSo Identity approval was closed. Nothing was submitted or minted.") } },500)
      setMessage("Review and approve the source post in DeSo Identity. Minting has not started yet.")
      popup.focus()
    } catch { setMessage("The source post could not be prepared. Nothing was posted or minted.") }
    finally { setPostBusy(false) }
  }

  async function uploadStandardImage(){
    if(!session){ setMessage("Sign in with DeSo Identity before uploading. Nothing was uploaded or minted."); return }
    if(!file || uploading) return
    if(!file.type.startsWith("image/")){ setMessage("Standard · DeSo currently supports image mint media here. Use Advanced for an existing video, audio or other durable media URL."); return }
    if(!["image/gif","image/jpeg","image/png","image/webp"].includes(file.type)){ setMessage("DeSo Standard accepts JPEG, PNG, GIF or WebP images here. Nothing was uploaded."); return }
    if(file.size<=0){ setMessage("The selected image is empty. Nothing was uploaded."); return }
    setUploading(true); setMessage("Authorizing DeSo media upload…")
    try {
      const jwt=await requestIdentityJwt(session.publicKey)
      const form=new FormData(); form.set("publicKey",session.publicKey); form.set("jwt",jwt); form.set("file",file,file.name)
      const response=await fetch("/api/via/social/image-upload",{method:"POST",body:form,cache:"no-store"})
      const data=await response.json() as {ok?:boolean;imageUrl?:string;error?:string}
      if(!response.ok || !data.ok || !data.imageUrl) throw new Error(data.error || "UPLOAD_FAILED")
      setImageUrl(data.imageUrl); setVideoUrl(""); setSourcePostReady(false); setMessage("Image uploaded to DeSo. Next: add the description and create the source post. NFT minting has not started.")
      onPostHash?.("")
    } catch { setMessage("Image upload failed. Nothing was posted or minted.") }
    finally { setUploading(false) }
  }
  return (
    <section className="mb-4 rounded-[14px] border border-zinc-800/80 bg-zinc-950/55 p-5 sm:p-6" aria-labelledby="mint-media-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">Step 1 · Media</p>
      <h2 id="mint-media-heading" className="mt-2 text-2xl font-semibold tracking-tight">Choose media and storage</h2>
      <p className="mt-3 text-sm leading-6 text-zinc-400">Your original stays yours. Keep a master copy on your iPad, computer, SSD/HDD or NAS. The public NFT media can use the route you choose below.</p>

      <label className="mt-5 grid gap-2">
        <span className="text-sm font-semibold text-zinc-200">Choose image, video, audio or other NFT media</span>
        <input type="file" onChange={(e)=>{const next=e.target.files?.[0] ?? null; setFile(next); setFileName(next?.name ?? ""); setImageUrl(""); setDescription(""); setSensitiveContent(false); setSourcePostReady(false); setMessage(""); onPostHash?.("")}} className="block w-full rounded-[11px] border border-zinc-700/80 bg-[#050807] px-3 py-3 text-sm text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:font-semibold file:text-zinc-100"/>
        {fileName ? <span className="text-xs text-zinc-500">Selected locally: {fileName} · {imageUrl ? "uploaded to DeSo" : "not uploaded yet"}{file && file.type.startsWith("image/") && file.size>10*1024*1024 ? " · image exceeds the 10 MB DeSo limit" : ""}</span> : null}
      </label>
      {mode==="deso" ? <VideoUploadControl onReady={(url) => { setVideoUrl(url); setImageUrl(""); setSourcePostReady(false); onPostHash?.(""); setMessage("Video is ready on DeSo. Next: add the description and create the source post. NFT minting has not started.") }} /> : null}

      {mode==="deso" && file ? <button type="button" onClick={uploadStandardImage} disabled={uploading || file.size<=0 || file.size>10*1024*1024 || !["image/gif","image/jpeg","image/png","image/webp"].includes(file.type)} className="mt-3 rounded-[11px] border border-[#8fd4a9]/50 px-4 py-2 text-sm font-semibold text-[#9adbb2] disabled:opacity-40">{uploading ? "Uploading…" : "Upload image to DeSo"}</button> : null}
      {(imageUrl || (mode==="advanced" && externalMediaUrl.trim())) ? <><label className="mt-4 grid gap-2"><span className="text-sm font-semibold text-zinc-200">Description</span><textarea value={description} onChange={(e)=>{setDescription(e.target.value); setSourcePostReady(false); onPostHash?.("")}} maxLength={5000} rows={3} placeholder="Describe this NFT…" className="w-full rounded-[11px] border border-zinc-700/80 bg-[#050807] px-3 py-3 text-sm text-zinc-100 outline-none focus:border-[#8fd4a9]/55"/></label><label className="mt-3 flex items-start gap-2 text-sm text-zinc-300"><input type="checkbox" checked={sensitiveContent} onChange={(e)=>{setSensitiveContent(e.target.checked); setSourcePostReady(false); onPostHash?.("")}} className="mt-1"/><span><strong className="font-semibold text-zinc-200">Sensitive / explicit content</strong><span className="block text-xs leading-5 text-zinc-500">Mark the DeSo source post before minting when the media or description requires it.</span></span></label><button type="button" onClick={createSourcePost} disabled={postBusy || description.trim().length===0} className="mt-3 rounded-[11px] border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 disabled:opacity-40">{postBusy ? "Preparing…" : "Create DeSo source post"}</button></> : null}
      {sourcePostReady ? <p className="mt-2 text-xs font-semibold text-[#9adbb2]">✓ DeSo source post ready for NFT mint terms.</p> : null}{message ? <p className="mt-2 text-xs text-zinc-400" role="status">{message}</p> : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {choices.map((choice)=>(
          <button key={choice.id} type="button" onClick={()=>{setMode(choice.id); setImageUrl(""); setExternalMediaUrl(""); setDescription(""); setSensitiveContent(false); setSourcePostReady(false); onPostHash?.(""); setMessage(choice.id==="protected" ? "Protected storage is not connected yet. Nothing will be uploaded until a provider and cost are confirmed." : "")}} aria-pressed={mode===choice.id}
            className={`min-h-32 rounded-[12px] border p-4 text-left transition ${mode===choice.id ? "border-[#8fd4a9]/60 bg-[#0c1711]/60" : "border-zinc-800 bg-black/20 hover:border-zinc-700"}`}>
            <span className="block text-sm font-semibold text-zinc-100">{choice.title}</span>
            <span className="mt-2 block text-xs leading-5 text-zinc-400">{choice.text}</span>
          </button>
        ))}
      </div>

      {mode==="advanced" ? <label className="mt-4 grid gap-2"><span className="text-sm font-semibold text-zinc-200">Existing media URL / own server</span><input type="url" value={externalMediaUrl} onChange={(e)=>{setExternalMediaUrl(e.target.value.trimStart()); setSourcePostReady(false); onPostHash?.("")}} placeholder="https://…" className="w-full rounded-[11px] border border-zinc-700/80 bg-[#050807] px-3 py-3 text-base text-zinc-100 outline-none focus:border-[#8fd4a9]/55"/></label> : null}

      <p className="mt-4 rounded-[10px] border border-zinc-800/80 bg-black/20 px-3 py-2 text-xs leading-5 text-zinc-500">{mode==="deso" ? (imageUrl ? "The media upload is complete. Creating the source post requires DeSo Identity approval; NFT minting remains a separate approval in the mint terms below." : "Standard uses VIA’s existing DeSo media route. Nothing is uploaded until you choose Upload image to DeSo.") : "This storage option is not submitted yet. VIA will show the provider and any storage cost before anything is uploaded or charged."}</p>
    </section>
  )
}
