import Link from "next/link"
import ViaHomeEarth from "./via-home-earth"
import ViaHomeFeatured from "./via-home-featured"
import ViaWorldClock from "./via-world-clock"

const mainActions = [
  ["Explore NFTs", "/collection", "◇"],
  ["Join the Community", "/communities", "◎"],
  ["Create a Post", "/social", "✎"],
  ["Go Live", "/live", "◉"],
] as const

const styles = {
  page: {
    minHeight: "calc(100vh - 68px)",
    background: "#010403",
    color: "#f5f7f6",
    fontFamily: "Arial, Helvetica, sans-serif",
    position: "relative" as const,
    overflow: "hidden",
  },
  tools: {
    minHeight: "58px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap" as const,
    gap: "8px",
    padding: "10px 20px",
    borderBottom: "1px solid rgba(143,212,169,.11)",
    background: "rgba(2,7,4,.93)",
    position: "relative" as const,
    zIndex: 6,
  },
  tool: {
    minHeight: "38px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "0 15px",
    border: "1px solid rgba(143,212,169,.18)",
    borderRadius: "999px",
    background: "rgba(4,10,6,.62)",
    color: "#c8d3cd",
    textDecoration: "none",
    fontSize: "12px",
    whiteSpace: "nowrap" as const,
  },
  search: { minWidth: "210px", justifyContent: "flex-start" as const },
  quiet: { color: "#88978f" },
  stage: {
    minHeight: "clamp(720px, 76vw, 910px)",
    position: "relative" as const,
    overflow: "hidden",
  },
  shell: {
    width: "min(1480px, calc(100% - 40px))",
    margin: "0 auto",
    position: "relative" as const,
    zIndex: 2,
    minHeight: "inherit",
    padding: "32px 0 0",
  },
  actionRail: {
    position: "absolute" as const,
    left: 0,
    top: "48px",
    width: "min(240px, 22vw)",
    display: "grid",
    gap: "12px",
    zIndex: 5,
  },
  action: {
    minHeight: "52px",
    display: "flex",
    alignItems: "center",
    gap: "13px",
    padding: "0 20px",
    border: "1px solid rgba(122,217,164,.62)",
    borderRadius: "13px",
    background: "rgba(2,10,6,.72)",
    color: "#f0f5f2",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 650,
    backdropFilter: "blur(8px)",
    boxShadow: "0 12px 30px rgba(0,0,0,.16)",
  },
  actionIcon: { color: "#91ddb1", fontSize: "19px", width: "24px", textAlign: "center" as const },
  hero: {
    position: "relative" as const,
    zIndex: 4,
    maxWidth: "900px",
    margin: "0 auto",
    padding: "34px 20px 0",
    textAlign: "center" as const,
  },
  kicker: {
    margin: "0 auto 19px",
    color: "#75d59e",
    fontSize: "clamp(11px, 1.18vw, 15px)",
    fontWeight: 650,
    letterSpacing: ".28em",
    lineHeight: 1.8,
    textTransform: "uppercase" as const,
  },
  title: {
    margin: 0,
    color: "#f2f5f3",
    fontSize: "clamp(32px, 4.1vw, 52px)",
    fontWeight: 500,
    letterSpacing: "-.035em",
    lineHeight: 1.08,
    textShadow: "0 2px 24px rgba(0,0,0,.48)",
  },
  featured: {
    position: "absolute" as const,
    left: 0,
    right: 0,
    bottom: "48px",
    zIndex: 5,
  },
  footer: {
    borderTop: "1px solid rgba(143,212,169,.13)",
    background: "#020504",
    padding: "10px 0 18px",
    position: "relative" as const,
    zIndex: 4,
  },
  footerInner: { width: "min(1480px, calc(100% - 40px))", margin: "0 auto" },
  footerBottom: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "7px 20px 0",
    color: "#c8d1cc",
    fontSize: "11px",
  },
}

export default function Home() {
  return (
    <main style={styles.page}>
      <section style={styles.tools} aria-label="VIA entrance tools">
        <Link href="/discover/voices" style={{ ...styles.tool, ...styles.search }}>
          <span aria-hidden="true">⌕</span><span>Search members</span>
        </Link>
        <Link href="/settings" style={styles.tool}>EN</Link>
        <span style={styles.tool} title="Public visitors can explore VIA without DeSo interaction rights.">Public Entrance</span>
        <Link href="/wallet" style={styles.tool}>Buy $DESO</Link>
        <span style={{ ...styles.tool, ...styles.quiet }} title="A total visitor count appears only when a reliable counter is connected.">Visitors —</span>
      </section>

      <section style={styles.stage} aria-labelledby="via-home-title">
        <ViaHomeEarth />
        <div style={styles.shell}>
          <nav style={styles.actionRail} aria-label="Start with VIA">
            {mainActions.map(([label, href, icon]) => (
              <Link key={href} href={href} style={styles.action}>
                <span style={styles.actionIcon} aria-hidden="true">{icon}</span>
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          <div style={styles.hero}>
            <div style={styles.kicker}>Art · People · Ideas · Creators · Collectors · Communities · Musicians</div>
            <h1 id="via-home-title" style={styles.title}>A global space for creators, collectors and communities.</h1>
          </div>

          <div style={styles.featured}>
            <ViaHomeFeatured />
          </div>
        </div>
      </section>

      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <ViaWorldClock />
          <div style={styles.footerBottom}>DeSo is the Key <span style={{ marginLeft: "6px", color: "#d7b86b" }}>🔑</span></div>
        </div>
      </footer>
    </main>
  )
}
