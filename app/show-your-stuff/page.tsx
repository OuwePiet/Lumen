"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import ParticipationGate from "../participation-gate"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"

const doors = [
  { title: "Just look around", hindiTitle: "बस देखें", text: "Come in without an account or wallet. Discover public work, creators, music, culture, communities and DeSo activity at your own pace.", hindiText: "बिना account या wallet के आएँ। अपनी गति से public work, creators, music, culture, communities और DeSo activity खोजें।", href: "/discover", action: "Explore VIA", hindiAction: "VIA खोजें", status: "OPEN" },
  { title: "Show your stuff", hindiTitle: "अपना काम दिखाएँ", text: "Want to present work or take part? Participation opens through DeSo. VIA does not create a second anonymous or email-based creator account beside DeSo.", hindiText: "अपना काम दिखाना या भाग लेना चाहते हैं? भागीदारी DeSo के माध्यम से खुलती है। VIA, DeSo के साथ कोई दूसरा anonymous या email-based creator account नहीं बनाता।", status: "DESO LOGIN" },
  { title: "Already on DeSo", hindiTitle: "पहले से DeSo पर हैं", text: "Use DeSo Identity to select your account. VIA keeps public discovery open while write functions are connected safely and separately.", hindiText: "अपना account चुनने के लिए DeSo Identity का उपयोग करें। VIA public discovery खुला रखता है, जबकि write functions सुरक्षित और अलग तरीके से जुड़े रहते हैं।", status: "DESO" },
]

