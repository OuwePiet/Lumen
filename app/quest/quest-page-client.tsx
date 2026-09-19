"use client"

import { useEffect, useState } from "react"
import SaveButton from "../saved/save-button"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, VIA_SETTINGS_KEY, type ViaLanguage } from "../via-local-settings"
import AlphabetRelay from "./alphabet-relay"
import BlockchainPuzzle from "./blockchain-puzzle"
import CoffeeGames from "./coffee-games"
import DailyGrid from "./daily-grid"
import QuestGame from "./quest-game"
import MahjongStack from "./mahjong-stack"
import ShareButton from "./share-button"
import ViaPong from "./via-pong"
import VaultBreaker from "./vault-breaker"
import styles from "./quest.module.css"

const shareRow = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap" as const,
  alignItems: "center",
  margin: "12px 0 28px",
}

type QuestCopy = {
  navigation: string
  discovery: string
  radio: string
  saved: string
  free: string
  heroTitle: string
  heroText: string
  games: string
  pick: string
  pickText: string
  descriptions: string[]
  rewardTitle: string
  rewardText: string
  coffeeActions: string
}

const COPY: Record<ViaLanguage, QuestCopy> = {
  Dutch: {
    navigation: "World Quest-navigatie",
    discovery: "Wereld ontdekken",
    radio: "Wereldradio",
    saved: "Opgeslagen",
    free: "Gratis",
    heroTitle: "Speel de wereld. Ontdek DeSo.",
    heroText: "Voltooi korte ontdekkingsroutes, verzamel VIA Points en bouw een reeks op. De eerste speelbare versie is alleen-lezen en heeft nooit een seed phrase of wallet-ondertekening nodig.",
    games: "VIA GAMES",
    pick: "Kies een VIA-spel",
    pickText: "Ga direct naar een spel. Alles hieronder is gratis te spelen; delen en opslaan zijn optioneel. Opgeslagen spellen blijven in deze browser.",
    descriptions: [
      "Een kort dagelijks denkspel.",
      "Houd de letterketting in beweging.",
      "Snel lokaal arcadespel.",
      "Ruim een verzorgde tegelstapel van drie lagen op.",
      "Kraak drie cryptische mechanische kluizen met UV-aanwijzingen.",
      "Drie luchtige VIA-koffiespelletjes.",
      "Bouw een kettingafbeelding opnieuw op tot 500 stukjes.",
      "Ontdek VIA en DeSo via routes.",
    ],
    rewardTitle: "Geen financiële spelbeloningen",
    rewardText: "VIA World Quest-spellen zijn ontspannende ervaringen voor spelen, ontdekken en optionele lokale voortgang. Scores, reeksen, VIA Points en opgeslagen spelstatus hebben geen geldwaarde en geven geen recht op DESO, Diamonds, tokens, uitbetalingen of andere financiële beloningen. Spelactiviteit veroorzaakt nooit automatisch een on-chain betaling of prijs.",
    coffeeActions: "VIA Coffee Corner delen of opslaan",
  },
  English: {
    navigation: "World Quest navigation",
    discovery: "World Discovery",
    radio: "World Radio",
    saved: "Saved",
    free: "Free",
    heroTitle: "Play the world. Discover DeSo.",
    heroText: "Complete short discovery routes, collect VIA Points and build a streak. The first playable version is read-only and never needs a seed phrase or wallet signing.",
    games: "VIA GAMES",
    pick: "Pick a VIA game",
    pickText: "Jump straight to a game. Everything below is free to play; sharing and saving are optional. Saved games stay in this browser.",
    descriptions: [
      "A short daily brain game.",
      "Keep the letter chain moving.",
      "Fast local arcade play.",
      "Clear a polished three-layer tile stack.",
      "Crack three cryptic mechanical vaults with UV clues.",
      "Three light VIA coffee mini games.",
      "Rebuild a chain image up to 500 pieces.",
      "Discover VIA and DeSo through routes.",
    ],
    rewardTitle: "No financial game rewards",
    rewardText: "VIA World Quest games are casual experiences for play, discovery and optional local progress. Scores, streaks, VIA Points and saved game state have no cash value and do not create any right to DESO, Diamonds, tokens, payouts or other financial rewards. Game activity never triggers an automatic on-chain payment or prize.",
    coffeeActions: "Share or save VIA Coffee Corner games",
  },
  French: {
    navigation: "Navigation World Quest",
    discovery: "Découvrir le monde",
    radio: "Radio mondiale",
    saved: "Enregistré",
    free: "Gratuit",
    heroTitle: "Jouez avec le monde. Découvrez DeSo.",
    heroText: "Terminez de courts parcours de découverte, collectez des VIA Points et construisez une série. La première version jouable est en lecture seule et ne nécessite jamais de phrase seed ni de signature de portefeuille.",
    games: "JEUX VIA",
    pick: "Choisissez un jeu VIA",
    pickText: "Accédez directement à un jeu. Tout ce qui suit est gratuit ; le partage et l’enregistrement sont facultatifs. Les jeux enregistrés restent dans ce navigateur.",
    descriptions: [
      "Un court jeu de réflexion quotidien.",
      "Faites avancer la chaîne de lettres.",
      "Un jeu d’arcade local rapide.",
      "Videz une pile soignée de tuiles sur trois niveaux.",
      "Ouvrez trois coffres mécaniques cryptiques grâce à des indices UV.",
      "Trois mini-jeux VIA autour du café.",
      "Reconstituez une image de chaîne jusqu’à 500 pièces.",
      "Découvrez VIA et DeSo à travers des parcours.",
    ],
    rewardTitle: "Aucune récompense financière",
    rewardText: "Les jeux VIA World Quest sont des expériences décontractées destinées au jeu, à la découverte et à une progression locale facultative. Les scores, séries, VIA Points et états sauvegardés n’ont aucune valeur monétaire et ne donnent aucun droit à des DESO, Diamonds, jetons, paiements ou autres récompenses financières. Une activité de jeu ne déclenche jamais automatiquement un paiement ou un prix on-chain.",
    coffeeActions: "Partager ou enregistrer les jeux VIA Coffee Corner",
  },
  Spanish: {
    navigation: "Navegación de World Quest",
    discovery: "Descubrir el mundo",
    radio: "Radio mundial",
    saved: "Guardado",
    free: "Gratis",
    heroTitle: "Juega por el mundo. Descubre DeSo.",
    heroText: "Completa rutas cortas de descubrimiento, reúne VIA Points y crea una racha. La primera versión jugable es de solo lectura y nunca necesita una frase semilla ni una firma de cartera.",
    games: "JUEGOS VIA",
    pick: "Elige un juego VIA",
    pickText: "Entra directamente en un juego. Todo lo que aparece abajo es gratuito; compartir y guardar es opcional. Los juegos guardados permanecen en este navegador.",
    descriptions: [
      "Un breve juego mental diario.",
      "Mantén en movimiento la cadena de letras.",
      "Juego arcade local y rápido.",
      "Limpia una cuidada pila de fichas de tres niveles.",
      "Abre tres bóvedas mecánicas crípticas con pistas UV.",
      "Tres minijuegos VIA de café.",
      "Reconstruye una imagen de cadena de hasta 500 piezas.",
      "Descubre VIA y DeSo mediante rutas.",
    ],
    rewardTitle: "Sin recompensas económicas",
    rewardText: "Los juegos VIA World Quest son experiencias informales para jugar, descubrir y llevar un progreso local opcional. Las puntuaciones, rachas, VIA Points y partidas guardadas no tienen valor monetario ni crean derecho alguno a DESO, Diamonds, tokens, pagos u otras recompensas económicas. La actividad del juego nunca activa automáticamente un pago o premio on-chain.",
    coffeeActions: "Compartir o guardar juegos de VIA Coffee Corner",
  },
  Chinese: {
    navigation: "World Quest 导航",
    discovery: "探索世界",
    radio: "世界电台",
    saved: "已保存",
    free: "免费",
    heroTitle: "畅玩世界。发现 DeSo。",
    heroText: "完成简短的探索路线，收集 VIA Points 并建立连续记录。首个可玩版本为只读模式，绝不需要助记词或钱包签名。",
    games: "VIA 游戏",
    pick: "选择一个 VIA 游戏",
    pickText: "直接进入游戏。以下内容均可免费游玩；分享和保存均为可选。保存的游戏数据仅保留在此浏览器中。",
    descriptions: [
      "简短的每日益智游戏。",
      "让字母接龙持续进行。",
      "快速的本地街机玩法。",
      "清除精致的三层麻将牌堆。",
      "利用 UV 线索破解三个神秘机械保险库。",
      "三个轻松的 VIA 咖啡小游戏。",
      "重建最多 500 块的链式拼图。",
      "通过路线探索 VIA 与 DeSo。",
    ],
    rewardTitle: "不提供金融类游戏奖励",
    rewardText: "VIA World Quest 游戏用于娱乐、探索以及可选的本地进度记录。分数、连续记录、VIA Points 和已保存的游戏状态均无现金价值，也不会产生获得 DESO、Diamonds、代币、付款或其他金融奖励的权利。游戏行为绝不会自动触发链上付款或奖品。",
    coffeeActions: "分享或保存 VIA Coffee Corner 游戏",
  },
  // Hindi currently falls back to English here until this surface receives its full Hindi copy.
  Hindi: {
    navigation: "World Quest navigation",
    discovery: "World Discovery",
    radio: "World Radio",
    saved: "Saved",
    free: "Free",
    heroTitle: "Play the world. Discover DeSo.",
    heroText: "Complete short discovery routes, collect VIA Points and build a streak. The first playable version is read-only and never needs a seed phrase or wallet signing.",
    games: "VIA GAMES",
    pick: "Pick a VIA game",
    pickText: "Jump straight to a game. Everything below is free to play; sharing and saving are optional. Saved games stay in this browser.",
    descriptions: [
      "A short daily brain game.",
      "Keep the letter chain moving.",
      "Fast local arcade play.",
      "Clear a polished three-layer tile stack.",
      "Crack three cryptic mechanical vaults with UV clues.",
      "Three light VIA coffee mini games.",
      "Rebuild a chain image up to 500 pieces.",
      "Discover VIA and DeSo through routes.",
    ],
    rewardTitle: "No financial game rewards",
    rewardText: "VIA World Quest games are casual experiences for play, discovery and optional local progress. Scores, streaks, VIA Points and saved game state have no cash value and do not create any right to DESO, Diamonds, tokens, payouts or other financial rewards. Game activity never triggers an automatic on-chain payment or prize.",
    coffeeActions: "Share or save VIA Coffee Corner games",
  },
}

