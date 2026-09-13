"use client"

import { useMemo, useState } from "react"

type TilePos = { id: number; x: number; y: number; z: 0 | 1 | 2 }
type Tile = TilePos & { symbol: string; removed: boolean }

const LAYOUT: TilePos[] = [
  {id:0,x:7,y:8,z:0},{id:1,x:29,y:8,z:0},{id:2,x:51,y:8,z:0},{id:3,x:73,y:8,z:0},
  {id:4,x:7,y:39,z:0},{id:5,x:29,y:39,z:0},{id:6,x:51,y:39,z:0},{id:7,x:73,y:39,z:0},
  {id:8,x:7,y:70,z:0},{id:9,x:29,y:70,z:0},{id:10,x:51,y:70,z:0},{id:11,x:73,y:70,z:0},
  {id:12,x:18,y:23,z:1},{id:13,x:40,y:23,z:1},{id:14,x:62,y:23,z:1},
  {id:15,x:18,y:54,z:1},{id:16,x:40,y:54,z:1},{id:17,x:62,y:54,z:1},
  {id:18,x:29,y:38,z:1},{id:19,x:51,y:38,z:1},
  {id:20,x:30,y:29,z:2},{id:21,x:52,y:29,z:2},
  {id:22,x:30,y:51,z:2},{id:23,x:52,y:51,z:2},
]

const SYMBOLS = ["🀄","🀅","🀆","🀇","🀈","🀉","🀐","🀑","🀒","🀙","🀚","🀛"]

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

