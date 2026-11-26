"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {submitPost,identity} from "deso-protocol"
import { viaModernIdentity } from "../deso-identity-modern"
import { type ViaIdentitySession } from "../deso-identity-session"

type InspectResponse = {
  ok?: boolean
  error?: string
  post?: {
    postHashHex: string
    body: string
    imageUrls: string[]
    videoUrls: string[]
    parentStakeID: string
    postExtraData: Record<string,string>
  }
}

type PrepareResponse = { ok?: boolean; error?: string; transactionHex?: string; feeNanos?: number | null }
type SubmitResponse = { ok?: boolean; error?: string }

export default function EditPostControl() {
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const [postHashHex, setPostHashHex] = useState("")
  const [body, setBody] = useState("")
  const [originalBody, setOriginalBody] = useState("")
  const [mediaSummary, setMediaSummary] = useState("")
  const [loadedHash, setLoadedHash] = useState("")
  const [feeNanos, setFeeNanos] = useState<number | null>(null)
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "preparing" | "awaiting" | "submitting" | "done" | "error">("idle")
  const [message, setMessage] = useState("")
  const lock=useRef(false)

  useEffect(() => {
    const linkedHash = new URLSearchParams(window.location.search).get("post")?.trim() ?? ""
    if (/^[0-9a-fA-F]{64}$/.test(linkedHash)) {
      setPostHashHex(linkedHash.toLowerCase())
      setMessage("Post hash loaded from VIA. Verify ownership before editing.")
    }
    return viaModernIdentity.subscribe((user) => {
      setSession(user)
    })
  }, [])

  useEffect(() => {
    setLoadedHash("")
    setBody("")
    setOriginalBody("")
  }, [session?.publicKey])

  const hashValid = /^[0-9a-fA-F]{64}$/.test(postHashHex.trim())
  const changed = Boolean(loadedHash && body !== originalBody)
  const remaining = 5000 - body.length
  const feeLabel = useMemo(() => feeNanos === null ? "" : `${feeNanos.toLocaleString()} nanos network fee in the prepared transaction`, [feeNanos])

  async function inspect() {
    if (!session || !hashValid) return
    const activeKey = session.publicKey
    setStatus("loading")
    setMessage("Checking the post and ownership on DeSo…")
    setFeeNanos(null)
    try {
      const response = await fetch("/api/via/social/edit-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ action: "inspect", publicKey: activeKey, postHashHex: postHashHex.trim() }),
      })
      const data = await response.json() as InspectResponse
      if (!response.ok || !data.ok || !data.post) throw new Error(data.error || "LOOKUP_FAILED")
      setLoadedHash(data.post.postHashHex)
      setPostHashHex(data.post.postHashHex)
      setBody(data.post.body)
      setOriginalBody(data.post.body)
      setMediaSummary(`${data.post.imageUrls.length} image(s) · ${data.post.videoUrls.length} video(s) preserved`)
      setStatus("ready")
      setMessage("Post verified for the active DeSo key. Edit the text below; existing media will be preserved.")
    } catch (error) {
      const code = error instanceof Error ? error.message : "LOOKUP_FAILED"
      setLoadedHash("")
      setBody("")
      setOriginalBody("")
      setMediaSummary("")
      setStatus("error")
      setMessage(code === "POST_NOT_OWNED_BY_ACTIVE_KEY" ? "This post does not belong to the active DeSo key." : "This post could not be verified for safe editing.")
    }
  }

  async function prepare() {
    if (!session || !loadedHash || !changed || !body.trim() || body.length > 5000 || lock.current) return
    lock.current=true
    const activeKey = session.publicKey
    setStatus("preparing")
    setMessage("Rechecking ownership and preparing the exact DeSo edit transaction…")
    setFeeNanos(null)
    try {
            const assertAccount=async()=>{if((await viaModernIdentity.currentUser())?.publicKey!==activeKey||(await identity.snapshot()).currentUser?.publicKey!==activeKey)throw new Error("ACCOUNT_CHANGED")}
      await assertAccount()
      const response=await fetch("/api/via/social/edit-post",{method:"POST",headers:{"Content-Type":"application/json"},cache:"no-store",body:JSON.stringify({action:"inspect",publicKey:activeKey,postHashHex:loadedHash})})
      const data=await response.json() as InspectResponse
      if(!response.ok||!data.ok||!data.post||data.post.body!==originalBody||data.post.postHashHex!==loadedHash)throw new Error("POST_CHANGED")
      const post=data.post
      await submitPost({UpdaterPublicKeyBase58Check:activeKey,PostHashHexToModify:loadedHash,ParentStakeID:post.parentStakeID,RepostedPostHashHex:"",BodyObj:{Body:body.trim(),ImageURLs:post.imageUrls,VideoURLs:post.videoUrls},PostExtraData:{...post.postExtraData,ViaClient:"viadeso.online"},IsHidden:false,MinFeeRateNanosPerKB:1000,TransactionFees:[]},{localConstruction:false})
      setOriginalBody(body.trim());setStatus("done");setMessage("Edited post submitted to DeSo.")
    } catch {
      setStatus("error");setMessage("Edit not confirmed. Reload the post from DeSo before retrying.")
    } finally {lock.current=false}
  }

  if (!session) {
    return <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 text-sm leading-6 text-zinc-400">Connect through DeSo Identity before editing a post. VIA never edits a post from a displayed public key alone.</div>
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5" aria-labelledby="edit-post-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">Controlled DeSo write</p>
      <h2 id="edit-post-heading" className="mt-2 text-xl font-semibold">Edit your DeSo post</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-400">VIA first reloads the post from DeSo and verifies that its poster public key equals the active Identity key. Existing images and video are preserved; this first release edits text only.</p>

      <label className="mt-5 block text-sm text-zinc-300" htmlFor="edit-post-hash">Post hash</label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input id="edit-post-hash" value={postHashHex} onChange={(event) => { setPostHashHex(event.target.value); setLoadedHash(""); setBody(""); setOriginalBody(""); setMediaSummary(""); setStatus("idle"); setMessage("") }} placeholder="64-character DeSo post hash" className="min-w-0 flex-1 rounded-xl border border-zinc-800 bg-black/40 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-green-700" />
        <button type="button" onClick={inspect} disabled={!hashValid || status === "loading"} className="rounded-xl border border-green-800 px-4 py-2 text-sm font-semibold text-green-300 disabled:border-zinc-800 disabled:text-zinc-600">{status === "loading" ? "Checking…" : "Load my post"}</button>
      </div>

      {loadedHash ? <>
        <label className="mt-5 block text-sm text-zinc-300" htmlFor="edit-post-body">Post text</label>
        <textarea id="edit-post-body" value={body} onChange={(event) => setBody(event.target.value)} maxLength={5000} rows={8} className="mt-2 w-full rounded-xl border border-zinc-800 bg-black/40 px-3 py-3 text-sm text-zinc-100 outline-none focus:border-green-700" />
        <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-zinc-500"><span>{remaining.toLocaleString()} characters left</span><span>{mediaSummary}</span></div>
        {feeLabel ? <p className="mt-2 text-xs text-zinc-500">{feeLabel}</p> : null}
        <button type="button" onClick={prepare} disabled={!changed || body.length > 5000 || status === "preparing" || status === "awaiting" || status === "submitting"} className="mt-4 rounded-xl border border-green-700 px-4 py-2 text-sm font-semibold text-green-300 disabled:border-zinc-800 disabled:text-zinc-600">{status === "preparing" ? "Preparing…" : status === "awaiting" ? "Awaiting approval…" : status === "submitting" ? "Submitting…" : "Review edit in DeSo"}</button>
      </> : null}

      {message ? <p className={`mt-4 text-sm ${status === "error" ? "text-amber-300" : status === "done" ? "text-green-300" : "text-zinc-400"}`} role="status" aria-live="polite">{message}</p> : null}
      <p className="mt-4 text-xs leading-5 text-zinc-600">No edit is submitted without a fresh DeSo lookup, a newly constructed transaction and explicit approval in DeSo Identity.</p>
    </section>
  )
}
