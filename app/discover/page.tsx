import Link from "next/link"
import SaveButton from "../saved/save-button"

type CreatorWindowKind = "visual" | "audio" | "video" | "collectible" | "heritage" | "writing" | "discovery"
type CreatorWindow = { title: string; text: string; kind: CreatorWindowKind; href?: string; action?: string }

function isOpenCreatorWindow(window: CreatorWindow) {
  return Boolean(window.href && window.action)
}

function creatorWindowAnchor(window: CreatorWindow) {
  const slug = window.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  return `creator-${window.kind}-${slug}`
}

const creatorWindows: CreatorWindow[] = [
  { title: "Art & Painting", kind: "visual", text: "A window for painters, illustrators, digital artists and people showing work for the first time.", href: "/social?media=image", action: "Discover Art Images" },
  { title: "Music & Audio", kind: "audio", text: "Discover public radio now. Musicians, creator audio and independent releases will join this window only after their DeSo-compatible media/metadata path is verified.", href: "/radio", action: "Open World Radio" },
  { title: "Photography", kind: "visual", text: "A place for photographers and visual creators to show a single image, a series, photo story, portfolio work or a growing body of work.", href: "/social?media=image", action: "Discover Images" },
  { title: "Film & Video", kind: "video", text: "Short film, moving image, documentary, animation, music video and creator-led video can all find an audience here.", href: "/social?media=video", action: "Discover Video" },
  { title: "NFTs & Collecting", kind: "collectible", text: "Explore native DeSo NFTs, collectors and creators publicly. Future external collectibles will remain clearly labelled and separate until a verified DeSo mint/ownership route exists.", href: "/social?media=nft", action: "Discover DeSo NFTs" },
  { title: "Museums & Heritage", kind: "heritage", text: "Museums, archives, history, collections and cultural heritage belong in the same daily world window. Start with VIA’s public world exploration while dedicated institution metadata remains future work.", href: "/discover/world", action: "Explore the World" },
  { title: "Writing & Stories", kind: "writing", text: "Discover writers, poets, reporters and storytellers through VIA’s public DeSo post window; dedicated long-form classification waits for verified metadata.", href: "/social", action: "Discover Posts" },
  { title: "New & Unexpected", kind: "discovery", text: "Leave room for new makers, small accounts and creative forms that do not fit an existing label yet. VIA opens the existing deterministic Surprise route instead of pretending to rank people as new or important.", href: "/discover/surprise", action: "Surprise Me" },
]

