import Link from "next/link"
import { ShieldCheck } from "lucide-react"

export default function ViaTrustTowerCard({ language = "English" }: { language?: string }) {
  const copy: Record<string, { title: string; detail: string; pending: string; more: string }> = {
    Dutch: { title: "VIA Vertrouwen", detail: "Veiligheid, bereikbaarheid en onderhoud", pending: "Protocolcontrole nog niet gekoppeld", more: "Bekijk het vertrouwensbord" },
    English: { title: "VIA Trust", detail: "Safety, availability and maintenance", pending: "Protocol monitoring not connected yet", more: "View the trust board" },
    French: { title: "Confiance VIA", detail: "Sécurité, disponibilité et maintenance", pending: "Suivi du protocole non connecté", more: "Voir le tableau de confiance" },
    Spanish: { title: "Confianza VIA", detail: "Seguridad, disponibilidad y mantenimiento", pending: "Control del protocolo aún no conectado", more: "Ver el panel de confianza" },
    Chinese: { title: "VIA 信任", detail: "安全、可用性与维护", pending: "协议监控尚未连接", more: "查看信任公告板" },
    Hindi: { title: "VIA भरोसा", detail: "सुरक्षा, उपलब्धता और रखरखाव", pending: "प्रोटोकॉल निगरानी अभी जुड़ी नहीं है", more: "विश्वास बोर्ड देखें" },
  }
  const t = copy[language] ?? copy.English
  return (
    <section aria-label={t.title} className="rounded-2xl border border-[#285f40]/70 bg-[#050806]/90 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
      <div className="flex items-center gap-2 text-[#9adbb2]"><ShieldCheck aria-hidden="true" size={17}/><h2 className="text-sm font-semibold">{t.title}</h2></div>
      <p className="mt-2 text-xs text-zinc-300">{t.detail}</p>
      <p className="mt-2 text-[11px] text-amber-200">{t.pending}</p>
      <Link href="/vertrouwen" className="mt-3 inline-flex text-xs text-[#9adbb2] underline underline-offset-4">{t.more}</Link>
    </section>
  )
}
