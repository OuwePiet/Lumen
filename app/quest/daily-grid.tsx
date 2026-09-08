"use client"

import { useEffect, useMemo, useState } from "react"

const ANSWERS = ["WORLD", "QUEST", "RADIO", "BADGE", "GREEN", "POINT", "SHARE"]
const MAX_TRIES = 6
const DAY_MS = 86_400_000

function utcDayNumber(now = Date.now()) {
  return Math.floor(now / DAY_MS)
}

function answerForDay(day: number) {
  return ANSWERS[day % ANSWERS.length]
}

function scoreGuess(guess: string, answer: string) {
  const result = Array(5).fill("absent") as ("correct" | "present" | "absent")[]
  const remaining: Record<string, number> = {}
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) result[i] = "correct"
    else remaining[answer[i]] = (remaining[answer[i]] || 0) + 1
  }
  for (let i = 0; i < 5; i++) {
    if (result[i] === "correct") continue
    const letter = guess[i]
    if ((remaining[letter] || 0) > 0) {
      result[i] = "present"
      remaining[letter]--
    }
  }
  return result
}

export default function DailyGrid() {
  const [day, setDay] = useState(() => utcDayNumber())
  const answer = useMemo(() => answerForDay(day), [day])
  const storageKey = `via:daily-grid:${day}`
  const [guesses, setGuesses] = useState<string[]>([])
  const [input, setInput] = useState("")
  const [copied, setCopied] = useState<"idle" | "ok" | "error">("idle")
  const [hydratedKey, setHydratedKey] = useState<string | null>(null)

  useEffect(() => {
    function refreshDay() {
      const current = utcDayNumber()
      setDay((old) => old === current ? old : current)
    }
    const timer = window.setInterval(refreshDay, 30_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    setHydratedKey(null)
    setInput("")
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) || "[]")
      const clean = Array.isArray(saved)
        ? saved.filter((x): x is string => typeof x === "string" && /^[A-Z]{5}$/.test(x)).slice(0, MAX_TRIES)
        : []
      setGuesses(clean)
    } catch {
      setGuesses([])
    } finally {
      setHydratedKey(storageKey)
    }
  }, [storageKey])

  useEffect(() => {
    if (hydratedKey !== storageKey) return
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(guesses))
    } catch {
      // Playing still works when browser storage is blocked or full.
    }
  }, [guesses, hydratedKey, storageKey])

  const won = guesses.includes(answer)
  const finished = won || guesses.length >= MAX_TRIES

  function submit() {
    const guess = input.trim().toUpperCase()
    if (finished || !/^[A-Z]{5}$/.test(guess)) return
    setGuesses((old) => [...old, guess])
    setInput("")
  }

  function shareText() {
    const rows = guesses.map((guess) => scoreGuess(guess, answer).map((cell) => cell === "correct" ? "🟩" : cell === "present" ? "🟨" : "⬛").join(""))
    return [`VIA Daily Grid #${day}`, won ? `${guesses.indexOf(answer) + 1}/${MAX_TRIES}` : `X/${MAX_TRIES}`, "", ...rows, "", "Play the world. Discover DeSo."].join("\n")
  }

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(shareText())
      setCopied("ok")
    } catch {
      setCopied("error")
    }
    window.setTimeout(() => setCopied("idle"), 1800)
  }

  return (
    <article style={{border:"1px solid #234b36", borderRadius:18, padding:20, marginTop:24, background:"#07100b"}}>
      <p style={{margin:0, color:"#7ee2a8", fontWeight:700}}>DAILY GAME · ONE PUZZLE PER UTC DAY</p>
      <h2>VIA Daily Grid</h2>
      <p>Guess today&apos;s five-letter VIA world word in six tries. Green is correct, yellow is the right letter in another place.</p>

      <div aria-label="Daily Grid guesses" style={{display:"grid", gap:6, maxWidth:330, margin:"18px 0"}}>
        {Array.from({length: MAX_TRIES}).map((_, row) => {
          const guess = guesses[row] || ""
          const scored = guess ? scoreGuess(guess, answer) : []
          return <div key={row} style={{display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:6}}>
            {Array.from({length:5}).map((__, col) => {
              const status = scored[col]
              const bg = status === "correct" ? "#168447" : status === "present" ? "#9a7b13" : status === "absent" ? "#303632" : "#111b15"
              return <span key={col} style={{aspectRatio:"1", display:"grid", placeItems:"center", border:"1px solid #395044", borderRadius:6, background:bg, fontWeight:800, fontSize:22}}>{guess[col] || ""}</span>
            })}
          </div>
        })}
      </div>

      {!finished ? <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
        <input aria-label="Five-letter guess" value={input} maxLength={5} onChange={(e) => setInput(e.target.value.replace(/[^a-z]/gi, ""))} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="5 letters" style={{padding:"12px 14px", borderRadius:10, border:"1px solid #395044", background:"#0b1510", color:"white", textTransform:"uppercase"}} />
        <button type="button" onClick={submit} disabled={input.length !== 5} style={{padding:"12px 16px", borderRadius:10, border:0, fontWeight:800}}>Guess</button>
      </div> : <div>
        <strong>{won ? `Solved in ${guesses.indexOf(answer) + 1}/${MAX_TRIES}!` : `Today's word was ${answer}.`}</strong>
        <p>The share result contains only the coloured grid, never the answer.</p>
        <button type="button" onClick={copyResult} style={{padding:"12px 16px", borderRadius:10, border:0, fontWeight:800}}>{copied === "ok" ? "Copied ✓" : copied === "error" ? "Copy failed" : "Copy result for DeSo"}</button>
      </div>}

      <p style={{fontSize:13, opacity:.75, marginBottom:0, marginTop:18}}>Daily Grid is a VIA game. A new puzzle starts at 00:00 UTC. Answers are client-visible, so this game is not authoritative evidence for financial rewards. No DeSo signing is required to play.</p>
    </article>
  )
}
