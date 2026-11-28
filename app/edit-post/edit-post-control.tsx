"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {submitPost,getSinglePost} from "deso-protocol"
import { viaModernIdentity } from "../deso-identity-modern"
import { type ViaIdentitySession } from "../deso-identity-session"

async function loadPost(postHashHex: string, publicKey: string) {
  const { PostFound: post } = await getSinglePost({ PostHashHex: postHashHex, ReaderPublicKeyBase58Check: publicKey, FetchParents: false, CommentLimit: 0, CommentOffset: 0 })
  if (!post || post.PosterPublicKeyBase58Check !== publicKey) throw new Error("POST_NOT_OWNED_BY_ACTIVE_KEY")
  return { postHashHex: post.PostHashHex, body: post.Body, imageUrls: post.ImageURLs ?? [], videoUrls: post.VideoURLs ?? [], parentStakeID: post.ParentStakeID, postExtraData: post.PostExtraData ?? {}, isHidden: post.IsHidden, isFrozen: post.IsFrozen, repostedPostHashHex: post.RepostedPostEntryResponse?.PostHashHex ?? post.RecloutedPostEntryResponse?.PostHashHex ?? "" }
}


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

  const feeLabel = useMemo(() => feeNanos === null ? "" : `${feeNanos.toLocaleString()} nanos network fee in the prepared transaction`, [feeNanos])

  async function inspect() {
    if (!session || !hashValid) return
    const activeKey = session.publicKey
    setStatus("loading")
    setMessage("Checking the post and ownership on DeSo…")
    setFeeNanos(null)
    try {
      const data = { post: await loadPost(postHashHex.trim(), activeKey) }
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
    if (!session || !loadedHash || !changed || lock.current) return
    lock.current=true
    const activeKey = session.publicKey
    setStatus("preparing")
    setMessage("Rechecking ownership and preparing the exact DeSo edit transaction…")
    setFeeNanos(null)
    try {
      const post = await loadPost(loadedHash, activeKey)
      if(post.body!==originalBody||post.postHashHex!==loadedHash)throw new Error("POST_CHANGED")
      await submitPost({UpdaterPublicKeyBase58Check:activeKey,PostHashHexToModify:loadedHash,ParentStakeID:post.parentStakeID,RepostedPostHashHex:post.repostedPostHashHex,IsFrozen:post.isFrozen,BodyObj:{Body:body,ImageURLs:post.imageUrls,VideoURLs:post.videoUrls},PostExtraData:post.postExtraData,IsHidden:post.isHidden,TransactionFees:[]},{localConstruction:false})
      setOriginalBody(body);setStatus("done");setMessage("Edited post submitted to DeSo.")
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
        <textarea id="edit-post-body" value={body} onChange={(event) => setBody(event.target.value)} rows={8} className="mt-2 w-full rounded-xl border border-zinc-800 bg-black/40 px-3 py-3 text-sm text-zinc-100 outline-none focus:border-green-700" />
        <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-zinc-500"><span>{body.length.toLocaleString()} characters</span><span>{mediaSummary}</span></div>
        {feeLabel ? <p className="mt-2 text-xs text-zinc-500">{feeLabel}</p> : null}
        <button type="button" onClick={prepare} disabled={!changed || status === "preparing" || status === "awaiting" || status === "submitting"} className="mt-4 rounded-xl border border-green-700 px-4 py-2 text-sm font-semibold text-green-300 disabled:border-zinc-800 disabled:text-zinc-600">{status === "preparing" ? "Preparing…" : status === "awaiting" ? "Awaiting approval…" : status === "submitting" ? "Submitting…" : "Review edit in DeSo"}</button>
      </> : null}

      {message ? <p className={`mt-4 text-sm ${status === "error" ? "text-amber-300" : status === "done" ? "text-green-300" : "text-zinc-400"}`} role="status" aria-live="polite">{message}</p> : null}
      <p className="mt-4 text-xs leading-5 text-zinc-600">No edit is submitted without a fresh DeSo lookup, a newly constructed transaction and explicit approval in DeSo Identity.</p>
    </section>
  )
}
