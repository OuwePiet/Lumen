"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useViaIdentitySession } from "../use-via-identity-session"
import LocalSaveButton from "../social/local-save-button"
import { ViaPostActionBar, ViaMoreActions } from "../social/via-post-action-bar"

type Association = {
  AssociationID: string
  PostHashHex: string
  PostEntry?: { Body?: string; PosterPublicKeyBase58Check?: string; TimestampNanos?: number }
}
type QueryResponse = { ok?: boolean; result?: { Associations?: Association[]; PostHashHexToPostEntryResponse?: Record<string, Association["PostEntry"]> } }

export default function DeSoSavedPosts() {
  const session = useViaIdentitySession()
  const account = session?.publicKey
  const [items, setItems] = useState<Association[]>([])
  const [status, setStatus] = useState("")

  useEffect(() => {
    if (!account) { setItems([]); setStatus("Log in via VIA to see your DeSo bookmarks."); return }
    let active = true
    const load = async () => {
      setStatus("DeSo bookmarks laden…")
      try {
        const found: Association[] = []
        const seen = new Set<string>()
        let cursor: string | undefined
        for (let page = 0; page < 100; page++) {
          const response = await fetch("/api/via/social/bookmark", {
            method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store",
            body: JSON.stringify({ action: "query", publicKey: account, ...(cursor ? { lastSeenAssociationID: cursor } : {}) }),
          })
          const data = await response.json() as QueryResponse
          const batch = data.result?.Associations
          if (!response.ok || !data.ok || !Array.isArray(batch)) throw new Error("DESO_QUERY_FAILED")
          for (const item of batch) {
            const post = item.PostEntry ?? data.result?.PostHashHexToPostEntryResponse?.[item.PostHashHex]
            if (item.PostHashHex && !seen.has(item.PostHashHex)) {
              seen.add(item.PostHashHex)
              found.push({ ...item, PostEntry: post })
            }
          }
          if (batch.length < 100) break
          const last = batch[batch.length - 1]?.AssociationID
          if (!last || last === cursor) throw new Error("INVALID_CURSOR")
          cursor = last
          if (page === 99) throw new Error("PAGINATION_LIMIT")
        }
        if (active) { setItems(found); setStatus(found.length ? "" : "Nog geen DeSo bookmarks opgeslagen.") }
      } catch { if (active) setStatus("DeSo bookmarks konden niet worden geladen.") }
    }
    void load()
    window.addEventListener("via:saved:changed", load)
    return () => { active = false; window.removeEventListener("via:saved:changed", load) }
  }, [account])

  return <section className="mb-8" aria-label="DeSo bookmarks">
    <h2 className="mb-3 text-lg font-semibold text-[#9adbb2]">Op DeSo opgeslagen berichten</h2>
    {status ? <p role="status" className="text-sm text-zinc-400">{status}</p> : null}
    <div className="grid gap-3">
      {items.map(item => <article key={item.AssociationID} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <p className="whitespace-pre-wrap text-sm text-zinc-200">{item.PostEntry?.Body || "DeSo-bericht"}</p>
        <ViaPostActionBar className="mt-3">
          <Link className="inline-flex h-9 items-center rounded-full border border-zinc-800 px-3 text-xs text-zinc-300" href={`/social?post=${encodeURIComponent(item.PostHashHex)}`}>Open post</Link>
          <ViaMoreActions>
            {item.PostEntry?.PosterPublicKeyBase58Check ? <div className="[&_button]:w-full [&_button]:justify-start [&_button]:border-0"><LocalSaveButton postHash={item.PostHashHex} body={item.PostEntry.Body ?? ""} publicKey={item.PostEntry.PosterPublicKeyBase58Check} timestampNanos={item.PostEntry.TimestampNanos ?? 0} /></div> : null}
            <button type="button" className="block w-full rounded-lg px-3 py-2 text-left text-xs text-zinc-300" onClick={() => void navigator.clipboard?.writeText(`${window.location.origin}/social?post=${encodeURIComponent(item.PostHashHex)}`)}>Link to Post</button>
          </ViaMoreActions>
        </ViaPostActionBar>
      </article>)}
    </div>
  </section>
}