const styles = {
  main: { minHeight: "100vh", background: "#050807", color: "#f4f7f5", padding: "24px 16px 56px" },
  shell: { width: "min(920px, 100%)", margin: "0 auto" },
  eyebrow: { color: "#8fd4a9", fontWeight: 700, letterSpacing: "0.16em", fontSize: "12px" },
  title: { fontSize: "clamp(30px, 6vw, 52px)", lineHeight: 1.02, margin: "12px 0", letterSpacing: "-0.025em" },
  lead: { color: "#aebbb4", lineHeight: 1.65, maxWidth: "760px", marginBottom: "18px" },
  welcome: { border: "1px solid rgba(143,212,169,.34)", borderRadius: "14px", background: "rgba(12,23,17,.45)", padding: "16px", marginBottom: "22px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "14px" },
  card: { border: "1px solid rgba(63,74,68,.72)", borderRadius: "14px", background: "rgba(9,13,11,.72)", padding: "18px" },
  cardTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" },
  cardTitle: { margin: "0 0 8px", fontSize: "19px", fontWeight: 600 },
  cardText: { margin: 0, color: "#9daaa3", lineHeight: 1.55, fontSize: "14px" },
  badge: { color: "#8fd4a9", border: "1px solid rgba(143,212,169,.3)", borderRadius: "9px", padding: "4px 7px", fontSize: "10px", fontWeight: 750, letterSpacing: "0.08em" },
  link: { marginTop: "14px", border: "1px solid rgba(143,212,169,.42)", borderRadius: "11px", padding: "9px 13px", color: "#9adbb2", textDecoration: "none", fontWeight: 650, display: "inline-flex" },
  boundary: { marginTop: "22px", border: "1px solid rgba(113,130,120,.42)", borderRadius: "14px", background: "rgba(9,14,11,.72)", padding: "14px", color: "#aebbb4", lineHeight: 1.55, fontSize: "13px" },
  nav: { display: "flex", gap: "9px", flexWrap: "wrap" as const, marginTop: "22px" },
}

export default function ShowYourStuffPage() {
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
        <p style={styles.eyebrow}>VIA · {hindi ? "अंदर आएँ" : "COME IN"}</p>
        <h1 style={styles.title}>{hindi ? "अपना काम दिखाएँ। दुनिया से मिलें।" : "Show your stuff. Meet the world."}</h1>
        <p style={styles.lead}>{hindi ? "VIA एक café है: कोई भी आ सकता है और देख सकता है कि लोग क्या बनाते और करते हैं। Guests केवल देख सकते हैं। जब आप भाग लेना चाहें, VIA DeSo का दरवाज़ा खोलता है।" : "VIA is the café: anyone can walk in and discover what people make and do. Guests stay view-only. When you want to participate, VIA opens the DeSo door."}</p>
        <div style={styles.welcome}><strong>{hindi ? "दुनिया का स्वागत है। कॉफी तैयार है। ☕" : "The world is welcome. The coffee is ready. ☕"}</strong><p style={{ ...styles.cardText, marginTop: "7px" }}>{hindi ? "Art, photography, music, film, writing, NFTs, heritage, hobbies, communities और वे चीज़ें जिनके बारे में हमने अभी सोचा भी नहीं है—सबके लिए यहाँ जगह है।" : "Art, photography, music, film, writing, NFTs, heritage, hobbies, communities and things we have not thought of yet all belong at the table."}</p></div>

        <section style={styles.grid} aria-label={hindi ? "VIA में प्रवेश के तरीके" : "Ways into VIA"}>
          {doors.map((door) => (
            <article key={door.title} style={styles.card}>
              <div style={styles.cardTop}><h2 style={styles.cardTitle}>{hindi ? door.hindiTitle : door.title}</h2><span style={styles.badge}>{door.status}</span></div>
              <p style={styles.cardText}>{hindi ? door.hindiText : door.text}</p>
              {door.href ? <Link href={door.href} style={styles.link}>{hindi ? door.hindiAction : door.action}</Link> : null}
            </article>
          ))}
        </section>

        <ParticipationGate title={hindi ? "भाग लेने के लिए तैयार हैं?" : "Ready to take part?"} text={hindi ? "आधिकारिक DeSo Identity flow के माध्यम से आगे बढ़ें। VIA login पर approval-required transaction level मांगता है; सामान्य browsing इसके बिना भी खुली रहती है।" : "Continue through the official DeSo Identity flow. VIA requests the approval-required transaction level at login; ordinary browsing stays open without it."} />

        <div style={styles.boundary}><strong>{hindi ? "स्पष्ट सीमा:" : "Clear boundary:"}</strong> {hindi ? "guests navigate, search, read, watch और listen कर सकते हैं, लेकिन post, reply, upload, follow, like, Diamonds भेजना, maker space claim करना या अन्य participation action नहीं कर सकते। Sensitive NFT और financial actions के लिए अतिरिक्त explicit preflight, consent, signing और verification आवश्यक हैं।" : "guests may navigate, search, read, watch and listen, but cannot post, reply, upload, follow, like, send Diamonds, claim a maker space or perform another participation action. Sensitive NFT and financial actions additionally require explicit preflight, consent, signing and verification."}</div>
        <div style={styles.boundary}><strong>{hindi ? "कम्युनिटी सुरक्षा:" : "Community protection:"}</strong> {hindi ? "DeSo login भागीदारी का gate है, trust badge नहीं। VIA spam और bot limits, link/media validation, impersonation protection और repeated abuse के लिए proportional restrictions लागू कर सकता है। DeSo balance या purchase requirement DeSo का अपना मौजूदा नियम रहता है; VIA कोई fixed entry payment नहीं बनाता।" : "a DeSo login is the participation gate, not a trust badge. VIA can still apply spam and bot limits, link/media validation, impersonation protection and proportional restrictions for repeated abuse. Any DeSo balance or purchase requirement remains DeSo's own current rule; VIA does not invent a fixed entry payment."}</div>

        <nav aria-label={hindi ? "Show Your Stuff नेविगेशन" : "Show Your Stuff navigation"} style={styles.nav}>
          <Link href="/" style={styles.link}>{hindi ? "होम" : "Home"}</Link>
          <Link href="/discover" style={styles.link}>{hindi ? "खोजें" : "Discover"}</Link>
          <Link href="/discover/voices" style={styles.link}>{hindi ? "नई आवाज़ें" : "New Voices"}</Link>
        </nav>
      </div>
    </main>
  )
}
