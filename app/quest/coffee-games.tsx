"use client"

import { useCallback, useEffect, useRef, useState } from "react"

const cardStyle = {
  border: "1px solid #315a43",
  borderRadius: "22px",
  background: "linear-gradient(180deg, #101712 0%, #0a0f0c 100%)",
  boxShadow: "0 18px 50px rgba(0,0,0,.28)",
  padding: "clamp(18px, 3vw, 28px)",
  marginTop: "24px",
} as const

const buttonStyle = {
  minHeight: "46px",
  border: "1px solid #4c8060",
  borderRadius: "999px",
  background: "linear-gradient(180deg, #173522 0%, #10261a 100%)",
  color: "#d8ffe7",
  fontWeight: 800,
  padding: "11px 18px",
  cursor: "pointer",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,.05)",
} as const

const boardStyle = {
  width: "100%",
  display: "block",
  margin: "18px auto",
  background: "#07100b",
  border: "2px solid #315a43",
  borderRadius: 16,
  boxShadow: "inset 0 0 40px rgba(92,255,157,.035)",
} as const

function CoffeeRush() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef({ score: 0, lives: 3, x: 560, speed: 3, full: false, over: false, streak: 0 })
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)
  const [round, setRound] = useState(0)
  const [message, setMessage] = useState("Time your first pour.")

  const reset = useCallback(() => {
    stateRef.current = { score: 0, lives: 3, x: 560, speed: 3, full: false, over: false, streak: 0 }
    setScore(0)
    setLives(3)
    setGameOver(false)
    setMessage("Fresh machine. Go for a perfect pour.")
    setRound((value) => value + 1)
  }, [])

  const tapMachine = useCallback(() => {
    const state = stateRef.current
    if (state.over || state.full) return
    const machineX = 150
    const cupCentre = state.x + 20
    const distance = Math.abs(cupCentre - machineX)
    if (distance <= 18) {
      state.full = true
      state.streak += 1
      const points = distance <= 7 ? 20 : 10
      state.score += points
      state.speed = Math.min(7.5, state.speed + 0.35)
      setScore(state.score)
      setMessage(distance <= 7 ? `Perfect pour! +${points}` : `Nice pour! +${points}`)
    } else {
      setMessage(cupCentre > machineX ? "A little early…" : "A little late…")
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
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const machineX = 150

      const gradient = ctx.createLinearGradient(0, 0, 600, 200)
      gradient.addColorStop(0, "#07100b")
      gradient.addColorStop(1, "#101b13")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 600, 200)

      ctx.fillStyle = "rgba(92,255,157,.08)"
      ctx.fillRect(machineX - 28, 75, 56, 110)
      ctx.strokeStyle = "#5cff9d"
      ctx.lineWidth = 2
      ctx.setLineDash([5, 7])
      ctx.strokeRect(machineX - 22, 76, 44, 108)
      ctx.setLineDash([])

      ctx.fillStyle = "#c99462"
      ctx.fillRect(machineX - 13, 12, 26, 42)
      ctx.beginPath()
      ctx.moveTo(machineX - 24, 54)
      ctx.lineTo(machineX + 24, 54)
      ctx.lineTo(machineX, 76)
      ctx.fill()

      if (!state.over) {
        state.x -= state.speed
        if (state.x + 40 < 0) {
          if (!state.full) {
            state.lives -= 1
            state.streak = 0
            setLives(state.lives)
            setMessage("Missed cup. One life gone.")
          }
          state.x = 560
          state.full = false
        }
      }

      ctx.fillStyle = state.full ? "#9b6238" : "#e7e1d7"
      ctx.fillRect(state.x, 122, 40, 48)
      ctx.strokeStyle = "#cfc6b8"
      ctx.lineWidth = 5
      ctx.beginPath()
      ctx.arc(state.x + 43, 142, 10, -Math.PI / 2, Math.PI / 2)
      ctx.stroke()
      if (state.full) {
        ctx.fillStyle = "#4b2918"
        ctx.fillRect(state.x + 4, 126, 32, 8)
      }

      if (state.lives <= 0 && !state.over) {
        state.over = true
        setGameOver(true)
        setMessage(`Shift over. Final score: ${state.score}.`)
      }
      if (!state.over) frame = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(frame)
  }, [round])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault()
        tapMachine()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [tapMachine])

  return (
    <section style={cardStyle} aria-labelledby="coffee-rush-heading">
      <p style={{ color: "#c99462", fontWeight: 800, margin: 0 }}>TIMING · QUICK PLAY</p>
      <h2 id="coffee-rush-heading" style={{ marginTop: 8 }}>☕ VIA Coffee Rush</h2>
      <p>Catch the cup inside the glowing pour zone. Perfect timing scores double; every successful pour makes the belt a little faster.</p>
      <canvas ref={canvasRef} width={600} height={200} aria-label="VIA Coffee Rush timing board" style={{ ...boardStyle, maxWidth: 600 }} />
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <button type="button" onClick={tapMachine} style={buttonStyle}>Pour coffee</button>
        {gameOver && <button type="button" onClick={reset} style={buttonStyle}>Play again</button>}
        <strong>Score {score} · Lives {lives}</strong>
      </div>
      <p role="status" aria-live="polite" style={{ color: "#b9c8bf", minHeight: 24 }}>{message}</p>
      <small style={{ color: "#7f9487" }}>Touch, click, or press Space. Local score only.</small>
    </section>
  )
}

