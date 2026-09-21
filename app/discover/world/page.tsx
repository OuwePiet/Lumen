"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../../via-local-settings"

const regions = [
  { name: "Europe", hindi: "यूरोप", countries: [["Netherlands", "नीदरलैंड"], ["Germany", "जर्मनी"], ["United Kingdom", "यूनाइटेड किंगडम"]] },
  { name: "North America", hindi: "उत्तरी अमेरिका", countries: [["United States", "संयुक्त राज्य अमेरिका"], ["Canada", "कनाडा"], ["Mexico", "मेक्सिको"]] },
  { name: "South America", hindi: "दक्षिण अमेरिका", countries: [["Brazil", "ब्राज़ील"], ["Argentina", "अर्जेंटीना"], ["Chile", "चिली"]] },
  { name: "Africa", hindi: "अफ्रीका", countries: [["South Africa", "दक्षिण अफ्रीका"], ["Nigeria", "नाइजीरिया"], ["Kenya", "केन्या"]] },
  { name: "Asia", hindi: "एशिया", countries: [["India", "भारत"], ["Japan", "जापान"], ["Philippines", "फिलीपींस"]] },
  { name: "Oceania", hindi: "ओशिनिया", countries: [["Australia", "ऑस्ट्रेलिया"], ["New Zealand", "न्यूज़ीलैंड"]] },
]

const styles = {
  main: { minHeight: "100vh", background: "#020403", color: "#f4f7f5", padding: "24px 16px 56px" },
  shell: { width: "min(980px, 100%)", margin: "0 auto" },
  eyebrow: { color: "#8fd4a9", fontWeight: 800, letterSpacing: "0.12em", fontSize: "12px" },
  title: { fontSize: "clamp(30px, 6vw, 52px)", lineHeight: 1.02, margin: "12px 0" },
  lead: { color: "#b7c5bd", lineHeight: 1.65, maxWidth: "760px", marginBottom: "24px" },
  nav: { display: "flex", gap: "10px", flexWrap: "wrap" as const, marginBottom: "28px" },
  link: { border: "1px solid #285f40", borderRadius: "999px", padding: "9px 14px", color: "#b9ffd4", textDecoration: "none", fontWeight: 800, display: "inline-flex" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" },
  card: { border: "1px solid #285f40", borderRadius: "16px", background: "#08100b", padding: "18px" },
  cardTitle: { margin: "0 0 8px", fontSize: "19px" },
  cardText: { margin: "0 0 14px", color: "#a9b8af", lineHeight: 1.55, fontSize: "14px" },
  actions: { display: "flex", gap: "8px", flexWrap: "wrap" as const },
  countryLinks: { display: "flex", gap: "8px", flexWrap: "wrap" as const, marginBottom: "12px" },
  notice: { marginTop: "18px", border: "1px solid #347d52", borderRadius: "16px", background: "#0b1710", padding: "18px", color: "#cde8d8", lineHeight: 1.55 },
}

export default function AroundTheWorldPage() {
  const [language, setLanguage] = useState<ViaLanguage | "Hindi">("English")

  useEffect(() => {
    const refresh = () => setLanguage(readViaLocalSettings().interfaceLanguage)
    refresh()
    window.addEventListener(VIA_SETTINGS_EVENT, refresh)
    return () => window.removeEventListener(VIA_SETTINGS_EVENT, refresh)
  }, [])

  const hindi = language === "Hindi"

  return (
    <main style={styles.main}>
      <div style={styles.shell}>
        <p style={styles.eyebrow}>VIA · {hindi ? "दुनिया भर में" : "AROUND THE WORLD"}</p>
        <h1 style={styles.title}>{hindi ? "लोग कहाँ हैं इसका अनुमान लगाए बिना दुनिया भर में खोजें।" : "Explore globally without guessing where people are."}</h1>
        <p style={styles.lead}>
          {hindi ? "VIA अभी भौगोलिक खोज के लिए केवल सत्यापित सार्वजनिक संदर्भ का उपयोग करता है। जब तक कोई विश्वसनीय सार्वजनिक DeSo location signal उपलब्ध नहीं होता, यह route नाम, भाषा, network data, devices या behavior से creator location का अनुमान नहीं लगाता।" : "VIA currently uses only verified public context for geographic discovery. Until a reliable public DeSo location signal is available, this route does not infer creator locations from names, language, network data, devices, or behavior."}
        </p>

        <nav aria-label={hindi ? "दुनिया भर में नेविगेशन" : "Around the World navigation"} style={styles.nav}>
          <Link href="/discover" style={styles.link}>{hindi ? "वर्ल्ड डिस्कवरी" : "World Discovery"}</Link>
          <Link href="/radio" style={styles.link}>{hindi ? "वर्ल्ड रेडियो" : "World Radio"}</Link>
          <Link href="/discover/voices" style={styles.link}>{hindi ? "नई आवाज़ें" : "New Voices"}</Link>
          <Link href="/collection#collection-controls" style={styles.link}>{hindi ? "NFT विंडो" : "NFT Window"}</Link>
        </nav>

        <section style={styles.grid} aria-label={hindi ? "विश्व क्षेत्र" : "World regions"}>
          {regions.map((region) => (
            <article key={region.name} style={styles.card}>
              <h2 style={styles.cardTitle}>{hindi ? region.hindi : region.name}</h2>
              <p style={styles.cardText}>
                {hindi ? "क्षेत्र के नाम केवल नेविगेशन के लिए हैं। नीचे दिए देश शॉर्टकट सार्वजनिक World Radio station metadata खोजते हैं; वे यह दावा नहीं करते कि DeSo creators वहाँ स्थित हैं।" : "Region labels are navigation only. The country shortcuts below search public World Radio station metadata; they do not claim that DeSo creators are located there."}
              </p>
              <div style={styles.countryLinks}>
                {region.countries.map(([country, hindiCountry]) => (
                  <Link key={country} href={`/radio?country=${encodeURIComponent(country)}`} style={styles.link}>{hindi ? hindiCountry : country}</Link>
                ))}
              </div>
              <div style={styles.actions}>
                <Link href="/discover/voices" style={styles.link}>{hindi ? "क्रिएटर्स खोलें" : "Open creators"}</Link>
              </div>
            </article>
          ))}
        </section>

        <div style={styles.notice}>
          {hindi ? "Around the World तभी अधिक समृद्ध होगा जब VIA किसी उपयुक्त सार्वजनिक स्रोत को सत्यापित कर सके। Radio country shortcuts केवल सार्वजनिक station-directory metadata का उपयोग करते हैं; VIA निजी creator-location inference नहीं करता और paid placement को organic discovery के रूप में नहीं दिखाता।" : "Around the World becomes richer only when VIA can verify a suitable public source. Radio country shortcuts use public station-directory metadata only; VIA still performs no private creator-location inference and no paid placement disguised as organic discovery."}
        </div>
      </div>
    </main>
  )
}
