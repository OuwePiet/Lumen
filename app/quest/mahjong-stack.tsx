"use client"

import { useMemo, useState } from "react"

type TilePos = { id: number; x: number; y: number; z: number }
type Tile = TilePos & { symbol: string; removed: boolean }
type Mode = "classic" | "expanded"

type BoardConfig = {
  label: string
  layers: number
  layout: TilePos[]
  tileWidth: number
  tileHeight: number
  aspectRatio: string
}

const CLASSIC_LAYOUT: TilePos[] = [
  {id:0,x:7,y:8,z:0},{id:1,x:29,y:8,z:0},{id:2,x:51,y:8,z:0},{id:3,x:73,y:8,z:0},
  {id:4,x:7,y:39,z:0},{id:5,x:29,y:39,z:0},{id:6,x:51,y:39,z:0},{id:7,x:73,y:39,z:0},
  {id:8,x:7,y:70,z:0},{id:9,x:29,y:70,z:0},{id:10,x:51,y:70,z:0},{id:11,x:73,y:70,z:0},
  {id:12,x:18,y:23,z:1},{id:13,x:40,y:23,z:1},{id:14,x:62,y:23,z:1},
  {id:15,x:18,y:54,z:1},{id:16,x:40,y:54,z:1},{id:17,x:62,y:54,z:1},
  {id:18,x:29,y:38,z:1},{id:19,x:51,y:38,z:1},
  {id:20,x:30,y:29,z:2},{id:21,x:52,y:29,z:2},
  {id:22,x:30,y:51,z:2},{id:23,x:52,y:51,z:2},
]

const EXPANDED_LAYOUT: TilePos[] = [
  // Layer 1 · 16 tiles
  ...[5,25,45,65].flatMap((x, xi) => [5,27,49,71].map((y, yi) => ({ id: xi * 4 + yi, x, y, z: 0 }))),
  // Layer 2 · 12 tiles
  ...[14,34,54,74].flatMap((x, xi) => [16,38,60].map((y, yi) => ({ id: 16 + xi * 3 + yi, x, y, z: 1 }))),
  // Layer 3 · 8 tiles
  ...[20,40,60,80].flatMap((x, xi) => [27,51].map((y, yi) => ({ id: 28 + xi * 2 + yi, x, y, z: 2 }))),
  // Layer 4 · 8 tiles
  ...[28,43,58,73].flatMap((x, xi) => [34,56].map((y, yi) => ({ id: 36 + xi * 2 + yi, x, y, z: 3 }))),
  // Layer 5 · 4 tiles
  ...[34,49,64,79].map((x, index) => ({ id: 44 + index, x, y: 45, z: 4 })),
]

const BOARD_CONFIGS: Record<Mode, BoardConfig> = {
  classic: {
    label: "Standaard · 3 lagen",
    layers: 3,
    layout: CLASSIC_LAYOUT,
    tileWidth: 17,
    tileHeight: 23,
    aspectRatio: "1.34 / 1",
  },
  expanded: {
    label: "Meer stenen · 5 lagen",
    layers: 5,
    layout: EXPANDED_LAYOUT,
    tileWidth: 13.5,
    tileHeight: 17.5,
    aspectRatio: "1.48 / 1",
  },
}

const SYMBOLS = ["🀄","🀅","🀆","🀇","🀈","🀉","🀐","🀑","🀒","🀙","🀚","🀛"]

const TILE_PALETTES = [
  { free: "linear-gradient(145deg,#fff3d4,#d9c594)", ink: "#603a12", rim: "#b89552" },
  { free: "linear-gradient(145deg,#dff6e7,#a6cfb5)", ink: "#163c29", rim: "#5f9b73" },
  { free: "linear-gradient(145deg,#dcecf8,#9cbdd4)", ink: "#16384d", rim: "#5d8aa5" },
  { free: "linear-gradient(145deg,#f7dddd,#d6a2a2)", ink: "#5a2228", rim: "#a46468" },
  { free: "linear-gradient(145deg,#eee1f7,#bca5d2)", ink: "#3f2957", rim: "#826aa0" },
]

function seededRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
}

function shuffle<T>(items: T[], random: () => number) {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

function makeBoard(mode: Mode, seed = 20260919): Tile[] {
  const config = BOARD_CONFIGS[mode]
  const random = seededRandom(seed)
  const result: Tile[] = []
  let symbolIndex = 0

  for (let z = 0; z < config.layers; z += 1) {
    const layer = config.layout.filter((tile) => tile.z === z)
    const pairCount = layer.length / 2
    const layerSymbols = shuffle(
      Array.from({ length: pairCount }, () => SYMBOLS[symbolIndex++ % SYMBOLS.length])
        .flatMap((symbol) => [symbol, symbol]),
      random
    )
    shuffle(layer, random).forEach((position, index) => {
      result.push({ ...position, symbol: layerSymbols[index], removed: false })
    })
  }

  return result.sort((a, b) => a.id - b.id)
}

function overlaps(a: Tile, b: Tile, config: BoardConfig) {
  return (
    a.x < b.x + config.tileWidth &&
    a.x + config.tileWidth > b.x &&
    a.y < b.y + config.tileHeight &&
    a.y + config.tileHeight > b.y
  )
}

function isFree(tile: Tile, tiles: Tile[], config: BoardConfig) {
  if (tile.removed) return false
  return !tiles.some((other) => !other.removed && other.z > tile.z && overlaps(tile, other, config))
}

function symbolPalette(symbol: string) {
  const index = Math.max(0, SYMBOLS.indexOf(symbol))
  return TILE_PALETTES[index % TILE_PALETTES.length]
}

const panel = {
  border: "1px solid #315a43",
  borderRadius: 22,
  background: "linear-gradient(180deg,rgba(17,30,23,.97) 0%,rgba(7,16,11,.98) 100%)",
  boxShadow: "0 18px 50px rgba(0,0,0,.28)",
  padding: "clamp(18px,3vw,28px)",
  marginTop: 24,
} as const

const control = {
  minHeight: 44,
  border: "1px solid #4c8060",
  borderRadius: 999,
  background: "#10261a",
  color: "#d8ffe7",
  fontWeight: 800,
  padding: "10px 16px",
  cursor: "pointer",
} as const

export default function MahjongStack() {
  const [mode, setMode] = useState<Mode>("classic")
  const [tiles, setTiles] = useState<Tile[]>(() => makeBoard("classic"))
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [moves, setMoves] = useState(0)
  const [message, setMessage] = useState("Clear the top layer first. Match two identical free tiles.")
  const [hintIds, setHintIds] = useState<number[]>([])

  const config = BOARD_CONFIGS[mode]
  const remaining = tiles.filter((tile) => !tile.removed).length
  const won = remaining === 0
  const freeIds = useMemo(
    () => new Set(tiles.filter((tile) => isFree(tile, tiles, config)).map((tile) => tile.id)),
    [tiles, config]
  )

  function resetBoard(nextMode = mode) {
    const nextConfig = BOARD_CONFIGS[nextMode]
    setMode(nextMode)
    setTiles(makeBoard(nextMode, Date.now()))
    setSelectedId(null)
    setMoves(0)
    setHintIds([])
    setMessage(
      nextMode === "expanded"
        ? `Grotere stapel klaar: ${nextConfig.layout.length} stenen over ${nextConfig.layers} lagen.`
        : "Nieuwe stapel klaar. Begin met een vrije steen op de hoogste zichtbare laag."
    )
  }

  function choose(tile: Tile) {
    if (tile.removed) return
    if (!freeIds.has(tile.id)) {
      setMessage("Deze steen wordt nog bedekt door een hogere laag.")
      return
    }
    setHintIds([])
    if (selectedId === null) {
      setSelectedId(tile.id)
      setMessage(`Geselecteerd ${tile.symbol}. Kies dezelfde vrije steen.`)
      return
    }
    if (selectedId === tile.id) {
      setSelectedId(null)
      setMessage("Selectie opgeheven.")
      return
    }
    const first = tiles.find((candidate) => candidate.id === selectedId)
    if (!first || first.removed || !freeIds.has(first.id)) {
      setSelectedId(tile.id)
      setMessage(`Geselecteerd ${tile.symbol}.`)
      return
    }
    if (first.symbol !== tile.symbol) {
      setSelectedId(tile.id)
      setMessage("Geen paar. De tweede steen is nu geselecteerd.")
      return
    }
    setTiles((current) => current.map((candidate) =>
      candidate.id === first.id || candidate.id === tile.id
        ? { ...candidate, removed: true }
        : candidate
    ))
    setSelectedId(null)
    setMoves((value) => value + 1)
    setMessage(remaining === 2 ? "Stapel leeg — VIA Mahjong voltooid!" : "Paar gevonden! Twee stenen verwijderd.")
  }

  function hint() {
    const free = tiles.filter((tile) => isFree(tile, tiles, config))
    for (let i = 0; i < free.length; i += 1) {
      const mate = free.slice(i + 1).find((tile) => tile.symbol === free[i].symbol)
      if (mate) {
        setHintIds([free[i].id, mate.id])
        setMessage(`Hint: twee vrije ${free[i].symbol}-stenen lichten op.`)
        return
      }
    }
    setHintIds([])
    setMessage("Geen vrij paar gevonden. Start een nieuwe stapel.")
  }

  return (
    <article style={panel} aria-labelledby="via-mahjong-heading">
      <p style={{margin:0,color:"#8fd4a9",fontWeight:800,letterSpacing:2,fontSize:12}}>
        VIA TABLE · {config.layers} LAGEN
      </p>
      <h2 id="via-mahjong-heading" style={{fontSize:"clamp(28px,5vw,46px)",margin:"8px 0"}}>VIA Mahjong Stack</h2>
      <p style={{color:"#a9b8af",lineHeight:1.65,maxWidth:760}}>
        Match twee gelijke vrije stenen. Kies de standaardstapel of speel met meer stenen, kleinere tegels en vijf lagen.
      </p>

      <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",margin:"16px 0 10px"}}>
        <button
          type="button"
          onClick={() => resetBoard("classic")}
          aria-pressed={mode === "classic"}
          style={{...control,background:mode==="classic"?"#1d5c39":"#10261a",borderColor:mode==="classic"?"#7bc894":"#4c8060"}}
        >
          Standaard · 3 lagen
        </button>
        <button
          type="button"
          onClick={() => resetBoard("expanded")}
          aria-pressed={mode === "expanded"}
          style={{...control,background:mode==="expanded"?"#604f1a":"#10261a",borderColor:mode==="expanded"?"#cdb65f":"#4c8060",color:mode==="expanded"?"#fff2b9":"#d8ffe7"}}
        >
          Meer stenen · 5 lagen
        </button>
      </div>

      <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",margin:"10px 0 16px"}}>
        <button type="button" onClick={() => resetBoard(mode)} style={control}>Schud / nieuwe stapel</button>
        <button type="button" onClick={hint} disabled={won} style={{...control,opacity:won?.55:1}}>Hint</button>
        <strong style={{color:"#d8ffe7"}}>{remaining} stenen · {moves} paren · {config.layers} lagen</strong>
      </div>

      <div
        role="group"
        aria-label={`${config.layers}-layer VIA Mahjong board`}
        style={{
          position:"relative",
          width:"min(820px,100%)",
          aspectRatio:config.aspectRatio,
          margin:"18px auto",
          border:"1px solid #3f7252",
          borderRadius:22,
          background:"radial-gradient(circle at 25% 18%,rgba(73,127,99,.28),transparent 28%),radial-gradient(circle at 78% 72%,rgba(151,112,58,.2),transparent 31%),linear-gradient(145deg,#10261a 0%,#0a1711 45%,#07100b 100%)",
          boxShadow:"inset 0 0 90px rgba(117,255,166,.055),0 18px 45px rgba(0,0,0,.30)",
          overflow:"hidden",
        }}
      >
        <div aria-hidden="true" style={{position:"absolute",inset:"7%",border:"1px solid rgba(213,182,101,.12)",borderRadius:18,boxShadow:"inset 0 0 28px rgba(0,0,0,.26)"}} />
        {tiles.map((tile) => {
          if (tile.removed) return null
          const free = freeIds.has(tile.id)
          const selected = selectedId === tile.id
          const hinted = hintIds.includes(tile.id)
          const palette = symbolPalette(tile.symbol)
          const offset = tile.z * -0.7
          return (
            <button
              key={tile.id}
              type="button"
              onClick={() => choose(tile)}
              aria-label={`${tile.symbol} tile, layer ${tile.z + 1}, ${free ? "free" : "covered"}`}
              aria-pressed={selected}
              style={{
                position:"absolute",
                left:`${tile.x}%`,
                top:`${tile.y}%`,
                width:`${config.tileWidth}%`,
                height:`${config.tileHeight}%`,
                transform:`translate(${offset}%,${offset}%)`,
                zIndex:10 + tile.z * 10,
                display:"grid",
                placeItems:"center",
                border:selected
                  ?"2px solid #d9ffe7"
                  :hinted
                    ?"2px solid #ffe58c"
                    :`1px solid ${free ? palette.rim : "#59615b"}`,
                borderRadius:"clamp(6px,1.35vw,11px)",
                background:selected
                  ?"linear-gradient(145deg,#298f53,#174a30)"
                  :free
                    ?palette.free
                    :"linear-gradient(145deg,#a5aba5,#717971)",
                color:selected?"#f4fff8":free?palette.ink:"#29322d",
                fontSize:mode==="expanded"?"clamp(16px,4.4vw,38px)":"clamp(19px,5.2vw,46px)",
                lineHeight:1,
                cursor:free?"pointer":"not-allowed",
                boxShadow:hinted
                  ?"0 0 0 3px rgba(255,229,140,.16),0 8px 15px rgba(0,0,0,.42)"
                  :`${2 + tile.z}px ${4 + tile.z}px ${7 + tile.z}px rgba(0,0,0,.40), inset 0 1px 0 rgba(255,255,255,.48)`,
                opacity:free?1:.78,
                transition:"transform 120ms ease,box-shadow 120ms ease,background 120ms ease",
                touchAction:"manipulation",
              }}
            >
              <span aria-hidden="true">{tile.symbol}</span>
            </button>
          )
        })}

        {won ? (
          <div style={{position:"absolute",inset:0,zIndex:80,display:"grid",placeItems:"center",background:"rgba(3,8,5,.80)",backdropFilter:"blur(4px)"}}>
            <div style={{textAlign:"center",padding:24}}>
              <div style={{fontSize:"clamp(42px,9vw,82px)"}}>🏆</div>
              <strong style={{display:"block",fontSize:"clamp(24px,5vw,42px)",color:"#b9ffd4"}}>Stapel leeg</strong>
              <p style={{color:"#a9b8af"}}>{moves} paren · alle {config.layers} lagen voltooid</p>
              <button type="button" onClick={() => resetBoard(mode)} style={control}>Nog een keer</button>
            </div>
          </div>
        ) : null}
      </div>

      <p role="status" aria-live="polite" style={{minHeight:24,color:"#b9c8bf"}}>{message}</p>
      <small style={{color:"#7f9487"}}>Aanraken, klikken of toetsenbord. Alleen lokaal spel; geen wallet- of blockchainactie.</small>
    </article>
  )
}
