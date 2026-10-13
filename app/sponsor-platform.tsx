"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { HandCoins } from "lucide-react"
import { DESO_IDENTITY_ORIGIN, restoreIdentitySession, VIA_IDENTITY_EVENT } from "./deso-identity-session"
import { viaModernIdentity } from "./deso-identity-modern"
import { financialReceipt, financialSubmissionBlock, markFinancialPending, markFinancialSubmitted, readFinancialReceipt, withFinancialAccountLock, FINANCIAL_SUBMISSION_EVENT } from "./financial-submission"
import DiamondButton from "./social/diamond-button"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "./via-local-settings"

type Target = { ok?: boolean; publicKey?: string; postHash?: string | null }
type PrepareResponse = { ok?: boolean; transactionHex?: string; feeNanos?: number; amountNanos?: number; senderPublicKey?: string; preparedAt?: number; error?: string }

type SponsorOperation = { publicKey: string; intent: string; amountNanos: number; invalidated: boolean; allowNewAction: boolean }

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

const COPY: Record<ViaLanguage | "Hindi", SponsorCopy> = {
  Dutch: {
    trigger: "Sponsoring Platform", dialogLabel: "Sponsor VIA", kicker: "VIA · Sponsoring Platform",
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
  Hindi: {
    trigger: "VIA को प्रायोजित करें", dialogLabel: "VIA को प्रायोजित करें", kicker: "VIA · प्रायोजक प्लेटफ़ॉर्म",
    title: "हर योगदान मायने रखता है — सबसे छोटा भी।", intro: "DESO या Diamond से VIA को सीधे समर्थन दें। VIA भुगतान विवरण सहेजता नहीं है और हर मूल्य कार्रवाई के लिए DeSo Identity मंज़ूरी आवश्यक है।",
    close: "बंद करें", desoTitle: "DESO योगदान", desoIntro: "VIA के लिए सामान्य DeSo Basic Transfer के रूप में तैयार किया जाता है।", amountAria: "DESO राशि",
    confirm: "मैं समझता हूँ कि इससे वास्तविक DESO मूल्य भेजा जाता है और मैं DeSo Identity में लेनदेन जाँचूँगा।",
    preparing: "तैयार हो रहा है…", approval: "DeSo में जाँचें…", submitting: "भेजा जा रहा है…", sendDeso: "DESO भेजें", fee: "तैयार नेटवर्क शुल्क",
    diamondTitle: "Diamond योगदान", diamondIntro: "Diamond भी DESO मूल्य दर्शाता है और VIA योगदान से जुड़ता है।", diamondLoading: "Diamond लक्ष्य लोड हो रहा है… DESO योगदान उपलब्ध है।",
    disclaimer: "योगदान स्वैच्छिक हैं। योगदान से स्वामित्व, निवेश अधिकार या गारंटीकृत प्रतिफल नहीं मिलता।", sent: "धन्यवाद। DESO योगदान भेज दिया गया।", failed: "योगदान नहीं भेजा गया।",
    loginFirst: "पहले DeSo Identity से लॉग इन करें।", invalidAmount: "मान्य DESO राशि दर्ज करें, न्यूनतम 0.000000001 DESO।", prepareExact: "सटीक DeSo लेनदेन तैयार हो रहा है…",
    approvalClosed: "DeSo मंज़ूरी बंद कर दी गई। कुछ भी नहीं भेजा गया।", checkApproval: "DeSo Identity में राशि और प्राप्तकर्ता जाँचें और सब सही होने पर ही मंज़ूर करें।",
    popupBlocked: "मंज़ूरी popup ब्लॉक हो गया।", prepareFailed: "DESO योगदान तैयार नहीं किया जा सका।",
  },
}

function signedTransactionFromMessage(event: MessageEvent, source: Window | null) {
  if (!source || event.origin !== DESO_IDENTITY_ORIGIN || event.source !== source) return null
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

export default function SponsorPlatform({ compact = false, showIcon = true }: { compact?: boolean; showIcon?: boolean }) {
  const [open, setOpen] = useState(false)
  const [language, setLanguage] = useState<ViaLanguage>("English")
  const [target, setTarget] = useState<Target | null>(null)
  const [amount, setAmount] = useState("0.01")
  const [amountMode, setAmountMode] = useState<"DESO"|"USD">("DESO")
  const [usdPerDeso, setUsdPerDeso] = useState<number | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [status, setStatus] = useState<"idle"|"preparing"|"approval"|"submitting"|"done"|"error">("idle")
  const busy = status === "preparing" || status === "approval" || status === "submitting"
  const [message, setMessage] = useState("")
  const [feeNanos, setFeeNanos] = useState<number | null>(null)
  const popupRef = useRef<Window | null>(null)
  const popupWatch = useRef<number | null>(null)
  const sendLock = useRef(false)
  const activeOperation = useRef<SponsorOperation | null>(null)
  const approval = useRef<{ source: Window; resolve: (hex: string) => void; reject: (error: Error) => void } | null>(null)
  const allowNewAction = useRef<{ publicKey: string; intent: string } | null>(null)
  const [submissionBlock, setSubmissionBlock] = useState("")
  const [hasReceipt, setHasReceipt] = useState(false)
  const selectedAccount = useRef<string | null>(null)
  // The recipient is deliberately unchanged. Its historical approval scope is
  // unresolved; this key labels the existing OuwePiet Basic Transfer only.
  const currentNanos = parseDesoToNanos(amountMode === "USD" && usdPerDeso ? (Number(amount) / usdPerDeso).toFixed(9) : amountMode === "DESO" ? amount : "")
  const currentIntent = `sponsor-deso:OuwePiet:${currentNanos ?? 0}`

  function cancelApproval(reason: string) {
    const waiting = approval.current
    approval.current = null
    if (popupWatch.current !== null) window.clearInterval(popupWatch.current)
    popupWatch.current = null
    popupRef.current?.close()
    popupRef.current = null
    waiting?.reject(new Error(reason))
  }

  function invalidateSelection() {
    if (activeOperation.current) activeOperation.current.invalidated = true
    allowNewAction.current = null
    cancelApproval("SPONSOR_SELECTION_CHANGED")
  }

  useEffect(() => {
    const sync = (event?: Event) => {
      const operation = activeOperation.current
      if (operation && event?.type === "storage") {
        const change = event as StorageEvent
        if ((change.key === "viaActivePublicKey" || change.key === "desoActivePublicKey") && change.newValue !== operation.publicKey) operation.invalidated = true
      }
      const session = restoreIdentitySession()
      if (selectedAccount.current !== null && selectedAccount.current !== session?.publicKey) setConfirmed(false)
      selectedAccount.current = session?.publicKey ?? null
      if (allowNewAction.current && (allowNewAction.current.publicKey !== session?.publicKey || allowNewAction.current.intent !== currentIntent)) allowNewAction.current = null
      if (operation && session?.publicKey !== operation.publicKey) operation.invalidated = true
      if (operation?.invalidated) cancelApproval("DESO_ACCOUNT_CHANGED")
      try {
        setSubmissionBlock(session ? financialSubmissionBlock(session.publicKey, currentIntent, Boolean(allowNewAction.current)) : "")
        setHasReceipt(Boolean(session && financialReceipt(session.publicKey, currentIntent)))
      } catch { setSubmissionBlock("Herstelregistratie niet beschikbaar. Niet verzenden."); setHasReceipt(false) }
    }
    sync()
    window.addEventListener(VIA_IDENTITY_EVENT, sync)
    window.addEventListener("storage", sync)
    window.addEventListener(FINANCIAL_SUBMISSION_EVENT, sync)
    return () => {
      window.removeEventListener(VIA_IDENTITY_EVENT, sync)
      window.removeEventListener("storage", sync)
      window.removeEventListener(FINANCIAL_SUBMISSION_EVENT, sync)
      if (activeOperation.current) activeOperation.current.invalidated = true
      cancelApproval("SPONSOR_OPERATION_CANCELLED")
    }
  }, [currentIntent])

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
    if (!open || usdPerDeso) return
    void fetch("https://node.deso.org/api/v0/get-exchange-rate", { cache: "no-store" })
      .then(async (response) => response.ok ? await response.json() as { USDCentsPerDeSoExchangeRate?: number } : null)
      .then((data) => {
        const cents = data?.USDCentsPerDeSoExchangeRate
        if (typeof cents === "number" && Number.isFinite(cents) && cents > 0) setUsdPerDeso(cents / 100)
      })
      .catch(() => undefined)
  }, [open, usdPerDeso])

  useEffect(() => {
    if (!open || target) return
    void fetch("/api/via/sponsor-target", { cache: "no-store" })
      .then(async (response) => response.ok ? await response.json() as Target : null)
      .then((data) => { if (data?.ok) setTarget(data) })
      .catch(() => undefined)
  }, [open, target])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const waiting = approval.current
      if (!waiting) return
      const signedTransactionHex = signedTransactionFromMessage(event, waiting.source)
      if (!signedTransactionHex) return
      // Consume synchronously before any await; duplicate popup messages cannot
      // start another submit. Broadcasting stays in the captured operation.
      approval.current = null
      if (popupWatch.current !== null) window.clearInterval(popupWatch.current)
      popupWatch.current = null
      popupRef.current?.close()
      popupRef.current = null
      waiting.resolve(signedTransactionHex)
    }
    window.addEventListener("message", onMessage)
    return () => {
      window.removeEventListener("message", onMessage)
      if (activeOperation.current) activeOperation.current.invalidated = true
      cancelApproval("SPONSOR_OPERATION_CANCELLED")
    }
  }, [])

  async function prepareDeso() {
    if (sendLock.current) return
    const session = restoreIdentitySession()
    const entered = Number(amount)
    const desoAmount = amountMode === "USD"
      ? (Number.isFinite(entered) && entered > 0 && usdPerDeso ? (entered / usdPerDeso).toFixed(9) : "")
      : amount
    const amountNanos = parseDesoToNanos(desoAmount)
    if (!session) { setStatus("error"); setMessage(copy.loginFirst); return }
    if (!amountNanos) { setStatus("error"); setMessage(copy.invalidAmount); return }
    if (!confirmed || status === "preparing" || status === "approval" || status === "submitting") return
    sendLock.current = true
    const intent = `sponsor-deso:OuwePiet:${amountNanos}`
    const permit = allowNewAction.current
    const operation: SponsorOperation = { publicKey: session.publicKey, intent, amountNanos, invalidated: false, allowNewAction: permit?.publicKey === session.publicKey && permit.intent === intent }
    activeOperation.current = operation
    let submissionStarted = false
    let accepted = false
    try {
      const assertAccount = async () => {
        const check = () => { if (operation.invalidated || restoreIdentitySession()?.publicKey !== operation.publicKey) throw new Error("DESO_ACCOUNT_CHANGED") }
        check()
        const current = await viaModernIdentity.currentUser()
        check()
        if (current?.publicKey !== operation.publicKey) throw new Error("DESO_ACCOUNT_CHANGED")
      }
      await withFinancialAccountLock(operation.publicKey, async () => {
      await assertAccount()
      const blocked = financialSubmissionBlock(operation.publicKey, intent, operation.allowNewAction)
      if (blocked) { setSubmissionBlock(blocked); setMessage(blocked); return }
      setStatus("preparing")
      setMessage(copy.prepareExact)
      setFeeNanos(null)
      const response = await fetch("/api/via/sponsor/contribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ action: "prepare", senderPublicKey: session.publicKey, amountNanos, confirmed: true }),
      })
      const data = await response.json() as PrepareResponse
      await assertAccount()
      if (!response.ok || !data.ok || !data.transactionHex) throw new Error(data.error || "PREPARE_FAILED")
      if (data.senderPublicKey !== operation.publicKey || data.amountNanos !== amountNanos || typeof data.feeNanos !== "number" || !Number.isSafeInteger(data.feeNanos) || data.feeNanos < 0 ||
        !Number.isSafeInteger(amountNanos + data.feeNanos) || typeof data.preparedAt !== "number" || !Number.isSafeInteger(data.preparedAt)) throw new Error("INVALID_PREPARED_COST")
      const assertFresh = () => { if (Date.now() < data.preparedAt! || Date.now() - data.preparedAt! > 120_000) throw new Error("SPONSOR_QUOTE_EXPIRED") }
      assertFresh()
      setFeeNanos(data.feeNanos)
      const popup = window.open(
        `${DESO_IDENTITY_ORIGIN}/approve?tx=${encodeURIComponent(data.transactionHex)}`,
        "via-sponsor-deso-approve",
        `popup=yes,width=${Math.min(800, window.screen.availWidth)},height=${Math.min(900, window.screen.availHeight)}`,
      )
      if (!popup) throw new Error("POPUP_BLOCKED")
      popupRef.current = popup
      setStatus("approval")
      setMessage(copy.checkApproval)
      const signedTransactionHex = await new Promise<string>((resolve, reject) => {
        approval.current = { source: popup, resolve, reject }
        popupWatch.current = window.setInterval(() => {
          if (popup.closed) cancelApproval("SPONSOR_APPROVAL_CLOSED")
          else if (operation.invalidated || Date.now() - data.preparedAt! > 120_000) cancelApproval("SPONSOR_APPROVAL_EXPIRED_OR_CHANGED")
        }, 500)
      })
      await assertAccount()
      assertFresh()
      if (signedTransactionHex.length > 500_000 || !/^(?:[0-9a-f]{2})+$/i.test(signedTransactionHex)) throw new Error("INVALID_SIGNED_TRANSACTION")
      const submission = { publicKey: operation.publicKey, intent, amountNanos, startedAt: Date.now() }
      markFinancialPending(submission)
      if (operation.invalidated || restoreIdentitySession()?.publicKey !== operation.publicKey) throw new Error("DESO_ACCOUNT_CHANGED")
      setStatus("submitting")
      setMessage(copy.submitting)
      submissionStarted = true
      const submitResponse = await fetch("/api/via/sponsor/contribute", {
        method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store",
        body: JSON.stringify({ action: "submit", signedTransactionHex }),
      })
      const submitData = await submitResponse.json() as { ok?: boolean; error?: string; transaction?: { TxnHashHex?: unknown } }
      if (!submitResponse.ok || !submitData.ok) throw new Error(submitData.error || "SUBMIT_FAILED")
      accepted = true
      allowNewAction.current = null
      markFinancialSubmitted(submission, submitData.transaction?.TxnHashHex)
      setStatus("done")
      setMessage(copy.sent)
      setConfirmed(false)
      setHasReceipt(true)
      setSubmissionBlock(financialSubmissionBlock(operation.publicKey, intent))
      try { setMessage(await readFinancialReceipt(operation.publicKey, intent)) } catch { setMessage("DeSo heeft de bijdrage ontvangen; readback niet beschikbaar. Niet opnieuw verzenden.") }
      })
    } catch (error) {
      setStatus("error")
      setMessage(accepted ? "DeSo heeft de bijdrage ontvangen, maar herstelregistratie is onzeker. Niet opnieuw verzenden."
        : submissionStarted ? "Verzendstatus onzeker. Controleer DeSo; niet opnieuw verzenden."
        : error instanceof Error && error.message === "POPUP_BLOCKED" ? copy.popupBlocked
        : `Niet uitgezonden door VIA. Controleer account en herstelstatus. ${error instanceof Error ? error.message : ""}`)
    } finally {
      cancelApproval("SPONSOR_OPERATION_FINISHED")
      activeOperation.current = null
      allowNewAction.current = null
      sendLock.current = false
    }
  }

  function startNewContribution() {
    if (sendLock.current) return
    const session = restoreIdentitySession()
    if (!session) return
    try {
      // Only a known accepted receipt permits a deliberate new contribution.
      // This never clears an uncertain pending marker or authorizes a retry.
      if (financialSubmissionBlock(session.publicKey, "new-confirmation") || !financialReceipt(session.publicKey, currentIntent)) return
      allowNewAction.current = { publicKey: session.publicKey, intent: currentIntent }
      setConfirmed(false)
      setSubmissionBlock("")
      setStatus("idle")
      setMessage("Nieuwe bijdrage. Controleer bedrag en bevestig opnieuw; de vorige verzending wordt niet herhaald.")
    } catch { setMessage("Herstelregistratie niet beschikbaar. Niet verzenden.") }
  }

  const triggerClass = compact
    ? "rounded-lg border border-[#8fd4a9]/35 px-3 py-1.5 text-xs font-semibold text-[#9adbb2] hover:border-[#8fd4a9]/60"
    : "rounded-full border border-[#8fd4a9]/45 bg-[#10261a] px-4 py-2 text-sm font-semibold text-[#c9ffdc]"

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClass}>{showIcon ? <HandCoins className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}<span>{copy.trigger}</span></button>
      {open && typeof document !== "undefined" ? createPortal(
        <div role="dialog" aria-modal="true" aria-label={copy.dialogLabel} onMouseDown={(event) => { if (event.currentTarget === event.target) { invalidateSelection(); setOpen(false) } }} style={{ position:"fixed", inset:0, zIndex:160, display:"grid", placeItems:"center", padding:20, background:"rgba(0,0,0,.78)", backdropFilter:"blur(8px)" }}>
          <section style={{ width:"min(580px,100%)", maxHeight:"88vh", overflowY:"auto", border:"1px solid rgba(143,212,169,.32)", borderRadius:18, padding:20, background:"#06100b", color:"#edf4ef", boxShadow:"0 24px 80px rgba(0,0,0,.55)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", gap:16 }}>
              <div>
                <p style={{ margin:0, color:"#8fd4a9", fontSize:11, fontWeight:800, letterSpacing:".14em", textTransform:"uppercase" }}>{copy.kicker}</p>
                <h2 style={{ margin:"6px 0 0", fontSize:24 }}>{copy.title}</h2>
                <p style={{ margin:"8px 0 0", color:"#9aa79f", fontSize:13, lineHeight:1.55 }}>{copy.intro}</p>
              </div>
              <button type="button" onClick={() => { invalidateSelection(); setOpen(false) }} aria-label={copy.close} style={{ border:0, background:"transparent", color:"#aab5ae", fontSize:24, cursor:"pointer" }}>×</button>
            </div>

            <div style={{ marginTop:18, display:"grid", gap:14 }}>
              <section style={{ border:"1px solid rgba(143,212,169,.18)", borderRadius:14, padding:14, background:"rgba(0,0,0,.22)" }}>
                <strong>{copy.desoTitle}</strong>
                <p style={{ margin:"5px 0 10px", color:"#87958d", fontSize:12 }}>{copy.desoIntro}</p>
                <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                  <input value={amount} onChange={(e)=>{invalidateSelection();setAmount(e.target.value);setConfirmed(false)}} inputMode="decimal" aria-label={amountMode === "DESO" ? copy.amountAria : "USD amount"} style={{ minHeight:40, width:160, border:"1px solid rgba(143,212,169,.22)", borderRadius:10, padding:"8px 10px", background:"#050807", color:"#eef5f0" }} />
                  <div role="group" aria-label="DESO or USD" style={{ display:"inline-flex", padding:2, border:"1px solid rgba(143,212,169,.28)", borderRadius:999, background:"#050807" }}>
                    {(["DESO","USD"] as const).map((mode) => <button key={mode} type="button" onClick={()=>{ if (mode !== amountMode) { invalidateSelection(); setAmount(mode === "USD" ? "1.00" : "0.01"); setAmountMode(mode); setConfirmed(false) } }} aria-pressed={amountMode===mode} style={{ minHeight:30, border:0, borderRadius:999, padding:"5px 10px", background:amountMode===mode?"rgba(40,95,64,.9)":"transparent", color:amountMode===mode?"#c9ffdc":"#8d978f", fontSize:11, fontWeight:750, cursor:"pointer" }}>{mode === "USD" ? "$" : "DESO"}</button>)}
                  </div>
                </div>
                {amountMode === "USD" ? <p style={{ margin:"7px 0 0", color:"#75847b", fontSize:11 }}>{usdPerDeso ? `$1 = ${(1/usdPerDeso).toFixed(6)} DESO · 1 DESO = ${usdPerDeso.toFixed(2)}` : "Live DESO / $ rate wordt geladen…"}</p> : null}
                <label style={{ marginTop:10, display:"flex", gap:7, alignItems:"flex-start", color:"#d8bf82", fontSize:11, lineHeight:1.4 }}><input type="checkbox" checked={confirmed} onChange={(e)=>{ if (activeOperation.current) { activeOperation.current.invalidated = true; cancelApproval("SPONSOR_CONFIRMATION_CHANGED") } setConfirmed(e.target.checked) }} />{copy.confirm}</label>
                <button type="button" onClick={()=>void prepareDeso()} disabled={!confirmed || status==="preparing" || status==="approval" || status==="submitting"} style={{ marginTop:10, minHeight:38, border:"1px solid rgba(143,212,169,.42)", borderRadius:999, padding:"7px 13px", background:"rgba(18,53,34,.58)", color: confirmed ? "#b9ffd4" : "#65746b", fontWeight:750, cursor: confirmed ? "pointer" : "default" }}>{status==="preparing"?copy.preparing:status==="approval"?copy.approval:status==="submitting"?copy.submitting:copy.sendDeso}</button>
                {feeNanos !== null ? <p style={{ margin:"8px 0 0", color:"#75847b", fontSize:11 }}>{copy.fee}: {feeNanos.toLocaleString()} nanos.</p> : null}
                {submissionBlock ? <p role="status" style={{ color:"#e2bd7e", fontSize:12 }}>{submissionBlock}</p> : null}
                {hasReceipt ? <div style={{ marginTop:8, display:"flex", gap:10 }}>
                  <button type="button" disabled={busy} onClick={() => { const session = restoreIdentitySession(); if (session) void readFinancialReceipt(session.publicKey, currentIntent).then(setMessage).catch(() => setMessage("Readback niet beschikbaar. Niet opnieuw verzenden.")) }}>Controleer eerdere verzending</button>
                  <button type="button" disabled={busy} onClick={startNewContribution}>Nieuwe bijdrage</button>
                </div> : null}
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
