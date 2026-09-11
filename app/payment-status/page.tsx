import ViaPaymentStatusCard from "../via-payment-status-card"

export const dynamic = "force-dynamic"

export default function PaymentStatusPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050807",
        color: "#f4f7f5",
        padding: "32px 20px",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <p style={{ color: "#8fd4a9", fontSize: 12, letterSpacing: ".12em" }}>
          VIA · LIVE STATUS
        </p>
        <h1 style={{ fontSize: 24 }}>Payment readiness</h1>
        <ViaPaymentStatusCard />
      </div>
    </main>
  )
}
