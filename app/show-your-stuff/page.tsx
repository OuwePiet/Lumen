import Link from "next/link"

const doors = [
  {
    title: "Just look around",
    text: "Come in without a wallet. Discover public work, creators, music, culture, communities and DeSo activity at your own pace.",
    href: "/discover",
    action: "Explore VIA",
    status: "OPEN",
  },
  {
    title: "Show your stuff",
    text: "A simple showcase route is being prepared for makers who are not ready to use DeSo. It is for showing work and meeting people — not a VIA shop or general marketplace.",
    status: "PREPARING",
  },
  {
    title: "Join through DeSo",
    text: "Already on DeSo? VIA keeps the existing DeSo route for public profiles, social participation and the DeSo-native NFT functions as they are safely connected.",
    href: "/social",
    action: "Open DeSo side",
    status: "DESO",
  },
]

const styles = {
  main: { minHeight: "100vh", background: "#050807", color: "#f4f7f5", padding: "24px 16px 56px" },
  shell: { width: "min(920px, 100%)", margin: "0 auto" },
  eyebrow: { color: "#8fd4a9", fontWeight: 700, letterSpacing: "0.16em", fontSize: "12px" },
  title: { fontSize: "clamp(30px, 6vw, 52px)", lineHeight: 1.02, margin: "12px 0", letterSpacing: "-0.025em" },
  lead: { color: "#aebbb4", lineHeight: 1.65, maxWidth: "760px", marginBottom: "18px" },
  welcome: { border: "1px solid rgba(143,212,169,.34)", borderRadius: "14px", background: "rgba(12,23,17,.45)", padding: "16px", marginBottom: "22px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "14px" },
  card: { border: "1px solid rgba(63,74,68,.72)", borderRadius: "14px", background: "rgba(9,13,11,.72)", padding: "18px" },
  cardTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" },
  cardTitle: { margin: "0 0 8px", fontSize: "19px", fontWeight: 600 },
  cardText: { margin: 0, color: "#9daaa3", lineHeight: 1.55, fontSize: "14px" },
  badge: { color: "#8fd4a9", border: "1px solid rgba(143,212,169,.3)", borderRadius: "9px", padding: "4px 7px", fontSize: "10px", fontWeight: 750, letterSpacing: "0.08em" },
  link: { marginTop: "14px", border: "1px solid rgba(143,212,169,.42)", borderRadius: "11px", padding: "9px 13px", color: "#9adbb2", textDecoration: "none", fontWeight: 650, display: "inline-flex" },
  boundary: { marginTop: "22px", border: "1px solid rgba(113,130,120,.42)", borderRadius: "14px", background: "rgba(9,14,11,.72)", padding: "14px", color: "#aebbb4", lineHeight: 1.55, fontSize: "13px" },
  nav: { display: "flex", gap: "9px", flexWrap: "wrap" as const, marginTop: "22px" },
}

export default function ShowYourStuffPage() {
  return (
    <main style={styles.main}>
      <div style={styles.shell}>
        <p style={styles.eyebrow}>VIA · COME IN</p>
        <h1 style={styles.title}>Show your stuff. Meet the world.</h1>
        <p style={styles.lead}>VIA is the café: a place to discover what people make and do. You do not need to understand blockchain to walk in. DeSo remains the network VIA opens onto when you want to participate there.</p>
        <div style={styles.welcome}><strong>The world is welcome. The coffee is ready. ☕</strong><p style={{ ...styles.cardText, marginTop: "7px" }}>Art, photography, music, film, writing, NFTs, heritage, hobbies, communities and things we have not thought of yet all belong at the table.</p></div>

        <section style={styles.grid} aria-label="Ways into VIA">
          {doors.map((door) => (
            <article key={door.title} style={styles.card}>
              <div style={styles.cardTop}><h2 style={styles.cardTitle}>{door.title}</h2><span style={styles.badge}>{door.status}</span></div>
              <p style={styles.cardText}>{door.text}</p>
              {door.href ? <Link href={door.href} style={styles.link}>{door.action}</Link> : null}
            </article>
          ))}
        </section>

        <div style={styles.boundary}><strong>Clear boundary:</strong> Show Your Stuff is not a general VIA buy/sell system. People may meet here and arrange ordinary trade elsewhere. DeSo-native NFT and blockchain functions keep their existing VIA safety path. VIA never silently creates a wallet, signs, spends, follows, likes or sends a Diamond.</div>
        <div style={styles.boundary}><strong>Community first:</strong> before public showcase submissions open, VIA will add suitable account control, spam and bot limits, link/media validation, impersonation protection and understandable restrictions for repeated abuse. Reading stays low-friction.</div>

        <nav aria-label="Show Your Stuff navigation" style={styles.nav}>
          <Link href="/" style={styles.link}>Home</Link>
          <Link href="/discover" style={styles.link}>Discover</Link>
          <Link href="/discover/voices" style={styles.link}>New Voices</Link>
        </nav>
      </div>
    </main>
  )
}
