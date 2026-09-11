import ViaPaymentReadinessV2 from "../via-payment-readiness-v2"

export const dynamic = "force-dynamic"

export default function CentralPaymentReadinessPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050807", color: "#f4f7f5", padding: "32px 20px" }}>
      <section style={{ maxWidth: 760, margin: "0 auto", padding: 20, border: "1px solid rgba(143,212,169,.22)", borderRadius: 14 }}>
        <p style={{ color: "#8fd4a9", fontSize: 12, letterSpacing: ".12em" }}>VIA · CENTRAL READINESS</p>
        <h1 style={{ fontSize: 24 }}>Payment availability</h1>
        <ViaPaymentReadinessV2 />
        <p style={{ marginTop: 20 }}>
          <a href="/" style={{ color: "#9adbb2" }}>Back to VIA</a>
        </p>
      </section>
    </main>
  )
}
