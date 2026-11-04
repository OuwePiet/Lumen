"use client"

import Link from "next/link"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"
import PublicAccountLabel from "../public-account-label"
import { useEffect, useRef, useState } from "react"
import { useViaIdentitySession } from "../use-via-identity-session"
import { viaModernIdentity } from "../deso-identity-modern"
import { restoreIdentitySession } from "../deso-identity-session"
import { parseNFTGiveaway, type NFTGiveaway, type NFTClaimReservation } from "../../lib/via/nft-claims"


const GIVEAWAY_COPY: Record<ViaLanguage, Record<string, string>> = {"Dutch":{"Campagne-ID":"Campagne-ID","Open campagne":"Open campagne","Titel":"Titel","NFT post hash":"NFT post hash","Editienummers (maximaal 50)":"Editienummers (maximaal 50)","Start (lokale tijd)":"Start (lokale tijd)","Einde (lokale tijd)":"Einde (lokale tijd)","Maximum per account":"Maximum per account","Campagne registreren":"Campagne registreren","Gratis editie aanvragen":"Gratis editie aanvragen","Controleer bestaande aanvraag en NFT-status":"Controleer bestaande aanvraag en NFT-status","Maker / eigenaar":"Maker / eigenaar","Ontvanger / claimer":"Ontvanger / claimer","Gratis giveaway maken":"Gratis giveaway maken","Zo werkt het":"Zo werkt het","Vraag gratis een editie aan. De eigenaar draagt de NFT over; de ontvanger accepteert deze daarna.":"Vraag gratis een editie aan. De eigenaar draagt de NFT over; de ontvanger accepteert deze daarna.","Kies je eigen NFT, edities, periode en maximum per account.":"Kies je eigen NFT, edities, periode en maximum per account.","Ik heb NFT, edities, periode en limieten gecontroleerd. De campagne is gratis; er wordt nu niets overgedragen of ondertekend.":"Ik heb NFT, edities, periode en limieten gecontroleerd. De campagne is gratis; er wordt nu niets overgedragen of ondertekend."},"English":{"Campagne-ID":"Campaign ID","Open campagne":"Open campaign","Titel":"Title","NFT post hash":"NFT post hash","Editienummers (maximaal 50)":"Edition numbers (maximum 50)","Start (lokale tijd)":"Start (local time)","Einde (lokale tijd)":"End (local time)","Maximum per account":"Maximum per account","Campagne registreren":"Register campaign","Gratis editie aanvragen":"Request free edition","Controleer bestaande aanvraag en NFT-status":"Check request and NFT status","Maker / eigenaar":"Creator / owner","Ontvanger / claimer":"Recipient / claimant","Gratis giveaway maken":"Create free giveaway","Zo werkt het":"How it works","Vraag gratis een editie aan. De eigenaar draagt de NFT over; de ontvanger accepteert deze daarna.":"Request a free edition. The owner transfers the NFT and the recipient then accepts it.","Kies je eigen NFT, edities, periode en maximum per account.":"Choose your own NFT, editions, dates and account limit.","Ik heb NFT, edities, periode en limieten gecontroleerd. De campagne is gratis; er wordt nu niets overgedragen of ondertekend.":"I checked the NFT, editions, dates and limits. Creating this free campaign does not transfer or sign anything."},"French":{"Campagne-ID":"ID de campagne","Open campagne":"Ouvrir la campagne","Titel":"Titre","NFT post hash":"Hash NFT","Editienummers (maximaal 50)":"Numéros d’édition (maximum 50)","Start (lokale tijd)":"Début (heure locale)","Einde (lokale tijd)":"Fin (heure locale)","Maximum per account":"Maximum par compte","Campagne registreren":"Créer la campagne","Gratis editie aanvragen":"Demander une édition gratuite","Controleer bestaande aanvraag en NFT-status":"Vérifier la demande et le NFT","Maker / eigenaar":"Créateur / propriétaire","Ontvanger / claimer":"Destinataire / demandeur","Gratis giveaway maken":"Créer une distribution gratuite","Zo werkt het":"Fonctionnement","Vraag gratis een editie aan. De eigenaar draagt de NFT over; de ontvanger accepteert deze daarna.":"Demandez une édition gratuite. Le propriétaire transfère le NFT, puis le destinataire l’accepte.","Kies je eigen NFT, edities, periode en maximum per account.":"Choisissez votre NFT, les éditions, les dates et la limite par compte.","Ik heb NFT, edities, periode en limieten gecontroleerd. De campagne is gratis; er wordt nu niets overgedragen of ondertekend.":"J’ai vérifié le NFT, les éditions, les dates et les limites. Cette campagne gratuite ne transfère ni ne signe rien."},"Spanish":{"Campagne-ID":"ID de campaña","Open campagne":"Abrir campaña","Titel":"Título","NFT post hash":"Hash del NFT","Editienummers (maximaal 50)":"Ediciones (máximo 50)","Start (lokale tijd)":"Inicio (hora local)","Einde (lokale tijd)":"Fin (hora local)","Maximum per account":"Máximo por cuenta","Campagne registreren":"Registrar campaña","Gratis editie aanvragen":"Solicitar edición gratis","Controleer bestaande aanvraag en NFT-status":"Consultar solicitud y NFT","Maker / eigenaar":"Creador / propietario","Ontvanger / claimer":"Destinatario / solicitante","Gratis giveaway maken":"Crear giveaway gratis","Zo werkt het":"Cómo funciona","Vraag gratis een editie aan. De eigenaar draagt de NFT over; de ontvanger accepteert deze daarna.":"Solicita una edición gratis. El propietario transfiere el NFT y el destinatario lo acepta.","Kies je eigen NFT, edities, periode en maximum per account.":"Elige tu NFT, ediciones, fechas y límite por cuenta.","Ik heb NFT, edities, periode en limieten gecontroleerd. De campagne is gratis; er wordt nu niets overgedragen of ondertekend.":"He revisado NFT, ediciones, fechas y límites. Crear esta campaña gratis no transfiere ni firma nada."},"Chinese":{"Campagne-ID":"活动编号","Open campagne":"打开活动","Titel":"标题","NFT post hash":"NFT 帖子哈希","Editienummers (maximaal 50)":"版本编号（最多50）","Start (lokale tijd)":"开始（本地时间）","Einde (lokale tijd)":"结束（本地时间）","Maximum per account":"每个账户上限","Campagne registreren":"登记活动","Gratis editie aanvragen":"申请免费版本","Controleer bestaande aanvraag en NFT-status":"检查申请和NFT状态","Maker / eigenaar":"创作者／所有者","Ontvanger / claimer":"接收者／申请人","Gratis giveaway maken":"创建免费赠送","Zo werkt het":"使用说明","Vraag gratis een editie aan. De eigenaar draagt de NFT over; de ontvanger accepteert deze daarna.":"申请免费版本。所有者转移NFT，接收者随后接受。","Kies je eigen NFT, edities, periode en maximum per account.":"选择自己的NFT、版本、日期和账户上限。","Ik heb NFT, edities, periode en limieten gecontroleerd. De campagne is gratis; er wordt nu niets overgedragen of ondertekend.":"我已检查NFT、版本、日期和限制。创建免费活动不会转移或签署任何内容。"},"Hindi":{"Campagne-ID":"अभियान आईडी","Open campagne":"अभियान खोलें","Titel":"शीर्षक","NFT post hash":"NFT पोस्ट हैश","Editienummers (maximaal 50)":"संस्करण संख्या (अधिकतम 50)","Start (lokale tijd)":"आरंभ (स्थानीय समय)","Einde (lokale tijd)":"समाप्ति (स्थानीय समय)","Maximum per account":"प्रति खाते अधिकतम","Campagne registreren":"अभियान दर्ज करें","Gratis editie aanvragen":"मुफ़्त संस्करण मांगें","Controleer bestaande aanvraag en NFT-status":"आवेदन और NFT स्थिति देखें","Maker / eigenaar":"निर्माता / स्वामी","Ontvanger / claimer":"प्राप्तकर्ता / दावेदार","Gratis giveaway maken":"मुफ़्त गिवअवे बनाएं","Zo werkt het":"यह कैसे काम करता है","Vraag gratis een editie aan. De eigenaar draagt de NFT over; de ontvanger accepteert deze daarna.":"मुफ़्त संस्करण मांगें। स्वामी NFT भेजता है और प्राप्तकर्ता उसे स्वीकार करता है।","Kies je eigen NFT, edities, periode en maximum per account.":"अपना NFT, संस्करण, तिथियां और प्रति खाता सीमा चुनें।","Ik heb NFT, edities, periode en limieten gecontroleerd. De campagne is gratis; er wordt nu niets overgedragen of ondertekend.":"मैंने NFT, संस्करण, तिथियां और सीमाएं जांचीं। मुफ्त अभियान बनाने पर कुछ भेजा या हस्ताक्षरित नहीं होता।"}}
function useGiveawayText() {
  const [language, setLanguage] = useState<ViaLanguage>("English")
  useEffect(() => { const sync = () => setLanguage(readViaLocalSettings().interfaceLanguage); sync(); window.addEventListener(VIA_SETTINGS_EVENT, sync); window.addEventListener("storage", sync); return () => { window.removeEventListener(VIA_SETTINGS_EVENT, sync); window.removeEventListener("storage", sync) } }, [])
  return (source: string) => GIVEAWAY_COPY[language][source] ?? source
}

