"use client"

import { useEffect, useState } from "react"
import { Bookmark } from "lucide-react"
import { viaModernIdentity } from "../deso-identity-modern"
import { useViaIdentitySession } from "../use-via-identity-session"

type Props = { postHash: string; body: string; publicKey: string; timestampNanos: number }
type Association = { AssociationID: string; PostHashHex: string }
type QueryResult = { ok?: boolean; result?: { Associations?: Association[] }; error?: string }
type PrepareResult = { ok?: boolean; transactionHex?: string; error?: string }
const ENDPOINT = "/api/via/social/bookmark"

async function request(body: Record<string, unknown>) {
  const response = await fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", body: JSON.stringify(body) })
  const result = await response.json()
  if (!response.ok || !result.ok) throw new Error(result.error || "DESO_BOOKMARK_UNAVAILABLE")
  return result
}

async function findBookmark(account: string, postHash: string): Promise<Association | null> {
  let cursor: string | undefined
  const seen = new Set<string>()
  for (let page = 0; page < 100; page++) {
    const result = await request({ action: "query", publicKey: account, ...(cursor ? { lastSeenAssociationID: cursor } : {}) }) as QueryResult
    const associations = result.result?.Associations
    if (!Array.isArray(associations)) throw new Error("INVALID_ASSOCIATION_RESPONSE")
    const found = associations.find(item => item.PostHashHex?.toLowerCase() === postHash.toLowerCase())
    if (found) return found
    if (associations.length < 100) return null
    const last = associations[associations.length - 1]?.AssociationID
    if (!last || seen.has(last)) throw new Error("INVALID_ASSOCIATION_CURSOR")
    seen.add(last)
    cursor = last
  }
  throw new Error("BOOKMARK_QUERY_LIMIT_REACHED")
}

export default function LocalSaveButton({ postHash }: Props) {
  const session = useViaIdentitySession()
  const account = session?.publicKey
  const [saved, setSaved] = useState(false)
  const [associationID, setAssociationID] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [ready, setReady] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    let active = true
    setReady(false)
    setSaved(false)
    setAssociationID(null)
    if (!account) return
    void findBookmark(account, postHash).then(found => {
      if (!active) return
      setAssociationID(found?.AssociationID ?? null)
      setSaved(Boolean(found))
      setReady(true)
    }).catch(() => {
      if (active) { setReady(false); setMessage("DeSo bookmarks tijdelijk niet beschikbaar.") }
    })
    return () => { active = false }
  }, [account, postHash])

  async function toggle() {
    if (!account || !ready || busy) return
    setBusy(true)
    setMessage("")
    try {
      // Check the chain again immediately before constructing a paid transaction.
      const existing = await findBookmark(account, postHash)
      const create = !existing
      if (!create && !existing?.AssociationID) throw new Error("MISSING_ASSOCIATION_ID")
      if ((await viaModernIdentity.currentUser())?.publicKey !== account) throw new Error("DESO_ACCOUNT_CHANGED")
      const prepared = await request(create
        ? { action: "prepare-create", publicKey: account, postHash }
        : { action: "prepare-delete", publicKey: account, associationID: existing?.AssociationID }) as PrepareResult
      if (!prepared.transactionHex) throw new Error("PREPARE_FAILED")
      if ((await viaModernIdentity.currentUser())?.publicKey !== account) throw new Error("DESO_ACCOUNT_CHANGED")
      const signedTransactionHex = await viaModernIdentity.signTx(prepared.transactionHex)
      if ((await viaModernIdentity.currentUser())?.publicKey !== account) throw new Error("DESO_ACCOUNT_CHANGED")
      await request({ action: "submit", signedTransactionHex })
      setSaved(create)
      setAssociationID(create ? null : null)
      setMessage(create ? "Opgeslagen op DeSo." : "Bookmark verwijderd van DeSo.")
      window.dispatchEvent(new Event("via:saved:changed"))
    } catch {
      setMessage("Bookmark niet gewijzigd. Controleer DeSo of de machtigingen.")
    } finally { setBusy(false) }
  }

  return <span className="inline-flex items-center gap-1">
    <button type="button" onClick={() => void toggle()} disabled={!account || !ready || busy}
      aria-label={saved ? "Verwijder DeSo bookmark" : "Bewaar op DeSo"}
      aria-pressed={saved} title={!account ? "Log in via VIA" : !ready ? "Bookmarks laden…" : "DeSo blockchainbookmark"}
      className="inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-full border border-zinc-800 px-2 text-xs text-zinc-300 hover:border-[#8fd4a9] disabled:opacity-50">
      <Bookmark className={saved ? "h-4 w-4 fill-current" : "h-4 w-4"} aria-hidden="true" />
      <span>{busy ? "…" : saved ? "Saved" : "Save"}</span>
    </button>
    {message ? <span role="status" aria-live="polite" className="sr-only">{message}</span> : null}
  </span>
}