type Bean = { x: number; y: number; vx: number; vy: number }

function BeanDrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const beansRef = useRef<Bean[]>([])
  const [score, setScore] = useState(0)
  const [drops, setDrops] = useState(12)
  const [best, setBest] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    let frame = 0
    const pegs = [
      { x: 70, y: 120 }, { x: 150, y: 120 }, { x: 250, y: 120 }, { x: 330, y: 120 },
      { x: 110, y: 210 }, { x: 200, y: 210 }, { x: 290, y: 210 },
      { x: 70, y: 300 }, { x: 150, y: 300 }, { x: 250, y: 300 }, { x: 330, y: 300 },
      { x: 110, y: 385 }, { x: 200, y: 385 }, { x: 290, y: 385 },
    ]
    const cups = [
      { x: 8, w: 70, points: 75, fill: "#8d5b34" },
      { x: 92, w: 86, points: 25, fill: "#315a43" },
      { x: 190, w: 70, points: 10, fill: "#244332" },
      { x: 272, w: 86, points: 25, fill: "#315a43" },
      { x: 370, w: 22, points: 100, fill: "#b47a45" },
    ]

    const update = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, 500)
      gradient.addColorStop(0, "#0c1710")
      gradient.addColorStop(1, "#07100b")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 400, 500)

      ctx.fillStyle = "#5e7666"
      for (const peg of pegs) {
        ctx.beginPath(); ctx.arc(peg.x, peg.y, 7, 0, Math.PI * 2); ctx.fill()
        ctx.strokeStyle = "rgba(255,255,255,.14)"; ctx.stroke()
      }
      ctx.font = "bold 13px Arial"
      for (const cup of cups) {
        ctx.fillStyle = cup.fill
        ctx.fillRect(cup.x, 456, cup.w, 44)
        if (cup.w > 30) {
          ctx.fillStyle = "#fff"
          ctx.fillText(`${cup.points}`, cup.x + Math.max(8, cup.w / 2 - 10), 483)
        }
      }

      const next: Bean[] = []
      for (const bean of beansRef.current) {
        bean.vy += 0.11
        bean.x += bean.vx
        bean.y += bean.vy
        if (bean.x < 6 || bean.x > 394) bean.vx *= -0.8
        for (const peg of pegs) {
          const dx = bean.x - peg.x
          const dy = bean.y - peg.y
          const dist = Math.hypot(dx, dy)
          if (dist < 14 && dist > 0) {
            bean.vy = -Math.abs(bean.vy) * 0.55
            bean.vx += (dx / dist) * 1.35
          }
        }
        ctx.fillStyle = "#b67a45"
        ctx.beginPath(); ctx.ellipse(bean.x, bean.y, 6, 9, 0.35, 0, Math.PI * 2); ctx.fill()
        if (bean.y > 456) {
          const cup = cups.find((candidate) => bean.x >= candidate.x && bean.x <= candidate.x + candidate.w)
          if (cup) {
            setScore((value) => {
              const nextScore = value + cup.points
              setBest((oldBest) => Math.max(oldBest, nextScore))
              return nextScore
            })
          }
        } else if (bean.y < 520) next.push(bean)
      }
      beansRef.current = next
      frame = requestAnimationFrame(update)
    }
    update()
    return () => cancelAnimationFrame(frame)
  }, [])

  const dropBean = (clientX: number) => {
    if (drops <= 0) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = Math.max(10, Math.min(390, ((clientX - rect.left) / rect.width) * 400))
    beansRef.current.push({ x, y: 24, vy: 1.2, vx: (Math.random() - 0.5) * 1.4 })
    setDrops((value) => value - 1)
  }

  const reset = () => {
    beansRef.current = []
    setScore(0)
    setDrops(12)
  }

  return (
    <section style={cardStyle} aria-labelledby="bean-drop-heading">
      <p style={{ color: "#c99462", fontWeight: 800, margin: 0 }}>PHYSICS · LUCK & AIM</p>
      <h2 id="bean-drop-heading" style={{ marginTop: 8 }}>🫘 VIA Bean Drop</h2>
      <p>Choose where each bean starts. Bounce through the VIA coffee board and hunt the narrow bonus cups.</p>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}><strong>Score {score}</strong><span>Drops {drops}/12</span><span>Best {best}</span></div>
      <canvas ref={canvasRef} width={400} height={500} onPointerDown={(event) => dropBean(event.clientX)} aria-label="VIA Bean Drop board. Tap a horizontal position to drop a bean." style={{ ...boardStyle, maxWidth: 400, touchAction: "none" }} />
      <button type="button" onClick={reset} style={buttonStyle}>New round</button>
      {drops === 0 && beansRef.current.length === 0 && <p role="status">Round complete. Score: {score}.</p>}
    </section>
  )
}

