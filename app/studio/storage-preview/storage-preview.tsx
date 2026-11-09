"use client"

import Link from "next/link"
import NFTInfo from "../../nft-info"
import { useEffect, useState } from "react"
import { FileImage, ArrowRight, Check } from "lucide-react"

type Route = "deso" | "external" | "own"
const routes: Array<{ id: Route; title: string; note: string }> = [
  { id: "deso", title: "DeSo-opslag", note: "Kies een afbeelding voor de bestaande DeSo-upload." },
  { id: "external", title: "Externe opslag", note: "Gebruik een bestaande link van je opslagdienst, zoals Arweave of IPFS." },
  { id: "own", title: "Eigen opslag", note: "Gebruik een publieke HTTPS-link naar een bestand dat je zelf beheert." },

]
const steps = ["Opslag", "Gegevens", "NFT maken"]
const panel = "rounded-2xl border border-[#264333] bg-[#0a130e] p-3 sm:p-4"
const field = "mt-2 min-h-12 w-full min-w-0 rounded-xl border border-[#34513f] bg-[#050b07] p-3 text-base text-white focus:outline-2 focus:outline-[#8fd4a9]"
const button = "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#568d68] bg-[#173624] px-5 py-3 font-medium text-[#d9f6e3] disabled:cursor-not-allowed disabled:opacity-40"

