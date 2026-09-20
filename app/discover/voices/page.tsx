"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../../via-local-settings"

const styles = {
  main: { minHeight: "100vh", background: "#020403", color: "#f4f7f5", padding: "24px 16px 56px" },
  shell: { width: "min(760px, 100%)", margin: "0 auto" },
  eyebrow: { color: "#8fd4a9", fontWeight: 800, letterSpacing: "0.12em", fontSize: "12px" },
  title: { fontSize: "clamp(32px, 7vw, 58px)", lineHeight: 1, margin: "12px 0" },
  text: { color: "#b7c5bd", lineHeight: 1.65 },
  panel: { marginTop: "24px", border: "1px solid #285f40", borderRadius: "16px", background: "#08100b", padding: "18px" },
  form: { display: "flex", gap: "10px", flexWrap: "wrap" as const, marginTop: "16px" },
  input: { flex: "1 1 240px", minHeight: "44px", borderRadius: "12px", border: "1px solid #347d52", background: "#020403", color: "#f4f7f5", padding: "10px 12px", fontSize: "16px" },
  button: { minHeight: "44px", borderRadius: "999px", border: "1px solid #347d52", background: "#10261a", color: "#b9ffd4", padding: "9px 16px", fontWeight: 800, cursor: "pointer" },
  nav: { display: "flex", gap: "10px", flexWrap: "wrap" as const, marginTop: "24px" },
  link: { border: "1px solid #285f40", borderRadius: "999px", padding: "9px 14px", color: "#b9ffd4", textDecoration: "none", fontWeight: 800 },
}

export default function NewVoicesPage() {
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
        <p style={styles.eyebrow}>VIA · {hindi ? "नई आवाज़ें" : "NEW VOICES"}</p>
        <h1 style={styles.title}>{hindi ? "एक सार्वजनिक DeSo क्रिएटर खोजें।" : "Explore a public DeSo creator."}</h1>
        <p style={styles.text}>
          {hindi ? "New Voices का यह पहला चरण उपयोगकर्ता-निर्देशित और केवल पढ़ने के लिए है। उपयुक्त सार्वजनिक प्रमाण के बिना VIA किसी अकाउंट को नया, महत्वपूर्ण, सत्यापित या ऑर्गेनिक रूप से रैंक किया हुआ नहीं बताता।" : "This first New Voices step is user-directed and read-only. VIA does not label an account as new, important, verified, or organically ranked without suitable public evidence."}
        </p>

        <section style={styles.panel} aria-label={hindi ? "सार्वजनिक क्रिएटर खोलें" : "Open a public creator"}>
          <h2>{hindi ? "क्रिएटर संग्रह खोलें" : "Open creator collection"}</h2>
          <p style={styles.text}>{hindi ? "एक सार्वजनिक DeSo यूज़रनेम दर्ज करें। VIA मौजूदा सार्वजनिक संग्रह ब्राउज़र खोलता है; कोई signing, follow, like, payment या Diamond action नहीं किया जाता।" : "Enter a public DeSo username. VIA opens the existing public collection browser; no signing, follow, like, payment, or Diamond action is performed."}</p>
          <form action="/collection" method="get" style={styles.form}>
            <input name="account" aria-label={hindi ? "DeSo यूज़रनेम" : "DeSo username"} placeholder={hindi ? "DeSo यूज़रनेम" : "DeSo username"} autoComplete="off" style={styles.input} />
            <button type="submit" style={styles.button}>{hindi ? "क्रिएटर खोजें" : "Explore creator"}</button>
          </form>
        </section>

        <nav aria-label={hindi ? "नई आवाज़ें नेविगेशन" : "New Voices navigation"} style={styles.nav}>
          <Link href="/discover" style={styles.link}>{hindi ? "वर्ल्ड डिस्कवरी" : "World Discovery"}</Link>
          <Link href="/" style={styles.link}>{hindi ? "होम" : "Home"}</Link>
        </nav>
      </div>
    </main>
  )
}
