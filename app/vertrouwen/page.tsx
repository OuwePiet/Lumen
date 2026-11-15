import Link from "next/link"
import { ShieldCheck } from "lucide-react"

export const metadata = { title: "VIA Vertrouwen | VIA", description: "Publieke informatie over bereikbaarheid, onderhoud en veilig gebruik van VIA." }

export default function ViaTrustPage() {
  return (
    <main className="min-h-screen bg-[#020403] px-4 py-8 text-[#e9f0eb]">
      <div className="mx-auto max-w-2xl space-y-5">
        <Link href="/" className="text-sm text-[#9adbb2]">← VIA</Link>
        <header className="flex items-center gap-3"><ShieldCheck aria-hidden="true" className="text-[#9adbb2]"/><h1 className="text-2xl font-semibold">VIA Vertrouwen / VIA Trust</h1></header>
        <p className="text-sm leading-6 text-zinc-300">VIA deelt hier begrijpelijke informatie over veiligheid, onderhoud en bereikbaarheid. Een bereikbare node bewijst niet dat alle DeSo-functies of transacties veilig werken.</p>
        <section className="rounded-xl border border-[#285f40] p-4" aria-label="Controlestatus">
          <h2 className="font-semibold text-[#9adbb2]">Huidige controlestatus / Current checks</h2>
          <p className="mt-2 text-sm text-amber-200">Automatische publieke status- en protocolcontrole nog niet gekoppeld / Public automated status and protocol monitoring not connected yet.</p>
          <p className="mt-2 text-xs text-zinc-400">Geen actuele veiligheidsgarantie. Er wordt geen groen vinkje getoond zonder geverifieerde meting.</p>
        </section>
        <section className="space-y-2 rounded-xl border border-zinc-800 p-4">
          <h2 className="font-semibold">Veiligheid voor makers en community / Creator & community safety</h2>
          <ul className="list-inside list-disc space-y-2 text-sm text-zinc-300">
            <li>Deel nooit je herstelzin of privésleutel. / Never share a recovery phrase or private key.</li>
            <li>Controleer ontvanger, bedrag, royalties en machtigingen vóór ondertekening. / Verify recipients, amounts, royalties and permissions before signing.</li>
            <li>Wees voorzichtig met imitatieprofielen en onbekende links. / Beware of impersonation and unfamiliar links.</li>
            <li>Bij een vastgelopen betaling: controleer de blockchainstatus voordat je opnieuw probeert. / Check transaction status before retrying.</li>
          </ul>
        </section>
        <p className="text-xs text-zinc-500">Meer talen en geverifieerde incidenthistorie worden nog aangesloten. / More languages and verified incident history are pending.</p>
        <footer className="text-xs text-zinc-500">© @OuwePiet 2026</footer>
      </div>
    </main>
  )
}
