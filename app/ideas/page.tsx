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
        <p style={{ color: "#8fd4a9", fontWeight: 800, letterSpacing: "0.12em", fontSize: 12 }}>VIA · IDEA BOX</p>
        <h1 style={{ fontSize: "clamp(30px, 6vw, 52px)", lineHeight: 1.02, margin: "12px 0" }}>Help VIA move forward.</h1>
        <p style={{ color: "#b7c5bd", lineHeight: 1.7 }}>VIA is built for and with its visitors. Share what you miss, what could work better, or what you would like to experience, create or discover.</p>

        <section style={{ marginTop: 24, border: "1px solid #347d52", borderRadius: 20, background: "#08100b", padding: 22 }}>
          <h2 style={{ marginTop: 0 }}>What happens to your idea?</h2>
          <p style={{ color: "#b7c5bd", lineHeight: 1.65 }}>We review ideas alongside visitor needs and what is technically safe, practical and affordable. An idea can move through <strong>Received → Reviewed → Exploring → Planned → In development → Built</strong>. Not every idea will be implemented; where useful, VIA can explain why something is not moving forward yet.</p>
          <p style={{ color: "#b7c5bd", lineHeight: 1.65 }}>Never share passwords, DeSo seed words, private keys or other confidential information. This first version stores a submission only on this device; it is not sent to VIA or DeSo.</p>
        </section>

        <form onSubmit={submitIdea} style={{ marginTop: 24, display: "grid", gap: 14 }}>
          <label>Category
            <select name="category" defaultValue="Other" style={{ display: "block", width: "100%", marginTop: 7, padding: 12, borderRadius: 12, background: "#08100b", color: "#f4f7f5", border: "1px solid #285f40" }}>
              {categories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
          <label>Your idea
            <textarea name="idea" required maxLength={2000} rows={8} placeholder="Tell us what could make VIA better, more useful or more enjoyable…" style={{ display: "block", width: "100%", marginTop: 7, padding: 12, borderRadius: 12, background: "#08100b", color: "#f4f7f5", border: "1px solid #285f40", resize: "vertical" }} />
          </label>
          <button type="submit" style={{ justifySelf: "start", border: "1px solid #347d52", borderRadius: 999, padding: "11px 17px", background: "#0b1b11", color: "#b9ffd4", fontWeight: 800 }}>Save my idea</button>
          {saved && <p role="status" style={{ color: "#8fd4a9" }}>Saved on this device. Online submission will only be added after a safe intake layer is ready.</p>}
        </form>

        <p style={{ marginTop: 30 }}><Link href="/" style={{ color: "#b9ffd4" }}>← Back to VIA</Link></p>
      </div>
    </main>
  )
}
