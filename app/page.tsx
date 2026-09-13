import Link from "next/link"
import ViaHomeEarth from "./via-home-earth"
import ViaHomeSignature from "./via-home-signature"
import ViaWorldClock from "./via-world-clock"

const mainActions = [
  ["Explore NFTs", "/collection", "▧"],
  ["Join the Community", "/communities", "◎"],
  ["Create a Post", "/social", "✎"],
  ["Go Live", "/live", "◉"],
] as const

const discover = [
  ["Discover", "/discover"],
  ["Market", "/market"],
  ["My VIA", "/my-via"],
  ["Studio", "/studio"],
  ["News", "/news"],
  ["World Radio", "/radio"],
  ["World Quest", "/quest"],
  ["Saved", "/saved"],
] as const

const styles = {
  page: { minHeight: "calc(100vh - 68px)", background: "#030705", color: "#f4f7f5", fontFamily: "Arial, Helvetica, sans-serif", position: "relative" as const, overflow: "hidden" },
  shell: { width: "min(1480px, calc(100% - 40px))", margin: "0 auto", position: "relative" as const, zIndex: 2, padding: "clamp(54px, 8vw, 108px) 0 58px" },
  hero: { maxWidth: "960px", margin: "0 auto", textAlign: "center" as const, position: "relative" as const, zIndex: 3 },
  kicker: { color: "#9adbb2", fontSize: "clamp(12px, 1.5vw, 17px)", fontWeight: 700, letterSpacing: ".46em", textTransform: "uppercase" as const, marginBottom: "18px" },
  title: { margin: 0, color: "#eaf0ec", fontSize: "clamp(30px, 4.2vw, 58px)", fontWeight: 500, letterSpacing: "-.03em", lineHeight: 1.05 },
  intro: { margin: "18px auto 0", maxWidth: "660px", color: "#b1bcb5", fontSize: "clamp(14px, 1.6vw, 18px)", fontStyle: "italic" as const, lineHeight: 1.55 },
  actions: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "14px", maxWidth: "1020px", margin: "clamp(190px, 28vw, 360px) auto 0", position: "relative" as const, zIndex: 4 },
  action: { minHeight: "58px", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", border: "1px solid rgba(143,212,169,.42)", borderRadius: "12px", background: "rgba(5,11,8,.74)", color: "#bfe8cc", textDecoration: "none", fontSize: "14px", fontWeight: 700, backdropFilter: "blur(8px)" },
  icon: { color: "#9adbb2", fontSize: "20px", lineHeight: 1 },
  lower: { marginTop: "42px", borderTop: "1px solid rgba(143,212,169,.13)", paddingTop: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "18px", flexWrap: "wrap" as const },
  discover: { display: "flex", gap: "8px", flexWrap: "wrap" as const },
  discoverLink: { color: "#aebbb4", textDecoration: "none", border: "1px solid rgba(80,103,91,.42)", borderRadius: "999px", padding: "8px 12px", fontSize: "11px", fontWeight: 650 },
  motto: { display: "flex", alignItems: "center", gap: "8px", color: "#849289", fontSize: "11px" },
  leaf: { width: "24px", height: "24px" },
  clockWrap: { marginTop: "24px" },
  mobileNote: { margin: "20px auto 0", maxWidth: "760px", color: "#6f7d75", fontSize: "11px", lineHeight: 1.5, textAlign: "center" as const },
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
          <p style={styles.intro}>One calm entrance to discover, collect, create, talk and meet — all through VIA on DeSo.</p>
        </section>

        <section style={styles.actions} aria-label="Start with VIA">
          {mainActions.map(([label, href, icon]) => (
            <Link key={href} href={href} style={styles.action}>
              <span style={styles.icon} aria-hidden="true">{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </section>

        <section style={styles.lower} aria-label="More VIA destinations">
          <div style={styles.discover}>
            {discover.map(([label, href]) => <Link key={href} href={href} style={styles.discoverLink}>{label}</Link>)}
          </div>
          <div style={styles.motto}>
            <img src="/via-leaf.svg" alt="" style={styles.leaf} />
            <span>Art · Community · Freedom · On DeSo</span>
          </div>
        </section>

        <div style={styles.clockWrap}><ViaWorldClock /></div>
        <p style={styles.mobileNote}>VIA keeps public discovery open while DeSo participation and transaction actions remain on their guarded approval paths.</p>
      </div>
    </main>
  )
}
