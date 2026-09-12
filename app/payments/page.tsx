import CheckoutSecurityPreview from "../checkout-security-preview"
import ViaPaymentReadiness from "../via-payment-readiness"

export const dynamic = "force-dynamic"

export default function PaymentsPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050807",
        color: "#f4f7f5",
        padding: "32px 20px",
      }}
    >
      <section
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: 20,
          border: "1px solid rgba(143,212,169,.22)",
          borderRadius: 14,
          background: "rgba(9,13,11,.72)",
        }}
      >
        <p style={{ color: "#8fd4a9", fontSize: 12, letterSpacing: ".12em" }}>
          VIA · PAYMENT AVAILABILITY
        </p>
        <h1 style={{ fontSize: 24 }}>Payment methods</h1>
        <ViaPaymentReadiness />
        <CheckoutSecurityPreview />
      </section>
    </main>
  )
}
