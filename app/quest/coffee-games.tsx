"use client"

import { useCallback, useEffect, useRef, useState } from "react"

const cardStyle = {
  border: "1px solid #285f40",
  borderRadius: "18px",
  background: "#0c120f",
  padding: "20px",
  marginTop: "24px",
} as const

const buttonStyle = {
  minHeight: "44px",
  border: "1px solid #3e7a55",
  borderRadius: "999px",
  background: "#10261a",
  color: "#b9ffd4",
  fontWeight: 800,
  padding: "10px 16px",
  cursor: "pointer",
} as const

function CoffeeRush() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef({ score: 0, lives: 3, x: 560, speed: 3, full: false, over: false })
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)

  const reset = useCallback(() => {
    stateRef.current = { score: 0, lives: 3, x: 560, speed: 3, full: false, over: false }
    setScore(0)
    setLives(3)
    setGameOver(false)
  }, [])

  const tapMachine = useCallback(() => {
    const state = stateRef.current
    if (state.over) return
    const machineX = 150
    const cupWidth = 40
    if (state.x < machineX && state.x + cupWidth > machineX && !state.full) {
      state.full = true
      state.score += 10
      state.speed += 0.5
      setScore(state.score)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    let frame = 0

    const draw = () => {
      const state = stateRef.current
      if (state.over) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const machineX = 150
      ctx.fillStyle = "#6f4e37"
      ctx.fillRect(machineX - 10, 10, 20, 40)
      ctx.beginPath()
      ctx.moveTo(machineX - 20, 50)
      ctx.lineTo(machineX + 20, 50)
      ctx.lineTo(machineX, 70)
      ctx.fill()

      state.x -= state.speed
      if (state.x + 40 < 0) {
        if (!state.full) {
          state.lives -= 1
          setLives(state.lives)
        }
        state.x = 560
        state.full = false
      }

      ctx.fillStyle = state.full ? "#8b5a2b" : "#dddddd"
      ctx.fillRect(state.x, 120, 40, 50)
      ctx.fillStyle = "#aaaaaa"
      ctx.fillRect(state.x + 40, 130, 10, 20)

      if (state.lives <= 0) {
        state.over = true
        setGameOver(true)
        return
      }
      frame = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <section style={cardStyle} aria-labelledby="coffee-rush-heading">
      <h2 id="coffee-rush-heading">☕ Coffee Rush</h2>
      <p>Tap when the cup is exactly under the machine arrow.</p>
      <canvas ref={canvasRef} width={600} height={200} style={{ width: "100%", maxWidth: 600, background: "#ffffff", border: "3px solid #285f40", borderRadius: 12, display: "block", margin: "16px auto" }} />
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <button type="button" onClick={tapMachine} style={buttonStyle}>Tap machine</button>
        {gameOver && <button type="button" onClick={reset} style={buttonStyle}>Play again</button>}
        <strong>Score: {score} · Lives: {lives}</strong>
      </div>
      {gameOver && <p role="status">Game over. Final score: {score}.</p>}
    </section>
  )
}

type Bean = { x: number; y: number; vx: number; vy: number }

function BeanDrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const beansRef = useRef<Bean[]>([])
  const [score, setScore] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    let frame = 0
    const pegs = [
      { x: 100, y: 150 }, { x: 200, y: 150 }, { x: 300, y: 150 },
      { x: 150, y: 250 }, { x: 250, y: 250 },
      { x: 100, y: 350 }, { x: 200, y: 350 }, { x: 300, y: 350 },
    ]
    const cups = [
      { x: 20, w: 80, points: 50, fill: "#6f302d" },
      { x: 150, w: 100, points: 10, fill: "#285f40" },
      { x: 300, w: 80, points: 50, fill: "#6f302d" },
    ]

    const update = () => {
      ctx.clearRect(0, 0, 400, 500)
      ctx.fillStyle = "#777"
      for (const peg of pegs) {
        ctx.beginPath(); ctx.arc(peg.x, peg.y, 8, 0, Math.PI * 2); ctx.fill()
      }
      ctx.font = "16px Arial"
      for (const cup of cups) {
        ctx.fillStyle = cup.fill
        ctx.fillRect(cup.x, 460, cup.w, 40)
        ctx.fillStyle = "#fff"
        ctx.fillText(`${cup.points} pts`, cup.x + 14, 485)
      }

      const next: Bean[] = []
      for (const bean of beansRef.current) {
        bean.vy += 0.1
        bean.x += bean.vx
        bean.y += bean.vy
        for (const peg of pegs) {
          const dist = Math.hypot(bean.x - peg.x, bean.y - peg.y)
          if (dist < 14) {
            bean.vy = -bean.vy * 0.6
            bean.vx += (bean.x - peg.x) * 0.2
          }
        }
        ctx.fillStyle = "#3d2314"
        ctx.beginPath(); ctx.arc(bean.x, bean.y, 6, 0, Math.PI * 2); ctx.fill()
        if (bean.y > 460) {
          const cup = cups.find((candidate) => bean.x > candidate.x && bean.x < candidate.x + candidate.w)
          if (cup) setScore((value) => value + cup.points)
        } else if (bean.y < 520) {
          next.push(bean)
        }
      }
      beansRef.current = next
      frame = requestAnimationFrame(update)
    }
    update()
    return () => cancelAnimationFrame(frame)
  }, [])

  const dropBean = (clientX: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = Math.max(6, Math.min(394, ((clientX - rect.left) / rect.width) * 400))
    beansRef.current.push({ x, y: 20, vy: 2, vx: (Math.random() - 0.5) * 2 })
  }

  return (
    <section style={cardStyle} aria-labelledby="bean-drop-heading">
      <h2 id="bean-drop-heading">🫘 Bean Drop</h2>
      <p>Tap or click in the board to drop a bean and score in the cups.</p>
      <strong>Score: {score}</strong>
      <canvas
        ref={canvasRef}
        width={400}
        height={500}
        onPointerDown={(event) => dropBean(event.clientX)}
        aria-label="Bean Drop game board. Tap or click a horizontal position to drop a bean."
        style={{ width: "100%", maxWidth: 400, background: "#ffffff", border: "3px solid #285f40", borderRadius: 12, display: "block", margin: "16px auto", touchAction: "none" }}
      />
    </section>
  )
}

