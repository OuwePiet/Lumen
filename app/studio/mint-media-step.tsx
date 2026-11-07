"use client"

import { useEffect, useRef, useState } from "react"
import { viaModernIdentity, type ViaModernIdentityUser } from "../deso-identity-modern"
import { useNFTAction } from "../use-nft-action"
import { fetchDeSo } from "../deso-api"
import { restoreIdentitySession } from "../deso-identity-session"
import VideoUploadControl from "../social/video-upload-control"

type StorageMode = "deso" | "protected" | "advanced"

const choices: Array<{id:StorageMode; title:string; text:string}> = [
  { id:"deso", title:"Standard · DeSo", text:"Use the normal DeSo media route. Recommended for a simple native DeSo NFT." },
  { id:"protected", title:"Optional · Arweave preview", text:"Storage quotes only. Upload and provider payment are not connected. This option is not required for native DeSo minting." },
  { id:"advanced", title:"Advanced", text:"Use a supported external/IPFS provider, your own server, or an existing durable media URL." },
]

export default function MintMediaStep({ onPostHash }: { onPostHash?: (postHash: string) => void }) {
  const sourceRunner = useNFTAction()
  const [mode,setMode]=useState<StorageMode>("deso")
  const [fileName,setFileName]=useState("")
  const [file,setFile]=useState<File | null>(null)
  const [session,setSession]=useState<ViaModernIdentityUser | null>(null)
  const [uploading,setUploading]=useState(false)
  const uploadFlight = useRef(false)
  const mediaVersion = useRef(0)
  const mediaAccount = useRef<string | null>(null)
  const [imageUrl,setImageUrl]=useState("")
  const [videoUrl,setVideoUrl]=useState("")
  const [message,setMessage]=useState("")
  const [description,setDescription]=useState("")
  const [sensitiveContent,setSensitiveContent]=useState(false)
  const [externalMediaUrl,setExternalMediaUrl]=useState("")
  const [postBusy,setPostBusy]=useState(false)
  const [sourcePostReady,setSourcePostReady]=useState(false)
  const [arweaveQuote,setArweaveQuote]=useState<{priceWinston:string; viaStorageService:{percent:number;amountWinston:string;collectionStatus:string}; totalWinston:string; quotedAt:string} | null>(null)
  const [arweaveQuoteBusy,setArweaveQuoteBusy]=useState(false)
  const [arweaveQuoteError,setArweaveQuoteError]=useState("")
  useEffect(()=>{
    const unsubscribe = viaModernIdentity.subscribe(user => {
      setSession(user)
      if (mediaAccount.current === (user?.publicKey ?? null)) return
      mediaAccount.current = user?.publicKey ?? null
      mediaVersion.current += 1
      setImageUrl(""); setVideoUrl(""); setSourcePostReady(false); onPostHash?.("")
    })
    return () => { mediaVersion.current += 1; unsubscribe() }
  },[])
  useEffect(()=>{
    if(mode!=="protected" || !file || file.size<=0){ setArweaveQuote(null); setArweaveQuoteError(""); setArweaveQuoteBusy(false); return }
    const controller=new AbortController()
    setArweaveQuote(null); setArweaveQuoteError(""); setArweaveQuoteBusy(true)
    void fetch(`/api/via/storage/arweave/quote?bytes=${file.size}`,{cache:"no-store",signal:controller.signal})
      .then(async (response)=>{
        const data=await response.json() as {ok?:boolean;priceWinston?:string;viaStorageService?:{percent?:number;amountWinston?:string;collectionStatus?:string};totalWinston?:string;quotedAt?:string}
        if(!response.ok || !data.ok || !data.priceWinston || data.viaStorageService?.percent!==5 || !data.viaStorageService.amountWinston || !data.totalWinston || !data.quotedAt) throw new Error("QUOTE_UNAVAILABLE")
        setArweaveQuote({priceWinston:data.priceWinston,viaStorageService:{percent:data.viaStorageService.percent,amountWinston:data.viaStorageService.amountWinston,collectionStatus:data.viaStorageService.collectionStatus ?? "status-unavailable"},totalWinston:data.totalWinston,quotedAt:data.quotedAt})
      })
      .catch((error:unknown)=>{ if(!(error instanceof DOMException && error.name==="AbortError")) setArweaveQuoteError("Current Arweave storage quote is unavailable. Nothing was uploaded or charged.") })
      .finally(()=>{ if(!controller.signal.aborted) setArweaveQuoteBusy(false) })
    return ()=>controller.abort()
  },[mode,file])

  async function createSourcePost(){
    const sourceUrl=mode==="advanced" ? externalMediaUrl.trim() : (videoUrl || imageUrl)
    if(mode==="protected"){ setMessage("Arweave storage upload and direct provider payment are not connected yet. Nothing was uploaded, posted or minted."); return }
    if(!session){ setMessage("Sign in with DeSo Identity before creating the source post. Nothing was posted or minted."); return }
    if(!sourceUrl){ setMessage("Choose or upload NFT media before creating the source post. Nothing was posted or minted."); return }
    if(postBusy) return
    if(description.trim().length===0){ setMessage("Add a description before creating the DeSo source post. Nothing was posted or minted."); return }
    if(mode==="advanced"){ try { const parsed=new URL(sourceUrl); if(parsed.protocol!=="https:" || !parsed.hostname || parsed.username || parsed.password) throw new Error("HTTPS_REQUIRED") } catch { setMessage("Use a valid HTTPS media URL. Nothing was posted or minted."); return } }
    if (!sourceRunner.current) return
    const account = session.publicKey
    setSourcePostReady(false); onPostHash?.("")
    const result = await sourceRunner.current.run({ kind: "source-post", publicKey: account, body: { publicKey: account, body: description, imageUrls: videoUrl && mode === "deso" ? [] : [sourceUrl], videoUrls: videoUrl && mode === "deso" ? [sourceUrl] : [], sensitiveContent } }, (status, text) => {
      setPostBusy(["preparing", "approval", "submitting"].includes(status)); setMessage(text)
    })
    if (result.outcome !== "accepted") return
    if (!result.postHashHex) { setMessage("DeSo heeft de bronpost ontvangen, maar een betrouwbare PostHash ontbreekt. Niet opnieuw plaatsen; controleer DeSo handmatig."); return }
    try {
      const response = await fetchDeSo("get-single-post", { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", body: JSON.stringify({ PostHashHex: result.postHashHex, ReaderPublicKeyBase58Check: account, FetchParents: false, CommentLimit: 0 }) })
      const data = await response.json() as { PostFound?: { PostHashHex?: string; PublicKeyBase58Check?: string } }
      if (restoreIdentitySession()?.publicKey !== account) return
      if (!response.ok || data.PostFound?.PostHashHex?.toLowerCase() !== result.postHashHex || data.PostFound.PublicKeyBase58Check !== account) throw new Error("SOURCE_NOT_VISIBLE")
      onPostHash?.(result.postHashHex); setSourcePostReady(true)
      setMessage("DeSo toont de ontvangen bronpost. Dit bewijst nog geen definitieve block inclusion. Minten is een afzonderlijke actie met een nieuwe controle.")
    } catch { setMessage("DeSo heeft de bronpost ontvangen; de vervolgcontrole is niet beschikbaar. Niet opnieuw plaatsen. Controleer de post voordat je mint.") }
  }

  async function uploadStandardImage(){
    if(!session){ setMessage("Sign in with DeSo Identity before uploading. Nothing was uploaded or minted."); return }
    if(!file || uploadFlight.current) return
    if(!file.type.startsWith("image/")){ setMessage("Standard · DeSo currently supports image mint media here. Use Advanced for an existing video, audio or other durable media URL."); return }
    if(!["image/gif","image/jpeg","image/png","image/webp"].includes(file.type)){ setMessage("DeSo Standard accepts JPEG, PNG, GIF or WebP images here. Nothing was uploaded."); return }
    if(file.size<=0){ setMessage("The selected image is empty. Nothing was uploaded."); return }
    const account = session.publicKey, selectedFile = file, version = mediaVersion.current
    const current = () => mediaVersion.current === version && restoreIdentitySession()?.publicKey === account
    uploadFlight.current = true
    setUploading(true); setMessage("Authorizing DeSo media upload…")
    try {
      const jwt=await viaModernIdentity.jwt()
      if (!current()) return
      const form=new FormData(); form.set("publicKey",account); form.set("jwt",jwt); form.set("file",selectedFile,selectedFile.name)
      const response=await fetch("/api/via/social/image-upload",{method:"POST",body:form,cache:"no-store"})
      const data=await response.json() as {ok?:boolean;imageUrl?:string;error?:string}
      if (!current()) return
      if(!response.ok || !data.ok || !data.imageUrl) throw new Error(data.error || "UPLOAD_FAILED")
      setImageUrl(data.imageUrl); setVideoUrl(""); setSourcePostReady(false); setMessage("Image uploaded to DeSo. Next: add the description and create the source post. NFT minting has not started.")
      onPostHash?.("")
    } catch { if (current()) setMessage("De upload kon niet worden bevestigd. Er is geen bronpost of NFT aangemaakt.") }
    finally { uploadFlight.current = false; setUploading(false) }
  }
  const videoVersion = mediaVersion.current
  return (
    <section onChangeCapture={() => sourceRunner.current?.invalidate()} className="mb-4 rounded-[14px] border border-zinc-800/80 bg-zinc-950/55 p-5 sm:p-6" aria-labelledby="mint-media-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">Step 1 · Media</p>
      <h2 id="mint-media-heading" className="mt-2 text-2xl font-semibold tracking-tight">Choose media and storage</h2>
      <p className="mt-3 text-sm leading-6 text-zinc-400">Your original stays yours. Keep a master copy on your iPad, computer, SSD/HDD or NAS. The public NFT media can use the route you choose below.</p>

      <label className="mt-5 grid gap-2">
        <span className="text-sm font-semibold text-zinc-200">Choose image or video for DeSo, or use Advanced for other NFT media</span>
        <input type="file" onChange={(e)=>{mediaVersion.current += 1; const next=e.target.files?.[0] ?? null; setFile(next); setFileName(next?.name ?? ""); setImageUrl(""); setDescription(""); setSensitiveContent(false); setSourcePostReady(false); setMessage(""); onPostHash?.("")}} className="block w-full rounded-[11px] border border-zinc-700/80 bg-[#050807] px-3 py-3 text-sm text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:font-semibold file:text-zinc-100"/>
        {fileName ? <span className="text-xs text-zinc-500">Selected locally: {fileName} · {imageUrl || videoUrl ? "ready on DeSo" : "not uploaded yet"}{file && file.type.startsWith("image/") && file.size>10*1024*1024 ? " · image exceeds the 10 MB DeSo limit" : ""}</span> : null}
      </label>
      {mode==="deso" ? <VideoUploadControl key={session?.publicKey ?? "public"} onReady={(url) => { if (mediaVersion.current !== videoVersion || restoreIdentitySession()?.publicKey !== session?.publicKey) return; setVideoUrl(url); setImageUrl(""); setSourcePostReady(false); onPostHash?.(""); setMessage("Video is ready on DeSo. Next: add the description and create the source post. NFT minting has not started.") }} /> : null}

      {mode==="deso" && file ? <button type="button" onClick={uploadStandardImage} disabled={uploading || file.size<=0 || file.size>10*1024*1024 || !["image/gif","image/jpeg","image/png","image/webp"].includes(file.type)} className="mt-3 rounded-[11px] border border-[#8fd4a9]/50 px-4 py-2 text-sm font-semibold text-[#9adbb2] disabled:opacity-40">{uploading ? "Uploading…" : "Upload image to DeSo"}</button> : null}
      {(imageUrl || videoUrl || (mode==="advanced" && externalMediaUrl.trim())) ? <><label className="mt-4 grid gap-2"><span className="text-sm font-semibold text-zinc-200">Description <span className="font-normal text-zinc-500">({description.length}/5000)</span></span><textarea value={description} onChange={(e)=>{setDescription(e.target.value.slice(0,5000)); setSourcePostReady(false); onPostHash?.("")}} maxLength={5000} rows={3} placeholder="Describe this NFT…" className="w-full rounded-[11px] border border-zinc-700/80 bg-[#050807] px-3 py-3 text-sm text-zinc-100 outline-none focus:border-[#8fd4a9]/55"/></label><label className="mt-3 flex items-start gap-2 text-sm text-zinc-300"><input type="checkbox" checked={sensitiveContent} onChange={(e)=>{setSensitiveContent(e.target.checked); setSourcePostReady(false); onPostHash?.("")}} className="mt-1"/><span><strong className="font-semibold text-zinc-200">Sensitive / explicit content</strong><span className="block text-xs leading-5 text-zinc-500">Mark the DeSo source post before minting when the media or description requires it.</span></span></label><button type="button" onClick={createSourcePost} disabled={postBusy || !session || description.trim().length===0 || (!imageUrl && !videoUrl && !(mode==="advanced" && externalMediaUrl.trim()))} className="mt-3 rounded-[11px] border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 disabled:opacity-40">{postBusy ? "Preparing…" : "Create DeSo source post"}</button></> : null}
      {sourcePostReady ? <p className="mt-2 text-xs font-semibold text-[#9adbb2]">✓ DeSo source post ready for NFT mint terms.</p> : null}{message ? <p className="mt-2 text-xs text-zinc-400" role="status">{message}</p> : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {choices.map((choice)=>(
          <button key={choice.id} type="button" onClick={()=>{mediaVersion.current += 1; setMode(choice.id); setVideoUrl(""); setImageUrl(""); setExternalMediaUrl(""); setDescription(""); setSensitiveContent(false); setSourcePostReady(false); onPostHash?.(""); setMessage(choice.id==="protected" ? "Arweave quote mode selected. Nothing will be uploaded or charged until permanent storage upload and direct provider payment are connected." : "")}} aria-pressed={mode===choice.id}
            className={`min-h-32 rounded-[12px] border p-4 text-left transition ${mode===choice.id ? "border-[#8fd4a9]/60 bg-[#0c1711]/60" : "border-zinc-800 bg-black/20 hover:border-zinc-700"}`}>
            <span className="block text-sm font-semibold text-zinc-100">{choice.title}</span>
            <span className="mt-2 block text-xs leading-5 text-zinc-400">{choice.text}</span>
          </button>
        ))}
      </div>

      {mode==="protected" ? <div className="mt-4 rounded-[11px] border border-[#8fd4a9]/35 bg-[#0c1711]/35 px-4 py-3 text-sm text-zinc-300"><p className="font-semibold text-zinc-100">Arweave permanent storage quote</p>{!file ? <p className="mt-2 text-xs text-zinc-400">Choose a local file above to calculate the current network storage quote.</p> : arweaveQuoteBusy ? <p className="mt-2 text-xs text-zinc-400">Getting the current Arweave network quote…</p> : arweaveQuote ? <><p className="mt-2 text-xs text-zinc-300">File: {file.name} · {file.size.toLocaleString()} bytes</p><p className="mt-1 text-xs text-zinc-300">Arweave storage: {arweaveQuote.priceWinston} Winston</p><p className="mt-1 text-xs text-zinc-300">VIA Storage Service ({arweaveQuote.viaStorageService.percent}%): {arweaveQuote.viaStorageService.amountWinston} Winston</p><p className="mt-1 text-xs font-semibold text-zinc-200">Total storage quote: {arweaveQuote.totalWinston} Winston</p><p className="mt-1 text-xs text-zinc-500">Quoted {new Date(arweaveQuote.quotedAt).toLocaleString()} · quote only · VIA fee {arweaveQuote.viaStorageService.collectionStatus === "not-collected" ? "not collected" : arweaveQuote.viaStorageService.collectionStatus} · nothing uploaded or charged.</p><p className="mt-2 text-xs text-zinc-400">The creator pays the storage provider directly. VIA does not advance or collect this storage cost.</p></> : arweaveQuoteError ? <p className="mt-2 text-xs text-zinc-400">{arweaveQuoteError}</p> : null}</div> : null}

      {mode==="advanced" ? <label className="mt-4 grid gap-2"><span className="text-sm font-semibold text-zinc-200">Existing media URL / own server</span><input type="url" value={externalMediaUrl} onChange={(e)=>{setExternalMediaUrl(e.target.value.trimStart()); setSourcePostReady(false); onPostHash?.("")}} placeholder="https://…" className="w-full rounded-[11px] border border-zinc-700/80 bg-[#050807] px-3 py-3 text-base text-zinc-100 outline-none focus:border-[#8fd4a9]/55"/></label> : null}

      <p className="mt-4 rounded-[10px] border border-zinc-800/80 bg-black/20 px-3 py-2 text-xs leading-5 text-zinc-500">{mode==="deso" ? (imageUrl ? "The media upload is complete. Creating the source post requires DeSo Identity approval; NFT minting remains a separate approval in the mint terms below." : "Standard uses VIA’s existing DeSo media route. Nothing is uploaded until you choose Upload image to DeSo.") : "This storage option is not submitted yet. VIA will show the provider and any storage cost before anything is uploaded or charged."}</p>
    </section>
  )
}
