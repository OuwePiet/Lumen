import ViaHomeEarth from "./via-home-earth"
import ViaHomeSignature from "./via-home-signature"
import ViaWorldClock from "./via-world-clock"

const primary = [
  ["Social", "/social", "Posts, replies, likes, reposts and DeSo Diamonds."],
  ["NFT Collection", "/collection", "Browse DeSo NFTs, search creators and open NFT details."],
  ["Market", "/market", "NFT market, bids, sales and transfers."],
  ["My VIA", "/my-via", "Your personal VIA overview."],
  ["Studio", "/studio", "Create and prepare your own work."],
  ["Discover", "/discover", "Find creators, media and new activity."],
  ["Communities", "/communities", "Explore VIA community interests."],
  ["News", "/news", "VIA and DeSo news."],
] as const

const more = [
  ["VIA LIVE", "/live"],
  ["Events", "/events"],
  ["Learn", "/learn"],
  ["Quest", "/quest"],
  ["World Radio", "/radio"],
  ["Saved", "/saved"],
  ["Notifications", "/notifications"],
  ["Ideas", "/ideas"],
  ["Show your stuff", "/show-your-stuff"],
  ["Payment info", "/payment-info"],
  ["Transparency", "/transparency"],
] as const

const styles = {
  page: { minHeight: "100vh", background: "#050807", color: "#f4f7f5", fontFamily: "Arial, Helvetica, sans-serif", position: "relative" as const, overflow: "hidden" },
  shell: { width: "min(1480px, calc(100% - 40px))", margin: "0 auto", position: "relative" as const, zIndex: 1, padding: "28px 0 72px" },
  top: { display: "flex", justifyContent: "space-between", gap: "20px", alignItems: "center", flexWrap: "wrap" as const, marginBottom: "72px" },
  brand: { display: "flex", gap: "12px", alignItems: "center", textDecoration: "none" },
  mark: { width: "42px", height: "42px", display: "grid", placeItems: "center", border: "1px solid rgba(143,212,169,.34)", borderRadius: "12px", color: "#9adbb2", fontWeight: 800, background: "rgba(12,23,17,.48)" },
  brandText: { display: "grid", gap: "2px" },
  via: { color: "#9adbb2", fontSize: "14px", fontWeight: 800, letterSpacing: ".16em" },
  domain: { color: "#76837b", fontSize: "11px", letterSpacing: ".08em" },
  quickNav: { display: "flex", gap: "8px", flexWrap: "wrap" as const, justifyContent: "flex-end" },
  quickLink: { color: "#c1cbc5", textDecoration: "none", border: "1px solid rgba(113,130,120,.58)", borderRadius: "11px", padding: "10px 13px", fontSize: "12px", fontWeight: 700 },
  hero: { maxWidth: "900px", marginBottom: "46px" },
  kicker: { color: "#8fd4a9", fontSize: "12px", fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase" as const, marginBottom: "12px" },
  title: { fontSize: "clamp(42px, 7vw, 86px)", lineHeight: .94, letterSpacing: "-.045em", margin: "0 0 22px", fontWeight: 700 },
  intro: { color: "#a2afa7", fontSize: "clamp(16px, 2vw, 20px)", lineHeight: 1.6, maxWidth: "820px", margin: 0 },
  sectionTitle: { fontSize: "13px", color: "#9adbb2", textTransform: "uppercase" as const, letterSpacing: ".14em", margin: "0 0 14px", fontWeight: 800 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px", marginBottom: "36px" },
  card: { display: "block", minHeight: "142px", padding: "20px", border: "1px solid rgba(70,91,80,.72)", borderRadius: "16px", background: "rgba(8,14,11,.76)", textDecoration: "none", color: "inherit" },
  cardTitle: { display: "block", color: "#e8efeb", fontSize: "17px", fontWeight: 700, marginBottom: "9px" },
  cardText: { display: "block", color: "#8f9e95", fontSize: "13px", lineHeight: 1.55 },
  more: { display: "flex", flexWrap: "wrap" as const, gap: "9px", marginBottom: "30px" },
  moreLink: { color: "#c6d0ca", textDecoration: "none", border: "1px solid rgba(70,91,80,.72)", background: "rgba(8,14,11,.62)", borderRadius: "999px", padding: "10px 14px", fontSize: "12px", fontWeight: 700 },
  note: { color: "#738078", fontSize: "12px", lineHeight: 1.6, marginTop: "24px" },
}

export default function Home() {
  return (
    <main style={styles.page}>
      <ViaHomeSignature />
      <ViaHomeEarth />
      <div style={styles.shell}>
        <header style={styles.top}>
          <a href="/" style={styles.brand} aria-label="VIA home">
            <span style={styles.mark} aria-hidden="true">V</span>
            <span style={styles.brandText}>
              <span style={styles.via}>VIA</span>
              <span style={styles.domain}>viadeso.online</span>
            </span>
          </a>
          <nav style={styles.quickNav} aria-label="VIA primary navigation">
            <a href="/social" style={styles.quickLink}>Social</a>
            <a href="/collection" style={styles.quickLink}>NFTs</a>
            <a href="/market" style={styles.quickLink}>Market</a>
            <a href="/my-via" style={styles.quickLink}>My VIA</a>
            <a href="/studio" style={styles.quickLink}>Studio</a>
            <a href="/discover" style={styles.quickLink}>Discover</a>
          </nav>
        </header>

        <section style={styles.hero}>
          <div style={styles.kicker}>DeSo through VIA</div>
          <h1 style={styles.title}>One entrance.<br />Your VIA through DeSo.</h1>
          <p style={styles.intro}>Start with social, NFTs, the market or your own VIA space. From here every main part of the platform has a clear place and a direct route.</p>
        </section>

        <section aria-labelledby="via-main-areas">
          <h2 id="via-main-areas" style={styles.sectionTitle}>Main areas</h2>
          <div style={styles.grid}>
            {primary.map(([label, href, description]) => (
              <a key={href} href={href} style={styles.card}>
                <span style={styles.cardTitle}>{label}</span>
                <span style={styles.cardText}>{description}</span>
              </a>
            ))}
          </div>
        </section>

        <section aria-labelledby="via-more">
          <h2 id="via-more" style={styles.sectionTitle}>More VIA</h2>
          <div style={styles.more}>
            {more.map(([label, href]) => (
              <a key={href} href={href} style={styles.moreLink}>{label}</a>
            ))}
          </div>
        </section>

        <p style={styles.note}>VIA uses DeSo network data and keeps the main platform areas separated so each page can carry the controls that belong there.</p>
        <ViaWorldClock />
      </div>
    </main>
  )
}
