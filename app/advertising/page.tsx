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

        <section style={{ ...card, marginTop: 14 }}>
          <h2 style={{ margin: 0, fontSize: 19 }}>Sponsor VIA</h2>
          <p style={{ margin: "8px 0 0", color: "#9eaaa2", lineHeight: 1.6, fontSize: 14 }}>Elke gift is welkom, ook als hij klein is. Vrijwillige bijdragen via DESO of Diamonds worden pas als betaalbaar getoond wanneer de betreffende route volledig operationeel en getest is.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            <span style={{ border: "1px solid rgba(143,212,169,.28)", borderRadius: 999, padding: "7px 11px", color: "#9adbb2", fontSize: 12 }}>DESO</span>
            <span style={{ border: "1px solid rgba(143,212,169,.18)", borderRadius: 999, padding: "7px 11px", color: "#89968e", fontSize: 12 }}>USD · niet live</span>
            <span style={{ border: "1px solid rgba(143,212,169,.18)", borderRadius: 999, padding: "7px 11px", color: "#89968e", fontSize: 12 }}>Diamonds · na verificatie</span>
          </div>
          <p style={{ margin: "10px 0 0", color: "#78867e", lineHeight: 1.5, fontSize: 12 }}>Dit is statusinformatie, geen checkout. VIA toont geen schijnbare DESO/$-wissel zolang die betaalroute niet veilig is aangesloten.</p>
        </section>

        <section aria-labelledby="via-ad-packages" style={{ ...card, marginTop: 18 }}>
          <p style={{ margin: 0, color: "#8fd4a9", fontSize: 12, fontWeight: 800, letterSpacing: ".1em" }}>VIA SPONSORGALERIJ · VOORSTEL</p>
          <h2 id="via-ad-packages" style={{ margin: "7px 0 0", fontSize: 22 }}>Kleine advertenties, heldere prijzen</h2>
          <p style={{ margin: "8px 0 16px", color: "#aebbb4", fontSize: 13, lineHeight: 1.6 }}>
            Proefprijzen ter beoordeling. Nog geen aanbod of betaalmogelijkheid: plaatsing begint pas na goedkeuring en een gecontroleerde betaalroute.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10 }}>
            {[
              { name: "Kleine kaart", price: "€1", duration: "7 dagen", detail: "Een kaart in de reclamegalerij." },
              { name: "Standaard", price: "€3", duration: "30 dagen", detail: "Een kaart voor een volledige maand." },
              { name: "Voorkeursplaats", price: "€5", duration: "30 dagen", detail: "Pagina 1, zolang er plaats is; eerlijke rotatie." },
              { name: "Homepage", price: "€10", duration: "30 dagen", detail: "Een van maximaal vier roterende plaatsen." },
              { name: "Bedrijfspartner", price: "vanaf €15", duration: "30 dagen", detail: "Uitgebreidere presentatie; voorwaarden nog te bepalen." },
            ].map((plan) => (
              <article key={plan.name} style={{ border: "1px solid rgba(143,212,169,.22)", borderRadius: 12, background: "rgba(3,12,7,.65)", padding: 14 }}>
                <h3 style={{ margin: 0, fontSize: 14, color: "#e2f4e8" }}>{plan.name}</h3>
                <p style={{ margin: "9px 0 0", fontSize: 25, fontWeight: 800, color: "#9adbb2" }}>{plan.price}</p>
                <p style={{ margin: "2px 0 9px", fontSize: 12, color: "#c4d1c8" }}>{plan.duration}</p>
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: "#9eaaa2" }}>{plan.detail}</p>
              </article>
            ))}
          </div>
          <p style={{ margin: "14px 0 0", color: "#89968e", fontSize: 12, lineHeight: 1.6 }}>
            Prijzen zijn indicatief, niet definitief en niet te betalen op deze pagina. Er worden geen advertentieaanvragen of betalingen verwerkt.
          </p>
        </section>

        <AdvertisingDirectory />

        <nav style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 26 }}>
          <Link href="/" style={{ color: "#9adbb2", textDecoration: "none", border: "1px solid rgba(143,212,169,.35)", borderRadius: 999, padding: "9px 13px" }}>← VIA homepage</Link>
          <Link href="/payment-info" style={{ color: "#9adbb2", textDecoration: "none", border: "1px solid rgba(143,212,169,.35)", borderRadius: 999, padding: "9px 13px" }}>Betaalinformatie</Link>
        </nav>
      </section>
    </main>
  )
}
