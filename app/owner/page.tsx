import Link from "next/link"
import { fetchDeSo } from "../deso-api"
import OwnerDashboard from "./owner-dashboard"

async function getOwnerPublicKey() {
  try {
    const response = await fetchDeSo("get-single-profile", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ PublicKeyBase58Check: "", Username: "OuwePiet" }),
      cache: "no-store",
    })
    if (!response.ok) return null
    const data = await response.json() as { Profile?: { PublicKeyBase58Check?: unknown } }
    const key = data.Profile?.PublicKeyBase58Check
    return typeof key === "string" && key.length > 20 ? key : null
  } catch {
    return null
  }
}

export default async function OwnerPage() {
  const ownerPublicKey = await getOwnerPublicKey()

  return (
    <main style={{ minHeight: "100vh", background: "#020403", color: "#f4f7f5", padding: "28px 18px 64px", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div style={{ width: "min(1120px, 100%)", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 22 }}>
          <div>
            <p style={{ color: "#8fd4a9", fontWeight: 800, letterSpacing: ".14em", fontSize: 11, margin: 0 }}>VIA · OWNER</p>
            <h1 style={{ margin: "7px 0 0", fontSize: "clamp(28px, 5vw, 46px)" }}>Personal control room</h1>
          </div>
          <Link href="/" style={{ color: "#b9ffd4", textDecoration: "none", border: "1px solid #285f40", borderRadius: 999, padding: "9px 13px" }}>← VIA</Link>
        </div>

        <OwnerDashboard ownerPublicKey={ownerPublicKey} />
      </div>
    </main>
  )
}
