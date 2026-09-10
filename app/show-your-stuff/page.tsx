import Link from "next/link"
import ParticipationGate from "../participation-gate"

const doors = [
  {
    title: "Just look around",
    text: "Come in without an account or wallet. Discover public work, creators, music, culture, communities and DeSo activity at your own pace.",
    href: "/discover",
    action: "Explore VIA",
    status: "OPEN",
  },
  {
    title: "Show your stuff",
    text: "Want to present work or take part? Participation opens through DeSo. VIA does not create a second anonymous or email-based creator account beside DeSo.",
    status: "DESO LOGIN",
  },
  {
    title: "Already on DeSo",
    text: "Use DeSo Identity to select your account. VIA keeps public discovery open while write functions are connected safely and separately.",
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
        <p style={styles.lead}>VIA is the café: anyone can walk in and discover what people make and do. Guests stay view-only. When you want to participate, VIA opens the DeSo door.</p>
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

        <ParticipationGate
          title="Ready to take part?"
          text="Continue through the official DeSo Identity flow. VIA requests the approval-required transaction level at login; ordinary browsing stays open without it."
        />

        <div style={styles.boundary}><strong>Clear boundary:</strong> guests may navigate, search, read, watch and listen, but cannot post, reply, upload, follow, like, send Diamonds, claim a maker space or perform another participation action. Sensitive NFT and financial actions additionally require explicit preflight, consent, signing and verification.</div>
        <div style={styles.boundary}><strong>Community protection:</strong> a DeSo login is the participation gate, not a trust badge. VIA can still apply spam and bot limits, link/media validation, impersonation protection and proportional restrictions for repeated abuse. Any DeSo balance or purchase requirement remains DeSo's own current rule; VIA does not invent a fixed entry payment.</div>

        <nav aria-label="Show Your Stuff navigation" style={styles.nav}>
          <Link href="/" style={styles.link}>Home</Link>
          <Link href="/discover" style={styles.link}>Discover</Link>
          <Link href="/discover/voices" style={styles.link}>New Voices</Link>
        </nav>
      </div>
    </main>
  )
}
