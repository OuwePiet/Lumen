import Link from "next/link"
import AdvertisingDirectory from "./advertising-directory"

const card = {
  border: "1px solid rgba(143,212,169,.22)",
  borderRadius: 16,
  padding: 18,
  background: "rgba(8,15,11,.72)",
}

export default function AdvertisingPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050807", color: "#f4f7f5", padding: "32px 20px 56px" }}>
      <section style={{ width: "min(860px,100%)", margin: "0 auto" }}>
        <p style={{ color: "#8fd4a9", fontSize: 12, fontWeight: 800, letterSpacing: ".14em", margin: 0 }}>VIA · RECLAME & SPONSORPLAATSING</p>
        <h1 style={{ margin: "10px 0 0", fontSize: "clamp(30px,6vw,48px)" }}>Sponsorplaatsen op VIA.</h1>
        <p style={{ margin: "14px 0 0", color: "#aebbb4", lineHeight: 1.65, maxWidth: 760 }}>
          VIA heeft twee duidelijk gescheiden sponsorplekken: maximaal vier roterende sponsors in het bovenste stadsvak op de homepage, plus deze grotere sponsorpagina met automatische vervolgpagina’s.
        </p>

        <div style={{ display: "grid", gap: 14, marginTop: 24 }}>
          <section style={card}>
            <h2 style={{ margin: 0, fontSize: 19 }}>Hoe plaatsing werkt</h2>
            <p style={{ margin: "8px 0 0", color: "#9eaaa2", lineHeight: 1.6, fontSize: 14 }}>Een aanvraag wordt eerst beoordeeld. De klant kan een voorkeur voor pagina 1 kiezen tegen een kleine toeslag. Pagina 1 heeft maximaal 12 voorkeurplaatsen; de volgorde wisselt regelmatig zodat niemand permanent bovenaan staat.</p>
          </section>
          <section style={card}>
            <h2 style={{ margin: 0, fontSize: 19 }}>Automatische vervolgpagina’s</h2>
            <p style={{ margin: "8px 0 0", color: "#9eaaa2", lineHeight: 1.6, fontSize: 14 }}>Zodra pagina 1 vol raakt, worden overige goedgekeurde sponsorkaarten automatisch op pagina 2 geplaatst, daarna pagina 3 enzovoort. Hiervoor hoeft geen nieuwe pagina handmatig gebouwd te worden.</p>
          </section>
          <section style={card}>
            <h2 style={{ margin: 0, fontSize: 19 }}>Onafhankelijk van Sponsor platform</h2>
            <p style={{ margin: "8px 0 0", color: "#9eaaa2", lineHeight: 1.6, fontSize: 14 }}>Commerciële sponsorplaatsing staat los van vrijwillige bijdragen aan VIA via DESO of Diamonds. Een bijdrage koopt geen advertentieplek, ranking, verificatie of andere invloed.</p>
          </section>
        </div>

        <AdvertisingDirectory />

        <nav style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 26 }}>
          <Link href="/" style={{ color: "#9adbb2", textDecoration: "none", border: "1px solid rgba(143,212,169,.35)", borderRadius: 999, padding: "9px 13px" }}>← VIA homepage</Link>
          <Link href="/payment-info" style={{ color: "#9adbb2", textDecoration: "none", border: "1px solid rgba(143,212,169,.35)", borderRadius: 999, padding: "9px 13px" }}>Betaalinformatie</Link>
        </nav>
      </section>
    </main>
  )
}
