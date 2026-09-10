import Link from "next/link"
import SaveButton from "../saved/save-button"

const creatorWindows = [
  { title: "Art & Painting", text: "A window for painters, illustrators, digital artists and people showing work for the first time." },
  { title: "Music & Audio", text: "Discover musicians, voices, radio, sound experiments and independent releases." },
  { title: "Photography", text: "A place for photographers to show a single image, a series, a story or a growing body of work." },
  { title: "Film & Video", text: "Short film, moving image, documentary, animation and new visual work can all find an audience here." },
  { title: "NFTs & Collecting", text: "Explore DeSo NFTs and creators without making collecting the price of admission to VIA." },
  { title: "Museums & Heritage", text: "Museums, archives, history, collections and cultural heritage belong in the same daily world window." },
  { title: "Writing & Stories", text: "Writers, poets, reporters and storytellers need room to be discovered too." },
  { title: "New & Unexpected", text: "Leave room for new makers, small accounts and creative forms that do not fit an existing label yet." },
]

const sections = [
  { title: "Around the World", text: "Travel through VIA's safe global layer using public context only. Start with world regions and public radio shortcuts without guessing where DeSo creators live.", href: "/discover/world", action: "Explore the World", status: "LIVE" },
  { title: "New Voices", text: "Open a public DeSo creator through a user-directed, read-only route. VIA does not call accounts new, verified, or organically ranked without suitable public evidence.", href: "/discover/voices", action: "Open New Voices", status: "LIVE" },
  { title: "NFT Window", text: "Open VIA's public DeSo NFT collection browser. Search a creator account and inspect NFTs without signing or spending.", href: "/?account=OuwePiet#collection-controls", action: "Open NFT Window", status: "LIVE" },
  { title: "Surprise Me", text: "Open today's deterministic VIA discovery route. It never silently signs, transacts, spends, follows, likes, or sends Diamonds.", href: "/discover/surprise", action: "Surprise Me", status: "DAILY" },
]

const styles = {
  main: { minHeight: "100vh", background: "#050807", color: "#f4f7f5", padding: "24px 16px 56px" },
  shell: { width: "min(980px, 100%)", margin: "0 auto" },
  eyebrow: { color: "#8fd4a9", fontWeight: 700, letterSpacing: "0.16em", fontSize: "12px" },
  title: { fontSize: "clamp(30px, 6vw, 52px)", lineHeight: 1.02, margin: "12px 0", letterSpacing: "-0.025em" },
  lead: { color: "#aebbb4", lineHeight: 1.65, maxWidth: "760px", marginBottom: "18px" },
  welcome: { border: "1px solid rgba(143,212,169,.34)", borderRadius: "14px", background: "rgba(12,23,17,.45)", padding: "16px", marginBottom: "22px" },
  safety: { border: "1px solid rgba(113,130,120,.42)", borderRadius: "14px", background: "rgba(9,14,11,.72)", padding: "12px 14px", color: "#aebbb4", lineHeight: 1.5, fontSize: "13px", marginBottom: "22px" },
  nav: { display: "flex", gap: "9px", flexWrap: "wrap" as const, marginBottom: "28px" },
  link: { border: "1px solid rgba(143,212,169,.42)", borderRadius: "11px", padding: "9px 13px", color: "#9adbb2", background: "transparent", textDecoration: "none", fontWeight: 650, display: "inline-flex", transition: "background-color 200ms ease-out, border-color 200ms ease-out" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" },
  card: { border: "1px solid rgba(63,74,68,.72)", borderRadius: "14px", background: "rgba(9,13,11,.72)", padding: "18px" },
  cardTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" },
  cardTitle: { margin: "0 0 8px", fontSize: "19px", fontWeight: 600 },
  badge: { color: "#8fd4a9", border: "1px solid rgba(143,212,169,.3)", borderRadius: "9px", padding: "4px 7px", fontSize: "10px", fontWeight: 750, letterSpacing: "0.08em", background: "rgba(12,23,17,.45)" },
  cardText: { margin: 0, color: "#9daaa3", lineHeight: 1.55, fontSize: "14px" },
  cardAction: { marginTop: "14px", display: "flex", gap: "10px", flexWrap: "wrap" as const, alignItems: "center" },
  sectionTitle: { fontSize: "24px", margin: "32px 0 8px" },
  sectionLead: { color: "#9daaa3", lineHeight: 1.6, margin: "0 0 16px", maxWidth: "760px" },
  radio: { marginTop: "14px", border: "1px solid rgba(63,74,68,.72)", borderRadius: "14px", background: "rgba(9,13,11,.72)", padding: "18px" },
}

export default function DiscoverPage() {
  return (
    <main style={styles.main}>
      <div style={styles.shell}>
        <p style={styles.eyebrow}>VIA · DAILY WORLD WINDOW</p>
        <h1 style={styles.title}>See what people are creating today.</h1>
        <p style={styles.lead}>VIA is a daily meeting place for people who make, share, discover and enjoy things. From a first attempt to a lifetime of work, there should be room to be seen.</p>
        <div style={styles.welcome}><strong>The world is welcome. The coffee is ready. ☕</strong><p style={{ ...styles.cardText, marginTop: "7px" }}>Small or established, local or international, beginner or professional: VIA is meant to open doors, not decide who is important before they arrive.</p></div>

        <nav aria-label="Discovery navigation" style={styles.nav}>
          <Link href="/" style={styles.link}>Home</Link><Link href="/quest" style={styles.link}>World Quest</Link><Link href="/radio" style={styles.link}>World Radio</Link><Link href="/live" style={styles.link}>VIA LIVE</Link><Link href="/saved" style={styles.link}>Saved</Link>
        </nav>

        <h2 style={styles.sectionTitle}>A daily creator newspaper</h2>
        <p style={styles.sectionLead}>Not every visitor has to buy something. Browse, read, watch, listen, learn, follow a maker or discover work you would otherwise never meet.</p>
        <section style={styles.grid} aria-label="Creator windows">
          {creatorWindows.map((window) => <article key={window.title} style={styles.card}><h3 style={styles.cardTitle}>{window.title}</h3><p style={styles.cardText}>{window.text}</p></article>)}
        </section>

        <h2 style={styles.sectionTitle}>Discover VIA</h2>
        <section style={styles.grid} aria-label="World Discovery sections">
          {sections.map((section) => (
            <article key={section.title} style={styles.card}>
              <div style={styles.cardTop}><h3 style={styles.cardTitle}>{section.title}</h3><span style={styles.badge}>{section.status}</span></div>
              <p style={styles.cardText}>{section.text}</p>
              <div style={styles.cardAction}><Link href={section.href} style={styles.link}>{section.action}</Link><SaveButton title={section.title} href={section.href} kind="Discovery" /></div>
            </article>
          ))}
        </section>

        <div style={{ ...styles.safety, marginTop: "22px" }}>Discovery is not authority: opening these routes never proves identity or location and never silently signs, spends, follows, likes, transfers assets, or sends Diamonds. Saving a route is explicit and stays in this browser.</div>

        <section style={styles.radio}>
          <h2 style={styles.cardTitle}>World Radio · public world layer</h2>
          <p style={styles.cardText}>Explore stations by country or genre, keep local favorites, and start streams only when you choose Play. Around the World links directly into these public country searches.</p>
          <div style={{ marginTop: "14px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}><Link href="/radio" style={styles.link}>Open World Radio</Link><SaveButton title="World Radio" href="/radio" kind="Listen" /></div>
        </section>
      </div>
    </main>
  )
}