const sections = [
  { title: "Show Your Stuff", text: "Anyone can look around. Presenting work or taking part opens through the controlled DeSo participation route; VIA does not create a second anonymous creator account.", href: "/show-your-stuff", action: "Come In", status: "DESO TO JOIN" },
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
  metaLabel: { color: "#7f9187", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em" },
  scopeLink: { color: "#8fa299", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textDecoration: "none" },
  cardAction: { marginTop: "14px", display: "flex", gap: "10px", flexWrap: "wrap" as const, alignItems: "center" },
  sectionTitle: { fontSize: "24px", margin: "32px 0 8px" },
  sectionLead: { color: "#9daaa3", lineHeight: 1.6, margin: "0 0 16px", maxWidth: "760px" },
  radio: { marginTop: "14px", border: "1px solid rgba(63,74,68,.72)", borderRadius: "14px", background: "rgba(9,13,11,.72)", padding: "18px" },
}

export default function DiscoverPage() {
  const openCreatorWindows = creatorWindows.filter(isOpenCreatorWindow).length
  const plannedCreatorWindows = creatorWindows.length - openCreatorWindows
  const creatorKinds = [...new Set(creatorWindows.map((window) => window.kind))]
  const creatorKindTargets = creatorKinds.map((kind) => { const windows = creatorWindows.filter((window) => window.kind === kind); return { kind, window: windows[0]!, count: windows.length, openCount: windows.filter(isOpenCreatorWindow).length } })
  const orderedCreatorWindows = [...creatorWindows].sort((a, b) => Number(isOpenCreatorWindow(b)) - Number(isOpenCreatorWindow(a)))

  return (
    <main style={styles.main}>
      <div style={styles.shell}>
        <p style={styles.eyebrow}>VIA · DAILY WORLD WINDOW</p>
        <h1 style={styles.title}>See what people are creating today.</h1>
        <p style={styles.lead}>VIA is a daily meeting place for people who make, share, discover and enjoy things. From a first attempt to a lifetime of work, there should be room to be seen.</p>
        <div style={styles.welcome}><strong>The world is welcome. The coffee is ready. ☕</strong><p style={{ ...styles.cardText, marginTop: "7px" }}>Small or established, local or international, beginner or professional: VIA is meant to open doors, not decide who is important before they arrive.</p></div>

        <nav aria-label="Discovery navigation" style={styles.nav}>
          <Link href="/" style={styles.link}>Home</Link><Link href="/show-your-stuff" style={styles.link}>Show Your Stuff</Link><Link href="/quest" style={styles.link}>World Quest</Link><Link href="/radio" style={styles.link}>World Radio</Link><Link href="/live" style={styles.link}>VIA LIVE</Link><Link href="/saved" style={styles.link}>Saved</Link>
        </nav>

        <h2 style={styles.sectionTitle}>A daily creator newspaper</h2>
        <p style={styles.sectionLead}>Not every visitor has to buy something. Guests can browse, read, watch, listen and discover freely. {openCreatorWindows} creator windows already have public paths; participation such as posting, following, replying or giving a Diamond opens through DeSo.</p>
        <p style={{ ...styles.cardText, marginBottom: "12px" }}><strong>{openCreatorWindows} OPEN</strong> = working public VIA destinations. <strong>{plannedCreatorWindows} WINDOW</strong> = creator categories in VIA’s scope whose dedicated verified routes still have to come.</p>
        <div style={{ ...styles.nav, marginBottom: "12px" }} aria-label="Creator scope shortcuts">{creatorKindTargets.map(({ kind, window, count, openCount }) => <a key={kind} href={`#${creatorWindowAnchor(window)}`} style={styles.scopeLink} aria-label={`${kind} creator scope: ${openCount} of ${count} windows open`} data-creator-kind={kind} data-open-windows={openCount} data-total-windows={count} data-testid={`creator-scope-${kind}`}>{kind.toUpperCase()} {count > 1 ? `(${openCount}/${count} open)` : openCount ? "(open)" : "(window)"}</a>)}</div>
        <section style={styles.grid} aria-label={`${openCreatorWindows} open creator discovery windows`}>
          {orderedCreatorWindows.map((window) => <article key={window.title} id={creatorWindowAnchor(window)} style={styles.card}><div style={styles.cardTop}><h3 style={styles.cardTitle}>{window.title}</h3><span style={styles.badge}>{isOpenCreatorWindow(window) ? "OPEN" : "WINDOW"}</span></div><p style={{ ...styles.cardText, marginBottom: "6px" }}><span style={styles.metaLabel}>{window.kind.toUpperCase()}</span></p><p style={styles.cardText}>{window.text}</p>{isOpenCreatorWindow(window) ? <div style={styles.cardAction}><Link href={window.href!} style={styles.link}>{window.action}</Link></div> : null}</article>)}
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

        <div style={{ ...styles.safety, marginTop: "22px" }}>Guest discovery is view-only for VIA/DeSo/community state: navigation, public search, reading, watching and listening stay open. DeSo login is required before participation. A login is not a trust badge; VIA can still restrict spam, bots, impersonation and malicious links. Sensitive financial/blockchain actions keep their additional consent and signing boundary.</div>

        <section style={styles.radio}>
          <h2 style={styles.cardTitle}>World Radio · public world layer</h2>
          <p style={styles.cardText}>Explore stations by country or genre, keep local favorites, and start streams only when you choose Play. Around the World links directly into these public country searches.</p>
          <div style={{ marginTop: "14px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}><Link href="/radio" style={styles.link}>Open World Radio</Link><SaveButton title="World Radio" href="/radio" kind="Listen" /></div>
        </section>
      </div>
    </main>
  )
}
