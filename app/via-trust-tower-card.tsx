"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ShieldCheck } from "lucide-react"

type Reachability = "OK" | "DEGRADED" | "FAILED" | "UNKNOWN"
type Health = { checkedAt?: string; via?: { status?: Reachability }; deso?: { status?: Reachability } }
const translations: Record<string,{ title:string;detail:string;pending:string;more:string;checking:string;available:string;degraded:string;unknown:string;checked:string }> = {
  Dutch:{title:"VIA Vertrouwen",detail:"Veiligheid, bereikbaarheid en onderhoud",pending:"Protocol en Identity nog niet geverifieerd",more:"Bekijk het vertrouwensbord",checking:"Bereikbaarheid controleren…",available:"VIA en DeSo-node bereikbaar",degraded:"Bereikbaarheidsprobleem gemeten",unknown:"Bereikbaarheid niet geverifieerd",checked:"Gemeten"},
  English:{title:"VIA Trust",detail:"Safety, availability and maintenance",pending:"Protocol and Identity not yet verified",more:"View the trust board",checking:"Checking reachability…",available:"VIA and DeSo node reachable",degraded:"Reachability issue detected",unknown:"Reachability not verified",checked:"Measured"},
  French:{title:"Confiance VIA",detail:"Sécurité, disponibilité et maintenance",pending:"Protocole et Identity non vérifiés",more:"Voir le tableau de confiance",checking:"Contrôle de disponibilité…",available:"VIA et nœud DeSo accessibles",degraded:"Problème de disponibilité détecté",unknown:"Disponibilité non vérifiée",checked:"Mesuré"},
  Spanish:{title:"Confianza VIA",detail:"Seguridad, disponibilidad y mantenimiento",pending:"Protocolo e Identity sin verificar",more:"Ver el panel de confianza",checking:"Comprobando disponibilidad…",available:"VIA y nodo DeSo accesibles",degraded:"Problema de disponibilidad detectado",unknown:"Disponibilidad sin verificar",checked:"Medido"},
  Chinese:{title:"VIA 信任",detail:"安全、可用性与维护",pending:"协议和 Identity 尚未验证",more:"查看信任公告板",checking:"检查连接中…",available:"VIA 与 DeSo 节点可访问",degraded:"检测到连接问题",unknown:"连接状态尚未验证",checked:"检查时间"},
  Hindi:{title:"VIA भरोसा",detail:"सुरक्षा, उपलब्धता और रखरखाव",pending:"प्रोटोकॉल और Identity अभी सत्यापित नहीं",more:"विश्वास बोर्ड देखें",checking:"उपलब्धता जाँच रहे हैं…",available:"VIA और DeSo नोड उपलब्ध",degraded:"उपलब्धता में समस्या",unknown:"उपलब्धता सत्यापित नहीं",checked:"जाँच समय"},
}
export default function ViaTrustTowerCard({language="English"}:{language?:string}){
  const [status,setStatus]=useState<"loading"|"ok"|"degraded"|"unknown">("loading")
  const [checkedAt,setCheckedAt]=useState<string|null>(null)
  useEffect(()=>{
    const controller=new AbortController()
    const timer=window.setTimeout(()=>controller.abort(),7000)
    void fetch("/api/via/health",{cache:"no-store",signal:controller.signal}).then(async response=>{
      if(!response.ok) throw new Error("health")
      const health=await response.json() as Health
      const timestamp=Date.parse(health.checkedAt??"")
      if(!Number.isFinite(timestamp)||Math.abs(Date.now()-timestamp)>120000) throw new Error("stale")
      setCheckedAt(health.checkedAt??null)
      setStatus(health.via?.status==="OK"&&health.deso?.status==="OK"?"ok":health.via?.status==="FAILED"||health.deso?.status==="FAILED"||health.deso?.status==="DEGRADED"?"degraded":"unknown")
    }).catch(()=>{if(!controller.signal.aborted)setStatus("unknown")}).finally(()=>{window.clearTimeout(timer);if(controller.signal.aborted)setStatus("unknown")})
    return ()=>{controller.abort();window.clearTimeout(timer)}
  },[])
  const t=translations[language]??translations.English
  const message=status==="loading"?t.checking:status==="ok"?t.available:status==="degraded"?t.degraded:t.unknown
  return <section aria-label={t.title} className="rounded-2xl border border-[#285f40]/70 bg-[#050806]/90 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
    <div className="flex items-center gap-2 text-[#9adbb2]"><ShieldCheck aria-hidden="true" size={17}/><h2 className="text-sm font-semibold">{t.title}</h2></div>
    <p className="mt-2 text-xs text-zinc-300">{t.detail}</p>
    <p role="status" className={`mt-2 text-[11px] ${status==="degraded"?"text-amber-200":status==="ok"?"text-[#9adbb2]":"text-zinc-400"}`}>{message}</p>
    {checkedAt?<p className="mt-1 text-[10px] text-zinc-500">{t.checked}: {new Date(checkedAt).toLocaleString()}</p>:null}
    <p className="mt-2 text-[11px] text-zinc-400">{t.pending}</p>
    <Link href="/vertrouwen" className="mt-3 inline-flex text-xs text-[#9adbb2] underline underline-offset-4">{t.more}</Link>
  </section>
}
