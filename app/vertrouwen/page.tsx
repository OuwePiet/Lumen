"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ShieldCheck } from "lucide-react"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"

type Status = "OK" | "DEGRADED" | "FAILED" | "UNKNOWN"
type Protocol = { checkedAt?: string; checks?: Record<string, { status: string; detail: string }> }
type Health = { checkedAt?: string; via?: { status?: Status }; deso?: { status?: Status }; mediaUpload?: { status?: Status }; mediaRetrieval?: { status?: Status } }
const WORDS: Record<ViaLanguage, { title: string; intro: string; status: string; via: string; deso: string; uploads: string; media: string; protocol: string; protocolNote: string; ok: string; bad: string; unknown: string; loading: string; refresh: string; checked: string; failed: string; safety: string; tips: string[]; history: string; historyNote: string; notice: string }> = {
  Dutch: { title:"VIA Vertrouwen", intro:"Openbare informatie over bereikbaarheid en veilig gebruik. Een bereikbare node bewijst niet dat transacties of het DeSo-protocol veilig zijn.", status:"Actuele controles",via:"VIA-statusendpoint",deso:"DeSo-nodebereikbaarheid",uploads:"Media uploaden",media:"Media ophalen",protocol:"DeSo-protocol en Identity",protocolNote:"Automatische protocol- en Identity-verificatie is nog niet gekoppeld.",ok:"Bereikbaar",bad:"Niet bereikbaar / beperkt",unknown:"Niet geverifieerd",loading:"Controleren…",refresh:"Opnieuw controleren",checked:"Gecontroleerd",failed:"Controle mislukt",safety:"Veiligheid voor creators en community",tips:["Deel nooit je herstelzin of privésleutel.","Controleer ontvanger, bedrag, royalties en machtigingen vóór ondertekening.","Wees alert op imitatieprofielen en verdachte links.","Controleer bij een vastgelopen betaling de blockchainstatus vóór opnieuw proberen."],history:"Storingen en onderhoud",historyNote:"Er is nog geen geverifieerde openbare incidenthistorie aangesloten. Afwezigheid van meldingen betekent niet dat er geen incidenten waren.",notice:"Dit is een beperkte bereikbaarheidscontrole, geen beveiligingscertificaat." },
  English: { title:"VIA Trust",intro:"Public information about availability and safe use. A reachable node does not prove transactions or the DeSo protocol are secure.",status:"Current checks",via:"VIA status endpoint",deso:"DeSo node reachability",uploads:"Media upload",media:"Media retrieval",protocol:"DeSo protocol and Identity",protocolNote:"Automated protocol and Identity verification is not connected yet.",ok:"Reachable",bad:"Unavailable / degraded",unknown:"Not verified",loading:"Checking…",refresh:"Check again",checked:"Checked",failed:"Check failed",safety:"Creator and community safety",tips:["Never share your recovery phrase or private key.","Verify recipients, amounts, royalties and permissions before signing.","Beware of impersonation and suspicious links.","Check blockchain transaction status before retrying a stalled payment."],history:"Incidents and maintenance",historyNote:"No verified public incident history is connected yet. No reports does not mean no incidents occurred.",notice:"This is a limited reachability check, not a security certificate." },
  French: { title:"Confiance VIA",intro:"Informations publiques sur la disponibilité et la sécurité. Un nœud accessible ne garantit pas la sécurité des transactions ni du protocole DeSo.",status:"Contrôles actuels",via:"Service d'état VIA",deso:"Accessibilité du nœud DeSo",uploads:"Envoi de médias",media:"Accès aux médias",protocol:"Protocole DeSo et Identity",protocolNote:"La vérification automatique du protocole et d'Identity n'est pas encore connectée.",ok:"Accessible",bad:"Indisponible / dégradé",unknown:"Non vérifié",loading:"Vérification…",refresh:"Vérifier à nouveau",checked:"Vérifié le",failed:"Échec du contrôle",safety:"Sécurité des créateurs et de la communauté",tips:["Ne partagez jamais votre phrase de récupération ni votre clé privée.","Vérifiez le destinataire, le montant, les royalties et les autorisations avant de signer.","Méfiez-vous des faux profils et des liens suspects.","Vérifiez l'état de la transaction sur la blockchain avant de réessayer."],history:"Incidents et maintenance",historyNote:"Aucun historique public vérifié n'est encore connecté. L'absence de signalement ne signifie pas l'absence d'incident.",notice:"Il s'agit d'un contrôle limité de disponibilité, pas d'un certificat de sécurité." },
  Spanish: { title:"Confianza VIA",intro:"Información pública sobre disponibilidad y uso seguro. Un nodo accesible no garantiza la seguridad de las transacciones ni del protocolo DeSo.",status:"Comprobaciones actuales",via:"Servicio de estado VIA",deso:"Acceso al nodo DeSo",uploads:"Subida de medios",media:"Acceso a medios",protocol:"Protocolo DeSo e Identity",protocolNote:"La verificación automática del protocolo y de Identity aún no está conectada.",ok:"Accesible",bad:"No disponible / limitado",unknown:"Sin verificar",loading:"Comprobando…",refresh:"Comprobar de nuevo",checked:"Comprobado",failed:"Error de comprobación",safety:"Seguridad de creadores y comunidad",tips:["Nunca compartas tu frase de recuperación ni tu clave privada.","Comprueba destinatario, importe, regalías y permisos antes de firmar.","Cuidado con perfiles falsos y enlaces sospechosos.","Consulta el estado de la transacción en la blockchain antes de reintentar un pago."],history:"Incidentes y mantenimiento",historyNote:"Aún no hay un historial público de incidentes verificado. La ausencia de informes no significa ausencia de incidentes.",notice:"Esta es una comprobación limitada de disponibilidad, no un certificado de seguridad." },
  Chinese: { title:"VIA 信任",intro:"公开展示可用性和安全使用信息。节点可访问不代表交易或 DeSo 协议一定安全。",status:"当前检查",via:"VIA 状态接口",deso:"DeSo 节点连接",uploads:"媒体上传",media:"媒体读取",protocol:"DeSo 协议和 Identity",protocolNote:"协议及 Identity 自动验证尚未接入。",ok:"可访问",bad:"不可用或受限",unknown:"尚未验证",loading:"检查中…",refresh:"重新检查",checked:"检查时间",failed:"检查失败",safety:"创作者与社区安全",tips:["切勿分享助记词或私钥。","签名前检查收款人、金额、版税和权限。","警惕冒充账号和可疑链接。","支付卡住时，重试前先核对链上交易状态。"],history:"故障与维护",historyNote:"尚未接入经核实的公开事件记录。没有报告不代表没有事件。",notice:"这只是有限的连通性检查，并非安全认证。" },
  Hindi: { title:"VIA भरोसा",intro:"उपलब्धता और सुरक्षित उपयोग की सार्वजनिक जानकारी। नोड का उपलब्ध होना लेनदेन या DeSo प्रोटोकॉल की सुरक्षा का प्रमाण नहीं है।",status:"वर्तमान जाँच",via:"VIA स्थिति सेवा",deso:"DeSo नोड उपलब्धता",uploads:"मीडिया अपलोड",media:"मीडिया प्राप्ति",protocol:"DeSo प्रोटोकॉल और Identity",protocolNote:"प्रोटोकॉल और Identity की स्वचालित पुष्टि अभी जुड़ी नहीं है।",ok:"उपलब्ध",bad:"अनुपलब्ध / बाधित",unknown:"सत्यापित नहीं",loading:"जाँच जारी…",refresh:"फिर जाँचें",checked:"जाँच समय",failed:"जाँच विफल",safety:"क्रिएटर और समुदाय की सुरक्षा",tips:["अपना रिकवरी वाक्यांश या निजी कुंजी कभी साझा न करें।","हस्ताक्षर से पहले प्राप्तकर्ता, राशि, रॉयल्टी और अनुमतियाँ जाँचें।","नकली प्रोफाइल और संदिग्ध लिंक से सावधान रहें।","रुका भुगतान दोहराने से पहले ब्लॉकचेन पर लेनदेन की स्थिति जाँचें।"],history:"घटनाएँ और रखरखाव",historyNote:"सत्यापित सार्वजनिक घटना इतिहास अभी जुड़ा नहीं है। रिपोर्ट न होने का अर्थ घटना न होना नहीं है।",notice:"यह सीमित उपलब्धता जाँच है, सुरक्षा प्रमाणपत्र नहीं।" },
}

