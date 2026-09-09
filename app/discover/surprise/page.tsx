import Link from "next/link"

export const dynamic = "force-dynamic"

const routes = [
  { title: "NFT Window", text: "Explore a public DeSo NFT collection without signing or spending.", href: "/?account=OuwePiet#collection-controls" },
  { title: "World Radio", text: "Discover an external station directory through VIA. Playback starts only when you choose Play.", href: "/radio" },
  { title: "World Quest", text: "Open VIA's discovery games and local progress layer.", href: "/quest" },
  { title: "VIA LIVE", text: "See VIA's audio-first community foundation and Replay status.", href: "/live" },
]

function utcDayNumber() {
  return Math.floor(Date.now() / 86_400_000)
}

export default function SurprisePage() {
  const route = routes[utcDayNumber() % routes.length]
  return (
    <main style={{ minHeight: "100vh", background: "#020403", color: "#f4f7f5", padding: "32px 18px 64px", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div style={{ width: "min(760px, 100%)", margin: "0 auto" }}>
        <p style={{ color: "#78f0a8", fontWeight: 800, letterSpacing: "0.12em", fontSize: "12px" }}>VIA · SURPRISE ME</p>
        <h1 style={{ fontSize: "clamp(36px, 8vw, 72px)", lineHeight: 0.98, margin: "12px 0" }}>Today&apos;s discovery route</h1>
        <p style={{ color: "#b7c5bd", lineHeight: 1.65 }}>One deterministic route per UTC day. No random paid placement, no hidden ranking, no signing, no spending and no blockchain write.</p>
        <section style={{ marginTop: "28px", border: "1px solid #347d52", borderRadius: "20px", background: "#08100b", padding: "24px" }}>
          <p style={{ color: "#78f0a8", fontWeight: 800, margin: "0 0 8px" }}>ROUTE OF THE DAY</p>
          <h2 style={{ margin: "0 0 10px", fontSize: "28px" }}>{route.title}</h2>
          <p style={{ color: "#a9b8af", lineHeight: 1.6 }}>{route.text}</p>
          <Link href={route.href} style={{ display: "inline-flex", marginTop: "12px", border: "1px solid #285f40", borderRadius: "999px", padding: "10px 15px", color: "#b9ffd4", textDecoration: "none", fontWeight: 800 }}>Open route</Link>
        </section>
        <p style={{ marginTop: "24px" }}><Link href="/discover" style={{ color: "#b9ffd4" }}>← Back to World Discovery</Link></p>
      </div>
    </main>
  )
}
