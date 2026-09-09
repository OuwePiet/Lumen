"use client"

import { ChangeEvent, PointerEvent, useEffect, useMemo, useRef, useState } from "react"

type Difficulty = { label: string; cols: number; rows: number }
type ScoreRow = { name: string; seconds: number; pieces: number; date: string }

type Point = { x: number; y: number }

const difficulties: Difficulty[] = [
  { label: "Quick Chain · 80", cols: 10, rows: 8 },
  { label: "Deep Chain · 200", cols: 20, rows: 10 },
  { label: "Master Chain · 500", cols: 25, rows: 20 },
]

const card = { border: "1px solid #285f40", borderRadius: 22, background: "#0a100d", padding: 20, marginTop: 28 } as const
const button = { minHeight: 44, border: "1px solid #3d8058", borderRadius: 999, background: "#10261a", color: "#c9ffdc", padding: "10px 16px", fontWeight: 800, cursor: "pointer" } as const

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${minutes}:${String(rest).padStart(2, "0")}`
}

function fallbackImage(width: number, height: number) {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")!
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, "#07100b")
  gradient.addColorStop(0.55, "#0e3520")
  gradient.addColorStop(1, "#07130e")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  ctx.strokeStyle = "rgba(92,255,157,.28)"
  ctx.lineWidth = 2
  const nodes: Point[] = Array.from({ length: 28 }, (_, i) => ({
    x: 30 + ((i * 137) % Math.max(60, width - 60)),
    y: 30 + ((i * 83) % Math.max(60, height - 60)),
  }))
  nodes.forEach((node, i) => {
    const other = nodes[(i * 7 + 5) % nodes.length]
    ctx.beginPath(); ctx.moveTo(node.x, node.y); ctx.lineTo(other.x, other.y); ctx.stroke()
  })
  nodes.forEach((node, i) => {
    ctx.fillStyle = i % 3 === 0 ? "#d8ffe5" : "#5cff9d"
    ctx.beginPath(); ctx.arc(node.x, node.y, i % 3 === 0 ? 5 : 3, 0, Math.PI * 2); ctx.fill()
  })
  ctx.fillStyle = "rgba(255,255,255,.82)"
  ctx.font = "700 38px Arial"
  ctx.fillText("VIA CHAIN", 34, 62)
  ctx.font = "15px monospace"
  for (let y = 100; y < height; y += 38) {
    const hash = Array.from({ length: 42 }, (_, i) => ((y * 17 + i * 29) % 16).toString(16)).join("")
    ctx.fillStyle = "rgba(185,255,212,.36)"
    ctx.fillText(hash, 30, y)
  }
  return canvas.toDataURL("image/png")
}

export default function BlockchainPuzzle() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const dragRef = useRef<Point | null>(null)
  const [difficulty, setDifficulty] = useState(0)
  const [order, setOrder] = useState<number[]>([])
  const [placed, setPlaced] = useState<Set<number>>(new Set())
  const [active, setActive] = useState<number | null>(null)
  const [activePos, setActivePos] = useState<Point>({ x: 36, y: 36 })
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [complete, setComplete] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [message, setMessage] = useState("Choose a level and start the chain.")
  const [scores, setScores] = useState<ScoreRow[]>([])
  const [imageUrl, setImageUrl] = useState<string>("")

  const mode = difficulties[difficulty]
  const total = mode.cols * mode.rows
  const pieceIndex = placed.size
  const progress = Math.round((placed.size / total) * 100)
  const storageKey = `via:blockchain-puzzle:scores:${total}:v1`

  const sequence = useMemo(() => order.length === total ? order : Array.from({ length: total }, (_, i) => i), [order, total])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      setScores(raw ? JSON.parse(raw) : [])
    } catch { setScores([]) }
  }, [storageKey])

  useEffect(() => {
    if (!startedAt || complete) return
    const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000)
    return () => window.clearInterval(timer)
  }, [startedAt, complete])

  useEffect(() => {
    if (imageUrl) return
    setImageUrl(fallbackImage(750, 600))
  }, [imageUrl])

  useEffect(() => {
    if (!imageUrl) return
    const image = new Image()
    image.onload = () => { imageRef.current = image; draw() }
    image.src = imageUrl
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl])

  useEffect(() => { draw() })

  function boardMetrics() {
    const canvas = canvasRef.current
    const width = canvas?.width ?? 750
    const height = canvas?.height ?? 600
    return { width, height, pieceW: width / mode.cols, pieceH: height / mode.rows }
  }

  function draw() {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    const image = imageRef.current
    if (!canvas || !ctx || !image) return
    const { width, height, pieceW, pieceH } = boardMetrics()
    ctx.fillStyle = "#050807"
    ctx.fillRect(0, 0, width, height)

    if (showGuide) {
      ctx.globalAlpha = .13
      ctx.drawImage(image, 0, 0, width, height)
      ctx.globalAlpha = 1
    }

    for (const index of placed) {
      const col = index % mode.cols
      const row = Math.floor(index / mode.cols)
      ctx.drawImage(image, col * (image.width / mode.cols), row * (image.height / mode.rows), image.width / mode.cols, image.height / mode.rows, col * pieceW, row * pieceH, pieceW, pieceH)
    }

    ctx.strokeStyle = "rgba(92,255,157,.08)"
    ctx.lineWidth = 1
    for (let c = 1; c < mode.cols; c++) { ctx.beginPath(); ctx.moveTo(c * pieceW, 0); ctx.lineTo(c * pieceW, height); ctx.stroke() }
    for (let r = 1; r < mode.rows; r++) { ctx.beginPath(); ctx.moveTo(0, r * pieceH); ctx.lineTo(width, r * pieceH); ctx.stroke() }

    if (active !== null && !placed.has(active)) {
      const col = active % mode.cols
      const row = Math.floor(active / mode.cols)
      ctx.save()
      ctx.shadowColor = "rgba(92,255,157,.65)"
      ctx.shadowBlur = 12
      ctx.drawImage(image, col * (image.width / mode.cols), row * (image.height / mode.rows), image.width / mode.cols, image.height / mode.rows, activePos.x - pieceW / 2, activePos.y - pieceH / 2, pieceW, pieceH)
      ctx.restore()
      ctx.strokeStyle = "#b9ffd4"
      ctx.strokeRect(activePos.x - pieceW / 2, activePos.y - pieceH / 2, pieceW, pieceH)
    }
  }

  function startGame() {
    const shuffled = Array.from({ length: total }, (_, i) => i)
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setOrder(shuffled)
    setPlaced(new Set())
    setActive(shuffled[0])
    setActivePos({ x: 55, y: 55 })
    setStartedAt(Date.now())
    setElapsed(0)
    setComplete(false)
    setMessage(`${total} pieces ready. Drag the glowing piece to its place.`)
  }

  function pointerPosition(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return { x: ((event.clientX - rect.left) / rect.width) * canvas.width, y: ((event.clientY - rect.top) / rect.height) * canvas.height }
  }

  function onPointerDown(event: PointerEvent<HTMLCanvasElement>) {
    if (active === null || complete) return
    const point = pointerPosition(event)
    dragRef.current = point
    setActivePos(point)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function onPointerMove(event: PointerEvent<HTMLCanvasElement>) {
    if (!dragRef.current || active === null || complete) return
    setActivePos(pointerPosition(event))
  }

  function onPointerUp(event: PointerEvent<HTMLCanvasElement>) {
    if (!dragRef.current || active === null || complete) return
    dragRef.current = null
    const point = pointerPosition(event)
    const { pieceW, pieceH } = boardMetrics()
    const col = active % mode.cols
    const row = Math.floor(active / mode.cols)
    const target = { x: col * pieceW + pieceW / 2, y: row * pieceH + pieceH / 2 }
    const snap = Math.max(14, Math.min(pieceW, pieceH) * .7)
    if (Math.hypot(point.x - target.x, point.y - target.y) <= snap) {
      const nextPlaced = new Set(placed)
      nextPlaced.add(active)
      setPlaced(nextPlaced)
      if (nextPlaced.size === total) {
        finishGame(nextPlaced.size)
      } else {
        setActive(sequence[nextPlaced.size])
        setActivePos({ x: 45 + ((nextPlaced.size * 71) % 150), y: 45 + ((nextPlaced.size * 47) % 100) })
        setMessage(`Block validated · ${nextPlaced.size}/${total}`)
      }
    } else {
      setMessage("Not validated yet · move closer to the correct block.")
    }
  }

  function finishGame(_count: number) {
    const finalSeconds = startedAt ? Math.max(1, Math.floor((Date.now() - startedAt) / 1000)) : elapsed
    setElapsed(finalSeconds)
    setComplete(true)
    setActive(null)
    setMessage(`Chain complete in ${formatTime(finalSeconds)}.`)
    window.setTimeout(() => {
      const rawName = window.prompt("Chain complete! Name for this local high score?", "VIA Miner")
      const name = (rawName || "VIA Miner").trim().slice(0, 24) || "VIA Miner"
      const row: ScoreRow = { name, seconds: finalSeconds, pieces: total, date: new Date().toISOString() }
      const next = [...scores, row].sort((a, b) => a.seconds - b.seconds).slice(0, 10)
      setScores(next)
      try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch { /* local score only */ }
    }, 100)
  }

  function loadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) { setMessage("Choose an image file."); return }
    if (file.size > 12 * 1024 * 1024) { setMessage("Image too large for this local game. Maximum 12 MB."); return }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageUrl(reader.result)
        setMessage("Your image is loaded locally. It is not uploaded to VIA.")
        startGame()
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <section style={card} aria-labelledby="blockchain-puzzle-heading">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "end" }}>
        <div>
          <p style={{ color: "#5cff9d", fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", margin: 0 }}>VIA Puzzle Lab</p>
          <h2 id="blockchain-puzzle-heading" style={{ marginBottom: 8 }}>⛓ VIA Blockchain Mosaic</h2>
          <p style={{ color: "#a9b8af", maxWidth: 760, marginTop: 0 }}>Rebuild a chain image one validated block at a time. Use VIA's generated network image or choose your own image. Your image and high scores stay in this browser.</p>
        </div>
        <span style={{ color: "#b9ffd4", fontWeight: 800 }}>{progress}% · {placed.size}/{total}</span>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "16px 0" }}>
        {difficulties.map((item, index) => <button key={item.label} type="button" onClick={() => { setDifficulty(index); setComplete(false); setStartedAt(null); setPlaced(new Set()); setActive(null); setMessage(`${item.label} selected.`) }} style={{ ...button, background: difficulty === index ? "#18482c" : button.background }}>{item.label}</button>)}
        <button type="button" onClick={startGame} style={button}>Start / shuffle</button>
        <label style={{ ...button, display: "inline-flex", alignItems: "center" }}>Own image<input type="file" accept="image/*" onChange={loadImage} style={{ display: "none" }} /></label>
        <button type="button" onClick={() => setShowGuide(value => !value)} style={button}>{showGuide ? "Hide guide" : "Show guide"}</button>
      </div>

      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", color: "#d8ffe5", marginBottom: 12 }}><strong>Time {formatTime(elapsed)}</strong><strong>{mode.label}</strong><span role="status">{message}</span></div>

      <canvas ref={canvasRef} width={750} height={600} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} aria-label={`VIA Blockchain Mosaic puzzle board with ${total} pieces`} style={{ width: "100%", maxWidth: 750, aspectRatio: "5 / 4", display: "block", border: "2px solid #285f40", borderRadius: 16, background: "#050807", touchAction: "none", margin: "0 auto" }} />

      <div style={{ marginTop: 18, padding: 16, borderRadius: 16, background: "#07100b", border: "1px solid #1c4b30" }}>
        <h3 style={{ marginTop: 0 }}>🏆 Local top 10 · {total} pieces</h3>
        {scores.length === 0 ? <p style={{ color: "#8fa299" }}>No completed chain in this browser yet.</p> : <ol style={{ marginBottom: 0 }}>{scores.map((row, index) => <li key={`${row.date}-${index}`} style={{ margin: "8px 0" }}><strong>{row.name}</strong> · {formatTime(row.seconds)}</li>)}</ol>}
      </div>

      <p style={{ color: "#82958a", fontSize: 13, lineHeight: 1.6, marginBottom: 0 }}>VIA-proof boundary: scores are casual local game data, not proof for payments or on-chain rewards. Uploaded images are processed in your browser only and are not stored by VIA. Master Chain preserves the original 25 × 20 = 500-piece challenge; the smaller modes make the game practical on phones and tablets.</p>
    </section>
  )
}
