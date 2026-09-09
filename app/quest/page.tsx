import type { Metadata } from "next"
import AlphabetRelay from "./alphabet-relay"
import BlockchainPuzzle from "./blockchain-puzzle"
import CoffeeGames from "./coffee-games"
import DailyGrid from "./daily-grid"
import QuestGame from "./quest-game"
import ShareButton from "./share-button"
import ViaPong from "./via-pong"
import styles from "./quest.module.css"

export const metadata: Metadata = {
  title: "VIA World Quest",
  description: "Play the world, discover DeSo creators, NFTs and VIA experiences.",
}

const shareRow = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap" as const,
  alignItems: "center",
  margin: "12px 0 28px",
}

const games = [
  { href: "#daily-grid", title: "VIA Daily Grid", text: "A short daily brain game." },
  { href: "#alphabet-relay", title: "VIA Alphabet Relay", text: "Keep the letter chain moving." },
  { href: "#neo-pong", title: "VIA NEO PONG", text: "Fast local arcade play." },
  { href: "#coffee-corner", title: "VIA Coffee Corner", text: "Three light VIA coffee mini games." },
  { href: "#blockchain-mosaic", title: "VIA Blockchain Mosaic", text: "Rebuild a chain image up to 500 pieces." },
  { href: "#world-quest", title: "VIA World Quest", text: "Discover VIA and DeSo through routes." },
]

export default function QuestPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <nav className={styles.nav} aria-label="World Quest navigation">
          <a href="/" className={styles.back}>← VIA</a>
          <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap",justifyContent:"flex-end"}}>
            <a href="/discover" className={styles.back}>World Discovery</a>
            <a href="/radio" className={styles.back}>World Radio</a>
            <a href="/live" className={styles.back}>VIA LIVE</a>
            <span className={styles.status}>VIA World Quest · Free</span>
          </div>
        </nav>

        <header className={styles.hero}>
          <p className={styles.kicker}>VIA World Quest</p>
          <h1>Play the world. Discover DeSo.</h1>
          <p>
            Complete short discovery routes, collect VIA Points and build a streak. The first
            playable version is read-only and never needs a seed phrase or wallet signing.
          </p>
        </header>

        <section aria-labelledby="pick-game-heading" style={{ marginBottom: 30 }}>
          <p className={styles.kicker}>VIA Games</p>
          <h2 id="pick-game-heading">Pick a VIA game</h2>
          <p style={{ color: "#9bac9f", maxWidth: 720 }}>Jump straight to a game. Everything below is free to play; sharing is optional and always carries viadeso.online.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 16 }}>
            {games.map((game) => (
              <a key={game.href} href={game.href} style={{ display: "block", minHeight: 104, border: "1px solid #285f40", borderRadius: 16, padding: 16, background: "#0a100d", color: "#f4f7f5", textDecoration: "none" }}>
                <strong>{game.title}</strong>
                <span style={{ display: "block", marginTop: 7, color: "#8fa299", fontSize: 14, lineHeight: 1.45 }}>{game.text}</span>
              </a>
            ))}
          </div>
        </section>

        <section id="daily-grid" style={{ scrollMarginTop: 24 }}>
          <DailyGrid />
          <div style={shareRow}><ShareButton game="VIA Daily Grid" path="/quest#daily-grid" /></div>
        </section>

        <section id="alphabet-relay" style={{ scrollMarginTop: 24 }}>
          <AlphabetRelay />
          <div style={shareRow}><ShareButton game="VIA Alphabet Relay" path="/quest#alphabet-relay" /></div>
        </section>

        <section id="neo-pong" style={{ scrollMarginTop: 24 }}>
          <ViaPong />
          <div style={shareRow}><ShareButton game="VIA NEO PONG" path="/quest#neo-pong" /></div>
        </section>

        <section id="coffee-corner" style={{ scrollMarginTop: 24 }}>
          <CoffeeGames />
          <div style={shareRow} aria-label="Share VIA Coffee Corner games">
            <ShareButton game="VIA Coffee Rush" path="/quest#coffee-rush-heading" />
            <ShareButton game="VIA Bean Drop" path="/quest#bean-drop-heading" />
            <ShareButton game="VIA Perfect Blend" path="/quest#perfect-blend-heading" />
          </div>
        </section>

        <section id="blockchain-mosaic" style={{ scrollMarginTop: 24 }}>
          <BlockchainPuzzle />
          <div style={shareRow}><ShareButton game="VIA Blockchain Mosaic" path="/quest#blockchain-mosaic" /></div>
        </section>

        <section id="world-quest" style={{ scrollMarginTop: 24 }}>
          <QuestGame />
          <div style={shareRow}><ShareButton game="VIA World Quest" path="/quest#world-quest" /></div>
        </section>

        <section className={styles.safety} aria-labelledby="quest-reward-heading">
          <h2 id="quest-reward-heading">Diamond Shower reward</h2>
          <p>
            VIA Daily Grid, VIA Alphabet Relay, VIA NEO PONG, VIA Coffee Corner and VIA Blockchain Mosaic are casual
            game experiences. Local or client-visible game state is not authoritative proof for a real
            DeSo reward. A future DeSo reward can never exceed one VIA Diamond Shower per winner and
            reward moment. Before any real payout, VIA must show the number of posts, diamond level,
            estimated DESO cost, estimated cash value and available reward pool. No automatic on-chain
            payout is enabled in this prototype.
          </p>
        </section>
      </div>
    </main>
  )
}