const levelNames = ["Empty", "🫘 Bean", "⚙️ Ground", "☕ Espresso", "🥛 Flat White", "✨ VIA Roast"]
const levelSub = ["", "Level 1", "Level 2", "Level 3", "Level 4", "Level 5"]

function PerfectBlend() {
  const [cells, setCells] = useState([1, 1, 0, 0, 0, 0, 0, 0, 0])
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState("Merge matching items and reach the VIA Roast.")

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
    } else if (sourceLevel === targetLevel && sourceLevel > 0 && sourceLevel < 5) {
      next[index] = sourceLevel + 1
      next[selected] = 0
      const points = (sourceLevel + 1) * 25
      setScore((value) => value + points)
      setMessage(sourceLevel + 1 === 5 ? "VIA Roast unlocked! That is a complete blend." : `${levelNames[sourceLevel + 1]} created. +${points}`)
    } else {
      setMessage("Those two items do not blend. Match equal levels or move into an empty slot.")
    }
    setCells(next)
    setSelected(null)
  }

  const spawnItem = () => {
    const emptyIndexes = cells.map((level, index) => level === 0 ? index : -1).filter((index) => index >= 0)
    if (emptyIndexes.length === 0) return
    const target = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)]
    const next = [...cells]
    next[target] = 1
    setCells(next)
    setMessage("Fresh bean delivered.")
  }

  const reset = () => {
    setCells([1, 1, 0, 0, 0, 0, 0, 0, 0])
    setSelected(null)
    setScore(0)
    setMessage("New blend started.")
  }

  const full = !cells.includes(0)
  const won = cells.includes(5)

  return (
    <section style={cardStyle} aria-labelledby="perfect-blend-heading">
      <p style={{ color: "#c99462", fontWeight: 800, margin: 0 }}>MERGE · PUZZLE</p>
      <h2 id="perfect-blend-heading" style={{ marginTop: 8 }}>🧺 VIA Perfect Blend</h2>
      <p>Build the chain from bean to VIA Roast. Tap a source tile and then its destination. Matching levels merge upward.</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <button type="button" onClick={spawnItem} disabled={full || won} style={{ ...buttonStyle, opacity: full || won ? 0.5 : 1 }}>Generate bean</button>
        <button type="button" onClick={reset} style={buttonStyle}>New blend</button>
        <strong>Score {score}</strong>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(82px, 118px))", gap: 12, justifyContent: "center", marginTop: 20 }}>
        {cells.map((level, index) => (
          <button key={index} type="button" onClick={() => chooseCell(index)} aria-pressed={selected === index} style={{ minHeight: 108, border: selected === index ? "2px solid #5cff9d" : level > 0 ? "1px solid #446b52" : "1px dashed #33463a", borderRadius: 16, background: level === 5 ? "linear-gradient(145deg,#21452f,#8d673d)" : level > 0 ? "linear-gradient(145deg,#17231b,#101712)" : "#0a100c", color: "#f4f7f5", padding: 10, cursor: level > 0 || selected !== null ? "pointer" : "default", boxShadow: selected === index ? "0 0 0 3px rgba(92,255,157,.1)" : "none" }}>
            <span style={{ display: "block", fontSize: level > 0 ? 18 : 14, fontWeight: 800 }}>{levelNames[level]}</span>
            {level > 0 && <small style={{ color: "#9db0a4" }}>{levelSub[level]}</small>}
          </button>
        ))}
      </div>
      <p role="status" aria-live="polite" style={{ color: won ? "#b9ffd4" : "#aab9b0", minHeight: 24 }}>{message}</p>
      {full && !won && <p style={{ color: "#d5b07b" }}>Board full: merge matching tiles or start a new blend.</p>}
    </section>
  )
}

export default function CoffeeGames() {
  return (
    <section aria-labelledby="coffee-games-heading" style={{ marginTop: 44 }}>
      <div style={{ borderLeft: "3px solid #5cff9d", paddingLeft: 16 }}>
        <p style={{ color: "#5cff9d", fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 6 }}>VIA Mini Games</p>
        <h2 id="coffee-games-heading" style={{ margin: 0 }}>VIA Coffee Corner</h2>
        <p style={{ maxWidth: 760, color: "#a9b8af" }}>Three small VIA games with three different rhythms: timing, physics and merging. Free, local and designed for touch as well as desktop. No wallet or blockchain action is needed.</p>
      </div>
      <CoffeeRush />
      <BeanDrop />
      <PerfectBlend />
    </section>
  )
}
