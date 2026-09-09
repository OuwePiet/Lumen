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
            <span className={styles.status}>World Quest · Free</span>
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

        <DailyGrid />
        <div style={shareRow}><ShareButton game="VIA Daily Grid" /></div>

        <AlphabetRelay />
        <div style={shareRow}><ShareButton game="VIA Alphabet Relay" /></div>

        <ViaPong />
        <div style={shareRow}><ShareButton game="VIA NEO PONG" /></div>

        <CoffeeGames />
        <div style={shareRow} aria-label="Share Coffee Corner games">
          <ShareButton game="Coffee Rush" />
          <ShareButton game="Bean Drop" />
          <ShareButton game="The Perfect Blend" />
        </div>

        <BlockchainPuzzle />
        <div style={shareRow}><ShareButton game="Blockchain Mosaic" /></div>

        <QuestGame />
        <div style={shareRow}><ShareButton game="VIA World Quest" /></div>

        <section className={styles.safety} aria-labelledby="quest-reward-heading">
          <h2 id="quest-reward-heading">Diamond Shower reward</h2>
          <p>
            Daily Grid, Alphabet Relay, VIA NEO PONG, Coffee Corner and Blockchain Mosaic are casual
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
