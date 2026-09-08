import Link from "next/link"

const regions = [
  { name: "Europe", countries: ["Netherlands", "Germany", "United Kingdom"] },
  { name: "North America", countries: ["United States", "Canada", "Mexico"] },
  { name: "South America", countries: ["Brazil", "Argentina", "Chile"] },
  { name: "Africa", countries: ["South Africa", "Nigeria", "Kenya"] },
  { name: "Asia", countries: ["India", "Japan", "Philippines"] },
  { name: "Oceania", countries: ["Australia", "New Zealand"] },
]

const styles = {
  main: { minHeight: "100vh", background: "#020403", color: "#f4f7f5", padding: "24px 16px 56px" },
  shell: { width: "min(980px, 100%)", margin: "0 auto" },
  eyebrow: { color: "#78f0a8", fontWeight: 800, letterSpacing: "0.12em", fontSize: "12px" },
  title: { fontSize: "clamp(34px, 7vw, 68px)", lineHeight: 0.98, margin: "12px 0" },
  lead: { color: "#b7c5bd", lineHeight: 1.65, maxWidth: "760px", marginBottom: "24px" },
  nav: { display: "flex", gap: "10px", flexWrap: "wrap" as const, marginBottom: "28px" },
  link: { border: "1px solid #285f40", borderRadius: "999px", padding: "9px 14px", color: "#b9ffd4", textDecoration: "none", fontWeight: 800, display: "inline-flex" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" },
  card: { border: "1px solid #285f40", borderRadius: "16px", background: "#08100b", padding: "18px" },
  cardTitle: { margin: "0 0 8px", fontSize: "19px" },
  cardText: { margin: "0 0 14px", color: "#a9b8af", lineHeight: 1.55, fontSize: "14px" },
  actions: { display: "flex", gap: "8px", flexWrap: "wrap" as const },
  countryLinks: { display: "flex", gap: "8px", flexWrap: "wrap" as const, marginBottom: "12px" },
  notice: { marginTop: "18px", border: "1px solid #347d52", borderRadius: "16px", background: "#0b1710", padding: "18px", color: "#cde8d8", lineHeight: 1.55 },
}

export default function AroundTheWorldPage() {
  return (
    <main style={styles.main}>
      <div style={styles.shell}>
        <p style={styles.eyebrow}>VIA · AROUND THE WORLD</p>
        <h1 style={styles.title}>Explore globally without guessing where people are.</h1>
        <p style={styles.lead}>
          VIA currently uses only verified public context for geographic discovery. Until a reliable public DeSo location signal is available, this route does not infer creator locations from names, language, network data, devices, or behavior.
        </p>

        <nav aria-label="Around the World navigation" style={styles.nav}>
          <Link href="/discover" style={styles.link}>World Discovery</Link>
          <Link href="/radio" style={styles.link}>World Radio</Link>
          <Link href="/discover/voices" style={styles.link}>New Voices</Link>
          <Link href="/" style={styles.link}>NFT Window</Link>
        </nav>

        <section style={styles.grid} aria-label="World regions">
          {regions.map((region) => (
            <article key={region.name} style={styles.card}>
              <h2 style={styles.cardTitle}>{region.name}</h2>
              <p style={styles.cardText}>
                Region labels are navigation only. The country shortcuts below search public World Radio station metadata; they do not claim that DeSo creators are located there.
              </p>
              <div style={styles.countryLinks}>
                {region.countries.map((country) => (
                  <Link key={country} href={`/radio?country=${encodeURIComponent(country)}`} style={styles.link}>{country}</Link>
                ))}
              </div>
              <div style={styles.actions}>
                <Link href="/discover/voices" style={styles.link}>Open creators</Link>
              </div>
            </article>
          ))}
        </section>

        <div style={styles.notice}>
          Around the World becomes richer only when VIA can verify a suitable public source. Radio country shortcuts use public station-directory metadata only; VIA still performs no private creator-location inference and no paid placement disguised as organic discovery.
        </div>
      </div>
    </main>
  )
}
