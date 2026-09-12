import { currentViaCostPolicy } from "../../lib/via/cost-transparency-policy"

export const dynamic = "force-dynamic"

export default function TransparencyPage() {
  const policy = currentViaCostPolicy()
  const serviceFee = (policy.serviceFeeBps / 100).toFixed(2)

  return (
    <main style={{ minHeight: "100vh", background: "#050807", color: "#f4f7f5", padding: "32px 20px" }}>
      <section style={{ maxWidth: 760, margin: "0 auto", padding: 20, border: "1px solid rgba(143,212,169,.22)", borderRadius: 14, background: "rgba(9,13,11,.72)" }}>
        <p style={{ color: "#8fd4a9", fontSize: 12, letterSpacing: ".12em" }}>VIA · COSTS & TRANSPARENCY</p>
        <h1 style={{ fontSize: 24 }}>Pay for the action, not for access</h1>
        <p style={{ color: "#b9c6be", lineHeight: 1.65 }}>
          VIA keeps normal access as light as possible. When an action creates a real external cost, that cost is assigned to the person who triggers the action and shown before confirmation whenever it can be known in advance.
        </p>

        <div style={{ display: "grid", gap: 10, marginTop: 20 }}>
          <div><strong>Current VIA service fee:</strong> {serviceFee}%</div>
          <div><strong>Maximum without a new release decision:</strong> 1.00%</div>
          <div><strong>DESO-denominated VIA service fee:</strong> disabled</div>
          <div><strong>Pricing rule:</strong> current verified provider/network/storage cost beats old example tariffs</div>
        </div>

        <h2 style={{ marginTop: 28, fontSize: 18 }}>Who pays what?</h2>
        <div style={{ display: "grid", gap: 12, color: "#d3ddd6", lineHeight: 1.55 }}>
          <p><strong>Creator:</strong> costs caused by creator actions, such as minting or optional premium storage.</p>
          <p><strong>Buyer:</strong> payment-provider and checkout costs caused by the purchase, unless a specific sale rule clearly says otherwise.</p>
          <p><strong>Visitor:</strong> browsing, discovery and ordinary reading should remain free wherever the underlying infrastructure allows it.</p>
        </div>

        <h2 style={{ marginTop: 28, fontSize: 18 }}>Before you confirm</h2>
        <p style={{ color: "#b9c6be", lineHeight: 1.65 }}>
          VIA should show the base price, blockchain/network cost, payment-provider cost, storage or processing cost when applicable, VIA service fee and total. If a relevant quote changes or becomes stale, the total must be refreshed before approval.
        </p>

        <p style={{ marginTop: 24, color: "#8fd4a9" }}>
          Old illustrative tariffs are not live VIA prices.
        </p>
      </section>
    </main>
  )
}
