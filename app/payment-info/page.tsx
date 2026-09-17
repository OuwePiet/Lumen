import Link from "next/link"
import ViaPaymentAvailabilityLink from "../via-payment-availability-link"

export default function PaymentNavigationPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050807", color: "#f4f7f5", padding: "32px 20px" }}>
      <section style={{ maxWidth: 760, margin: "0 auto", padding: 20, border: "1px solid rgba(143,212,169,.22)", borderRadius: 14, background: "rgba(9,13,11,.72)" }}>
        <p style={{ color: "#8fd4a9", fontSize: 12, letterSpacing: ".12em" }}>VIA · PAYMENT INFO</p>
        <h1 style={{ fontSize: 26, marginBottom: 10 }}>Betalen zonder verborgen beloftes</h1>
        <p style={{ color: "#b9c6be", lineHeight: 1.65 }}>
          VIA toont alleen betaalmethoden als beschikbaar wanneer hun volledige route operationeel en getest is. Een oude schets, voorbeeldprijs of onderzochte provider geldt nooit automatisch als live betaaloptie.
        </p>

        <div style={{ display: "grid", gap: 12, marginTop: 22, color: "#d3ddd6", lineHeight: 1.55 }}>
          <p><strong>DeSo:</strong> on-chain acties vereisen expliciete goedkeuring via DeSo Identity. VIA bewaart geen private keys en de Wallet-pagina blijft alleen-lezen.</p>
          <p><strong>EUR / USD:</strong> alleen beschikbaar wanneer de actuele checkoutstatus dit als gereed aangeeft. VIA doet geen handmatige kaart- of bankverwerking.</p>
          <p><strong>Bitcoin:</strong> wordt pas aangeboden wanneer een eigen, gecontroleerde betaalroute expliciet is vrijgegeven.</p>
          <p><strong>Opslag en externe diensten:</strong> providerkosten en voorwaarden gelden bij de externe dienst. VIA toont geen oude voorbeeldstaffel als actuele prijs.</p>
          <p><strong>Voor bevestiging:</strong> waar mogelijk worden basisprijs, netwerk- of providerkosten, eventuele VIA-servicefee en het totaal vooraf getoond.</p>
        </div>

        <div style={{ marginTop: 22 }}>
          <ViaPaymentAvailabilityLink />
        </div>

        <nav aria-label="Payment info navigation" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 28 }}>
          <Link href="/public" style={{ color: "#9adbb2", textDecoration: "none", border: "1px solid rgba(143,212,169,.35)", borderRadius: 10, padding: "9px 12px" }}>Publieke ingang</Link>
          <Link href="/transparency" style={{ color: "#9adbb2", textDecoration: "none", border: "1px solid rgba(143,212,169,.35)", borderRadius: 10, padding: "9px 12px" }}>Kosten & transparantie</Link>
        </nav>
      </section>
    </main>
  )
}
