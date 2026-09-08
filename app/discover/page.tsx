import Link from "next/link"

const sections = [
  {
    title: "Around the World",
    text: "Discover public DeSo activity through transparent, read-only views. Country context is shown only when it comes from suitable public data; VIA does not infer private location.",
  },
  {
    title: "New Voices",
    text: "A future read-only window for newer or less-visible public creators. No paid placement is presented as organic discovery.",
  },
  {
    title: "NFT Window",
    text: "Open VIA's existing public DeSo NFT collection browser. Search a public creator account and inspect NFTs without signing or spending.",
    href: "/?account=OuwePiet#collection-controls",
    action: "Open NFT Window",
  },
  {
    title: "Surprise Me",
    text: "Open today's deterministic discovery route. It never silently signs, transacts, spends, follows, likes, or sends Diamonds.",
    href: "/discover/surprise",
    action: "Surprise Me",
  },
]

const styles = {
  main: { minHeight: "100vh", background: "#020403", color: "#f4f7f5", padding: "24px 16px 56px" },
  shell: { width: "min(980px, 100%)", margin: "0 auto" },
  eyebrow: { color: "#78f0a8", fontWeight: 800, letterSpacing: "0.12em", fontSize: "12px" },
  title: { fontSize: "clamp(34px, 7vw, 68px)", lineHeight: 0.98, margin: "12px 0" },
  lead: { color: "#b7c5bd", lineHeight: 1.65, maxWidth: "720px", marginBottom: "24px" },
  nav: { display: "flex", gap: "10px", flexWrap: "wrap" as const, marginBottom: "28px" },
  link: { border: "1px solid #285f40", borderRadius: "999px", padding: "9px 14px", color: "#b9ffd4", textDecoration: "none", fontWeight: 800, display: "inline-flex" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" },
  card: { border: "1px solid #285f40", borderRadius: "16px", background: "#08100b", padding: "18px" },
  cardTitle: { margin: "0 0 8px", fontSize: "19px" },
  cardText: { margin: 0, color: "#a9b8af", lineHeight: 1.55, fontSize: "14px" },
  cardAction: { marginTop: "14px" },
  radio: { marginTop: "14px", border: "1px solid #347d52", borderRadius: "16px", background: "#0b1710", padding: "18px" },
}

export default function DiscoverPage() {
  return (
    <main style={styles.main}>
      <div style={styles.shell}>
        <p style={styles.eyebrow}>VIA · WORLD DISCOVERY</p>
        <h1 style={styles.title}>Discover DeSo beyond your usual circle.</h1>
        <p style={styles.lead}>
          World Discovery starts as a low-cost, read-only layer. It connects VIA's existing public NFT and World Radio foundations without pretending that unverified rankings, locations, sponsorships, or blockchain actions are something else.
        </p>

        <nav aria-label="Discovery navigation" style={styles.nav}>
          <Link href="/" style={styles.link}>Home</Link>
          <Link href="/quest" style={styles.link}>World Quest</Link>
          <Link href="/radio" style={styles.link}>World Radio</Link>
          <Link href="/live" style={styles.link}>VIA LIVE</Link>
        </nav>

        <section style={styles.grid} aria-label="World Discovery sections">
          {sections.map((section) => (
            <article key={section.title} style={styles.card}>
              <h2 style={styles.cardTitle}>{section.title}</h2>
              <p style={styles.cardText}>{section.text}</p>
              {section.href && section.action ? (
                <p style={styles.cardAction}><Link href={section.href} style={styles.link}>{section.action}</Link></p>
              ) : null}
            </article>
          ))}
        </section>

        <section style={styles.radio}>
          <h2 style={styles.cardTitle}>World Radio is already live in VIA</h2>
          <p style={styles.cardText}>Explore stations by country or genre, keep local favorites, and start streams only when you choose Play.</p>
          <p style={{ margin: "14px 0 0" }}><Link href="/radio" style={styles.link}>Open World Radio</Link></p>
        </section>
      </div>
    </main>
  )
}
