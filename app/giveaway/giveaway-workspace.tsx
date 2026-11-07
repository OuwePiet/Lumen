"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useViaIdentitySession } from "../use-via-identity-session"
import { viaModernIdentity } from "../deso-identity-modern"
import { restoreIdentitySession } from "../deso-identity-session"
import { parseNFTGiveaway, type NFTGiveaway, type NFTClaimReservation } from "../../lib/via/nft-claims"

type Result = { ok?: boolean; error?: string; notApplied?: boolean; configured?: boolean; id?: string; canManage?: boolean; campaign?: Omit<NFTGiveaway, "claims"> & { availableCount: number; reservedCount: number }; claims?: Array<NFTClaimReservation & { state: string }> }
const field = "mt-2 min-h-11 w-full rounded-lg border border-zinc-700 bg-black p-3 text-sm"
const newId = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), value => value.toString(16).padStart(2, "0")).join("")

function AccountCampaign({ id, publicKey, owner }: { id?: string; publicKey: string | null; owner: string | null }) {
  const [result, setResult] = useState<Result | null>(null)
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [pending, setPending] = useState(false)
  const [recoveryId, setRecoveryId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [postHash, setPostHash] = useState("")
  const [serials, setSerials] = useState("1")
  const [startsAt, setStartsAt] = useState("")
  const [endsAt, setEndsAt] = useState("")
  const [limit, setLimit] = useState("1")
  const flight = useRef(false)
  const generation = useRef(0)
  const pendingKey = `via:nft-claim-request:v1:${publicKey}:${id ?? "create"}`
  const accountStillSelected = () => {
    if (publicKey && restoreIdentitySession()?.publicKey !== publicKey) throw new Error("ACCOUNT_CHANGED")
  }
  async function headers() {
    if (!publicKey) return {} as Record<string, string>
    accountStillSelected()
    const jwt = await viaModernIdentity.jwt()
    accountStillSelected()
    return { authorization: `Bearer ${jwt}`, "x-via-public-key": publicKey }
  }
  async function refresh() {
    if (!id || !/^[a-f0-9]{64}$/.test(id)) return
    const version = ++generation.current
    try {
      const response = await fetch(`/api/via/nft/giveaway?id=${id}`, { headers: await headers(), cache: "no-store" })
      const data = await response.json() as Result
      if (version !== generation.current) return
      accountStillSelected()
      if (!response.ok || !data.ok) throw new Error(data.error ?? "GIVEAWAY_UNAVAILABLE")
      setResult(data); setMessage("Actuele campagne en NFT-status gelezen. Er is geen transactie verzonden.")
      if (publicKey) {
        const creationKey = `via:nft-claim-request:v1:${publicKey}:create`
        const creation = window.localStorage.getItem(creationKey)
        if (creation && data.canManage) {
          const record = JSON.parse(creation) as { id?: string; action?: string }
          if (record.action === "create" && record.id === id) window.localStorage.removeItem(creationKey)
        }
        const raw = window.localStorage.getItem(pendingKey)
        if (raw) {
          const record = JSON.parse(raw) as { operationId?: string }
          // Readback proves that this request is already registered. Never auto-submit or transfer.
          if (data.claims?.some(claim => claim.operationId === record.operationId)) { window.localStorage.removeItem(pendingKey); setPending(false) }
          else setPending(true)
        }
      }
    } catch (error) { if (version === generation.current) setMessage(`Campagne of aanvraagstatus niet bewezen. ${error instanceof Error ? error.message : "Controleer later opnieuw."}`) }
  }
  useEffect(() => {
    try {
      const raw = publicKey ? window.localStorage.getItem(pendingKey) : null
      setPending(raw !== null)
      if (raw) { const saved = JSON.parse(raw) as { id?: string }; if (typeof saved.id === "string" && /^[a-f0-9]{64}$/.test(saved.id)) setRecoveryId(saved.id) }
    } catch { setPending(true) }
    void refresh()
    return () => { generation.current += 1 }
  }, [id, publicKey])

  async function send(action: "create" | "reserve") {
    if (flight.current || !publicKey || !confirmed || pending) return
    flight.current = true
    let started = false
    const operationId = newId()
    try {
      accountStillSelected()
      if (window.localStorage.getItem(pendingKey) !== null) throw new Error("Eerdere aanvraagstatus is onzeker; lees eerst terug.")
      const auth = await headers()
      accountStillSelected()
      const body = action === "create" ? { action, id: operationId, campaign: { title, postHash: postHash.trim().toLowerCase(), serialNumbers: serials.split(/[\s,]+/).filter(Boolean).map(Number), startsAt: Date.parse(startsAt), endsAt: Date.parse(endsAt), perAccount: Number(limit), requirement: "free" } } : { action, id, operationId }
      if (action === "create" && (!parseNFTGiveaway({ ...body.campaign, version: 1, id: operationId, ownerPublicKey: publicKey, claims: [] }) || publicKey !== owner)) throw new Error("Controleer titel, NFT, unieke editienummers, datums en accountlimiet.")
      const saved = JSON.stringify({ operationId, action, id: action === "create" ? operationId : id, publicKey })
      window.localStorage.setItem(pendingKey, saved)
      if (window.localStorage.getItem(pendingKey) !== saved) throw new Error("HERSTELREGISTRATIE_ONBESCHIKBAAR")
      setPending(true); setBusy(true); setMessage("Gratis aanvraag registreren. Er wordt geen DeSo-transactie ondertekend of verzonden.")
      setRecoveryId(action === "create" ? operationId : id ?? null)
      accountStillSelected()
      started = true
      const response = await fetch("/api/via/nft/giveaway", { method: "POST", headers: { ...auth, "Content-Type": "application/json" }, cache: "no-store", body: JSON.stringify(body) })
      const data = await response.json() as Result
      accountStillSelected()
      if (!response.ok || !data.ok) {
        if (data.notApplied === true) { window.localStorage.removeItem(pendingKey); setPending(false); started = false }
        throw new Error(data.error ?? "REQUEST_STATUS_UNCERTAIN")
      }
      window.localStorage.removeItem(pendingKey); setPending(false); setConfirmed(false)
      if (action === "create" && data.id) setMessage(`Campagne aangemaakt: ${window.location.origin}/giveaway?id=${data.id}`)
      else { setMessage("Aanvraag geregistreerd. Wacht op expliciete overdracht door de eigenaar en accepteer de NFT daarna zelf. Je bent nog geen eigenaar."); await refresh() }
    } catch (error) { setMessage(started ? "Aanvraagstatus onzeker. Niet opnieuw aanvragen; gebruik uitsluitend de statuscontrole. Er is door deze aanvraag geen financiële DeSo-transactie verzonden." : `Aanvraag niet verzonden. ${error instanceof Error ? error.message : "Controleer account en opslag."}`) }
    finally { flight.current = false; setBusy(false) }
  }
  return <>
    {id ? <section className="mt-6 rounded-xl border border-zinc-800 p-5">
      <button type="button" disabled={busy} onClick={() => void refresh()} className="min-h-11 rounded-lg border border-zinc-700 px-4 py-2">Controleer bestaande aanvraag en NFT-status</button>
      {result?.campaign ? <><h2 className="mt-5 text-xl font-semibold">{result.campaign.title}</h2><Link className="mt-3 inline-block min-h-11 text-[#9adbb2] underline" href={`/nft/${result.campaign.postHash}`}>Open NFT en native overdrachtsacties</Link>
        <p className="mt-2 text-sm text-zinc-400">Gratis · beschikbaar: {result.campaign.availableCount} · gereserveerd: {result.campaign.reservedCount} · maximum per account: {result.campaign.perAccount}</p>
        <p className="mt-2 text-sm text-zinc-400">{new Date(result.campaign.startsAt).toISOString()} tot {new Date(result.campaign.endsAt).toISOString()}</p>
        {publicKey && !result.canManage ? <><label className="mt-4 flex gap-3 text-sm text-amber-200"><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} />Ik vraag één gratis editie aan voor mijn actieve account. De eigenaar moet afzonderlijk overdragen; ik moet daarna zelf accepteren en betaal dan eventuele netwerkkosten.</label><button type="button" disabled={!confirmed || busy || pending || result.campaign.availableCount === 0 || (result.claims?.length ?? 0) >= result.campaign.perAccount || Date.now() < result.campaign.startsAt || Date.now() >= result.campaign.endsAt} onClick={() => void send("reserve")} className="mt-4 min-h-11 rounded-lg border border-[#285f40] px-4 py-2 text-[#9adbb2] disabled:text-zinc-600">Gratis editie aanvragen</button></> : null}
        <div className="mt-4 grid gap-3">{result.claims?.map(claim => <article key={claim.operationId} className="rounded-lg border border-zinc-800 p-3"><p className="text-sm">Editie #{claim.serialNumber} · {claim.state}</p><p className="mt-2 break-all text-xs text-zinc-400">Ontvangende publieke sleutel: {claim.publicKey}</p>{result.canManage ? <p className="mt-2 text-xs text-zinc-500">Controleer de ontvanger en gebruik de afzonderlijke native Transfer NFT-actie op de NFT-pagina. Geen automatische overdracht.</p> : null}</article>)}</div>
      </> : null}
    </section> : null}
    {publicKey && publicKey === owner && !id ? <section className="mt-6 rounded-xl border border-zinc-800 p-5" onChangeCapture={() => setConfirmed(false)}><h2 className="text-xl font-semibold">Gratis giveaway maken · OuwePiet</h2><p className="mt-3 text-sm text-zinc-400">Alleen eigen, niet verkochte en niet-pending edities zonder unlockable content. Aanvragen reserveren voorraad; overdracht en acceptatie blijven afzonderlijke expliciet ondertekende stappen.</p>
      <label className="mt-4 block text-sm">Titel<input value={title} onChange={event => setTitle(event.target.value)} maxLength={120} className={field} /></label>
      <label className="mt-4 block text-sm">NFT post hash<input value={postHash} onChange={event => setPostHash(event.target.value)} maxLength={64} className={field} /></label>
      <label className="mt-4 block text-sm">Editienummers (maximaal 50)<input value={serials} onChange={event => setSerials(event.target.value)} className={field} /></label>
      <label className="mt-4 block text-sm">Start (lokale tijd)<input type="datetime-local" value={startsAt} onChange={event => setStartsAt(event.target.value)} className={field} /></label>
      <label className="mt-4 block text-sm">Einde (lokale tijd)<input type="datetime-local" value={endsAt} onChange={event => setEndsAt(event.target.value)} className={field} /></label>
      <label className="mt-4 block text-sm">Maximum per account<input type="number" min={1} max={50} value={limit} onChange={event => setLimit(event.target.value)} className={field} /></label>
      <label className="mt-4 flex gap-3 text-sm text-amber-200"><input type="checkbox" checked={confirmed} onChange={event => { event.stopPropagation(); setConfirmed(event.target.checked) }} />Ik heb NFT, edities, periode en limieten gecontroleerd. De campagne is gratis; er wordt nu niets overgedragen of ondertekend.</label><button type="button" disabled={!confirmed || busy || pending} onClick={() => void send("create")} className="mt-4 min-h-11 rounded-lg border border-[#285f40] px-4 py-2 text-[#9adbb2] disabled:text-zinc-600">Campagne registreren</button>
    </section> : null}
    {pending ? <p className="mt-4 text-sm text-amber-300" role="status">Een eerdere aanvraag vereist statuscontrole. Er wordt niet automatisch opnieuw aangevraagd of verzonden.</p> : null}
    {recoveryId ? <Link className="mt-3 inline-block min-h-11 break-all text-sm text-[#9adbb2] underline" href={`/giveaway?id=${recoveryId}`}>Lees campagne {recoveryId} terug</Link> : null}
    {message ? <p className="mt-4 whitespace-pre-wrap break-words text-sm text-zinc-400" role="status">{message}</p> : null}
  </>
}
export default function GiveawayWorkspace({ id }: { id?: string }) {
  const session = useViaIdentitySession()
  const [owner, setOwner] = useState<string | null>(null)
  useEffect(() => { const controller = new AbortController(); void fetch("/api/via/owner-key", { signal: controller.signal, cache: "no-store" }).then(response => response.json()).then((data: { publicKey?: string }) => { if (!controller.signal.aborted) setOwner(data.publicKey ?? null) }).catch(() => {}); return () => controller.abort() }, [])
  return <><h1 className="text-2xl font-semibold">Claim / Giveaway</h1><p className="mt-3 text-sm leading-6 text-zinc-400">Gratis aanvragen met expliciete eigenaarsoverdracht en acceptatie door de ontvanger. VIA houdt geen NFT of geld vast. Een reservering is nog geen NFT-eigendom.</p>
    <p className="mt-3 text-sm text-amber-200">Diamond-claims, betaalde claims en automatische distributie zijn nog niet vrijgegeven. De koppeling tussen betaling en NFT-ontvangst moet eerst aantoonbaar veilig zijn.</p>
    <form className="mt-5"><label className="text-sm">Campagne-ID<input name="id" defaultValue={id ?? ""} required maxLength={64} className={field} /></label><button className="mt-3 min-h-11 rounded-lg border border-zinc-700 px-4 py-2">Open campagne</button></form>
    {!session ? <p className="mt-4 text-sm text-zinc-400">Publieke campagnegegevens zijn leesbaar zonder login. Log in via het VIA-accountmenu om een gratis editie aan te vragen.</p> : null}
    <AccountCampaign key={`${session?.publicKey ?? "guest"}:${id ?? "create"}`} id={id} publicKey={session?.publicKey ?? null} owner={owner} />
  </>
}
