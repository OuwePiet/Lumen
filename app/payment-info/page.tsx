import ViaPaymentAvailabilityLink from "../via-payment-availability-link"

export default function PaymentNavigationPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050807", color: "#f4f7f5", padding: 32 }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <h1>VIA payments</h1>
        <p>Check which payment methods are currently available.</p>
        <ViaPaymentAvailabilityLink />
      </div>
    </main>
  )
}
