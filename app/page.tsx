import Link from "next/link"
import ViaHomeEarth from "./via-home-earth"
import ViaHomeFeatured from "./via-home-featured"
import ViaHomeSignature from "./via-home-signature"
import ViaWorldClock from "./via-world-clock"

const mainActions = [
  ["Explore NFTs", "/collection", "▧"],
  ["Join the Community", "/communities", "◎"],
  ["Create a Post", "/social", "✎"],
  ["Go Live", "/live", "◉"],
] as const

const styles = {
  page: { minHeight: "calc(100vh - 68px)", background: "#020604", color: "#f4f7f5", fontFamily: "Arial, Helvetica, sans-serif", position: "relative" as const, overflow: "hidden" },
  shell: { width: "min(1480px, calc(100% - 40px))", margin: "0 auto", position: "relative" as const, zIndex: 2, padding: "clamp(46px, 6vw, 86px) 0 26px" },
  hero: { maxWidth: "920px", margin: "0 auto", textAlign: "center" as const, position: "relative" as const, zIndex: 3 },
  kicker: { color: "#9adbb2", fontSize: "clamp(12px, 1.35vw, 16px)", fontWeight: 700, letterSpacing: ".46em", textTransform: "uppercase" as const, marginBottom: "18px" },
  title: { margin: 0, color: "#edf2ef", fontSize: "clamp(29px, 4vw, 52px)", fontWeight: 500, letterSpacing: "-.035em", lineHeight: 1.06 },
  intro: { margin: "15px auto 0", maxWidth: "620px", color: "#abb7b0", fontSize: "clamp(14px, 1.5vw, 17px)", fontStyle: "italic" as const, lineHeight: 1.55 },
  actions: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", maxWidth: "1000px", margin: "clamp(230px, 28vw, 350px) auto 0", position: "relative" as const, zIndex: 4 },
  action: { minHeight: "58px", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", border: "1px solid rgba(143,212,169,.42)", borderRadius: "12px", background: "rgba(3,8,5,.76)", color: "#bfe8cc", textDecoration: "none", fontSize: "14px", fontWeight: 700, backdropFilter: "blur(9px)", boxShadow: "0 12px 35px rgba(0,0,0,.16)" },
  icon: { color: "#9adbb2", fontSize: "20px", lineHeight: 1 },
  footer: { marginTop: "28px", borderTop: "1px solid rgba(143,212,169,.14)", paddingTop: "16px", position: "relative" as const, zIndex: 4 },
  footerTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "18px", flexWrap: "wrap" as const },
  brandLine: { display: "flex", alignItems: "center", gap: "10px", color: "#9adbb2", fontSize: "13px", fontWeight: 700 },
  leaf: { width: "26px", height: "26px" },
  motto: { color: "#7f8e85", fontSize: "11px", letterSpacing: ".03em" },
  key: { color: "#c6d0ca", fontSize: "11px" },
  keyMark: { color: "#d7b86b", marginLeft: "6px" },
  clockWrap: { marginTop: "6px" },
}

export default function Home() {
  return (
    <main style={styles.page}>
      <ViaHomeSignature />
      <ViaHomeEarth />
      <div style={styles.shell}>
        <section style={styles.hero} aria-labelledby="via-home-title">
          <div style={styles.kicker}>Art · People · Ideas · On DeSo</div>
          <h1 id="via-home-title" style={styles.title}>A global space for creators, collectors and communities.</h1>
          <p style={styles.intro}>Discover, collect, create and meet — all through VIA on DeSo.</p>
        </section>

        <section style={styles.actions} aria-label="Start with VIA">
          {mainActions.map(([label, href, icon]) => (
            <Link key={href} href={href} style={styles.action}>
              <span style={styles.icon} aria-hidden="true">{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </section>

        <ViaHomeFeatured />

        <footer style={styles.footer}>
          <div style={styles.footerTop}>
            <div style={styles.brandLine}>
              <img src="/via-leaf.svg" alt="" style={styles.leaf} />
              <span>VIA</span>
              <span style={styles.motto}>Art · Community · Freedom · On DeSo</span>
            </div>
            <div style={styles.key}>DeSo is the Key <span style={styles.keyMark}>🔑</span></div>
          </div>
          <div style={styles.clockWrap}><ViaWorldClock /></div>
        </footer>
      </div>
    </main>
  )
}
