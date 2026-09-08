"use client"

import { useEffect, useMemo, useState } from "react"
import styles from "./quest.module.css"

type QuestState = {
  points: number
  streak: number
  completedToday: boolean
}

const STORAGE_KEY = "via:world-quest:v1"

const dailySteps = [
  "Discover a DeSo creator you do not already know.",
  "Open one NFT or collection and inspect its public details.",
  "Visit one public post or creator profile from VIA Discovery.",
  "Choose one world stop: creator, NFT or radio discovery.",
]

const surpriseRoutes = [
  ["Netherlands", "Ghana", "Japan", "Argentina"],
  ["Canada", "Spain", "India", "South Africa"],
  ["France", "Brazil", "South Korea", "Australia"],
  ["Germany", "Nigeria", "Mexico", "Indonesia"],
]

const initialState: QuestState = { points: 0, streak: 0, completedToday: false }

export default function QuestGame() {
  const [state, setState] = useState<QuestState>(initialState)
  const [step, setStep] = useState(0)
  const [mode, setMode] = useState<"daily" | "surprise">("daily")
  const [routeIndex, setRouteIndex] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<QuestState>
        setState({
          points: Number.isFinite(parsed.points) ? Number(parsed.points) : 0,
          streak: Number.isFinite(parsed.streak) ? Number(parsed.streak) : 0,
          completedToday: Boolean(parsed.completedToday),
        })
      }
    } catch {
      // Invalid local state is ignored safely.
    } finally {
      setReady(true)
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state, ready])

  const route = useMemo(() => surpriseRoutes[routeIndex % surpriseRoutes.length], [routeIndex])
  const totalSteps = mode === "daily" ? dailySteps.length : route.length
  const currentLabel = mode === "daily" ? dailySteps[step] : `World stop ${step + 1}: ${route[step]}`
  const finished = step >= totalSteps

  function startDaily() {
    setMode("daily")
    setStep(0)
  }

  function startSurprise() {
    setMode("surprise")
    setRouteIndex((value) => (value + 1) % surpriseRoutes.length)
    setStep(0)
  }

  function completeStep() {
    if (finished) return
    const next = step + 1
    setStep(next)
    setState((value) => ({ ...value, points: value.points + 10 }))

    if (next === totalSteps) {
      setState((value) => ({
        points: value.points + 25,
        streak: mode === "daily" && !value.completedToday ? value.streak + 1 : value.streak,
        completedToday: mode === "daily" ? true : value.completedToday,
      }))
    }
  }

  return (
    <section className={styles.game} aria-label="Playable VIA World Quest prototype">
      <div className={styles.scoreRow}>
        <div><strong>{state.points}</strong><span>VIA Points</span></div>
        <div><strong>{state.streak}</strong><span>Day streak</span></div>
        <div><strong>{state.completedToday ? "✓" : "—"}</strong><span>Daily Quest</span></div>
      </div>

      <div className={styles.modeButtons}>
        <button type="button" onClick={startDaily}>Daily Quest</button>
        <button type="button" onClick={startSurprise}>Surprise Route</button>
      </div>

      <article className={styles.questCard}>
        <div className={styles.progressLine}>
          <span>{mode === "daily" ? "Daily Quest" : "Surprise Route"}</span>
          <span>{Math.min(step, totalSteps)} / {totalSteps}</span>
        </div>

        {!finished ? (
          <>
            <h2>{currentLabel}</h2>
            <p>
              This prototype records only local game progress. Future versions will connect
              each step to verified VIA Discovery destinations.
            </p>
            <button className={styles.primary} type="button" onClick={completeStep}>
              Mark step complete · +10 points
            </button>
          </>
        ) : (
          <div className={styles.finished}>
            <span aria-hidden="true">◆</span>
            <h2>Quest complete</h2>
            <p>You earned the completion bonus. Try another route or return tomorrow.</p>
            <button className={styles.primary} type="button" onClick={mode === "daily" ? startSurprise : startDaily}>
              Play another route
            </button>
          </div>
        )}
      </article>

      <p className={styles.note}>
        VIA Points are currently local, non-transferable game points. They are not DESO,
        money or proof that a blockchain reward was paid.
      </p>
    </section>
  )
}
