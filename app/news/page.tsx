"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings";

const sections = [
  { title: "World", hindi: "दुनिया", text: "International headlines and developments from around the world.", hindiText: "दुनिया भर की अंतरराष्ट्रीय सुर्खियाँ और घटनाक्रम।" },
  { title: "Technology", hindi: "तकनीक", text: "Technology, digital culture and important new developments.", hindiText: "तकनीक, डिजिटल संस्कृति और महत्वपूर्ण नए घटनाक्रम।" },
  { title: "DeSo & Crypto", hindi: "DeSo और Crypto", text: "News around DeSo, creators, decentralized social and crypto.", hindiText: "DeSo, creators, decentralized social और crypto से जुड़ी खबरें।" },
  { title: "Art & Culture", hindi: "कला और संस्कृति", text: "Art, photography, culture and creative work.", hindiText: "कला, photography, संस्कृति और रचनात्मक कार्य।" },
  { title: "Music", hindi: "संगीत", text: "Music news, artists and discoveries.", hindiText: "संगीत समाचार, कलाकार और नई खोजें।" },
  { title: "Science", hindi: "विज्ञान", text: "Research, science and discoveries explained clearly.", hindiText: "Research, विज्ञान और खोजों की स्पष्ट व्याख्या।" },
];

export default function DailyNewsPage() {
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
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-[#8fd4a9]">VIA</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{hindi ? "दैनिक समाचार" : "Daily News"}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">{hindi ? "दुनिया को अपने तरीके से पढ़ें। समाचार और खोज के लिए VIA का अलग वातावरण।" : "Read the world, your way. A separate VIA environment for news and discovery."}</p>
          </div>
          <Link href="/" className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-[#8fd4a9]/70 hover:text-[#9adbb2]">{hindi ? "VIA पर वापस जाएँ" : "Back to VIA"}</Link>
        </div>

        <section className="mb-8 rounded-2xl border border-[#285f40]/60 bg-zinc-950 p-5">
          <h2 className="text-lg font-medium text-[#9adbb2]">{hindi ? "होमपेज पर हावी हुए बिना समाचार" : "News without taking over your homepage"}</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{hindi ? "Daily News इस पूरे पेज पर रहता है। VIA स्रोत का श्रेय और छोटे सारांश दिखाएगा और विज़िटर्स को मूल प्रकाशन से जोड़ेगा। News, community posts और Sponsored content स्पष्ट रूप से अलग रहेंगे।" : "Daily News lives on this full page. VIA will show source attribution and short summaries and link visitors to the original publication. News, community posts and Sponsored content remain clearly separate."}</p>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <h2 className="text-lg font-medium text-white">{hindi ? section.hindi : section.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{hindi ? section.hindiText : section.text}</p>
              <p className="mt-5 text-xs uppercase tracking-wider text-zinc-600">{hindi ? "समाचार स्रोत अगली चरण में" : "News sources coming next"}</p>
            </section>
          ))}
        </div>

        <p className="mt-8 text-xs leading-5 text-zinc-600">{hindi ? "VIA पूरे समाचार लेख दोबारा प्रकाशित नहीं करता। Live source selection, language/country controls और daily summaries केवल उपयुक्त source और attribution handling उपलब्ध होने पर जोड़े जाएंगे।" : "VIA does not republish complete news articles. Live source selection, language/country controls and daily summaries will be added only with suitable source and attribution handling."}</p>
      </div>
    </main>
  );
}
