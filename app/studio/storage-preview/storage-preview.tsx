"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { FileImage, HardDrive, Globe, ShieldCheck, ArrowRight, Check, Layers } from "lucide-react"

type Route = "deso" | "external" | "ipfs" | "arweave"
const routes: Array<{ id: Route; title: string; subtitle: string; note: string }> = [
  { id: "deso", title: "DeSo", subtitle: "De vertrouwde route", note: "Gebruik de bestaande DeSo-upload. Je NFT wordt een native DeSo-NFT." },
  { id: "external", title: "Eigen of externe opslag", subtitle: "Je bestand, jouw opslagkeuze", note: "Bewaar het bestand op je eigen publieke server of bij een dienst zoals Cloudflare R2. Gebruik hier de vaste HTTPS-bestandslink." },
  { id: "ipfs", title: "IPFS", subtitle: "Een adres op basis van de inhoud", note: "Gebruik een bestaande IPFS-verwijzing. Zorg dat het bestand blijvend gepind is; een link alleen bewaart het niet." },
  { id: "arweave", title: "Arweave", subtitle: "Bestaand duurzaam opgeslagen bestand", note: "Gebruik de link van een bestand dat je al bij Arweave hebt opgeslagen. Upload en betaling bij de provider blijven een afzonderlijke stap." },
]
const steps = ["Bestand & uitleg", "Opslag kiezen", "NFT instellen", "Overzicht"]
const panel = "rounded-2xl border border-[#264333] bg-[#0a130e] p-5 sm:p-7"
const field = "mt-2 min-h-12 w-full min-w-0 rounded-xl border border-[#34513f] bg-[#050b07] p-3 text-base text-white focus:outline-2 focus:outline-[#8fd4a9]"
const button = "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#568d68] bg-[#173624] px-5 py-3 font-medium text-[#d9f6e3] disabled:cursor-not-allowed disabled:opacity-40"

function validReference(route: Route, value: string) {
  if (route === "deso") return true
  if (route === "ipfs" && /^ipfs:\/\/[a-zA-Z0-9]+(?:\/[^\s]*)?$/.test(value) && !value.includes("..")) return true
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password }
  catch { return false }
}