function makeBoard(seed = 20260913): Tile[] {
  const random = seededRandom(seed)
  const byLayer = [
    LAYOUT.filter((tile) => tile.z === 0),
    LAYOUT.filter((tile) => tile.z === 1),
    LAYOUT.filter((tile) => tile.z === 2),
  ]
  let symbolIndex = 0
  const result: Tile[] = []
  for (const layer of byLayer) {
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

function overlaps(a: Tile, b: Tile) {
  const tileWidth = 18
  const tileHeight = 24
  return (
    a.x < b.x + tileWidth &&
    a.x + tileWidth > b.x &&
    a.y < b.y + tileHeight &&
    a.y + tileHeight > b.y
  )
}

function isFree(tile: Tile, tiles: Tile[]) {
  if (tile.removed) return false
  return !tiles.some((other) => !other.removed && other.z > tile.z && overlaps(tile, other))
}

const panel = {
  border: "1px solid #315a43",
  borderRadius: 22,
  background: "linear-gradient(180deg,#0d1611 0%,#07100b 100%)",
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
  const [tiles, setTiles] = useState<Tile[]>(() => makeBoard())
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [moves, setMoves] = useState(0)
  const [message, setMessage] = useState("Clear the top layer first. Match two identical free tiles.")
  const [hintIds, setHintIds] = useState<number[]>([])

  const remaining = tiles.filter((tile) => !tile.removed).length
  const won = remaining === 0
  const freeIds = useMemo(() => new Set(tiles.filter((tile) => isFree(tile, tiles)).map((tile) => tile.id)), [tiles])

  function newBoard() {
    setTiles(makeBoard(Date.now()))
    setSelectedId(null)
    setMoves(0)
    setHintIds([])
    setMessage("New solvable stack ready. Start with a free tile on the highest visible layer.")
  }

  function choose(tile: Tile) {
    if (tile.removed) return
    if (!freeIds.has(tile.id)) {
      setMessage("That tile is covered by a higher layer.")
      return
    }
    setHintIds([])
    if (selectedId === null) {
      setSelectedId(tile.id)
      setMessage(`Selected ${tile.symbol}. Choose the same free symbol.`)
      return
    }
    if (selectedId === tile.id) {
      setSelectedId(null)
      setMessage("Selection cleared.")
      return
    }
    const first = tiles.find((candidate) => candidate.id === selectedId)
    if (!first || first.removed || !freeIds.has(first.id)) {
      setSelectedId(tile.id)
      setMessage(`Selected ${tile.symbol}.`)
      return
    }
    if (first.symbol !== tile.symbol) {
      setSelectedId(tile.id)
      setMessage("No match. The second tile is now selected.")
      return
    }
    setTiles((current) => current.map((candidate) =>
      candidate.id === first.id || candidate.id === tile.id
        ? { ...candidate, removed: true }
        : candidate
    ))
    setSelectedId(null)
    setMoves((value) => value + 1)
    setMessage(remaining === 2 ? "Stack cleared — VIA Mahjong complete!" : "Match! Two tiles removed.")
  }

  function hint() {
    const free = tiles.filter((tile) => isFree(tile, tiles))
    for (let i = 0; i < free.length; i += 1) {
      const mate = free.slice(i + 1).find((tile) => tile.symbol === free[i].symbol)
      if (mate) {
        setHintIds([free[i].id, mate.id])
        setMessage(`Hint: two free ${free[i].symbol} tiles are glowing.`)
        return
      }
    }
    setHintIds([])
    setMessage("No free pair found. Start a new solvable stack.")
  }

  return (
    <article style={panel} aria-labelledby="via-mahjong-heading">
      <p style={{margin:0,color:"#8fd4a9",fontWeight:800,letterSpacing:2,fontSize:12}}>VIA TABLE · THREE LAYERS</p>
      <h2 id="via-mahjong-heading" style={{fontSize:"clamp(28px,5vw,46px)",margin:"8px 0"}}>VIA Mahjong Stack</h2>
      <p style={{color:"#a9b8af",lineHeight:1.65,maxWidth:760}}>
        Match two identical free tiles. A tile is free when no active tile from a higher layer overlaps it. Every new stack is built in solvable layer-pairs.
      </p>

      <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",margin:"16px 0"}}>
        <button type="button" onClick={newBoard} style={control}>Shuffle / new stack</button>
        <button type="button" onClick={hint} disabled={won} style={{...control,opacity:won?.55:1}}>Hint</button>
        <strong style={{color:"#d8ffe7"}}>{remaining} tiles · {moves} matches</strong>
      </div>

      <div
        role="group"
        aria-label="Three-layer VIA Mahjong board"
        style={{
          position:"relative",
          width:"min(760px,100%)",
          aspectRatio:"1.28 / 1",
          margin:"18px auto",
          border:"1px solid #315a43",
          borderRadius:20,
          background:"radial-gradient(circle at 50% 40%,#17301f 0%,#0a160f 48%,#050807 100%)",
          boxShadow:"inset 0 0 60px rgba(92,255,157,.045),0 18px 45px rgba(0,0,0,.28)",
          overflow:"hidden",
        }}
      >
        {tiles.map((tile) => {
          if (tile.removed) return null
          const free = freeIds.has(tile.id)
          const selected = selectedId === tile.id
          const hinted = hintIds.includes(tile.id)
          const offset = tile.z * -0.9
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
                width:"18%",
                height:"24%",
                transform:`translate(${offset}%,${offset}%)`,
                zIndex:10 + tile.z * 10,
                display:"grid",
                placeItems:"center",
                border:selected?"2px solid #b9ffd4":hinted?"2px solid #d8c86a":"1px solid #496652",
                borderRadius:"clamp(7px,1.6vw,13px)",
                background:selected
                  ?"linear-gradient(145deg,#1f7c45,#123a25)"
                  :free
                    ?"linear-gradient(145deg,#f1ead7,#cfc8b7)"
                    :"linear-gradient(145deg,#a8a89d,#757c75)",
                color:selected?"#f4fff8":"#17231b",
                fontSize:"clamp(20px,6vw,52px)",
                lineHeight:1,
                cursor:free?"pointer":"not-allowed",
                boxShadow:hinted
                  ?"0 0 0 3px rgba(216,200,106,.18),0 8px 15px rgba(0,0,0,.4)"
                  :`${3 + tile.z * 2}px ${5 + tile.z * 2}px ${8 + tile.z * 2}px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.45)`,
                opacity:free?1:.82,
                transition:"transform 120ms ease,box-shadow 120ms ease,background 120ms ease",
                touchAction:"manipulation",
              }}
            >
              <span aria-hidden="true">{tile.symbol}</span>
            </button>
          )
        })}
        {won ? (
          <div style={{position:"absolute",inset:0,zIndex:80,display:"grid",placeItems:"center",background:"rgba(3,8,5,.78)",backdropFilter:"blur(4px)"}}>
            <div style={{textAlign:"center",padding:24}}>
              <div style={{fontSize:"clamp(42px,9vw,82px)"}}>🏆</div>
              <strong style={{display:"block",fontSize:"clamp(24px,5vw,42px)",color:"#b9ffd4"}}>Stack cleared</strong>
              <p style={{color:"#a9b8af"}}>{moves} matches · all three layers complete</p>
              <button type="button" onClick={newBoard} style={control}>Play again</button>
            </div>
          </div>
        ) : null}
      </div>

      <p role="status" aria-live="polite" style={{minHeight:24,color:"#b9c8bf"}}>{message}</p>
      <small style={{color:"#7f9487"}}>Touch, click or keyboard. Local play only; no wallet or blockchain action.</small>
    </article>
  )
}