export default function ViaTrustPage() {
  const [language,setLanguage] = useState<ViaLanguage>("English")
  const [health,setHealth] = useState<Health | null>(null)
  const [protocol,setProtocol] = useState<Protocol | null>(null)
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState(false)
  const check = useCallback(async () => {
    setLoading(true);setError(false);setHealth(null);setProtocol(null)
    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), 8000)
    try {
      const response = await fetch("/api/via/health",{ cache:"no-store",signal:controller.signal })
      if (!response.ok) throw new Error("status")
      const data = await response.json() as Health
      if (!data.checkedAt || !Number.isFinite(Date.parse(data.checkedAt)) || Math.abs(Date.now()-Date.parse(data.checkedAt))>120000) throw new Error("stale")
      setHealth(data)
      try {
        const protocolResponse = await fetch("/api/via/protocol-status", { cache: "no-store", signal: controller.signal })
        if (protocolResponse.ok) {
          const protocolData = await protocolResponse.json() as Protocol
          if (protocolData.checkedAt && Math.abs(Date.now() - Date.parse(protocolData.checkedAt)) < 120000) setProtocol(protocolData)
        }
      } catch { /* Independent public source check: unknown if unavailable. */ }
    } catch {setError(true)} finally {window.clearTimeout(timer);setLoading(false)}
  },[])
  useEffect(() => {
    const sync=()=>setLanguage(readViaLocalSettings().interfaceLanguage)
    sync();window.addEventListener(VIA_SETTINGS_EVENT,sync);window.addEventListener("storage",sync)
    void check()
    return ()=>{window.removeEventListener(VIA_SETTINGS_EVENT,sync);window.removeEventListener("storage",sync)}
  },[check])
  const t=WORDS[language]
  const protocolChecks = protocol?.checks
  const protocolStatus = protocolChecks && Object.keys(protocolChecks).length >= 5 ? Object.values(protocolChecks).some(c => c.status === "REVIEW") ? "DEGRADED" as Status : Object.values(protocolChecks).some(c => c.status !== "OK") ? "UNKNOWN" as Status : "OK" as Status : "UNKNOWN" as Status
  const checkLabel = (key: string) => ({sdk: language === "Dutch" ? "DeSo SDK-versie" : "DeSo SDK version", advisories: language === "Dutch" ? "SDK-beveiligingsmeldingen" : "SDK security advisories", identity: "DeSo Identity", core: language === "Dutch" ? "Blockchain-broncode" : "Blockchain source", api: "DeSo API"})[key] ?? key
  const state=(value?:Status)=>value==="OK"?t.ok:value==="FAILED"||value==="DEGRADED"?t.bad:t.unknown
  const line=(name:string,value?:Status)=><div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 py-2 text-sm" key={name}><span>{name}</span><span className={value==="OK"?"text-[#9adbb2]":value==="FAILED"||value==="DEGRADED"?"text-amber-200":"text-zinc-400"}>{state(value)}</span></div>
  return <main className="min-h-screen bg-[#020403] px-4 py-8 text-[#e9f0eb]"><div className="mx-auto w-full max-w-4xl space-y-5">
    <header className="flex items-center gap-3"><ShieldCheck aria-hidden="true" className="text-[#9adbb2]"/><h1 className="text-2xl font-semibold">{t.title}</h1></header>
    <p className="text-sm leading-6 text-zinc-300">{t.intro}</p>
    <section className="rounded-xl border border-[#285f40] p-4" aria-label={t.status}><h2 className="font-semibold text-[#9adbb2]">{t.status}</h2>
      {loading?<p role="status" className="mt-2 text-sm">{t.loading}</p>:error?<p role="status" className="mt-2 text-sm text-amber-200">{t.failed}</p>:null}
      {line(t.via,health?.via?.status)}{line(t.deso,health?.deso?.status)}{line(t.uploads,health?.mediaUpload?.status)}{line(t.media,health?.mediaRetrieval?.status)}
      {line(t.protocol,protocolStatus)}
      {(["sdk", "advisories", "identity", "core", "api"] as const).map(key => <div key={key} className="border-b border-zinc-800 py-2 text-xs"><div className="flex justify-between gap-3"><span>{checkLabel(key)}</span><span className={protocolChecks?.[key]?.status === "OK" ? "text-[#9adbb2]" : protocolChecks?.[key]?.status === "REVIEW" ? "text-amber-200" : "text-zinc-400"}>{protocolChecks?.[key]?.status === "OK" ? (language === "Dutch" ? "Broncontrole OK" : "Source check OK") : protocolChecks?.[key]?.status === "REVIEW" ? (language === "Dutch" ? "Beoordelen" : "Review") : t.unknown}</span></div></div>)}
      <p className="mt-2 text-xs text-zinc-400">{language === "Dutch" ? "Automatische broncontroles zijn aangesloten. Bereikbaarheid en versievergelijking zijn geen volledige protocol- of veiligheidsgarantie." : "Automated source checks are connected. Reachability and version checks do not certify protocol compatibility or security."}</p>
      <p className="mt-2 text-xs text-zinc-400">{t.checked}: {health?.checkedAt?new Date(health.checkedAt).toLocaleString(({Dutch:"nl-NL",English:"en-GB",French:"fr-FR",Spanish:"es-ES",Chinese:"zh-CN",Hindi:"hi-IN"})[language]):"—"}</p>
      <button type="button" onClick={()=>void check()} disabled={loading} className="mt-3 rounded-lg border border-[#285f40] px-3 py-2 text-xs text-[#9adbb2] disabled:opacity-50">{t.refresh}</button>
      <p className="mt-3 text-xs text-zinc-400">{t.notice}</p>
    </section>
    <section className="space-y-2 rounded-xl border border-zinc-800 p-4"><h2 className="font-semibold">{t.safety}</h2><ul className="list-inside list-disc space-y-2 text-sm text-zinc-300">{t.tips.map(tip=><li key={tip}>{tip}</li>)}</ul></section>
    <section className="space-y-2 rounded-xl border border-zinc-800 p-4"><h2 className="font-semibold">{t.history}</h2><p className="text-sm text-zinc-400">{t.historyNote}</p></section>
    <footer className="text-xs text-zinc-500">© @OuwePiet 2026</footer>
  </div></main>
}
