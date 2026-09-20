"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { DESO_IDENTITY_ORIGIN, restoreIdentitySession } from "./deso-identity-session"
import DiamondButton from "./social/diamond-button"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "./via-local-settings"

type Target = { ok?: boolean; publicKey?: string; postHash?: string | null }
type PrepareResponse = { ok?: boolean; transactionHex?: string; feeNanos?: number | null; amountNanos?: number; error?: string }

type SponsorCopy = {
  trigger: string
  dialogLabel: string
  kicker: string
  title: string
  intro: string
  close: string
  desoTitle: string
  desoIntro: string
  amountAria: string
  confirm: string
  preparing: string
  approval: string
  submitting: string
  sendDeso: string
  fee: string
  diamondTitle: string
  diamondIntro: string
  diamondLoading: string
  disclaimer: string
  sent: string
  failed: string
  loginFirst: string
  invalidAmount: string
  prepareExact: string
  approvalClosed: string
  checkApproval: string
  popupBlocked: string
  prepareFailed: string
}

const COPY: Record<ViaLanguage, SponsorCopy> = {
  Dutch: {
    trigger: "Sponsor platform", dialogLabel: "Sponsor VIA", kicker: "VIA · Sponsor platform",
    title: "Elke bijdrage telt — ook de kleinste.",
    intro: "Steun VIA rechtstreeks met DESO of met een Diamond. VIA bewaart geen betaalgegevens en elke waardeactie vraagt DeSo Identity-goedkeuring.",
    close: "Sluiten", desoTitle: "DESO-bijdrage", desoIntro: "Wordt als gewone DeSo Basic Transfer voor VIA voorbereid.",
    amountAria: "DESO bedrag", confirm: "Ik begrijp dat dit echte DESO-waarde verstuurt en controleer de transactie in DeSo Identity.",
    preparing: "Voorbereiden…", approval: "Controleer in DeSo…", submitting: "Verzenden…", sendDeso: "Stort DESO",
    fee: "Voorbereide netwerkfee", diamondTitle: "Diamond-bijdrage",
    diamondIntro: "Een Diamond is ook DESO-waarde en wordt aan een VIA-bijdrage gekoppeld.",
    diamondLoading: "Diamond-doel wordt geladen… DESO storten blijft beschikbaar.",
    disclaimer: "Bijdragen zijn vrijwillig. Een bijdrage geeft geen eigendomsrecht, beleggingsrecht of gegarandeerde tegenprestatie.",
    sent: "Dank je. De DESO-bijdrage is verzonden.", failed: "De bijdrage is niet verzonden.",
    loginFirst: "Log eerst in met DeSo Identity.", invalidAmount: "Voer een geldig DESO-bedrag in, minimaal 0.000000001 DESO.",
    prepareExact: "Exacte DeSo-transactie wordt voorbereid…", approvalClosed: "DeSo-goedkeuring gesloten. Er is niets verzonden.",
    checkApproval: "Controleer bedrag en ontvanger in DeSo Identity en keur alleen goed als alles klopt.",
    popupBlocked: "De goedkeuringspopup werd geblokkeerd.", prepareFailed: "De DESO-bijdrage kon niet worden voorbereid.",
  },
  English: {
    trigger: "Sponsor platform", dialogLabel: "Sponsor VIA", kicker: "VIA · Sponsor platform",
    title: "Every contribution counts — even the smallest.",
    intro: "Support VIA directly with DESO or a Diamond. VIA stores no payment details and every value action requires DeSo Identity approval.",
    close: "Close", desoTitle: "DESO contribution", desoIntro: "Prepared as a normal DeSo Basic Transfer for VIA.",
    amountAria: "DESO amount", confirm: "I understand this sends real DESO value and I will verify the transaction in DeSo Identity.",
    preparing: "Preparing…", approval: "Review in DeSo…", submitting: "Sending…", sendDeso: "Send DESO",
    fee: "Prepared network fee", diamondTitle: "Diamond contribution",
    diamondIntro: "A Diamond also represents DESO value and is linked to a VIA contribution.",
    diamondLoading: "Diamond target is loading… DESO contribution remains available.",
    disclaimer: "Contributions are voluntary. A contribution gives no ownership, investment right, or guaranteed return.",
    sent: "Thank you. The DESO contribution was sent.", failed: "The contribution was not sent.",
    loginFirst: "Log in with DeSo Identity first.", invalidAmount: "Enter a valid DESO amount, minimum 0.000000001 DESO.",
    prepareExact: "Preparing the exact DeSo transaction…", approvalClosed: "DeSo approval was closed. Nothing was sent.",
    checkApproval: "Check the amount and recipient in DeSo Identity and approve only if everything is correct.",
    popupBlocked: "The approval popup was blocked.", prepareFailed: "The DESO contribution could not be prepared.",
  },
  French: {
    trigger: "Soutenir VIA", dialogLabel: "Soutenir VIA", kicker: "VIA · Soutien",
    title: "Chaque contribution compte — même la plus petite.",
    intro: "Soutenez VIA directement avec DESO ou un Diamond. VIA ne conserve aucune donnée de paiement et chaque transfert de valeur nécessite l’approbation DeSo Identity.",
    close: "Fermer", desoTitle: "Contribution DESO", desoIntro: "Préparée comme un transfert DeSo Basic standard pour VIA.",
    amountAria: "Montant DESO", confirm: "Je comprends qu’il s’agit d’une valeur DESO réelle et je vérifierai la transaction dans DeSo Identity.",
    preparing: "Préparation…", approval: "Vérifier dans DeSo…", submitting: "Envoi…", sendDeso: "Envoyer DESO",
    fee: "Frais réseau préparés", diamondTitle: "Contribution Diamond",
    diamondIntro: "Un Diamond représente également une valeur DESO et est associé à une contribution VIA.",
    diamondLoading: "La cible Diamond est en cours de chargement… La contribution DESO reste disponible.",
    disclaimer: "Les contributions sont volontaires. Elles ne donnent aucun droit de propriété, d’investissement ni de contrepartie garantie.",
    sent: "Merci. La contribution DESO a été envoyée.", failed: "La contribution n’a pas été envoyée.",
    loginFirst: "Connectez-vous d’abord avec DeSo Identity.", invalidAmount: "Saisissez un montant DESO valide, minimum 0.000000001 DESO.",
    prepareExact: "Préparation de la transaction DeSo exacte…", approvalClosed: "L’approbation DeSo a été fermée. Rien n’a été envoyé.",
    checkApproval: "Vérifiez le montant et le destinataire dans DeSo Identity et approuvez uniquement si tout est correct.",
    popupBlocked: "La fenêtre d’approbation a été bloquée.", prepareFailed: "La contribution DESO n’a pas pu être préparée.",
  },
  Spanish: {
    trigger: "Patrocinar VIA", dialogLabel: "Patrocinar VIA", kicker: "VIA · Patrocinio",
    title: "Cada contribución cuenta — incluso la más pequeña.",
    intro: "Apoya VIA directamente con DESO o con un Diamond. VIA no guarda datos de pago y cada acción de valor requiere aprobación de DeSo Identity.",
    close: "Cerrar", desoTitle: "Contribución DESO", desoIntro: "Se prepara como una transferencia básica DeSo normal para VIA.",
    amountAria: "Importe DESO", confirm: "Entiendo que esto envía valor DESO real y revisaré la transacción en DeSo Identity.",
    preparing: "Preparando…", approval: "Revisar en DeSo…", submitting: "Enviando…", sendDeso: "Enviar DESO",
    fee: "Comisión de red preparada", diamondTitle: "Contribución Diamond",
    diamondIntro: "Un Diamond también representa valor DESO y se vincula a una contribución a VIA.",
    diamondLoading: "Se está cargando el destino Diamond… La contribución DESO sigue disponible.",
    disclaimer: "Las contribuciones son voluntarias. No otorgan derechos de propiedad, inversión ni una contraprestación garantizada.",
    sent: "Gracias. La contribución DESO se ha enviado.", failed: "La contribución no se ha enviado.",
    loginFirst: "Inicia sesión primero con DeSo Identity.", invalidAmount: "Introduce un importe DESO válido, mínimo 0.000000001 DESO.",
    prepareExact: "Preparando la transacción DeSo exacta…", approvalClosed: "Se cerró la aprobación DeSo. No se envió nada.",
    checkApproval: "Comprueba el importe y el destinatario en DeSo Identity y aprueba solo si todo es correcto.",
    popupBlocked: "La ventana de aprobación fue bloqueada.", prepareFailed: "No se pudo preparar la contribución DESO.",
  },
  Chinese: {
    trigger: "赞助 VIA", dialogLabel: "赞助 VIA", kicker: "VIA · 赞助",
    title: "每一份支持都很重要——无论大小。",
    intro: "可直接使用 DESO 或 Diamond 支持 VIA。VIA 不保存支付信息，每次价值转移都需要 DeSo Identity 批准。",
    close: "关闭", desoTitle: "DESO 支持", desoIntro: "将作为普通 DeSo Basic Transfer 为 VIA 准备。",
    amountAria: "DESO 金额", confirm: "我明白这会发送真实的 DESO 价值，并会在 DeSo Identity 中核对交易。",
    preparing: "准备中…", approval: "在 DeSo 中核对…", submitting: "发送中…", sendDeso: "发送 DESO",
    fee: "预估网络费", diamondTitle: "Diamond 支持",
    diamondIntro: "Diamond 同样代表 DESO 价值，并会关联到 VIA 支持。",
    diamondLoading: "正在加载 Diamond 目标… 仍可使用 DESO 支持。",
    disclaimer: "所有支持均为自愿。支持不产生所有权、投资权或任何保证回报。",
    sent: "谢谢。DESO 支持已发送。", failed: "支持未发送。",
    loginFirst: "请先通过 DeSo Identity 登录。", invalidAmount: "请输入有效的 DESO 金额，最低为 0.000000001 DESO。",
    prepareExact: "正在准备准确的 DeSo 交易…", approvalClosed: "DeSo 批准窗口已关闭。未发送任何内容。",
    checkApproval: "请在 DeSo Identity 中核对金额和收款方，仅在全部正确时批准。",
    popupBlocked: "批准弹窗被拦截。", prepareFailed: "无法准备 DESO 支持。",
  },
}

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
  const [language, setLanguage] = useState<ViaLanguage>("English")
  const [target, setTarget] = useState<Target | null>(null)
  const [amount, setAmount] = useState("0.01")
  const [confirmed, setConfirmed] = useState(false)
  const [status, setStatus] = useState<"idle"|"preparing"|"approval"|"submitting"|"done"|"error">("idle")
  const [message, setMessage] = useState("")
  const [feeNanos, setFeeNanos] = useState<number | null>(null)
  const popupRef = useRef<Window | null>(null)
  const popupWatch = useRef<number | null>(null)

  useEffect(() => {
    const sync = () => setLanguage(readViaLocalSettings().interfaceLanguage)
    sync()
    window.addEventListener(VIA_SETTINGS_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(VIA_SETTINGS_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  const copy = COPY[language]

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
      setMessage(copy.submitting)
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
        setMessage(copy.sent)
        setConfirmed(false)
      } catch {
        setStatus("error")
        setMessage(copy.failed)
      }
    }
    window.addEventListener("message", onMessage)
    return () => {
      window.removeEventListener("message", onMessage)
      if (popupWatch.current !== null) window.clearInterval(popupWatch.current)
      popupRef.current?.close()
    }
  }, [copy])

  async function prepareDeso() {
    const session = restoreIdentitySession()
    const amountNanos = parseDesoToNanos(amount)
    if (!session) { setStatus("error"); setMessage(copy.loginFirst); return }
    if (!amountNanos) { setStatus("error"); setMessage(copy.invalidAmount); return }
    if (!confirmed || status === "preparing" || status === "approval" || status === "submitting") return

    setStatus("preparing")
    setMessage(copy.prepareExact)
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
          setMessage(copy.approvalClosed)
        }
      }, 500)
      setStatus("approval")
      setMessage(copy.checkApproval)
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error && error.message === "POPUP_BLOCKED" ? copy.popupBlocked : copy.prepareFailed)
    }
  }

  const triggerClass = compact
    ? "rounded-lg border border-[#8fd4a9]/35 px-3 py-1.5 text-xs font-semibold text-[#9adbb2] hover:border-[#8fd4a9]/60"
    : "rounded-full border border-[#8fd4a9]/45 bg-[#10261a] px-4 py-2 text-sm font-semibold text-[#c9ffdc]"

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClass}>{copy.trigger}</button>
      {open && typeof document !== "undefined" ? createPortal(
        <div role="dialog" aria-modal="true" aria-label={copy.dialogLabel} onMouseDown={(event) => { if (event.currentTarget === event.target) setOpen(false) }} style={{ position:"fixed", inset:0, zIndex:160, display:"grid", placeItems:"center", padding:20, background:"rgba(0,0,0,.78)", backdropFilter:"blur(8px)" }}>
          <section style={{ width:"min(580px,100%)", maxHeight:"88vh", overflowY:"auto", border:"1px solid rgba(143,212,169,.32)", borderRadius:18, padding:20, background:"#06100b", color:"#edf4ef", boxShadow:"0 24px 80px rgba(0,0,0,.55)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", gap:16 }}>
              <div>
                <p style={{ margin:0, color:"#8fd4a9", fontSize:11, fontWeight:800, letterSpacing:".14em", textTransform:"uppercase" }}>{copy.kicker}</p>
                <h2 style={{ margin:"6px 0 0", fontSize:24 }}>{copy.title}</h2>
                <p style={{ margin:"8px 0 0", color:"#9aa79f", fontSize:13, lineHeight:1.55 }}>{copy.intro}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label={copy.close} style={{ border:0, background:"transparent", color:"#aab5ae", fontSize:24, cursor:"pointer" }}>×</button>
            </div>

            <div style={{ marginTop:18, display:"grid", gap:14 }}>
              <section style={{ border:"1px solid rgba(143,212,169,.18)", borderRadius:14, padding:14, background:"rgba(0,0,0,.22)" }}>
                <strong>{copy.desoTitle}</strong>
                <p style={{ margin:"5px 0 10px", color:"#87958d", fontSize:12 }}>{copy.desoIntro}</p>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  <input value={amount} onChange={(e)=>{setAmount(e.target.value);setConfirmed(false)}} inputMode="decimal" aria-label={copy.amountAria} style={{ minHeight:40, width:160, border:"1px solid rgba(143,212,169,.22)", borderRadius:10, padding:"8px 10px", background:"#050807", color:"#eef5f0" }} />
                  <span style={{ alignSelf:"center", color:"#a9b6ae", fontSize:12 }}>DESO</span>
                </div>
                <label style={{ marginTop:10, display:"flex", gap:7, alignItems:"flex-start", color:"#d8bf82", fontSize:11, lineHeight:1.4 }}><input type="checkbox" checked={confirmed} onChange={(e)=>setConfirmed(e.target.checked)} />{copy.confirm}</label>
                <button type="button" onClick={()=>void prepareDeso()} disabled={!confirmed || status==="preparing" || status==="approval" || status==="submitting"} style={{ marginTop:10, minHeight:38, border:"1px solid rgba(143,212,169,.42)", borderRadius:999, padding:"7px 13px", background:"rgba(18,53,34,.58)", color: confirmed ? "#b9ffd4" : "#65746b", fontWeight:750, cursor: confirmed ? "pointer" : "default" }}>{status==="preparing"?copy.preparing:status==="approval"?copy.approval:status==="submitting"?copy.submitting:copy.sendDeso}</button>
                {feeNanos !== null ? <p style={{ margin:"8px 0 0", color:"#75847b", fontSize:11 }}>{copy.fee}: {feeNanos.toLocaleString()} nanos.</p> : null}
              </section>

              <section style={{ border:"1px solid rgba(143,212,169,.18)", borderRadius:14, padding:14, background:"rgba(0,0,0,.22)" }}>
                <strong>{copy.diamondTitle}</strong>
                <p style={{ margin:"5px 0 10px", color:"#87958d", fontSize:12 }}>{copy.diamondIntro}</p>
                {target?.publicKey && target?.postHash ? (
                  <DiamondButton postHash={target.postHash} receiverPublicKey={target.publicKey} initialCount={0} />
                ) : (
                  <p style={{ margin:0, color:"#8d978f", fontSize:12 }}>{copy.diamondLoading}</p>
                )}
              </section>
            </div>

            {message ? <p role="status" style={{ margin:"14px 0 0", color: status==="error" ? "#e2bd7e" : "#9adbb2", fontSize:12, lineHeight:1.5 }}>{message}</p> : null}
            <p style={{ margin:"14px 0 0", color:"#68756e", fontSize:10, lineHeight:1.5 }}>{copy.disclaimer}</p>
          </section>
        </div>,
        document.body,
      ) : null}
    </>
  )
}