export default function StoragePreview() {
  const [step, setStep] = useState(0)
  const [route, setRoute] = useState<Route>("deso")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [reference, setReference] = useState("")
  const [copies, setCopies] = useState("1")
  const [sale, setSale] = useState("collection")
  const [acknowledged, setAcknowledged] = useState(false)
  const [notice, setNotice] = useState("")
  useEffect(() => {
    if (!file || !file.type.startsWith("image/") || file.type === "image/svg+xml") { setPreview(""); return }
    const url = URL.createObjectURL(file); setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])
  const choice = routes.find(item => item.id === route)!
  const routeReady = validReference(route, reference.trim())
  const canAdvance = step === 0 ? title.trim().length > 0 && Boolean(file || reference.trim()) : step === 1 ? routeReady : step === 2 ? /^\d+$/.test(copies) && Number(copies) >= 1 && Number(copies) <= 10000 : false
  return <main className="min-h-screen bg-[#050a07] px-4 py-6 text-[#e6eee8] sm:px-8" data-storage-preview>
    <div className="mx-auto max-w-6xl">
      <nav className="flex flex-wrap items-center justify-between gap-3 text-sm" aria-label="NFT voorbeeldnavigatie"><Link href="/collection" className="inline-flex min-h-11 items-center text-[#a8d7b7]">← NF.VIA</Link><span className="rounded-full border border-[#35533f] px-3 py-2 text-[#b0c3b5]">Bekijkbaar voorbeeld · niets wordt verzonden</span></nav>
      <header className="mb-7 mt-7 max-w-3xl"><p className="text-xs font-semibold tracking-[.2em] text-[#91cba3]">NF.VIA · MAKEN & BEWAREN</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Jouw werk. Jouw opslag.</h1><p className="mt-4 text-base leading-7 text-[#acbdb1]">Maak een DeSo-NFT en kies waar het bijbehorende bestand wordt bewaard. Je originele bestand blijft van jou. VIA helpt je het te tonen en te openen.</p></header>
      <ol className="mb-7 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Stappen">{steps.map((label, index) => <li key={label}><button type="button" disabled={index > step} onClick={() => { setStep(index); setNotice("") }} aria-current={step === index ? "step" : undefined} className={`flex min-h-14 w-full items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm ${index === step ? "border-[#87c49a] bg-[#183322] text-white" : "border-[#23392b] text-[#92a597]"}`}><span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current">{index < step ? <Check size={14} /> : index + 1}</span>{label}</button></li>)}</ol>
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className={`${panel} min-w-0`} aria-labelledby="storage-step-heading">
          <h2 id="storage-step-heading" className="text-2xl font-semibold">{steps[step]}</h2>
          {step === 0 ? <div className="mt-5 grid gap-5">
            <label className="block rounded-xl border border-dashed border-[#50795c] bg-[#102017] p-5"><FileImage size={28} className="mb-3 text-[#9bd8af]" /><span className="block font-medium">Kies je bestand</span><span className="mt-1 block text-sm leading-6 text-[#a7b9ad]">Afbeelding, video, audio, boek of ander digitaal bestand. Het kiezen van een bestand uploadt nog niets.</span><input type="file" className="mt-4 block w-full min-w-0 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#254c32] file:p-3 file:text-white" onChange={event => { setFile(event.target.files?.[0] ?? null); setNotice("") }} /></label>
            <p className="text-sm text-[#a7b9ad]">Heb je al een publiek bestand? Vul hieronder de link in. Je kunt de opslagkeuze in de volgende stap aanpassen.</p>
            <label>Bestandslink <span className="text-sm text-[#92a597]">(optioneel bij een lokaal bestand)</span><input type="text" value={reference} onChange={event => setReference(event.target.value)} placeholder="https://… of ipfs://…" className={field} /></label>
            <label>Titel<input value={title} maxLength={120} onChange={event => setTitle(event.target.value)} className={field} placeholder="Geef je werk een naam" /></label>
            <label>Beschrijving<textarea value={description} maxLength={5000} onChange={event => setDescription(event.target.value)} className={field} rows={4} placeholder="Vertel wat je hebt gemaakt en wat de verzamelaar krijgt." /></label>
          </div> : null}
          {step === 1 ? <div className="mt-5">
            <p className="mb-5 leading-7 text-[#acbdb1]">Waar staat het bestand dat bezoekers straks kunnen openen? Bewaar daarnaast zelf een origineel op je computer, SSD of NAS.</p>
            <div className="grid gap-3 sm:grid-cols-2">{routes.map(item => <button type="button" key={item.id} aria-pressed={route === item.id} onClick={() => { setRoute(item.id); setAcknowledged(false) }} className={`min-h-32 rounded-xl border p-4 text-left ${route === item.id ? "border-[#8fd4a9] bg-[#193423]" : "border-[#304637] bg-[#080f0b]"}`}><span className="flex items-center justify-between gap-2 font-semibold">{item.title}{route === item.id ? <Check size={18} /> : null}</span><span className="mt-2 block text-sm leading-6 text-[#aebfb3]">{item.subtitle}</span></button>)}</div>
            <p className="mt-5 rounded-xl bg-[#132219] p-4 text-sm leading-7">{choice.note}</p>
            {route !== "deso" ? <label className="mt-5 block">{route === "ipfs" ? "IPFS-verwijzing of HTTPS-gatewaylink" : route === "arweave" ? "Arweave-bestandslink" : "Openbare HTTPS-bestandslink"}<input aria-label={route === "ipfs" ? "IPFS-verwijzing of HTTPS-gatewaylink" : route === "arweave" ? "Arweave-bestandslink" : "Openbare HTTPS-bestandslink"} aria-invalid={Boolean(reference) && !routeReady} aria-describedby={reference && !routeReady ? "storage-reference-error" : undefined} type="text" value={reference} onChange={event => setReference(event.target.value)} className={field} placeholder={route === "ipfs" ? "ipfs://…" : "https://…"} />{reference && !routeReady ? <span id="storage-reference-error" role="alert" className="mt-2 block text-sm text-amber-200">Gebruik een geldige publieke bestandslink zonder gebruikersnaam of wachtwoord.</span> : null}</label> : null}
            <details className="mt-5 rounded-xl border border-[#304637] p-4"><summary className="cursor-pointer font-medium">Wat kost opslag en wie beheert mijn bestand?</summary><div className="mt-3 space-y-3 text-sm leading-7 text-[#b0c1b5]"><p>Je betaalt een eventuele externe opslagdienst rechtstreeks. VIA toont geen verzonnen prijs of gratis-voor-altijdbelofte. DeSo-netwerkkosten en eventuele VIA-dienstkosten worden vóór een echte actie apart getoond.</p><p>Eigen opslag en R2 vragen doorlopend beheer. IPFS vraagt blijvende pinning. Bij een bestaande Arweave-link is de opslag eerder bij die provider geregeld. VIA neemt je opslagaccount of originele bestand niet over.</p><Link href="/storage" className="inline-flex min-h-11 items-center text-[#a5dfb8] underline">Bekijk externe opslagmogelijkheden</Link></div></details>
          </div> : null}
          {step === 2 ? <div className="mt-5 grid gap-5"><p className="leading-7 text-[#acbdb1]">Na het bestand volgen de NFT-instellingen. De echte mintflow controleert aantallen, royalties en actuele netwerkkosten via DeSo.</p><label>Aantal edities<input inputMode="numeric" value={copies} onChange={event => setCopies(event.target.value)} className={field} /></label><fieldset><legend className="mb-3">Wat wil je met de NFT doen?</legend><div className="grid gap-3">{[["collection", "Eerst in mijn collectie bewaren"], ["bid", "Biedingen ontvangen"], ["buy-now", "Direct kopen aanbieden"]].map(([value, label]) => <label key={value} className="flex min-h-12 items-center gap-3 rounded-xl border border-[#304637] p-3"><input type="radio" name="sale" checked={sale === value} onChange={() => setSale(value)} />{label}</label>)}</div></fieldset><p className="rounded-xl bg-[#132219] p-4 text-sm leading-7 text-[#afc2b5]">Royaltypercentages, verkoopbedragen en eventuele extra rechten blijven bewuste keuzes in de echte mintflow. Dit voorbeeld verandert geen bestaande bedragen of ontvangers.</p></div> : null}
          {step === 3 ? <div className="mt-5"><p className="mb-5 leading-7 text-[#acbdb1]">Zo komt de laatste controle eruit te zien. Er is nog geen bestand geüpload, bronpost geplaatst of NFT gemint.</p><dl className="grid gap-4">{[["Werk", title], ["Bestand", file?.name || "Bestaande bestandslink"], ["Opslag", choice.title], ["Verwijzing", route === "deso" ? "DeSo-link volgt na succesvolle upload" : reference], ["Edities", copies], ["Verkoop", sale === "collection" ? "Nog niet te koop" : sale === "bid" ? "Biedingen" : "Direct kopen"]].map(([label, value]) => <div key={label} className="border-b border-[#24392b] pb-3"><dt className="text-sm text-[#91a698]">{label}</dt><dd className="mt-1 break-all">{value}</dd></div>)}</dl><p className="mt-5 text-sm leading-7 text-[#a7b9ad]">Opslagkosten: bij je gekozen provider. Actuele DeSo-netwerkkosten: nog niet opgevraagd. Eventuele VIA-dienstkosten: apart te tonen vóór goedkeuring. In dit voorbeeld is niets verschuldigd.</p><label className="mt-5 flex gap-3 text-sm leading-6"><input type="checkbox" checked={acknowledged} onChange={event => setAcknowledged(event.target.checked)} className="mt-1" />Ik begrijp dat dit een voorbeeld is en dat bestandopslag, bronpost en minten afzonderlijke stappen zijn.</label><button type="button" disabled={!acknowledged} onClick={() => setNotice("Voorbeeld bekeken. Er is niets geüpload, betaald, ondertekend of gemint. Je kunt nu terug naar de bestaande mintflow.")} className={`${button} mt-5`}>Bekijk afronding</button>{notice ? <p role="status" className="mt-4 rounded-xl bg-[#173624] p-4 text-sm leading-7">{notice}</p> : null}<Link href="/studio#mint-nft" className="mt-4 flex min-h-11 items-center gap-2 text-[#a5dfb8] underline">Naar de bestaande mintflow <ArrowRight size={16} /></Link></div> : null}
          <div className="mt-7 flex flex-wrap justify-between gap-3 border-t border-[#294231] pt-5"><button type="button" disabled={step === 0} onClick={() => setStep(value => value - 1)} className="min-h-12 rounded-xl border border-[#35533f] px-5 py-3 disabled:opacity-30">Vorige</button>{step < 3 ? <button type="button" disabled={!canAdvance} onClick={() => setStep(value => Math.min(3, value + 1))} className={button}>Volgende <ArrowRight size={17} /></button> : null}</div>
        </section>
        <aside className="grid min-w-0 content-start gap-4">
          <section className={panel}><h2 className="mb-4 font-semibold">Je werk in beeld</h2><div className="flex min-h-44 items-center justify-center overflow-hidden rounded-xl border border-[#294231] bg-[#102017]">{preview ? <img src={preview} alt="Lokaal voorbeeld van je gekozen bestand" className="max-h-72 w-full object-contain" /> : <FileImage size={44} className="text-[#6c987b]" />}</div><p className="mt-4 break-words font-medium">{title || "Jouw NFT-titel"}</p><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#9eb2a5]">{description || "Je beschrijving komt hier."}</p>{file ? <p className="mt-3 break-all text-xs text-[#9eb2a5]">{file.name} · {new Intl.NumberFormat("nl-NL").format(file.size)} bytes · alleen lokaal geselecteerd</p> : null}</section>
          <section className={`${panel} space-y-4 text-sm leading-6`}><p className="flex gap-3"><HardDrive size={20} className="shrink-0 text-[#91cba3]" />Bewaar zelf je originele bestand.</p><p className="flex gap-3"><Globe size={20} className="shrink-0 text-[#91cba3]" />De media staat bij DeSo of jouw opslagprovider.</p><p className="flex gap-3"><Layers size={20} className="shrink-0 text-[#91cba3]" />De NFT en het eigendom worden op DeSo vastgelegd.</p><p className="flex gap-3"><ShieldCheck size={20} className="shrink-0 text-[#91cba3]" />DeSo Identity blijft leidend voor echte goedkeuring.</p></section>
        </aside>
      </div>
      <details className={`${panel} mt-6 text-sm leading-7`}><summary className="cursor-pointer font-medium">Waarom deze stappen? De eerdere afspraken en NFTz als referentie</summary><p className="mt-4 text-[#afc2b5]">De VIA-opzet volgt de afgesproken scheiding tussen het originele bestand, publieke mediaopslag en de DeSo-NFT. De historische NFTz-handleiding beschreef eveneens een aparte opslagkeuze en een bestaande Arweave-link. Dit voorbeeld neemt die begrijpelijke volgorde mee in de eigen VIA-vormgeving.</p><div className="mt-3 flex flex-wrap gap-x-6 gap-y-2"><a className="inline-flex min-h-11 items-center text-[#a5dfb8] underline" href="https://help.nftz.zone/beginners-guide/nft/selling-nft-intro/how-do-you-mint-sell-an-nft" target="_blank" rel="noopener noreferrer">Historische NFTz-mintinstructie</a><a className="inline-flex min-h-11 items-center text-[#a5dfb8] underline" href="https://help.nftz.zone/beginners-guide/nft/selling-nft-intro/how-to-use-an-arweave-link-advanced" target="_blank" rel="noopener noreferrer">NFTz: bestaande Arweave-link</a><a className="inline-flex min-h-11 items-center text-[#a5dfb8] underline" href="https://docs.deso.org/deso-features/social-nfts" target="_blank" rel="noopener noreferrer">Officiële DeSo-NFT-uitleg</a></div></details>
    </div>
  </main>
}
