"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { DESO_IDENTITY_ORIGIN, restoreIdentitySession } from "./deso-identity-session"
import DiamondButton from "./social/diamond-button"

type Target = { ok?: boolean; publicKey?: string; postHash?: string | null }
type PrepareResponse = { ok?: boolean; transactionHex?: string; feeNanos?: number | null; amountNanos?: number; error?: string }

function signedTransactionFromMessage(event: MessageEvent, source: Window | null) {
  if (event.origin !== DESO_IDENTITY_ORIGIN || event.source !== source) return null
  if (!event.data || typeof event.data !== "object") return null
  const data = event.data as Record<string, unknown>
  if (data.service !== "identity") return null
  const payload = data.payload
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null
  const signed = (payload as Record<string, unknown>).signedTransactionHex
  return typeof signed === "string" && signed.length > 0 ? signed : null
}

function parseDesoToNanos(value: string) {
  const clean = value.trim()
  if (!/^\d+(?:\.\d{0,9})?$/.test(clean)) return null
  const [whole, fraction = ""] = clean.split(".")
  const nanos = Number(whole) * 1_000_000_000 + Number((fraction + "000000000").slice(0, 9))
  return Number.isSafeInteger(nanos) && nanos >= 1 ? nanos : null
}

export default function SponsorPlatform({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false)
  const [target, setTarget] = useState<Target | null>(null)
  const [amount, setAmount] = useState("0.01")
  const [confirmed, setConfirmed] = useState(false)
  const [status, setStatus] = useState<"idle"|"preparing"|"approval"|"submitting"|"done"|"error">("idle")
  const [message, setMessage] = useState("")
  const [feeNanos, setFeeNanos] = useState<number | null>(null)
  const popupRef = useRef<Window | null>(null)
  const popupWatch = useRef<number | null>(null)

  useEffect(() => {
    if (!open || target) return
    void fetch("/api/via/sponsor-target", { cache: "no-store" })
      .then(async (response) => response.ok ? await response.json() as Target : null)
      .then((data) => { if (data?.ok) setTarget(data) })
      .catch(() => undefined)
  }, [open, target])

  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      const signedTransactionHex = signedTransactionFromMessage(event, popupRef.current)
      if (!signedTransactionHex) return
      if (popupWatch.current !== null) window.clearInterval(popupWatch.current)
      popupWatch.current = null
      popupRef.current?.close()
      popupRef.current = null
      setStatus("submitting")
      setMessage("Bijdrage wordt naar DeSo verzonden…")
      try {
        const response = await fetch("/api/via/sponsor/contribute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ action: "submit", signedTransactionHex }),
        })
        const data = await response.json() as { ok?: boolean; error?: string }
        if (!response.ok || !data.ok) throw new Error(data.error || "SUBMIT_FAILED")
        setStatus("done")
        setMessage("Dank je. De DESO-bijdrage is verzonden.")
        setConfirmed(false)
      } catch {
        setStatus("error")
        setMessage("De bijdrage is niet verzonden.")
      }
    }
    window.addEventListener("message", onMessage)
    return () => {
      window.removeEventListener("message", onMessage)
      if (popupWatch.current !== null) window.clearInterval(popupWatch.current)
      popupRef.current?.close()
    }
  }, [])

  async function prepareDeso() {
    const session = restoreIdentitySession()
    const amountNanos = parseDesoToNanos(amount)
    if (!session) { setStatus("error"); setMessage("Log eerst in met DeSo Identity."); return }
    if (!amountNanos) { setStatus("error"); setMessage("Voer een geldig DESO-bedrag in, minimaal 0.000000001 DESO."); return }
    if (!confirmed || status === "preparing" || status === "approval" || status === "submitting") return

    setStatus("preparing")
    setMessage("Exacte DeSo-transactie wordt voorbereid…")
    setFeeNanos(null)
    try {
      const response = await fetch("/api/via/sponsor/contribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ action: "prepare", senderPublicKey: session.publicKey, amountNanos, confirmed: true }),
      })
      const data = await response.json() as PrepareResponse
      if (!response.ok || !data.ok || !data.transactionHex) throw new Error(data.error || "PREPARE_FAILED")
      setFeeNanos(typeof data.feeNanos === "number" ? data.feeNanos : null)
      const popup = window.open(
        `${DESO_IDENTITY_ORIGIN}/approve?tx=${encodeURIComponent(data.transactionHex)}`,
        "via-sponsor-deso-approve",
        `popup=yes,width=${Math.min(800, window.screen.availWidth)},height=${Math.min(900, window.screen.availHeight)}`,
      )
      if (!popup) throw new Error("POPUP_BLOCKED")
      popupRef.current = popup
      popupWatch.current = window.setInterval(() => {
        if (popupRef.current?.closed) {
          popupRef.current = null
          if (popupWatch.current !== null) window.clearInterval(popupWatch.current)
          popupWatch.current = null
          setStatus("idle")
          setMessage("DeSo-goedkeuring gesloten. Er is niets verzonden.")
        }
      }, 500)
      setStatus("approval")
      setMessage("Controleer bedrag en ontvanger in DeSo Identity en keur alleen goed als alles klopt.")
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error && error.message === "POPUP_BLOCKED" ? "De goedkeuringspopup werd geblokkeerd." : "De DESO-bijdrage kon niet worden voorbereid.")
    }
  }

  const triggerClass = compact
    ? "rounded-lg border border-[#8fd4a9]/35 px-3 py-1.5 text-xs font-semibold text-[#9adbb2] hover:border-[#8fd4a9]/60"
    : "rounded-full border border-[#8fd4a9]/45 bg-[#10261a] px-4 py-2 text-sm font-semibold text-[#c9ffdc]"

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClass}>Sponsor platform</button>
      {open ? (
        <div role="dialog" aria-modal="true" aria-label="Sponsor VIA" onMouseDown={(event) => { if (event.currentTarget === event.target) setOpen(false) }} style={{ position:"fixed", inset:0, zIndex:160, display:"grid", placeItems:"center", padding:20, background:"rgba(0,0,0,.78)", backdropFilter:"blur(8px)" }}>
          <section style={{ width:"min(580px,100%)", maxHeight:"88vh", overflowY:"auto", border:"1px solid rgba(143,212,169,.32)", borderRadius:18, padding:20, background:"#06100b", color:"#edf4ef", boxShadow:"0 24px 80px rgba(0,0,0,.55)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", gap:16 }}>
              <div>
                <p style={{ margin:0, color:"#8fd4a9", fontSize:11, fontWeight:800, letterSpacing:".14em", textTransform:"uppercase" }}>VIA · Sponsor platform</p>
                <h2 style={{ margin:"6px 0 0", fontSize:24 }}>Elke bijdrage telt — ook de kleinste.</h2>
                <p style={{ margin:"8px 0 0", color:"#9aa79f", fontSize:13, lineHeight:1.55 }}>Steun VIA rechtstreeks met DESO of met een Diamond. VIA bewaart geen betaalgegevens en elke waardeactie vraagt DeSo Identity-goedkeuring.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Sluiten" style={{ border:0, background:"transparent", color:"#aab5ae", fontSize:24, cursor:"pointer" }}>×</button>
            </div>

            <div style={{ marginTop:18, display:"grid", gap:14 }}>
              <section style={{ border:"1px solid rgba(143,212,169,.18)", borderRadius:14, padding:14, background:"rgba(0,0,0,.22)" }}>
                <strong>DESO-bijdrage</strong>
                <p style={{ margin:"5px 0 10px", color:"#87958d", fontSize:12 }}>Wordt als gewone DeSo Basic Transfer voor VIA voorbereid.</p>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  <input value={amount} onChange={(e)=>{setAmount(e.target.value);setConfirmed(false)}} inputMode="decimal" aria-label="DESO bedrag" style={{ minHeight:40, width:160, border:"1px solid rgba(143,212,169,.22)", borderRadius:10, padding:"8px 10px", background:"#050807", color:"#eef5f0" }} />
                  <span style={{ alignSelf:"center", color:"#a9b6ae", fontSize:12 }}>DESO</span>
                </div>
                <label style={{ marginTop:10, display:"flex", gap:7, alignItems:"flex-start", color:"#d8bf82", fontSize:11, lineHeight:1.4 }}><input type="checkbox" checked={confirmed} onChange={(e)=>setConfirmed(e.target.checked)} />Ik begrijp dat dit echte DESO-waarde verstuurt en controleer de transactie in DeSo Identity.</label>
                <button type="button" onClick={()=>void prepareDeso()} disabled={!confirmed || status==="preparing" || status==="approval" || status==="submitting"} style={{ marginTop:10, minHeight:38, border:"1px solid rgba(143,212,169,.42)", borderRadius:999, padding:"7px 13px", background:"rgba(18,53,34,.58)", color: confirmed ? "#b9ffd4" : "#65746b", fontWeight:750, cursor: confirmed ? "pointer" : "default" }}>{status==="preparing"?"Voorbereiden…":status==="approval"?"Controleer in DeSo…":status==="submitting"?"Verzenden…":"Stort DESO"}</button>
                {feeNanos !== null ? <p style={{ margin:"8px 0 0", color:"#75847b", fontSize:11 }}>Voorbereide netwerkfee: {feeNanos.toLocaleString()} nanos.</p> : null}
              </section>

              <section style={{ border:"1px solid rgba(143,212,169,.18)", borderRadius:14, padding:14, background:"rgba(0,0,0,.22)" }}>
                <strong>Diamond-bijdrage</strong>
                <p style={{ margin:"5px 0 10px", color:"#87958d", fontSize:12 }}>Een Diamond is ook DESO-waarde en wordt aan een VIA-bijdrage gekoppeld.</p>
                {target?.publicKey && target?.postHash ? (
                  <DiamondButton postHash={target.postHash} receiverPublicKey={target.publicKey} initialCount={0} />
                ) : (
                  <p style={{ margin:0, color:"#8d978f", fontSize:12 }}>Diamond-doel wordt geladen… DESO storten blijft beschikbaar.</p>
                )}
              </section>
            </div>

            {message ? <p role="status" style={{ margin:"14px 0 0", color: status==="error" ? "#e2bd7e" : "#9adbb2", fontSize:12, lineHeight:1.5 }}>{message}</p> : null}
            <p style={{ margin:"14px 0 0", color:"#68756e", fontSize:10, lineHeight:1.5 }}>Bijdragen zijn vrijwillig. Een bijdrage geeft geen eigendomsrecht, beleggingsrecht of gegarandeerde tegenprestatie.</p>
          </section>
        </div>
      ) : null}
    </>
  )
}
