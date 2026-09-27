"use client"

import { useEffect, useState } from "react"
import { restoreIdentitySession, VIA_IDENTITY_EVENT, type ViaIdentitySession } from "../deso-identity-session"
import { requestIdentityJwt } from "../social/identity-jwt"

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
  const [message,setMessage]=useState("")

  useEffect(()=>{
    setSession(restoreIdentitySession())
    const onSession=(event:Event)=>setSession((event as CustomEvent<ViaIdentitySession | null>).detail ?? restoreIdentitySession())
    window.addEventListener(VIA_IDENTITY_EVENT,onSession)
    return ()=>window.removeEventListener(VIA_IDENTITY_EVENT,onSession)
  },[])

  async function uploadStandardImage(){
    if(!session || !file || uploading || !file.type.startsWith("image/")) return
    setUploading(true); setMessage("Authorizing DeSo media upload…")
    try {
      const jwt=await requestIdentityJwt(session.publicKey)
      const form=new FormData(); form.set("publicKey",session.publicKey); form.set("jwt",jwt); form.set("file",file,file.name)
      const response=await fetch("/api/via/social/image-upload",{method:"POST",body:form,cache:"no-store"})
      const data=await response.json() as {ok?:boolean;imageUrl?:string;error?:string}
      if(!response.ok || !data.ok || !data.imageUrl) throw new Error(data.error || "UPLOAD_FAILED")
      setImageUrl(data.imageUrl); setMessage("Image uploaded to DeSo. Next: create the source post, then mint it.")
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
        <input type="file" onChange={(e)=>{const next=e.target.files?.[0] ?? null; setFile(next); setFileName(next?.name ?? ""); setImageUrl(""); setMessage(""); onPostHash?.("")}} className="block w-full rounded-[11px] border border-zinc-700/80 bg-[#050807] px-3 py-3 text-sm text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:font-semibold file:text-zinc-100"/>
        {fileName ? <span className="text-xs text-zinc-500">Selected locally: {fileName} · {imageUrl ? "uploaded to DeSo" : "not uploaded yet"}</span> : null}
      </label>
      {mode==="deso" && file?.type.startsWith("image/") ? <button type="button" onClick={uploadStandardImage} disabled={!session || uploading} className="mt-3 rounded-[11px] border border-[#8fd4a9]/50 px-4 py-2 text-sm font-semibold text-[#9adbb2] disabled:opacity-40">{uploading ? "Uploading…" : "Upload image to DeSo"}</button> : null}
      {message ? <p className="mt-2 text-xs text-zinc-400" role="status">{message}</p> : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {choices.map((choice)=>(
          <button key={choice.id} type="button" onClick={()=>setMode(choice.id)} aria-pressed={mode===choice.id}
            className={`min-h-32 rounded-[12px] border p-4 text-left transition ${mode===choice.id ? "border-[#8fd4a9]/60 bg-[#0c1711]/60" : "border-zinc-800 bg-black/20 hover:border-zinc-700"}`}>
            <span className="block text-sm font-semibold text-zinc-100">{choice.title}</span>
            <span className="mt-2 block text-xs leading-5 text-zinc-400">{choice.text}</span>
          </button>
        ))}
      </div>

      {mode==="advanced" ? <label className="mt-4 grid gap-2"><span className="text-sm font-semibold text-zinc-200">Existing media URL / own server</span><input type="url" placeholder="https://…" className="w-full rounded-[11px] border border-zinc-700/80 bg-[#050807] px-3 py-3 text-base text-zinc-100 outline-none focus:border-[#8fd4a9]/55"/></label> : null}

      <p className="mt-4 rounded-[10px] border border-zinc-800/80 bg-black/20 px-3 py-2 text-xs leading-5 text-zinc-500">This step does not upload, charge or mint yet. VIA will show the selected provider and any storage cost before anything is submitted.</p>
    </section>
  )
}
