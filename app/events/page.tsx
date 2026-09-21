"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SaveButton from "../saved/save-button";
import XShareButton from "../x-share-button";
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings";

const eventTypes = [
  ["live", "Live", "लाइव", "Community talks, interviews and VIA LIVE sessions.", "कम्युनिटी वार्ताएँ, इंटरव्यू और VIA LIVE सत्र।"],
  ["art-nft", "Art & NFT", "कला और NFT", "Exhibitions, drops and creator-led collection moments.", "प्रदर्शनियाँ, drops और क्रिएटर द्वारा संचालित collection moments।"],
  ["music", "Music", "संगीत", "Listening sessions, releases and public music events.", "Listening sessions, releases और सार्वजनिक संगीत कार्यक्रम।"],
  ["community", "Community", "कम्युनिटी", "Meetups and public initiatives shared by communities.", "कम्युनिटी द्वारा साझा meetups और सार्वजनिक पहल।"],
  ["games", "Games", "गेम्स", "World Quest moments, challenges and casual VIA events.", "World Quest moments, challenges और सहज VIA events।"],
  ["learning", "Learning", "सीखना", "Public explainers, workshops and knowledge sessions.", "सार्वजनिक explainers, workshops और knowledge sessions।"],
];

export default function EventsPage() {
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
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#8fd4a9]">VIA</p><h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{hindi ? "इवेंट्स" : "Events"}</h1><p className="mt-3 max-w-2xl text-zinc-400">{hindi ? "होमपेज को notice board बनाए बिना जानें कि क्या हो रहा है।" : "Discover what is happening without turning the homepage into a notice board."}</p></div>
          <div className="flex flex-wrap gap-2"><Link href="/saved" className="rounded-full border border-zinc-700 px-4 py-2 text-sm hover:border-[#8fd4a9]/70 hover:text-[#9adbb2]">{hindi ? "सहेजे गए" : "Saved"}</Link><Link href="/my-via" className="rounded-full border border-zinc-700 px-4 py-2 text-sm hover:border-[#8fd4a9]/70 hover:text-[#9adbb2]">My VIA</Link></div>
        </header>
        <section className="mb-6 rounded-2xl border border-[#285f40]/60 bg-zinc-950 p-5"><h2 className="text-lg text-[#9adbb2]">{hindi ? "विज़िटर के नियंत्रण में खोज" : "Visitor-controlled discovery"}</h2><p className="mt-2 text-sm leading-6 text-zinc-400">{hindi ? "Events सार्वजनिक event information या विज़िटर द्वारा चुनी गई location का उपयोग करेंगे। VIA विज़िटर की location का चुपचाप अनुमान नहीं लगाएगा। Publishing, RSVP और ticket/payment functions इस foundation में सक्रिय नहीं हैं।" : "Events will use public event information or location chosen by the visitor. VIA will not silently infer a visitor's location. Publishing, RSVP and ticket/payment functions are not active in this foundation."}</p><p className="mt-2 text-xs leading-5 text-zinc-500">{hindi ? "किसी event category को सहेजना वैकल्पिक है और यह इसी browser में रहता है।" : "Saving an event category is optional and stays in this browser."}</p></section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{eventTypes.map(([id,title,hindiTitle,description,hindiDescription]) => <section id={id} key={title} className="scroll-mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-5"><h2 className="text-lg font-medium">{hindi ? hindiTitle : title}</h2><p className="mt-2 text-sm leading-6 text-zinc-400">{hindi ? hindiDescription : description}</p><p className="mt-5 text-xs uppercase tracking-wider text-zinc-600">{hindi ? "इवेंट खोज की बुनियाद" : "Event discovery foundation"}</p><div className="mt-4 flex flex-wrap gap-2"><SaveButton title={`VIA Events · ${hindi ? hindiTitle : title}`} href={`/events#${id}`} kind="Event" /><XShareButton href={`/events#${id}`} text={`VIA Events · ${hindi ? hindiTitle : title}`} label="X" className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-[#8fd4a9]/70 hover:text-[#9adbb2]" /></div></section>)}</div>
      </div>
    </main>
  );
}
