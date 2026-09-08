"use client"

import { useEffect, useMemo, useState } from "react"

const ANSWERS = ["WORLD", "QUEST", "RADIO", "BADGE", "GREEN", "POINT", "SHARE"]
const MAX_TRIES = 6

function dayNumber() {
  return Math.floor(Date.now() / 86400000)
}

function answerForToday() {
  return ANSWERS[dayNumber() % ANSWERS.length]
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
  const answer = useMemo(answerForToday, [])
  const storageKey = `via:daily-grid:${dayNumber()}`
  const [guesses, setGuesses] = useState<string[]>([])
  const [input, setInput] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "[]")
      if (Array.isArray(saved)) setGuesses(saved.filter((x) => typeof x === "string").slice(0, MAX_TRIES))
    } catch {}
  }, [storageKey])

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(guesses))
  }, [guesses, storageKey])

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
    return [`VIA Daily Grid #${dayNumber()}`, won ? `${guesses.indexOf(answer) + 1}/${MAX_TRIES}` : `X/${MAX_TRIES}`, "", ...rows, "", "Play the world. Discover DeSo."].join("\n")
  }

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(shareText())
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {}
  }

  return (
    <article style={{border:"1px solid #234b36", borderRadius:18, padding:20, marginTop:24, background:"#07100b"}}>
      <p style={{margin:0, color:"#7ee2a8", fontWeight:700}}>DAILY GAME · ONE PUZZLE A DAY</p>
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
        <button type="button" onClick={copyResult} style={{padding:"12px 16px", borderRadius:10, border:0, fontWeight:800}}>{copied ? "Copied ✓" : "Copy result for DeSo"}</button>
      </div>}

      <p style={{fontSize:13, opacity:.75, marginBottom:0, marginTop:18}}>Daily Grid is a VIA game. It does not copy Wordle&apos;s word list, branding or puzzle data. No DeSo signing is required to play.</p>
    </article>
  )
}
