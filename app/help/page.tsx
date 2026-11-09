"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"

type Copy = { title: string; intro: string; building: string }

const COPY: Record<ViaLanguage | "Hindi", Copy> = {
  Dutch: { title: "Handboek VIA", intro: "Dit wordt het centrale handboek voor VIA.", building: "De inhoud wordt stap voor stap toegevoegd; deze vaste ingang blijft hetzelfde." },
  English: { title: "VIA Handbook", intro: "This will be the central handbook for VIA.", building: "Content will be added step by step; this permanent entry point stays the same." },
  French: { title: "Guide VIA", intro: "Ceci deviendra le guide central de VIA.", building: "Le contenu sera ajouté étape par étape ; ce point d’accès permanent restera le même." },
  Spanish: { title: "Guía VIA", intro: "Esta será la guía central de VIA.", building: "El contenido se añadirá paso a paso; este acceso permanente seguirá siendo el mismo." },
  Chinese: { title: "VIA 指南", intro: "这里将成为 VIA 的中央指南。", building: "内容会逐步添加；这个固定入口将保持不变。" },
  Hindi: { title: "VIA मार्गदर्शिका", intro: "यह VIA की केंद्रीय मार्गदर्शिका होगी।", building: "सामग्री चरण-दर-चरण जोड़ी जाएगी; यह स्थायी प्रवेश बिंदु वही रहेगा।" },
}

export default function HelpPage() {
  const [language, setLanguage] = useState<ViaLanguage>("English")

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
  const dutch = language === "Dutch"
  const topics = dutch ? [{title:"Postkantoor",text:"Kies Hot, Following of Recent. Schrijf een bericht, voeg foto, video of poll toe en verstuur met je DeSo-account. Via de berichtknoppen kun je reageren, delen, vertalen en diamanten geven.",href:"/social"},{title:"NFT’s verzamelen",text:"Zoek een maker of open je eigen collectie. Gebruik de filters en open een NFT om edities, eigenaar, biedingen en verkoopgegevens te bekijken.",href:"/collection"},{title:"Minten en kosten",text:"Open Studio, controleer je actieve account en de getoonde mintgegevens. Controleer kosten en royalties voordat je een blockchainactie bevestigt.",href:"/studio"},{title:"Wallet en account",text:"Bekijk je DESO-saldo in Wallet. Wissel van account via het profielmenu. Stel je taal en standaardfeed in bij Instellingen.",href:"/wallet"},{title:"Muziek en radio",text:"Luister naar Wereldradio en ontdek muziek en creators via VIA Play.",href:"/music"}] : [{title:"Post Office",text:"Choose Hot, Following or Recent. Add text, photos, video or a poll. Sign in with DeSo to publish and use the post actions to reply, share, translate or give Diamonds.",href:"/social"},{title:"Collect NFTs",text:"Find a creator or open your collection. Filter the collection and open an NFT to view editions, ownership, bids and sale details.",href:"/collection"},{title:"Mint and costs",text:"Open Studio and check the active account, mint details, costs and royalties before confirming a blockchain action.",href:"/studio"},{title:"Wallet and account",text:"View your DESO balance in Wallet. Switch accounts in the profile menu and set your language and default feed in Settings.",href:"/wallet"},{title:"Music and radio",text:"Listen to World Radio and discover music and creators through VIA Play.",href:"/music"}]

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl rounded-2xl border border-[#285f40]/70 bg-[#050806]/90 p-6 sm:p-8">
        <h1 className="text-3xl font-semibold tracking-tight">{copy.title}</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">{dutch ? "Zo gebruik je de belangrijkste onderdelen van VIA." : "How to use the main parts of VIA."}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">{topics.map(topic => <section key={topic.href} className="rounded-xl border border-zinc-800 p-4"><h2 className="font-semibold">{topic.title}</h2><p className="mt-2 text-sm leading-6 text-zinc-400">{topic.text}</p><Link href={topic.href} className="mt-3 inline-flex min-h-11 items-center text-sm text-[#9adbb2] underline">{dutch ? "Open" : "Open"} {topic.title}</Link></section>)}</div>
      </div>
    </main>
  )
}
