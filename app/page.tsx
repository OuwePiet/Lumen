import Link from "next/link"
import ViaHomeEarth from "./via-home-earth"
import ViaHomeFeatured from "./via-home-featured"
import ViaWorldClock from "./via-world-clock"

const mainActions = [
  ["Explore NFTs", "/collection"],
  ["Join the Community", "/communities"],
  ["Create a Post", "/social"],
  ["Go Live", "/live"],
] as const

const styles = {
  page: { minHeight: "calc(100vh - 68px)", background: "#050706", color: "#f5f6f5", fontFamily: "Arial, Helvetica, sans-serif", overflow: "hidden" },
  utilities: { display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", flexWrap: "wrap" as const, padding: "10px 18px 12px", borderBottom: "1px solid rgba(255,255,255,.08)", background: "rgba(4,7,5,.88)" },
  utility: { minHeight: "40px", display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "999px", border: "1px solid rgba(255,255,255,.10)", background: "rgba(7,11,9,.58)", color: "rgba(255,255,255,.82)", padding: "0 15px", fontSize: "13px", textDecoration: "none", whiteSpace: "nowrap" as const },
  search: { minWidth: "200px", justifyContent: "flex-start" as const, gap: "9px" },
  visitor: { color: "rgba(255,255,255,.66)" },
  hero: { minHeight: "700px", position: "relative" as const, overflow: "hidden", borderBottom: "1px solid rgba(255,255,255,.06)" },
  earth: { position: "absolute" as const, inset: 0, zIndex: 0, opacity: .72 },
  ghost: { position: "absolute" as const, inset: 0, zIndex: 1, pointerEvents: "none" as const, overflow: "hidden" },
  ghostLetter: { position: "absolute" as const, top: "18%", fontWeight: 300, fontSize: "clamp(250px, 35vw, 540px)", lineHeight: .8, color: "rgba(255,255,255,.018)", WebkitTextStroke: "1px rgba(255,255,255,.18)", textShadow: "0 0 28px rgba(255,255,255,.025)", userSelect: "none" as const },
  orbit: { position: "absolute" as const, left: "50%", bottom: "-420px", width: "1100px", height: "1100px", borderRadius: "50%", border: "1px solid rgba(154,219,178,.10)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.015)", zIndex: 1, animation: "viaHomeOrbit 180s linear infinite" },
  logoWrap: { position: "relative" as const, zIndex: 4, width: "min(1420px, calc(100% - 48px))", margin: "0 auto", paddingTop: "20px" },
  logo: { width: "min(155px, 20vw)", height: "auto", filter: "drop-shadow(0 10px 30px rgba(0,0,0,.35))" },
  domain: { marginTop: "5px", fontSize: "10px", letterSpacing: ".17em", color: "rgba(255,255,255,.52)" },
  copy: { position: "relative" as const, zIndex: 4, textAlign: "center" as const, maxWidth: "920px", margin: "-2px auto 0", padding: "0 24px" },
  eyebrow: { color: "#9adbb2", fontSize: "clamp(15px, 1.7vw, 20px)", letterSpacing: ".28em", textTransform: "uppercase" as const, marginBottom: "12px" },
  title: { margin: "0 auto", fontSize: "clamp(31px, 3.5vw, 40px)", lineHeight: 1.14, fontWeight: 500, maxWidth: "900px" },
  intro: { margin: "12px auto 0", fontSize: "clamp(17px, 1.8vw, 20px)", lineHeight: 1.35, color: "rgba(255,255,255,.86)", maxWidth: "780px" },
  actions: { position: "relative" as const, zIndex: 4, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: "14px", maxWidth: "1000px", margin: "22px auto 0", padding: "0 24px" },
  action: { minHeight: "58px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "15px", border: "1px solid rgba(154,219,178,.28)", background: "rgba(6,10,8,.64)", color: "#f0f5f1", textDecoration: "none", fontSize: "15px", fontWeight: 650, backdropFilter: "blur(7px)" },
  wordLine: { position: "relative" as const, zIndex: 4, margin: "30px auto 0", padding: "0 24px", maxWidth: "1250px", textAlign: "center" as const, color: "rgba(255,255,255,.22)", fontSize: "clamp(24px,4.1vw,58px)", fontWeight: 300, letterSpacing: ".12em", lineHeight: 1.15 },
  featuredWrap: { background: "#050706", paddingTop: "2px" },
  panels: { maxWidth: "1420px", margin: "14px auto 0", padding: "0 24px 22px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "14px" },
  panel: { minHeight: "92px", border: "1px solid rgba(255,255,255,.08)", borderRadius: "16px", background: "rgba(5,8,6,.58)", padding: "14px 16px", display: "flex", flexDirection: "column" as const, justifyContent: "center" },
  panelKicker: { fontSize: "9px", letterSpacing: ".16em", textTransform: "uppercase" as const, color: "rgba(255,255,255,.46)" },
  panelMain: { marginTop: "7px", fontSize: "17px", color: "#f2f5f2" },
  panelSub: { marginTop: "5px", fontSize: "12px", color: "rgba(255,255,255,.62)", lineHeight: 1.45 },
  footer: { padding: "0 0 18px", borderTop: "1px solid rgba(255,255,255,.08)", background: "rgba(4,7,5,.86)" },
  key: { maxWidth: "1180px", margin: "8px auto 0", padding: "0 20px", textAlign: "right" as const, color: "rgba(255,255,255,.72)", fontSize: "12px" },
}

export default function Home() {
  return (
    <main style={styles.page}>
      <style>{`@keyframes viaHomeOrbit{from{transform:translateX(-50%) rotate(0deg)}to{transform:translateX(-50%) rotate(360deg)}} @media (prefers-reduced-motion: reduce){.via-home-orbit{animation:none!important}}`}</style>

      <div style={styles.utilities} aria-label="VIA entrance tools">
        <Link href="/discover/voices" style={{ ...styles.utility, ...styles.search }}><span aria-hidden="true">⌕</span><span>Search members</span></Link>
        <Link href="/settings" style={styles.utility}>EN</Link>
        <span style={styles.utility} title="Public visitors can explore VIA without DeSo interaction rights.">Public Entrance</span>
        <span style={styles.utility}>Buy $DESO</span>
        <span style={{ ...styles.utility, ...styles.visitor }}>Visitors&nbsp; <strong style={{ color: "#9adbb2" }}>—</strong></span>
      </div>

      <section style={styles.hero} aria-labelledby="via-home-title">
        <div style={styles.earth}><ViaHomeEarth /></div>
        <div style={styles.ghost} aria-hidden="true">
          <span style={{ ...styles.ghostLetter, left: "-1.5%" }}>V</span>
          <span style={{ ...styles.ghostLetter, left: "43.5%", transform: "scaleX(.80)" }}>I</span>
          <span style={{ ...styles.ghostLetter, right: "-1.8%" }}>A</span>
        </div>
        <div className="via-home-orbit" style={styles.orbit} aria-hidden="true" />

        <div style={styles.logoWrap}>
          <img src="/via-logo.svg" alt="VIA" style={styles.logo} />
          <div style={styles.domain}>VIADESO.ONLINE</div>
        </div>

        <div style={styles.copy}>
          <div style={styles.eyebrow}>Art · People · Ideas · On DeSo</div>
          <h1 id="via-home-title" style={styles.title}>A global space for creators, collectors and communities.</h1>
          <p style={styles.intro}>Discover, collect, create and meet — all through VIA on DeSo.</p>
        </div>

        <div style={styles.actions} aria-label="Start with VIA">
          {mainActions.map(([label, href]) => <Link key={href} href={href} style={styles.action}>{label}</Link>)}
        </div>

        <div style={styles.wordLine}>ART · PEOPLE · IDEAS · CREATORS · COLLECTORS · COMMUNITIES · ON DESO</div>
      </section>

      <div style={styles.featuredWrap}><ViaHomeFeatured /></div>

      <section style={styles.panels} aria-label="VIA homepage highlights">
        <div style={styles.panel}><div style={styles.panelKicker}>Sponsor</div><div style={styles.panelMain}>Available</div><div style={styles.panelSub}>Logo / name appears here only when an active sponsor is connected.</div></div>
        <div style={styles.panel}><div style={styles.panelKicker}>Support VIA</div><div style={styles.panelMain}>Sponsor VIA</div><div style={styles.panelSub}>Diamonds or $DESO only through a separately verified DeSo flow.</div></div>
        <div style={styles.panel}><div style={styles.panelKicker}>Best Performer</div><div style={styles.panelMain}>—</div><div style={styles.panelSub}>Filled only from an agreed and reliable metric.</div></div>
        <div style={styles.panel}><div style={styles.panelKicker}>Creator Country</div><div style={styles.panelMain}>—</div><div style={styles.panelSub}>Flag + country only from verified creator metadata.</div></div>
      </section>

      <footer style={styles.footer}>
        <ViaWorldClock />
        <div style={styles.key}>DeSo is the Key 🔑</div>
      </footer>
    </main>
  )
}
