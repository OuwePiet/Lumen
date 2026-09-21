"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SaveButton from "../saved/save-button";
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings";

const topics = [
  ["start-with-via", "Start with VIA", "VIA से शुरुआत", "Simple guides to the different VIA environments and visitor choices.", "VIA के अलग-अलग हिस्सों और विज़िटर विकल्पों के लिए सरल मार्गदर्शिकाएँ।"],
  ["deso", "DeSo", "DeSo", "Understand profiles, posts, public keys and the DeSo social layer without unnecessary jargon.", "अनावश्यक तकनीकी शब्दों के बिना profiles, posts, public keys और DeSo social layer को समझें।"],
  ["nfts", "NFTs", "NFTs", "Learn what an NFT is, ownership, editions, royalties and what VIA can and cannot do.", "जानें कि NFT क्या है, ownership, editions, royalties और VIA क्या कर सकता है तथा क्या नहीं।"],
  ["safety", "Safety", "सुरक्षा", "Recognise phishing, protect wallet access and understand why VIA never asks for seed words.", "Phishing पहचानें, wallet access सुरक्षित रखें और समझें कि VIA कभी seed words क्यों नहीं मांगता।"],
  ["creators", "Creators", "क्रिएटर्स", "Practical explanations for publishing, discovery, Studio and creator tools.", "Publishing, discovery, Studio और creator tools के लिए व्यावहारिक जानकारी।"],
  ["technology", "Technology", "तकनीक", "Clear background on decentralised social, storage, privacy and new platform technology.", "Decentralised social, storage, privacy और नई platform technology की स्पष्ट पृष्ठभूमि।"],
];

export default function LearnPage() {
  const [language, setLanguage] = useState<ViaLanguage | "Hindi">("English");

  useEffect(() => {
    const refresh = () => setLanguage(readViaLocalSettings().interfaceLanguage);
    refresh();
    window.addEventListener(VIA_SETTINGS_EVENT, refresh);
    return () => window.removeEventListener(VIA_SETTINGS_EVENT, refresh);
  }, []);

  const hindi = language === "Hindi";

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#8fd4a9]">VIA</p><h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{hindi ? "सीखें" : "Learn"}</h1><p className="mt-3 max-w-2xl text-zinc-400">{hindi ? "VIA, DeSo और creator technology को सरल भाषा में समझें।" : "Understand VIA, DeSo and creator technology in ordinary language."}</p></div><div className="flex flex-wrap gap-2"><Link href="/saved" className="rounded-full border border-zinc-700 px-4 py-2 text-sm hover:border-[#8fd4a9]/70 hover:text-[#9adbb2]">{hindi ? "सहेजे गए" : "Saved"}</Link><Link href="/my-via" className="rounded-full border border-zinc-700 px-4 py-2 text-sm hover:border-[#8fd4a9]/70 hover:text-[#9adbb2]">My VIA</Link></div></header>
        <section className="mb-6 rounded-2xl border border-[#285f40]/60 bg-zinc-950 p-5"><h2 className="text-lg text-[#9adbb2]">{hindi ? "ज्ञान, वित्तीय प्रचार नहीं" : "Knowledge, not financial promotion"}</h2><p className="mt-2 text-sm leading-6 text-zinc-400">{hindi ? "Learn स्पष्टीकरण और व्यावहारिक मार्गदर्शन के लिए है। शैक्षिक सामग्री Sponsored content से स्पष्ट रूप से अलग होनी चाहिए और speculation को guaranteed earnings या investment advice के रूप में प्रस्तुत नहीं करना चाहिए।" : "Learn is for explanations and practical guidance. Educational material must be distinguishable from Sponsored content and must not present speculation as guaranteed earnings or investment advice."}</p><p className="mt-2 text-xs leading-5 text-zinc-500">{hindi ? "किसी topic को सहेजना वैकल्पिक है, केवल इसी browser में रहता है और sensitive interests का अनुमान लगाने के लिए उपयोग नहीं होता।" : "Saving a topic is optional, browser-local and not used to infer sensitive interests."}</p></section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{topics.map(([id,title,hindiTitle,text,hindiText]) => <section id={id} key={title} className="scroll-mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-5"><h2 className="text-lg font-medium">{hindi ? hindiTitle : title}</h2><p className="mt-2 text-sm leading-6 text-zinc-400">{hindi ? hindiText : text}</p><p className="mt-5 text-xs uppercase tracking-wider text-zinc-600">{hindi ? "ज्ञान मार्ग" : "Knowledge track"}</p><div className="mt-4"><SaveButton title={`VIA Learn · ${hindi ? hindiTitle : title}`} href={`/learn#${id}`} kind="Knowledge" /></div></section>)}</div>
      </div>
    </main>
  );
}
