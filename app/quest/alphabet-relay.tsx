"use client"

import { useEffect, useMemo, useState } from "react"

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
const CATEGORIES = ["Free theme", "Animals", "Food", "Countries", "Music", "Art", "DeSo"]
const GAME_SECONDS = 5 * 60

function scoreWord(word: string) {
  const clean = word.trim()
  if (!clean) return 0
  return clean.length + (clean.length >= 6 ? 2 : 0)
}

export default function AlphabetRelay() {
  const [category, setCategory] = useState(CATEGORIES[0])
  const [words, setWords] = useState<Record<string, string>>({})
  const [secondsLeft, setSecondsLeft] = useState(GAME_SECONDS)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          window.clearInterval(id)
          setRunning(false)
          setFinished(true)
          return 0
        }
        return value - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [running])

  const total = useMemo(() => LETTERS.reduce((sum, letter) => sum + scoreWord(words[letter] || ""), 0), [words])
  const completed = useMemo(() => LETTERS.filter((letter) => (words[letter] || "").trim()).length, [words])
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60

  function startGame() {
    setWords({})
    setSecondsLeft(GAME_SECONDS)
    setFinished(false)
    setCopied(false)
    setRunning(true)
  }

  function finishNow() {
    setRunning(false)
    setFinished(true)
  }

  function resultText() {
    return [
      "VIA Alphabet Relay",
      `Category: ${category}`,
      `Score: ${total}`,
      `Letters completed: ${completed}/26`,
      "Time: 5:00",
      "",
      "Play the world. Discover DeSo.",
    ].join("\n")
  }

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(resultText())
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {}
  }

  return (
    <article style={{border:"1px solid #234b36", borderRadius:18, padding:20, marginTop:24, background:"#07100b"}}>
      <p style={{margin:0, color:"#7ee2a8", fontWeight:700}}>SOLO WORD GAME · 5 MINUTES</p>
      <h2>VIA Alphabet Relay</h2>
      <p>Fill A to Z with one word per letter. Each letter in a valid entry scores 1 point; words of 6 letters or more earn +2 bonus points.</p>

      <div style={{display:"flex", gap:10, flexWrap:"wrap", alignItems:"center", margin:"16px 0"}}>
        <label>
          Category{" "}
          <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={running} style={{padding:"9px 10px", borderRadius:8}}>
            {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <strong style={{fontSize:24, minWidth:72}}>{minutes}:{seconds.toString().padStart(2, "0")}</strong>
        {!running && !finished && <button type="button" onClick={startGame} style={{padding:"10px 14px", borderRadius:9, border:0, fontWeight:800}}>Start 5-minute game</button>}
        {running && <button type="button" onClick={finishNow} style={{padding:"10px 14px", borderRadius:9, border:0, fontWeight:800}}>Finish now</button>}
        {finished && <button type="button" onClick={startGame} style={{padding:"10px 14px", borderRadius:9, border:0, fontWeight:800}}>Play again</button>}
      </div>

      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:8, maxHeight:520, overflow:"auto", paddingRight:4}}>
        {LETTERS.map((letter) => {
          const value = words[letter] || ""
          const points = scoreWord(value)
          const startsCorrectly = !value || value.trim().toUpperCase().startsWith(letter)
          return <label key={letter} style={{display:"grid", gridTemplateColumns:"28px 1fr auto", gap:7, alignItems:"center"}}>
            <strong>{letter}</strong>
            <input
              value={value}
              disabled={!running}
              onChange={(e) => setWords((old) => ({...old, [letter]: e.target.value}))}
              placeholder={`${letter}…`}
              aria-label={`Word for ${letter}`}
              style={{padding:"9px 10px", borderRadius:8, border:`1px solid ${startsCorrectly ? "#395044" : "#8a3d3d"}`, background:"#0b1510", color:"white"}}
            />
            <span style={{fontSize:12, opacity:.8, minWidth:28, textAlign:"right"}}>{points}</span>
          </label>
        })}
      </div>

      <div style={{marginTop:18, display:"flex", gap:16, flexWrap:"wrap"}}>
        <strong>Score: {total}</strong>
        <span>Completed: {completed}/26</span>
      </div>

      {finished && <div style={{marginTop:14}}>
        <button type="button" onClick={copyResult} style={{padding:"11px 15px", borderRadius:9, border:0, fontWeight:800}}>{copied ? "Copied ✓" : "Copy result for DeSo"}</button>
      </div>}

      <p style={{fontSize:13, opacity:.75, marginBottom:0, marginTop:16}}>VIA currently checks the starting letter and calculates the score locally. Dictionary/category validation is deliberately not automatic yet, so the first version stays lightweight and language-friendly.</p>
    </article>
  )
}