const levelNames = ["Empty", "🫘 Bean · Level 1", "📦 Ground · Level 2", "☕ CUP OF COFFEE · Level 3"]

function PerfectBlend() {
  const [cells, setCells] = useState([1, 1, 0, 0, 0, 0])
  const [selected, setSelected] = useState<number | null>(null)

  const chooseCell = (index: number) => {
    if (selected === null) {
      if (cells[index] > 0) setSelected(index)
      return
    }
    if (selected === index) {
      setSelected(null)
      return
    }
    const sourceLevel = cells[selected]
    const targetLevel = cells[index]
    const next = [...cells]
    if (targetLevel === 0 && sourceLevel > 0) {
      next[index] = sourceLevel
      next[selected] = 0
    } else if (sourceLevel === targetLevel && sourceLevel > 0 && sourceLevel < 3) {
      next[index] = sourceLevel + 1
      next[selected] = 0
    }
    setCells(next)
    setSelected(null)
  }

  const spawnItem = () => {
    const emptyIndex = cells.findIndex((level) => level === 0)
    if (emptyIndex === -1) return
    const next = [...cells]
    next[emptyIndex] = 1
    setCells(next)
  }

  const full = !cells.includes(0)

  return (
    <section style={cardStyle} aria-labelledby="perfect-blend-heading">
      <h2 id="perfect-blend-heading">🧺 The Perfect Blend</h2>
      <p>Generate beans and combine equal items to make better coffee. Tap one item, then tap its destination.</p>
      <button type="button" onClick={spawnItem} disabled={full} style={{ ...buttonStyle, opacity: full ? 0.5 : 1 }}>Generate from coffee machine</button>
      {full && <p role="status">The grid is full. Merge items first.</p>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(72px, 100px))", gap: 10, justifyContent: "center", marginTop: 18 }}>
        {cells.map((level, index) => (
          <button
            key={index}
            type="button"
            onClick={() => chooseCell(index)}
            aria-pressed={selected === index}
            style={{
              minHeight: 100,
              border: selected === index ? "2px solid #5cff9d" : "2px dashed #557060",
              borderRadius: 10,
              background: "#172019",
              color: "#f4f7f5",
              padding: 8,
              cursor: level > 0 || selected !== null ? "pointer" : "default",
            }}
          >
            {levelNames[level]}
          </button>
        ))}
      </div>
    </section>
  )
}

export default function CoffeeGames() {
  return (
    <section aria-labelledby="coffee-games-heading">
      <div style={{ marginTop: 36 }}>
        <p style={{ color: "#5cff9d", fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase" }}>VIA Mini Games</p>
        <h2 id="coffee-games-heading">Coffee Corner</h2>
        <p>Three lightweight local games. No wallet, blockchain transaction or payment is required.</p>
      </div>
      <CoffeeRush />
      <BeanDrop />
      <PerfectBlend />
    </section>
  )
}