function validReference(route: Route, value: string) {
  if (route === "deso") return true
  if (route === "external" && /^ipfs:\/\/[a-zA-Z0-9]+(?:\/[^\s]*)?$/.test(value) && !value.includes("..")) return true
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
  const copiesValid = /^\d+$/.test(copies) && Number(copies) >= 1 && Number(copies) <= 10000
  const canAdvance = step === 0 ? (route === "deso" ? Boolean(file) : routeReady) : title.trim().length > 0
  return <main className="min-h-screen bg-[#050a07] px-3 py-3 text-[#e6eee8] sm:px-8" data-storage-preview>
    <div className="mx-auto max-w-6xl">
      <nav className="flex flex-wrap items-center justify-between gap-3 text-sm" aria-label="NFT voorbeeldnavigatie"><Link href="/collection" className="inline-flex min-h-11 items-center text-[#a8d7b7]">← NF.VIA</Link><span className="rounded-full border border-[#35533f] px-3 py-2 text-[#b0c3b5]">Bekijkbaar voorbeeld · niets wordt verzonden</span></nav>
      <header className="my-3"><h1 className="text-2xl font-semibold">Jouw werk. Jouw opslag.</h1></header>
      <ol className="mb-3 grid grid-cols-3 gap-1.5" aria-label="Stappen">{steps.map((label, index) => <li key={label}><button type="button" disabled={index > step} onClick={() => { setStep(index); setNotice("") }} aria-current={step === index ? "step" : undefined} className={`flex min-h-11 w-full items-center gap-1.5 rounded-xl border px-2 py-1.5 text-left text-sm ${index === step ? "border-[#87c49a] bg-[#183322] text-white" : "border-[#23392b] text-[#92a597]"}`}><span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current">{index < step ? <Check size={14} /> : index + 1}</span>{label}</button></li>)}</ol>
      <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
        <section className={`${panel} min-w-0`} aria-labelledby="storage-step-heading">
          <h2 id="storage-step-heading" className="text-2xl font-semibold">{steps[step]}</h2>
          {step === 0 ? <div className="mt-3 grid gap-3">
            <div className="grid grid-cols-3 gap-1.5">
              {routes.map(item => <button type="button" key={item.id} aria-pressed={route === item.id}
                onClick={() => { if (route !== item.id) { setRoute(item.id); setReference(""); setAcknowledged(false) } }}
                className={`min-h-11 rounded-xl border px-2 py-2 text-sm ${route === item.id ? "border-[#8fd4a9] bg-[#193423]" : "border-[#304637]"}`}>
                {item.title}
              </button>)}
            </div>
            <p className="text-sm text-[#acbdb1]">{choice.note}</p>
            {route === "deso" ? <label>Kies je bestand
              <input type="file" accept="image/gif,image/jpeg,image/png,image/webp" className="mt-2 block w-full min-w-0 text-sm"
                onChange={event => setFile(event.target.files?.[0] ?? null)} />
              {file ? <span className="mt-1 block break-all text-xs">{file.name}</span> : null}
            </label> : <label>Openbare bestandslink
              <input className={field} value={reference} onChange={event => setReference(event.target.value)}
                placeholder={route === "external" ? "https://… of ipfs://…" : "https://…"} aria-invalid={Boolean(reference) && !routeReady} />
              {reference && !routeReady ? <span role="alert" className="mt-1 block text-sm text-amber-200">Gebruik een geldige publieke bestandslink.</span> : null}
            </label>}
            <details className="text-sm text-[#b0c1b5]">
              <summary className="cursor-pointer">Opslagkosten en beheer</summary>
              <p className="mt-2">De opslagdienst en DeSo-mintkosten zijn afzonderlijke stappen. Een IPFS-bestand moet beschikbaar blijven via pinning. Bewaar zelf een reservekopie.</p>
              <Link href="/storage" className="underline">Externe opslagmogelijkheden</Link>
            </details>
          </div> : null}
          {step === 1 ? <div className="mt-3 grid gap-3">
            <label>Titel<input value={title} maxLength={120} onChange={event => setTitle(event.target.value)} className={field} /></label>
            <label>Beschrijving<textarea value={description} maxLength={5000} onChange={event => setDescription(event.target.value)} className={field} rows={3} /></label>
          </div> : null}
          {step === 2 ? <div className="mt-3 grid gap-3"><label>Aantal edities<input inputMode="numeric" value={copies} onChange={event => setCopies(event.target.value)} className={field} /></label><fieldset><legend className="mb-3">Wat wil je met de NFT doen?</legend><div className="grid gap-3">{[["collection", "Eerst in mijn collectie bewaren"], ["bid", "Biedingen ontvangen"], ["buy-now", "Direct kopen aanbieden"]].map(([value, label]) => <label key={value} className="flex min-h-12 items-center gap-3 rounded-xl border border-[#304637] p-3"><input type="radio" name="sale" checked={sale === value} onChange={() => setSale(value)} />{label}</label>)}</div></fieldset></div> : null}
          {step === 2 ? <div className="mt-5"><p className="mb-5 leading-7 text-[#acbdb1]">Zo komt de laatste controle eruit te zien. Er is nog geen bestand geüpload, bronpost geplaatst of NFT gemint.</p><dl className="grid gap-x-4 gap-y-2 sm:grid-cols-2">{[["Werk", title], ["Bestand", route === "deso" ? file?.name : "Bestaande bestandslink"], ["Opslag", choice.title], ["Verwijzing", route === "deso" ? "DeSo-link volgt na succesvolle upload" : reference], ["Edities", copies], ["Verkoop", sale === "collection" ? "Nog niet te koop" : sale === "bid" ? "Biedingen" : "Direct kopen"]].map(([label, value]) => <div key={label} className="border-b border-[#24392b] pb-3"><dt className="text-sm text-[#91a698]">{label}</dt><dd className="mt-1 break-all">{value}</dd></div>)}</dl><p className="mt-5 text-sm leading-7 text-[#a7b9ad]">Opslagkosten: bij je gekozen provider. Actuele DeSo-netwerkkosten: nog niet opgevraagd. Eventuele VIA-dienstkosten: apart te tonen vóór goedkeuring. In dit voorbeeld is niets verschuldigd.</p><label className="mt-5 flex gap-3 text-sm leading-6"><input type="checkbox" checked={acknowledged} onChange={event => setAcknowledged(event.target.checked)} className="mt-1" />Ik begrijp dat dit een voorbeeld is en dat bestandopslag, bronpost en minten afzonderlijke stappen zijn.</label><button type="button" disabled={!acknowledged || !copiesValid} onClick={() => setNotice("Voorbeeld bekeken. Er is niets geüpload, betaald, ondertekend of gemint. Je kunt nu terug naar de bestaande mintflow.")} className={`${button} mt-5`}>Bekijk afronding</button>{notice ? <p role="status" className="mt-4 rounded-xl bg-[#173624] p-4 text-sm leading-7">{notice}</p> : null}<Link href="/studio#mint-nft" className="mt-4 flex min-h-11 items-center gap-2 text-[#a5dfb8] underline">Naar de bestaande mintflow <ArrowRight size={16} /></Link></div> : null}
          <div className="mt-7 flex flex-wrap justify-between gap-3 border-t border-[#294231] pt-5"><button type="button" disabled={step === 0} onClick={() => setStep(value => value - 1)} className="min-h-12 rounded-xl border border-[#35533f] px-5 py-3 disabled:opacity-30">Vorige</button>{step < 2 ? <button type="button" disabled={!canAdvance} onClick={() => setStep(value => Math.min(2, value + 1))} className={button}>Volgende <ArrowRight size={17} /></button> : null}</div>
        </section>
        <aside className="grid min-w-0 content-start gap-4">
          <section className={panel}><h2 className="mb-4 font-semibold">Je werk in beeld</h2><div className="flex min-h-44 items-center justify-center overflow-hidden rounded-xl border border-[#294231] bg-[#102017]">{preview && route === "deso" ? <img src={preview} alt="Lokaal voorbeeld van je gekozen bestand" className="max-h-72 w-full object-contain" /> : <FileImage size={44} className="text-[#6c987b]" />}</div><p className="mt-4 break-words font-medium">{title || "Jouw NFT-titel"}</p><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#9eb2a5]">{description || "Je beschrijving komt hier."}</p>{file && route === "deso" ? <p className="mt-3 break-all text-xs text-[#9eb2a5]">{file.name} · {new Intl.NumberFormat("nl-NL").format(file.size)} bytes · alleen lokaal geselecteerd</p> : null}</section>
        </aside>
      </div>
      <details className="mt-3 rounded-xl border border-[#294231] px-3 py-2">
        <summary className="min-h-9 cursor-pointer py-2 text-sm text-[#9adbb2]">Info · NFT, eigendom en kosten</summary>
        <NFTInfo />
      </details>
    </div>
  </main>
}