const games = [
  { href: "#daily-grid", title: "VIA Daily Grid" },
  { href: "#alphabet-relay", title: "VIA Alphabet Relay" },
  { href: "#neo-pong", title: "VIA NEO PONG" },
  { href: "#mahjong-stack", title: "VIA Mahjong Stack" },
  { href: "#vault-breaker", title: "VIA Vault Breaker" },
  { href: "#coffee-corner", title: "VIA Coffee Corner" },
  { href: "#blockchain-mosaic", title: "VIA Blockchain Mosaic" },
  { href: "#world-quest", title: "VIA World Quest" },
]

export default function QuestPageClient() {
  const [language, setLanguage] = useState<ViaLanguage>("English")

  useEffect(() => {
    const refresh = () => setLanguage(readViaLocalSettings().interfaceLanguage)
    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === VIA_SETTINGS_KEY) refresh()
    }
    refresh()
    window.addEventListener(VIA_SETTINGS_EVENT, refresh)
    window.addEventListener("storage", handleStorage)
    return () => {
      window.removeEventListener(VIA_SETTINGS_EVENT, refresh)
      window.removeEventListener("storage", handleStorage)
    }
  }, [])

  const copy = COPY[language]

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <nav className={styles.nav} aria-label={copy.navigation}>
          <a href="/" className={styles.back}>← VIA</a>
          <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap",justifyContent:"flex-end"}}>
            <a href="/discover" className={styles.back}>{copy.discovery}</a>
            <a href="/radio" className={styles.back}>{copy.radio}</a>
            <a href="/live" className={styles.back}>VIA LIVE</a>
            <a href="/saved" className={styles.back}>{copy.saved}</a>
            <span className={styles.status}>VIA World Quest · {copy.free}</span>
          </div>
        </nav>

        <header className={styles.hero}>
          <p className={styles.kicker}>VIA World Quest</p>
          <h1>{copy.heroTitle}</h1>
          <p>{copy.heroText}</p>
        </header>

        <section aria-labelledby="pick-game-heading" style={{ marginBottom: 30 }}>
          <p className={styles.kicker}>{copy.games}</p>
          <h2 id="pick-game-heading">{copy.pick}</h2>
          <p style={{ color: "#9bac9f", maxWidth: 720 }}>{copy.pickText}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 16 }}>
            {games.map((game, index) => (
              <a key={game.href} href={game.href} style={{ display: "block", minHeight: 104, border: "1px solid #285f40", borderRadius: 16, padding: 16, background: "#0a100d", color: "#f4f7f5", textDecoration: "none" }}>
                <strong>{game.title}</strong>
                <span style={{ display: "block", marginTop: 7, color: "#8fa299", fontSize: 14, lineHeight: 1.45 }}>{copy.descriptions[index]}</span>
              </a>
            ))}
          </div>
        </section>

        <section id="daily-grid" style={{ scrollMarginTop: 24 }}>
          <DailyGrid />
          <div style={shareRow}>
            <ShareButton game="VIA Daily Grid" path="/quest#daily-grid" />
            <SaveButton title="VIA Daily Grid" href="/quest#daily-grid" kind="Game" />
          </div>
        </section>

        <section id="alphabet-relay" style={{ scrollMarginTop: 24 }}>
          <AlphabetRelay />
          <div style={shareRow}>
            <ShareButton game="VIA Alphabet Relay" path="/quest#alphabet-relay" />
            <SaveButton title="VIA Alphabet Relay" href="/quest#alphabet-relay" kind="Game" />
          </div>
        </section>

        <section id="neo-pong" style={{ scrollMarginTop: 24 }}>
          <ViaPong />
          <div style={shareRow}>
            <ShareButton game="VIA NEO PONG" path="/quest#neo-pong" />
            <SaveButton title="VIA NEO PONG" href="/quest#neo-pong" kind="Game" />
          </div>
        </section>

        <section id="mahjong-stack" style={{ scrollMarginTop: 24 }}>
          <MahjongStack />
          <div style={shareRow}>
            <ShareButton game="VIA Mahjong Stack" path="/quest#mahjong-stack" />
            <SaveButton title="VIA Mahjong Stack" href="/quest#mahjong-stack" kind="Game" />
          </div>
        </section>

        <section id="vault-breaker" style={{ scrollMarginTop: 24 }}>
          <VaultBreaker />
          <div style={shareRow}>
            <ShareButton game="VIA Vault Breaker" path="/quest#vault-breaker" />
            <SaveButton title="VIA Vault Breaker" href="/quest#vault-breaker" kind="Game" />
          </div>
        </section>

        <section id="coffee-corner" style={{ scrollMarginTop: 24 }}>
          <CoffeeGames />
          <div style={shareRow} aria-label={copy.coffeeActions}>
            <ShareButton game="VIA Coffee Rush" path="/quest#coffee-rush-heading" />
            <SaveButton title="VIA Coffee Rush" href="/quest#coffee-rush-heading" kind="Game" />
            <ShareButton game="VIA Bean Drop" path="/quest#bean-drop-heading" />
            <SaveButton title="VIA Bean Drop" href="/quest#bean-drop-heading" kind="Game" />
            <ShareButton game="VIA Perfect Blend" path="/quest#perfect-blend-heading" />
            <SaveButton title="VIA Perfect Blend" href="/quest#perfect-blend-heading" kind="Game" />
          </div>
        </section>

        <section id="blockchain-mosaic" style={{ scrollMarginTop: 24 }}>
          <BlockchainPuzzle />
          <div style={shareRow}>
            <ShareButton game="VIA Blockchain Mosaic" path="/quest#blockchain-mosaic" />
            <SaveButton title="VIA Blockchain Mosaic" href="/quest#blockchain-mosaic" kind="Game" />
          </div>
        </section>

        <section id="world-quest" style={{ scrollMarginTop: 24 }}>
          <QuestGame />
          <div style={shareRow}>
            <ShareButton game="VIA World Quest" path="/quest#world-quest" />
            <SaveButton title="VIA World Quest" href="/quest#world-quest" kind="Game" />
          </div>
        </section>

        <section className={styles.safety} aria-labelledby="quest-reward-heading">
          <h2 id="quest-reward-heading">{copy.rewardTitle}</h2>
          <p>{copy.rewardText}</p>
        </section>
      </div>
    </main>
  )
}
