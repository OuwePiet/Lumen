"use client"

import Link from "next/link"
import { FormEvent, useState } from "react"

const categories = ["NFT", "Social", "Music", "VIA LIVE", "Games", "Discovery", "Safety", "Accessibility", "Other"]

type SubmitState = "idle" | "sending" | "sent" | "local" | "rate" | "error"

function saveLocally(category: string, idea: string) {
  const current = JSON.parse(localStorage.getItem("via:ideas:drafts:v1") || "[]")
  const items = Array.isArray(current) ? current : []
  items.push({ category, idea: idea.slice(0, 2000), createdAt: new Date().toISOString(), status: "Received" })
  localStorage.setItem("via:ideas:drafts:v1", JSON.stringify(items.slice(-20)))
}

export default function IdeasPage() {
  const [state, setState] = useState<SubmitState>("idle")

  async function submitIdea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const idea = String(form.get("idea") || "").trim()
    const category = String(form.get("category") || "Other")
    const website = String(form.get("website") || "")
    if (!idea) return

    setState("sending")

    try {
      const response = await fetch("/api/via/ideas", {
        method: "POST",
        headers: { "content-type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ category, idea, website }),
      })
      const data = await response.json().catch(() => null) as { ok?: boolean; error?: string } | null

      if (response.ok && data?.ok) {
        setState("sent")
        formElement.reset()
        return
      }

      if (response.status === 429) {
        setState("rate")
        return
      }

      if (response.status === 503 && data?.error === "IDEAS_STORAGE_NOT_CONFIGURED") {
        saveLocally(category, idea)
        setState("local")
        formElement.reset()
        return
      }

      setState("error")
    } catch {
      try {
        saveLocally(category, idea)
        setState("local")
        formElement.reset()
      } catch {
        setState("error")
      }
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
          <p style={{ color: "#b7c5bd", lineHeight: 1.65 }}>Never share passwords, DeSo seed words, private keys or other confidential information. VIA first tries to send your idea to the secure central inbox. If central storage is temporarily unavailable, the idea is saved only on this device instead.</p>
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
          <label style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }} aria-hidden="true">
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
          <button type="submit" disabled={state === "sending"} style={{ justifySelf: "start", border: "1px solid #347d52", borderRadius: 999, padding: "11px 17px", background: "#0b1b11", color: "#b9ffd4", fontWeight: 800, opacity: state === "sending" ? .65 : 1 }}>
            {state === "sending" ? "Sending…" : "Send my idea"}
          </button>
          {state === "sent" && <p role="status" style={{ color: "#8fd4a9" }}>Received by VIA. Thank you.</p>}
          {state === "local" && <p role="status" style={{ color: "#e1c879" }}>Central intake is not available yet. Your idea was saved safely on this device.</p>}
          {state === "rate" && <p role="status" style={{ color: "#e1c879" }}>Please wait about a minute before sending another idea.</p>}
          {state === "error" && <p role="status" style={{ color: "#e6a6a6" }}>The idea could not be saved right now. Please try again later.</p>}
        </form>

        <p style={{ marginTop: 30 }}><Link href="/" style={{ color: "#b9ffd4" }}>← Back to VIA</Link></p>
      </div>
    </main>
  )
}
