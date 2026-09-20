import Link from "next/link"
import { currentViaCostPolicy } from "../../lib/via/cost-transparency-policy"
import { readViaLocalSettings } from "../via-local-settings"

export const dynamic = "force-dynamic"

export default function TransparencyPage() {
  const policy = currentViaCostPolicy()
  const serviceFee = (policy.serviceFeeBps / 100).toFixed(2)
  const hindi = readViaLocalSettings().interfaceLanguage === ("Hindi" as never)

  return (
    <main style={{ minHeight: "100vh", background: "#050807", color: "#f4f7f5", padding: "32px 20px" }}>
      <section style={{ maxWidth: 760, margin: "0 auto", padding: 20, border: "1px solid rgba(143,212,169,.22)", borderRadius: 14, background: "rgba(9,13,11,.72)" }}>
        <p style={{ color: "#8fd4a9", fontSize: 12, letterSpacing: ".12em" }}>VIA · {hindi ? "लागत और पारदर्शिता" : "COSTS & TRANSPARENCY"}</p>
        <h1 style={{ fontSize: 24 }}>{hindi ? "पहुंच के लिए नहीं, कार्रवाई के लिए भुगतान करें" : "Pay for the action, not for access"}</h1>
        <p style={{ color: "#b9c6be", lineHeight: 1.65 }}>{hindi ? "VIA सामान्य access को जितना संभव हो उतना हल्का रखता है। जब किसी action से वास्तविक external cost बनती है, वह लागत उस व्यक्ति को दी जाती है जो action करता है और जहाँ पहले से पता हो सके वहाँ confirmation से पहले दिखाई जाती है।" : "VIA keeps normal access as light as possible. When an action creates a real external cost, that cost is assigned to the person who triggers the action and shown before confirmation whenever it can be known in advance."}</p>

        <div style={{ display: "grid", gap: 10, marginTop: 20 }}>
          <div><strong>{hindi ? "मौजूदा VIA service fee:" : "Current VIA service fee:"}</strong> {serviceFee}%</div>
          <div><strong>{hindi ? "नई release decision के बिना अधिकतम:" : "Maximum without a new release decision:"}</strong> 1.00%</div>
          <div><strong>{hindi ? "DESO में VIA service fee:" : "DESO-denominated VIA service fee:"}</strong> {hindi ? "बंद" : "disabled"}</div>
          <div><strong>{hindi ? "Pricing rule:" : "Pricing rule:"}</strong> {hindi ? "मौजूदा verified provider/network/storage cost पुराने example tariffs से ऊपर माना जाता है" : "current verified provider/network/storage cost beats old example tariffs"}</div>
        </div>

        <h2 style={{ marginTop: 28, fontSize: 18 }}>{hindi ? "कौन क्या भुगतान करता है?" : "Who pays what?"}</h2>
        <div style={{ display: "grid", gap: 12, color: "#d3ddd6", lineHeight: 1.55 }}>
          <p><strong>{hindi ? "Creator:" : "Creator:"}</strong> {hindi ? "creator actions से होने वाली लागत, जैसे minting या optional premium storage।" : "costs caused by creator actions, such as minting or optional premium storage."}</p>
          <p><strong>{hindi ? "Buyer:" : "Buyer:"}</strong> {hindi ? "purchase से होने वाली payment-provider और checkout लागत, जब तक किसी sale rule में स्पष्ट रूप से कुछ और न कहा गया हो।" : "payment-provider and checkout costs caused by the purchase, unless a specific sale rule clearly says otherwise."}</p>
          <p><strong>{hindi ? "Visitor:" : "Visitor:"}</strong> {hindi ? "browsing, discovery और सामान्य reading वहाँ free रहनी चाहिए जहाँ underlying infrastructure इसकी अनुमति देता है।" : "browsing, discovery and ordinary reading should remain free wherever the underlying infrastructure allows it."}</p>
        </div>

        <h2 style={{ marginTop: 28, fontSize: 18 }}>{hindi ? "पुष्टि करने से पहले" : "Before you confirm"}</h2>
        <p style={{ color: "#b9c6be", lineHeight: 1.65 }}>{hindi ? "VIA को base price, blockchain/network cost, payment-provider cost, लागू होने पर storage या processing cost, VIA service fee और total दिखाना चाहिए। यदि कोई relevant quote बदलता है या पुराना हो जाता है, तो approval से पहले total को refresh करना होगा।" : "VIA should show the base price, blockchain/network cost, payment-provider cost, storage or processing cost when applicable, VIA service fee and total. If a relevant quote changes or becomes stale, the total must be refreshed before approval."}</p>

        <p style={{ marginTop: 24, color: "#8fd4a9" }}>{hindi ? "पुराने illustrative tariffs VIA की live prices नहीं हैं।" : "Old illustrative tariffs are not live VIA prices."}</p>

        <nav aria-label={hindi ? "Transparency navigation" : "Transparency navigation"} style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 28 }}>
          <Link href="/" style={{ color: "#9adbb2", textDecoration: "none", border: "1px solid rgba(143,212,169,.35)", borderRadius: 10, padding: "9px 12px" }}>{hindi ? "होम" : "Home"}</Link>
          <Link href="/payment-info" style={{ color: "#9adbb2", textDecoration: "none", border: "1px solid rgba(143,212,169,.35)", borderRadius: 10, padding: "9px 12px" }}>{hindi ? "भुगतान जानकारी" : "Payment info"}</Link>
        </nav>
      </section>
    </main>
  )
}