type Result = { ok?: boolean; error?: string; notApplied?: boolean; configured?: boolean; id?: string; canManage?: boolean; campaign?: Omit<NFTGiveaway, "claims"> & { availableCount: number; reservedCount: number }; claims?: Array<NFTClaimReservation & { state: string }> }
const field = "mt-1 min-h-10 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm"
const newId = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), value => value.toString(16).padStart(2, "0")).join("")

function AccountCampaign({ id, publicKey, owner }: { id?: string; publicKey: string | null; owner: string | null }) {
  const tr = useGiveawayText()
  const [result, setResult] = useState<Result | null>(null)
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [pending, setPending] = useState(false)
  const [recoveryId, setRecoveryId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [postHash, setPostHash] = useState(() => { if (typeof window === "undefined") return ""; const value = new URLSearchParams(window.location.search).get("postHash") ?? ""; return /^[a-f0-9]{64}$/i.test(value) ? value : "" })
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
      <button type="button" disabled={busy} onClick={() => void refresh()} className="min-h-11 rounded-lg border border-zinc-700 px-4 py-2">{tr("Controleer bestaande aanvraag en NFT-status")}</button>
      {result?.campaign ? <><h2 className="mt-5 text-xl font-semibold">{result.campaign.title}</h2><p className="mt-2 text-xs text-zinc-400">{tr("Maker / eigenaar")}</p><PublicAccountLabel publicKey={result.campaign.ownerPublicKey} /><Link className="mt-3 inline-block min-h-11 text-[#9adbb2] underline" href={`/nft/${result.campaign.postHash}`}>Open NFT en native overdrachtsacties</Link>
        <p className="mt-2 text-sm text-zinc-400">Gratis · beschikbaar: {result.campaign.availableCount} · gereserveerd: {result.campaign.reservedCount} · maximum per account: {result.campaign.perAccount}</p>
        <p className="mt-2 text-sm text-zinc-400">{new Date(result.campaign.startsAt).toISOString()} tot {new Date(result.campaign.endsAt).toISOString()}</p>
        {publicKey && !result.canManage ? <><label className="mt-4 flex gap-3 text-sm text-amber-200"><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} />Ik vraag één gratis editie aan voor mijn actieve account. De eigenaar moet afzonderlijk overdragen; ik moet daarna zelf accepteren en betaal dan eventuele netwerkkosten.</label><button type="button" disabled={!confirmed || busy || pending || result.campaign.availableCount === 0 || (result.claims?.length ?? 0) >= result.campaign.perAccount || Date.now() < result.campaign.startsAt || Date.now() >= result.campaign.endsAt} onClick={() => void send("reserve")} className="mt-4 min-h-11 rounded-lg border border-[#285f40] px-4 py-2 text-[#9adbb2] disabled:text-zinc-600">{tr("Gratis editie aanvragen")}</button></> : null}
        <div className="mt-4 grid gap-3">{Array.from(new Set(result.claims?.map(claim => claim.publicKey) ?? [])).map(account => <section key={account} className="rounded-lg border border-zinc-800 p-3"><PublicAccountLabel publicKey={account} /><p className="mt-1 text-xs text-zinc-500">{tr("Ontvanger / claimer")}</p><div className="mt-2 flex flex-wrap gap-2">{result.claims?.filter(claim => claim.publicKey === account).map(claim => <p key={claim.operationId} className="rounded border border-zinc-700 px-2 py-1 text-xs">Editie #{claim.serialNumber} · {claim.state}</p>)}</div></section>)}</div>
      </> : null}
    </section> : null}
    {publicKey && publicKey === owner && !id ? <section data-via-giveaway-editor className="mt-4 rounded-xl border border-zinc-800 p-3" onChangeCapture={() => setConfirmed(false)}><h2 className="text-xl font-semibold">{tr("Gratis giveaway maken")}</h2><p className="mt-3 text-sm text-zinc-400">{tr("Kies je eigen NFT, edities, periode en maximum per account.")}</p>
      <label className="mt-4 block text-sm">{tr("Titel")}<input value={title} onChange={event => setTitle(event.target.value)} maxLength={120} className={field} /></label>
      <label className="mt-4 block text-sm">{tr("NFT post hash")}<input value={postHash} onChange={event => setPostHash(event.target.value)} maxLength={64} className={field} /></label>
      <label className="mt-4 block text-sm">{tr("Editienummers (maximaal 50)")}<input value={serials} onChange={event => setSerials(event.target.value)} className={field} /></label>
      <label className="mt-4 block text-sm">{tr("Start (lokale tijd)")}<input type="datetime-local" value={startsAt} onChange={event => setStartsAt(event.target.value)} className={field} /></label>
      <label className="mt-4 block text-sm">{tr("Einde (lokale tijd)")}<input type="datetime-local" value={endsAt} onChange={event => setEndsAt(event.target.value)} className={field} /></label>
      <label className="mt-4 block text-sm">{tr("Maximum per account")}<input type="number" min={1} max={50} value={limit} onChange={event => setLimit(event.target.value)} className={field} /></label>
      <label className="mt-4 flex gap-3 text-sm text-amber-200"><input type="checkbox" checked={confirmed} onChange={event => { event.stopPropagation(); setConfirmed(event.target.checked) }} />{tr("Ik heb NFT, edities, periode en limieten gecontroleerd. De campagne is gratis; er wordt nu niets overgedragen of ondertekend.")}</label><button type="button" disabled={!confirmed || busy || pending} onClick={() => void send("create")} className="mt-4 min-h-11 rounded-lg border border-[#285f40] px-4 py-2 text-[#9adbb2] disabled:text-zinc-600">{tr("Campagne registreren")}</button>
    </section> : null}
    {pending ? <p className="mt-4 text-sm text-amber-300" role="status">Een eerdere aanvraag vereist statuscontrole. Er wordt niet automatisch opnieuw aangevraagd of verzonden.</p> : null}
    {recoveryId ? <Link className="mt-3 inline-block min-h-11 break-all text-sm text-[#9adbb2] underline" href={`/giveaway?id=${recoveryId}`}>Lees campagne {recoveryId} terug</Link> : null}
    {message ? <p className="mt-4 whitespace-pre-wrap break-words text-sm text-zinc-400" role="status">{message}</p> : null}
  </>
}
export default function GiveawayWorkspace({ id }: { id?: string }) {
  const tr = useGiveawayText()
  const session = useViaIdentitySession()
  const [owner, setOwner] = useState<string | null>(null)
  useEffect(() => { const controller = new AbortController(); void fetch("/api/via/owner-key", { signal: controller.signal, cache: "no-store" }).then(response => response.json()).then((data: { publicKey?: string }) => { if (!controller.signal.aborted) setOwner(data.publicKey ?? null) }).catch(() => {}); return () => controller.abort() }, [])
  return <><h1 className="text-2xl font-semibold">Claim / Giveaway</h1><style>{"[data-via-giveaway-editor]{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 14px}[data-via-giveaway-editor]>h2,[data-via-giveaway-editor]>p,[data-via-giveaway-editor]>label:has(input[type=checkbox]){grid-column:1/-1}[data-via-giveaway-editor]>label{margin-top:0}[data-via-giveaway-editor]>h2{font-size:18px}[data-via-giveaway-editor]>p{margin-top:0}@media(max-width:640px){[data-via-giveaway-editor]{grid-template-columns:minmax(0,1fr)}}"}</style><details className="mt-2 text-sm text-zinc-400"><summary className="cursor-pointer text-[#9adbb2]">{tr("Zo werkt het")}</summary><p className="mt-2">{tr("Vraag gratis een editie aan. De eigenaar draagt de NFT over; de ontvanger accepteert deze daarna.")}</p></details>
    <form className="mt-5"><label className="text-sm">{tr("Campagne-ID")}<input name="id" defaultValue={id ?? ""} required maxLength={64} className={field} /></label><button className="mt-3 min-h-11 rounded-lg border border-zinc-700 px-4 py-2">{tr("Open campagne")}</button></form>
    {!session ? <p className="mt-4 text-sm text-zinc-400">Publieke campagnegegevens zijn leesbaar zonder login. Log in via het VIA-accountmenu om een gratis editie aan te vragen.</p> : null}
    <AccountCampaign key={`${session?.publicKey ?? "guest"}:${id ?? "create"}`} id={id} publicKey={session?.publicKey ?? null} owner={owner} />
  </>
}
