"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useViaIdentitySession } from "../use-via-identity-session"
import { useNFTAction } from "../use-nft-action"
import { fetchDeSo } from "../deso-api"
import { parseNFTCollectionManifest, NFT_COLLECTION_EXTRA_KEY, type NFTCollectionManifest } from "../../lib/via/nft-collection-manifest"

const field = "mt-2 min-h-11 w-full rounded-lg border border-zinc-700 bg-black p-3 text-sm"

function CollectionEditor({ publicKey }: { publicKey: string }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<NFTCollectionManifest["category"]>("art")
  const [hashes, setHashes] = useState("")
  const [confirmed, setConfirmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const runner = useNFTAction()
  const draftKey = `via:nft-collection-draft:v1:${publicKey}`
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(draftKey)
      if (!raw) return
      const data = parseNFTCollectionManifest(JSON.parse(raw), publicKey)
      if (data) { setTitle(data.title); setDescription(data.description); setCategory(data.category); setHashes(data.items.join("\n")) }
    } catch { setMessage("Draft could not be restored. No publication has been started.") }
  }, [draftKey, publicKey])
  const manifest = () => parseNFTCollectionManifest({ version: 1, creatorPublicKey: publicKey, title, description, category, items: hashes.split(/\s+/).filter(Boolean) }, publicKey)
  function saveDraft() {
    const data = manifest()
    if (!data) { setMessage("Enter a title and 1–50 distinct, valid NFT post hashes."); return }
    try { window.localStorage.setItem(draftKey, JSON.stringify(data)); setMessage("Draft saved on this browser for this account. It has not been published and is not encrypted Vault storage.") }
    catch { setMessage("Draft could not be saved. Nothing was published.") }
  }
  async function publish() {
    const data = manifest()
    if (!data || !confirmed || !runner.current) return
    const result = await runner.current.run({ kind: "source-post", publicKey, body: { publicKey, body: `${data.title}\n\n${data.description}\n\nVIA curated NFT collection / series. Membership does not transfer NFT ownership.`, nftCollection: data } }, (status, text) => { setBusy(["preparing", "approval", "submitting"].includes(status)); setMessage(text) })
    if (result.outcome !== "stopped") setConfirmed(false)
    if (result.outcome === "accepted") setMessage(result.message + " Refresh the public reader to check whether the collection is visible.")
  }
  return <section onChangeCapture={() => { runner.current?.invalidate(); setConfirmed(false) }} className="mt-8 rounded-xl border border-zinc-800 p-5" aria-labelledby="series-editor-heading">
    <h2 id="series-editor-heading" className="text-xl font-semibold">Create a collection / series</h2>
    <p className="mt-3 text-sm text-zinc-400">Organize existing public NFT post hashes. Publishing creates a public signed DeSo post with a versioned manifest. It does not mint, remint, transfer ownership or prove copyright. Each publication is a separate snapshot.</p>
    <label className="mt-4 block text-sm">Title<input value={title} onChange={event => setTitle(event.target.value)} maxLength={120} className={field} /></label>
    <label className="mt-4 block text-sm">Description<textarea value={description} onChange={event => setDescription(event.target.value)} maxLength={1000} className={field} /></label>
    <label className="mt-4 block text-sm">Category<select value={category} onChange={event => setCategory(event.target.value as NFTCollectionManifest["category"])} className={field}>{["art", "photography", "video", "music", "3d", "avatar", "ai", "other"].map(item => <option key={item}>{item}</option>)}</select></label>
    <label className="mt-4 block text-sm">NFT post hashes, one per line (maximum 50)<textarea value={hashes} onChange={event => setHashes(event.target.value)} maxLength={3250} rows={5} className={field} /></label>
    <button type="button" onClick={saveDraft} disabled={busy} className="mt-4 min-h-11 rounded-lg border border-zinc-700 px-4 py-2">Save local draft</button>
    <label className="mt-5 flex gap-3 text-sm text-amber-200"><input type="checkbox" checked={confirmed} onChange={event => { event.stopPropagation(); runner.current?.invalidate(); setConfirmed(event.target.checked) }} />I reviewed this public collection and the active account. Publishing is a separate on-chain action with a network fee.</label>
    <button type="button" disabled={!confirmed || !manifest() || busy} onClick={() => void publish()} className="mt-4 min-h-11 rounded-lg border border-[#285f40] px-4 py-2 text-[#9adbb2] disabled:text-zinc-600">Review publication in DeSo</button>
    {message ? <p role="status" className="mt-4 text-sm text-zinc-400">{message}</p> : null}
  </section>
}

