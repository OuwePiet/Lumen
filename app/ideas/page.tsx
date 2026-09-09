"use client"

import Link from "next/link"
import { FormEvent, useState } from "react"

const categories = ["NFT", "Social", "Music", "VIA LIVE", "Games", "Discovery", "Safety", "Accessibility", "Other"]

export default function IdeasPage() {
  const [saved, setSaved] = useState(false)

  function submitIdea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const idea = String(form.get("idea") || "").trim()
    const category = String(form.get("category") || "Other")
    if (!idea) return
    try {
      const current = JSON.parse(localStorage.getItem("via:ideas:drafts:v1") || "[]")
      const items = Array.isArray(current) ? current : []
      items.push({ category, idea: idea.slice(0, 2000), createdAt: new Date().toISOString(), status: "Received" })
      localStorage.setItem("via:ideas:drafts:v1", JSON.stringify(items.slice(-20)))
      setSaved(true)
      event.currentTarget.reset()
    } catch {
      setSaved(false)
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#020403", color: "#f4f7f5", padding: "32px 18px 64px", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div style={{ width: "min(820px, 100%)", margin: "0 auto" }}>
        <p style={{ color: "#78f0a8", fontWeight: 800, letterSpacing: "0.12em", fontSize: 12 }}>VIA · IDEEËNBUS</p>
        <h1 style={{ fontSize: "clamp(36px, 8vw, 68px)", lineHeight: 1, margin: "12px 0" }}>Help VIA vooruit.</h1>
        <p style={{ color: "#b7c5bd", lineHeight: 1.7 }}>VIA draait voor en met bezoekers. Deel wat je mist, wat beter kan of wat je graag zou willen beleven, maken, ontdekken of verdienen.</p>

        <section style={{ marginTop: 24, border: "1px solid #347d52", borderRadius: 20, background: "#08100b", padding: 22 }}>
          <h2 style={{ marginTop: 0 }}>Wat doen we met jouw idee?</h2>
          <p style={{ color: "#b7c5bd", lineHeight: 1.65 }}>We bekijken ideeën naast bezoekersbehoeften en wat technisch, veilig en betaalbaar mogelijk is. Een idee kan doorgaan als <strong>Ontvangen → Bekeken → In onderzoek → Gepland → In ontwikkeling → Gebouwd</strong>. Niet ieder idee wordt uitgevoerd; waar zinvol leggen we uit waarom iets voorlopig niet doorgaat.</p>
          <p style={{ color: "#b7c5bd", lineHeight: 1.65 }}>Deel nooit wachtwoorden, DeSo seed words, private keys of andere vertrouwelijke informatie. Deze eerste versie bewaart een inzending alleen lokaal op dit apparaat; hij wordt nog niet naar VIA of DeSo verstuurd.</p>
        </section>

        <form onSubmit={submitIdea} style={{ marginTop: 24, display: "grid", gap: 14 }}>
          <label>Onderwerp
            <select name="category" defaultValue="Other" style={{ display: "block", width: "100%", marginTop: 7, padding: 12, borderRadius: 12, background: "#08100b", color: "#f4f7f5", border: "1px solid #285f40" }}>
              {categories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
          <label>Jouw idee
            <textarea name="idea" required maxLength={2000} rows={8} placeholder="Vertel ons wat VIA volgens jou beter, leuker of nuttiger kan maken…" style={{ display: "block", width: "100%", marginTop: 7, padding: 12, borderRadius: 12, background: "#08100b", color: "#f4f7f5", border: "1px solid #285f40", resize: "vertical" }} />
          </label>
          <button type="submit" style={{ justifySelf: "start", border: "1px solid #347d52", borderRadius: 999, padding: "11px 17px", background: "#0b1b11", color: "#b9ffd4", fontWeight: 800 }}>Bewaar mijn idee</button>
          {saved && <p role="status" style={{ color: "#78f0a8" }}>Op dit apparaat bewaard. Online inzenden volgt pas wanneer de veilige ontvangstlaag gereed is.</p>}
        </form>

        <p style={{ marginTop: 30 }}><Link href="/" style={{ color: "#b9ffd4" }}>← Terug naar VIA</Link></p>
      </div>
    </main>
  )
}
