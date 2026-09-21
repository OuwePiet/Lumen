"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../../via-local-settings"

export const dynamic = "force-dynamic"

const routes = [
  { title: "NFT Window", text: "Explore a public DeSo NFT collection without signing or spending.", href: "/collection#collection-controls" },
  { title: "World Radio", text: "Discover an external station directory through VIA. Playback starts only when you choose Play.", href: "/radio" },
  { title: "World Quest", text: "Open VIA's discovery games and local progress layer.", href: "/quest" },
  { title: "VIA LIVE", text: "Preview VIA's audio-room controls and current Replay/media status; live microphone rooms are not released yet.", href: "/live" },
]

const HINDI_ROUTES = [
  { title: "NFT विंडो", text: "बिना साइन किए या खर्च किए सार्वजनिक DeSo NFT संग्रह देखें।" },
  { title: "वर्ल्ड रेडियो", text: "VIA के माध्यम से बाहरी स्टेशन डायरेक्टरी खोजें। प्लेबैक केवल Play चुनने पर शुरू होता है।" },
  { title: "वर्ल्ड क्वेस्ट", text: "VIA के डिस्कवरी गेम्स और स्थानीय प्रगति परत खोलें।" },
  { title: "VIA LIVE", text: "VIA के ऑडियो-रूम नियंत्रण और मौजूदा Replay/media स्थिति का पूर्वावलोकन करें; लाइव माइक्रोफोन रूम अभी जारी नहीं हुए हैं।" },
]

function utcDayNumber() {
  return Math.floor(Date.now() / 86_400_000)
}

export default function SurprisePage() {
  const [language, setLanguage] = useState<ViaLanguage | "Hindi">("English")

  useEffect(() => {
    const refresh = () => setLanguage(readViaLocalSettings().interfaceLanguage)
    refresh()
    window.addEventListener(VIA_SETTINGS_EVENT, refresh)
    return () => window.removeEventListener(VIA_SETTINGS_EVENT, refresh)
  }, [])

  const routeIndex = utcDayNumber() % routes.length
  const route = routes[routeIndex]
  const hindi = language === "Hindi"
  const shownRoute = hindi ? { ...route, ...HINDI_ROUTES[routeIndex] } : route

  return (
    <main style={{ minHeight: "100vh", background: "#020403", color: "#f4f7f5", padding: "32px 18px 64px", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div style={{ width: "min(760px, 100%)", margin: "0 auto" }}>
        <p style={{ color: "#8fd4a9", fontWeight: 800, letterSpacing: "0.12em", fontSize: "12px" }}>VIA · {hindi ? "मुझे चौंकाएँ" : "SURPRISE ME"}</p>
        <h1 style={{ fontSize: "clamp(30px, 6vw, 52px)", lineHeight: 1.02, margin: "12px 0" }}>{hindi ? "आज का डिस्कवरी रूट" : "Today’s discovery route"}</h1>
        <p style={{ color: "#b7c5bd", lineHeight: 1.65 }}>{hindi ? "हर UTC दिन के लिए एक निश्चित रूट। कोई रैंडम paid placement, hidden ranking, signing, spending या blockchain write नहीं।" : "One deterministic route per UTC day. No random paid placement, no hidden ranking, no signing, no spending and no blockchain write."}</p>
        <section style={{ marginTop: "28px", border: "1px solid #347d52", borderRadius: "20px", background: "#08100b", padding: "24px" }}>
          <p style={{ color: "#8fd4a9", fontWeight: 800, margin: "0 0 8px" }}>{hindi ? "आज का रूट" : "ROUTE OF THE DAY"}</p>
          <h2 style={{ margin: "0 0 10px", fontSize: "28px" }}>{shownRoute.title}</h2>
          <p style={{ color: "#a9b8af", lineHeight: 1.6 }}>{shownRoute.text}</p>
          <Link href={shownRoute.href} style={{ display: "inline-flex", marginTop: "12px", border: "1px solid #285f40", borderRadius: "999px", padding: "10px 15px", color: "#b9ffd4", textDecoration: "none", fontWeight: 800 }}>{hindi ? "रूट खोलें" : "Open route"}</Link>
        </section>
        <p style={{ marginTop: "24px" }}><Link href="/discover" style={{ color: "#b9ffd4" }}>{hindi ? "← वर्ल्ड डिस्कवरी पर वापस जाएँ" : "← Back to World Discovery"}</Link></p>
      </div>
    </main>
  )
}
