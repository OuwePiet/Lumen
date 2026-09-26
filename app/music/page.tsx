import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "VIA Muziek",
  description: "VIA Muziek — publieke muziekruimte van VIA met DeSo-toegang voor deelname.",
}

export default function MusicPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050807", color: "#e8f1eb", padding: "clamp(28px,5vw,72px) 20px 110px" }}>
      <section style={{ width: "min(980px,100%)", margin: "0 auto", border: "1px solid rgba(143,212,169,.16)", borderRadius: 24, background: "rgba(7,16,11,.78)", padding: "clamp(24px,5vw,54px)" }}>
        <p style={{ margin: "0 0 10px", color: "#8fd4a9", fontSize: 12, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase" }}>VIA</p>
        <h1 style={{ margin: 0, fontSize: "clamp(32px,6vw,62px)", lineHeight: 1 }}>VIA Muziek</h1>
        <p style={{ margin: "18px 0 0", maxWidth: 720, color: "#b8c6bd", lineHeight: 1.7 }}>
          Vrij toegankelijk om muziek en creators te ontdekken. DeSo-login wordt gebruikt voor deelname en interactieve functies.
        </p>
        <p style={{ margin: "14px 0 0", maxWidth: 720, color: "#829087", lineHeight: 1.7, fontSize: 14 }}>
          Muziekopslag, publieke veiligheid, creatorbescherming en betalingen worden als aparte gecontroleerde VIA-laag aangesloten voordat uploads of transacties worden vrijgegeven.
        </p>
      </section>
    </main>
  )
}
