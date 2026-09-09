import Link from "next/link"
import SaveButton from "../saved/save-button"

const sections = [
  {
    title: "Around the World",
    text: "Travel through VIA's safe global layer using public context only. Start with world regions and public radio shortcuts without guessing where DeSo creators live.",
    href: "/discover/world",
    action: "Explore the World",
    status: "LIVE",
  },
  {
    title: "New Voices",
    text: "Open a public DeSo creator through a user-directed, read-only route. VIA does not call accounts new, verified, or organically ranked without suitable public evidence.",
    href: "/discover/voices",
    action: "Open New Voices",
    status: "LIVE",
  },
  {
    title: "NFT Window",
    text: "Open VIA's public DeSo NFT collection browser. Search a creator account and inspect NFTs without signing or spending.",
    href: "/?account=OuwePiet#collection-controls",
    action: "Open NFT Window",
    status: "LIVE",
  },
  {
    title: "Surprise Me",
    text: "Open today's deterministic VIA discovery route. It never silently signs, transacts, spends, follows, likes, or sends Diamonds.",
    href: "/discover/surprise",
    action: "Surprise Me",
    status: "DAILY",
  },
]

const styles = {
  main: { minHeight: "100vh", background: "#020403", color: "#f4f7f5", padding: "24px 16px 56px" },
  shell: { width: "min(980px, 100%)", margin: "0 auto" },
  eyebrow: { color: "#78f0a8", fontWeight: 800, letterSpacing: "0.12em", fontSize: "12px" },
  title: { fontSize: "clamp(34px, 7vw, 68px)", lineHeight: 0.98, margin: "12px 0" },
  lead: { color: "#b7c5bd", lineHeight: 1.65, maxWidth: "760px", marginBottom: "18px" },
  safety: { border: "1px solid #285f40", borderRadius: "14px", background: "#07100b", padding: "12px 14px", color: "#b9d6c4", lineHeight: 1.5, fontSize: "13px", marginBottom: "22px" },
  nav: { display: "flex", gap: "10px", flexWrap: "wrap" as const, marginBottom: "28px" },
  link: { border: "1px solid #285f40", borderRadius: "999px", padding: "9px 14px", color: "#b9ffd4", textDecoration: "none", fontWeight: 800, display: "inline-flex" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" },
  card: { border: "1px solid #285f40", borderRadius: "16px", background: "#08100b", padding: "18px" },
  cardTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" },
  cardTitle: { margin: "0 0 8px", fontSize: "19px" },
  badge: { color: "#78f0a8", border: "1px solid #285f40", borderRadius: "999px", padding: "4px 8px", fontSize: "10px", fontWeight: 900, letterSpacing: "0.08em" },
  cardText: { margin: 0, color: "#a9b8af", lineHeight: 1.55, fontSize: "14px" },
  cardAction: { marginTop: "14px", display: "flex", gap: "10px", flexWrap: "wrap" as const, alignItems: "center" },
  radio: { marginTop: "14px", border: "1px solid #347d52", borderRadius: "16px", background: "#0b1710", padding: "18px" },
}

export default function DiscoverPage() {
  return (
    <main style={styles.main}>
      <div style={styles.shell}>
        <p style={styles.eyebrow}>VIA · WORLD DISCOVERY</p>
        <h1 style={styles.title}>Discover beyond your usual DeSo circle.</h1>
        <p style={styles.lead}>
          One VIA hub for creators, NFTs, world radio and daily discovery. The foundation stays low-cost and read-only while public data and DeSo capabilities are verified step by step.
        </p>
        <div style={styles.safety}>
          Discovery is not authority: opening these routes never proves identity or location and never silently signs, spends, follows, likes, transfers assets, or sends Diamonds. Saving a route is also explicit and stays in this browser.
        </div>

        <nav aria-label="Discovery navigation" style={styles.nav}>
          <Link href="/" style={styles.link}>Home</Link>
          <Link href="/quest" style={styles.link}>World Quest</Link>
          <Link href="/radio" style={styles.link}>World Radio</Link>
          <Link href="/live" style={styles.link}>VIA LIVE</Link>
          <Link href="/saved" style={styles.link}>Saved</Link>
        </nav>

        <section style={styles.grid} aria-label="World Discovery sections">
          {sections.map((section) => (
            <article key={section.title} style={styles.card}>
              <div style={styles.cardTop}>
                <h2 style={styles.cardTitle}>{section.title}</h2>
                <span style={styles.badge}>{section.status}</span>
              </div>
              <p style={styles.cardText}>{section.text}</p>
              <div style={styles.cardAction}>
                <Link href={section.href} style={styles.link}>{section.action}</Link>
                <SaveButton title={section.title} href={section.href} kind="Discovery" />
              </div>
            </article>
          ))}
        </section>

        <section style={styles.radio}>
          <h2 style={styles.cardTitle}>World Radio · public world layer</h2>
          <p style={styles.cardText}>Explore stations by country or genre, keep local favorites, and start streams only when you choose Play. Around the World now links directly into these public country searches.</p>
          <div style={{ marginTop: "14px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <Link href="/radio" style={styles.link}>Open World Radio</Link>
            <SaveButton title="World Radio" href="/radio" kind="Listen" />
          </div>
        </section>
      </div>
    </main>
  )
}