function PublishedCollections({ publicKey }: { publicKey: string }) {
  const [collections, setCollections] = useState<Array<{ hash: string; data: NFTCollectionManifest }>>([])
  const [message, setMessage] = useState("Loading public publications…")
  const [revision, setRevision] = useState(0)
  const [cursor, setCursor] = useState("")
  const [nextCursor, setNextCursor] = useState("")
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    if (!cursor) setCollections([])
    setLoading(true); setMessage("Loading public publications…")
    void (async () => {
      try {
        if (!/^[1-9A-HJ-NP-Za-km-z]{40,128}$/.test(publicKey)) throw new Error("INVALID_PUBLIC_KEY")
        const response = await fetchDeSo("get-posts-for-public-key", { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", signal: controller.signal, body: JSON.stringify({ PublicKeyBase58Check: publicKey, ReaderPublicKeyBase58Check: "", NumToFetch: 50, LastPostHashHex: cursor }) })
        const data = await response.json() as { LastPostHashHex?: string; Posts?: Array<{ PostHashHex?: string; PublicKeyBase58Check?: string; IsHidden?: boolean; PostExtraData?: Record<string, unknown> }> | null }
        if (!response.ok || (!Array.isArray(data.Posts) && data.Posts !== null)) throw new Error("PUBLICATIONS_UNAVAILABLE")
        const found: Array<{ hash: string; data: NFTCollectionManifest }> = []
        for (const post of data.Posts ?? []) {
          if (post.PublicKeyBase58Check !== publicKey || post.IsHidden || !post.PostHashHex || !/^[a-f0-9]{64}$/i.test(post.PostHashHex)) continue
          const raw = post.PostExtraData?.[NFT_COLLECTION_EXTRA_KEY]
          if (typeof raw !== "string" || raw.length > 10_000) continue
          try { const manifest = parseNFTCollectionManifest(JSON.parse(raw), publicKey); if (manifest) found.push({ hash: post.PostHashHex, data: manifest }) } catch { /* Invalid public manifests are not rendered. */ }
        }
        if (controller.signal.aborted) return
        const more = typeof data.LastPostHashHex === "string" && /^[a-f0-9]{64}$/i.test(data.LastPostHashHex) && data.LastPostHashHex !== cursor && (data.Posts?.length ?? 0) === 50 ? data.LastPostHashHex : ""
        setNextCursor(more)
        setCollections(previous => cursor ? [...previous, ...found.filter(item => !previous.some(existing => existing.hash === item.hash))] : found)
        setMessage(`Checked ${data.Posts?.length ?? 0} public posts in this batch; ${found.length} valid collection publications found. ${more ? "Load older posts to continue checking the publisher's history." : "No further page was returned by this read."}`)
      } catch { if (!controller.signal.aborted) setMessage("Public collections could not be checked. This does not prove that no collections exist.") }
      finally { if (!controller.signal.aborted) setLoading(false) }
    })()
    return () => controller.abort()
  }, [publicKey, revision, cursor])
  return <section className="mt-8" aria-labelledby="published-collections-heading">
    <h2 id="published-collections-heading" className="text-xl font-semibold">Public collections / series</h2>
    <p className="mt-3 break-all text-xs text-zinc-500">Publisher: {publicKey}</p>
    <button type="button" disabled={loading} className="mt-3 min-h-11 rounded-lg border border-zinc-700 px-4 py-2" onClick={() => { setCursor(""); setNextCursor(""); setRevision(value => value + 1) }}>Refresh publications</button>
    <p role="status" className="mt-3 text-sm text-zinc-400">{message}</p>
    <div className="mt-5 grid gap-4">{collections.map(({ hash, data }) => <article key={hash} className="rounded-xl border border-zinc-800 p-5"><h3 className="text-lg font-semibold">{data.title}</h3><p className="mt-2 whitespace-pre-wrap text-sm text-zinc-400">{data.description}</p><p className="mt-2 text-xs text-zinc-500">{data.category} · {data.items.length} NFT references · curated membership</p><ul className="mt-3 grid gap-2">{data.items.map((item, index) => <li key={item}><Link className="inline-block min-h-11 break-all py-2 text-sm text-[#9adbb2] underline" href={`/nft/${item}`}>{index + 1}. {item}</Link></li>)}</ul><p className="break-all text-xs text-zinc-500">Publication: {hash}</p></article>)}</div>
    {nextCursor ? <button type="button" disabled={loading} className="mt-4 min-h-11 rounded-lg border border-zinc-700 px-4 py-2" onClick={() => setCursor(nextCursor)}>Load older publications</button> : null}
  </section>
}

export default function CollectionWorkspace({ publicKey }: { publicKey?: string }) {
  const session = useViaIdentitySession()
  const reader = publicKey || session?.publicKey
  return <><h1 className="text-2xl font-semibold">Collections & series</h1><p className="mt-3 text-sm text-zinc-400">Public DeSo publications stay readable without login. Local drafts belong to the currently selected VIA account.</p>
    <form className="mt-5"><label className="text-sm">Public publisher key<input name="publicKey" defaultValue={publicKey ?? ""} required className={field} placeholder="BC1…" /></label><button className="mt-3 min-h-11 rounded-lg border border-zinc-700 px-4 py-2">Open public collections</button></form>
    {reader ? <PublishedCollections key={reader} publicKey={reader} /> : <p className="mt-4 text-sm text-zinc-400">Choose a public publisher or sign in through the VIA account menu.</p>}
    {session ? <CollectionEditor key={session.publicKey} publicKey={session.publicKey} /> : null}
  </>
}
